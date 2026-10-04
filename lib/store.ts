import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { MongoClient, type AnyBulkWriteOperation, type Db } from "mongodb";
import { DEFAULT_SETTINGS, type Settings } from "./settings";
import type { AuditEntry, Provider, PublicProvider, SavedDesign, SetupRequest, Subscriber } from "./types";

export type DB = {
  requests: SetupRequest[];
  providers: Provider[];
  designs: SavedDesign[];
  subscribers: Subscriber[];
  settings: Settings;
  audit: AuditEntry[];
  /** Last issued reference number per kind (SR/SP/DS). */
  counters: Record<string, number>;
};

const RECORDS = ["requests", "providers", "designs", "subscribers"] as const;
type RecordKey = (typeof RECORDS)[number];
const AUDIT_LIMIT = 500;

const empty = (): DB => ({ requests: [], providers: [], designs: [], subscribers: [], settings: structuredClone(DEFAULT_SETTINGS), audit: [], counters: {} });

/**
 * Storage backend:
 * - MONGODB_URI set → MongoDB (required on Vercel/serverless, where the filesystem is read-only)
 * - otherwise, or STORAGE=file → JSON file at DATA_FILE (default data/db.json), fine for a single server
 */
const useMongo = () => !!process.env.MONGODB_URI && process.env.STORAGE !== "file";

// ---------------------------------------------------------------- MongoDB

const g = globalThis as unknown as { __rtsMongo?: Promise<Db> };

/** One client per server instance (survives dev hot-reload and warm serverless invocations). */
function mongo(): Promise<Db> {
  g.__rtsMongo ??= (async () => {
    const client = await new MongoClient(process.env.MONGODB_URI!, { maxPoolSize: 5, serverSelectionTimeoutMS: 8000 }).connect();
    const db = client.db(process.env.MONGODB_DB || "rooftop_solar");
    await Promise.all([
      ...RECORDS.map((c) => db.collection(c).createIndex({ id: 1 }, { unique: true })),
      ...(["requests", "providers", "designs"] as const).map((c) => db.collection(c).createIndex({ ref: 1 }, { unique: true })),
      db.collection("subscribers").createIndex({ contact: 1 }, { unique: true }),
      db.collection("audit").createIndex({ at: -1 }),
    ]);
    return db;
  })().catch((e) => {
    g.__rtsMongo = undefined; // allow a retry on the next request
    throw e;
  });
  return g.__rtsMongo;
}

async function readMongo(): Promise<DB> {
  const db = await mongo();
  const noId = { projection: { _id: 0 } };
  const [requests, providers, designs, subscribers, settingsDoc, audit, countersDoc] = await Promise.all([
    ...RECORDS.map((c) => db.collection(c).find({}, noId).toArray()),
    db.collection("settings").findOne({ _id: "site" as never }, noId),
    db.collection("audit").find({}, noId).sort({ at: -1 }).limit(AUDIT_LIMIT).toArray(),
    db.collection("counters").findOne({ _id: "refs" as never }, noId),
  ]);
  return {
    requests: requests as unknown as SetupRequest[],
    providers: providers as unknown as Provider[],
    designs: designs as unknown as SavedDesign[],
    subscribers: subscribers as unknown as Subscriber[],
    settings: { ...structuredClone(DEFAULT_SETTINGS), ...(settingsDoc as Partial<Settings> | null) },
    audit: audit as unknown as AuditEntry[],
    counters: (countersDoc ?? {}) as Record<string, number>,
  };
}

class WriteConflict extends Error {}

/** Write back only what fn changed, so concurrent instances don't overwrite each other's records. */
async function writeMongoDiff(before: DB, after: DB) {
  const db = await mongo();
  // Claim reference numbers first: compare-and-set, so two instances can never issue the same one.
  for (const [k, v] of Object.entries(after.counters)) {
    const prev = before.counters[k];
    if (prev === v) continue;
    const filter = { _id: "refs" as never, [k]: prev === undefined ? { $exists: false } : prev };
    try {
      const r = await db.collection("counters").updateOne(filter, { $set: { [k]: v } }, { upsert: prev === undefined });
      if (!r.matchedCount && !r.upsertedCount) throw new WriteConflict();
    } catch (e) {
      if ((e as { code?: number }).code === 11000) throw new WriteConflict();
      throw e;
    }
  }
  for (const c of RECORDS) {
    const prev = new Map((before[c] as { id: string }[]).map((r) => [r.id, JSON.stringify(r)]));
    const next = after[c] as { id: string }[];
    const ops: AnyBulkWriteOperation[] = [];
    for (const r of next) {
      if (prev.get(r.id) !== JSON.stringify(r)) ops.push({ replaceOne: { filter: { id: r.id }, replacement: r, upsert: true } });
      prev.delete(r.id);
    }
    for (const id of prev.keys()) ops.push({ deleteOne: { filter: { id } } });
    if (ops.length) await db.collection(c).bulkWrite(ops, { ordered: true });
  }
  if (JSON.stringify(before.settings) !== JSON.stringify(after.settings)) {
    await db.collection("settings").replaceOne({ _id: "site" as never }, after.settings, { upsert: true });
  }
  const seen = new Set(before.audit.map((a) => a.at + a.action + a.target));
  const added = after.audit.filter((a) => !seen.has(a.at + a.action + a.target));
  if (added.length) await db.collection("audit").insertMany(added.map((a) => ({ ...a })));
}

