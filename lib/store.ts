import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { DEFAULT_SETTINGS, type Settings } from "./settings";
import type { AuditEntry, Provider, PublicProvider, SavedDesign, SetupRequest, Subscriber } from "./types";

export type DB = {
  requests: SetupRequest[];
  providers: Provider[];
  designs: SavedDesign[];
  subscribers: Subscriber[];
  settings: Settings;
  audit: AuditEntry[];
};

const empty = (): DB => ({ requests: [], providers: [], designs: [], subscribers: [], settings: structuredClone(DEFAULT_SETTINGS), audit: [] });

const FILE = process.env.DATA_FILE || path.join(process.cwd(), "data", "db.json");

export async function readDb(): Promise<DB> {
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
    };
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return empty();
    throw e;
  }
}

// Serialise writes within this process so concurrent submissions don't clobber each other.
let queue: Promise<unknown> = Promise.resolve();

export function mutate<T>(fn: (db: DB) => T): Promise<T> {
  const run = queue.then(async () => {
    const db = await readDb();
    const out = fn(db);
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(db, null, 2), "utf8");
    return out;
  });
  queue = run.catch(() => {});
  return run;
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export function nextRef(kind: "SR" | "SP" | "DS", count: number) {
  return `BD-RTS/${kind}/${new Date().getFullYear()}/${String(count + 1).padStart(4, "0")}`;
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
  if (db.audit.length > 500) db.audit.length = 500;
}

export async function getSettings() {
  return (await readDb()).settings;
}
