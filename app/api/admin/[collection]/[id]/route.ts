import { NextResponse } from "next/server";
import { denyUnlessAdmin } from "@/lib/auth";
import { ENLISTMENT, STAGES } from "@/lib/options";
import { audit, mutate, type DB } from "@/lib/store";

type Collection = "requests" | "providers" | "designs" | "subscribers";
const COLLECTIONS: Collection[] = ["requests", "providers", "designs", "subscribers"];
const LABEL: Record<Collection, string> = { requests: "অনুরোধ", providers: "প্রোভাইডার", designs: "ডিজাইন", subscribers: "সাবস্ক্রাইবার" };

type Ctx = { params: Promise<{ collection: string; id: string }> };

function describe(db: DB, c: Collection, id: string) {
  const x = (db[c] as { id: string }[]).find((r) => r.id === id) as Record<string, any> | undefined;
  if (!x) return null;
  return x.ref ?? x.contact ?? id;
}

/** PATCH — only whitelisted fields per collection. */
export async function PATCH(req: Request, { params }: Ctx) {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;
  const { collection, id } = await params;
  const b = await req.json().catch(() => null);

  const result = await mutate((db) => {
    if (collection === "requests") {
      const r = db.requests.find((x) => x.id === id);
      if (!r) return 404;
      if (Number.isInteger(b?.stage) && b.stage >= 0 && b.stage < STAGES.length) {
        r.stage = b.stage;
        audit(db, `ধাপ → ${STAGES[b.stage]}`, r.ref);
      }
      if (Array.isArray(b?.interests)) {
        r.interests = b.interests.filter((p: unknown) => typeof p === "string" && db.providers.some((x) => x.id === p));
        audit(db, "আগ্রহী প্রোভাইডার হালনাগাদ", r.ref);
      }
      return r;
    }
    if (collection === "providers") {
      const p = db.providers.find((x) => x.id === id);
      if (!p) return 404;
      if (ENLISTMENT.some((e) => e.value === b?.enlistment)) {
        p.enlistment = b.enlistment;
        audit(db, `তালিকাভুক্তি → ${ENLISTMENT.find((e) => e.value === b.enlistment)!.label}`, `${p.ref} ${p.company}`);
      }
      return p;
    }
    return 400;
  });

  if (result === 404) return NextResponse.json({ error: "পাওয়া যায়নি" }, { status: 404 });
  if (result === 400) return NextResponse.json({ error: "এই তালিকায় সম্পাদনা সমর্থিত নয়" }, { status: 400 });
  return NextResponse.json(result);
}

/** DELETE — remove a record. Deleting a provider also clears it from requests' interest lists. */
export async function DELETE(_req: Request, { params }: Ctx) {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;
  const { collection, id } = await params;
  if (!COLLECTIONS.includes(collection as Collection)) return NextResponse.json({ error: "অজানা তালিকা" }, { status: 400 });
  const c = collection as Collection;

  const ok = await mutate((db) => {
    const label = describe(db, c, id);
    if (label === null) return false;
    (db[c] as { id: string }[]) = (db[c] as { id: string }[]).filter((x) => x.id !== id);
    if (c === "providers") for (const r of db.requests) r.interests = r.interests.filter((p) => p !== id);
    audit(db, `${LABEL[c]} মুছে ফেলা`, String(label));
    return true;
  });
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "পাওয়া যায়নি" }, { status: 404 });
}