// ---------------------------------------------------------------- JSON file

const FILE = process.env.DATA_FILE || path.join(process.cwd(), "data", "db.json");

async function readFile(): Promise<DB> {
  try {
    const db = JSON.parse(await fs.readFile(FILE, "utf8")) as Partial<DB>;
    const base = empty();
    return {
      requests: db.requests ?? base.requests,
      providers: db.providers ?? base.providers,
      designs: db.designs ?? base.designs,
      subscribers: db.subscribers ?? base.subscribers,
      settings: { ...base.settings, ...db.settings },
      audit: db.audit ?? base.audit,
      counters: db.counters ?? base.counters,
    };
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return empty();
    throw e;
  }
}

// ---------------------------------------------------------------- public API

export function readDb(): Promise<DB> {
  return useMongo() ? readMongo() : readFile();
}

// Serialise writes within this process so concurrent submissions don't clobber each other.
let queue: Promise<unknown> = Promise.resolve();

/**
 * Read-modify-write. `fn` must be synchronous and side-effect free apart from editing `db`,
 * because on a MongoDB unique-key race (two instances issuing the same reference number)
 * the whole operation is re-run against fresh data.
 */
export function mutate<T>(fn: (db: DB) => T): Promise<T> {
  const run = queue.then(async () => {
    if (!useMongo()) {
      const db = await readFile();
      const out = fn(db);
      await fs.mkdir(path.dirname(FILE), { recursive: true });
      await fs.writeFile(FILE, JSON.stringify(db, null, 2), "utf8");
      return out;
    }
    for (let attempt = 0; ; attempt++) {
      const before = await readMongo();
      const db = structuredClone(before);
      const out = fn(db);
      try {
        await writeMongoDiff(before, db);
        return out;
      } catch (e) {
        const conflict = e instanceof WriteConflict || (e as { code?: number }).code === 11000;
        if (!conflict || attempt >= 8) throw e;
        // Another instance won the race — back off briefly, then re-run on fresh data.
        await new Promise((r) => setTimeout(r, 20 + Math.random() * 80 * (attempt + 1)));
      }
    }
  });
  queue = run.catch(() => {});
  return run;
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const REF_SOURCE = { SR: "requests", SP: "providers", DS: "designs" } as const;

/**
 * Issue the next reference number. Uses a stored counter (seeded from the highest existing ref),
 * so numbers are never reused after deletions or across concurrent server instances.
 */
export function nextRef(db: DB, kind: keyof typeof REF_SOURCE) {
  const seed = () =>
    Math.max(0, ...(db[REF_SOURCE[kind]] as { ref: string }[]).map((r) => Number(r.ref.match(/(d+)$/)?.[1] ?? 0)));
  const n = (db.counters[kind] ?? seed()) + 1;
  db.counters[kind] = n;
  return `BD-RTS/${kind}/${new Date().getFullYear()}/${String(n).padStart(4, "0")}`;
}

export function publicProvider({ phone, email, contact, ...p }: Provider): PublicProvider {
  return p;
}

const maskPhone = (p: string) => p.slice(0, 3) + "•••••" + p.slice(-3);

/** Contact details are visible only to providers who have expressed interest. */
export function viewRequest(r: SetupRequest, viewerId?: string | null): SetupRequest {
  if (viewerId && r.interests.includes(viewerId)) return r;
  return { ...r, phone: maskPhone(r.phone), address: "", geo: "", masked: true };
}

/** Append to the admin audit trail (kept to the latest 500 entries). Call inside mutate(). */
export function audit(db: DB, action: string, target: string) {
  db.audit.unshift({ at: new Date().toISOString(), action, target });
  if (db.audit.length > AUDIT_LIMIT) db.audit.length = AUDIT_LIMIT;
}

export async function getSettings() {
  return (await readDb()).settings;
}

export const storageKind = () => (useMongo() ? `MongoDB (${process.env.MONGODB_DB || "rooftop_solar"})` : FILE);
