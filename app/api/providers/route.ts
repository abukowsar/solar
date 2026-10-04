import { NextResponse } from "next/server";
import { DISTRICT_BY_BN } from "@/lib/data/districts";
import { ELIGIBILITY } from "@/lib/data/tender";
import { CATEGORIES, ENLISTMENT, GOALS, PROVIDER_KINDS } from "@/lib/options";
import { mutate, nextRef, publicProvider, readDb, uid } from "@/lib/store";
import { num, oneOf, PHONE_RE, pick, str } from "@/lib/validate";
import type { Provider } from "@/lib/types";

export async function GET() {
  const { providers } = await readDb();
  return NextResponse.json(
    providers.map(publicProvider).sort((a, b) => a.company.localeCompare(b.company)),
  );
}

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b || typeof b !== "object") return NextResponse.json({ error: "অবৈধ অনুরোধ" }, { status: 400 });

  const company = str(b.company, 150);
  const contact = str(b.contact, 100);
  const phone = str(b.phone, 11);
  const email = str(b.email, 150);
  const home = str(b.home, 40);
  const serve = pick(b.serve, Object.keys(DISTRICT_BY_BN));
  const solset = str(b.solset, 300);
  const expKw = num(b.expKw, 0, 1_000_000);

  const errors: string[] = [];
  if (!company) errors.push("প্রতিষ্ঠানের নাম দিন");
  if (!contact) errors.push("যোগাযোগকারীর নাম দিন");
  if (!PHONE_RE.test(phone)) errors.push("সঠিক মোবাইল নম্বর দিন");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("সঠিক ইমেইল দিন");
  if (!DISTRICT_BY_BN[home]) errors.push("ব্যবসা নিবন্ধিত জেলা বেছে নিন");
  if (!serve.length) errors.push("অন্তত একটি সেবা-জেলা বেছে নিন");
  if (solset && !/^https:\/\/([a-z0-9-]+\.)*solset\.ai(\/|$)/i.test(solset)) errors.push("Solset লিংক https://…solset.ai দিয়ে শুরু হতে হবে");
  if (errors.length) return NextResponse.json({ error: errors.join("; ") }, { status: 422 });

  const docs = pick(b.docs, ELIGIBILITY.map((e) => e.key));
  // The 2 kW experience criterion is met by the declared track record too
  if (expKw >= 2 && !docs.includes("exp")) docs.push("exp");

  const created = await mutate((db) => {
    const p: Provider = {
      id: uid(),
      ref: nextRef("SP", db.providers.length),
      company, contact, phone, email, home, expKw, docs, solset,
      kind: oneOf(b.kind, PROVIDER_KINDS.map((k) => k.value), "new"),
      types: pick(b.types, CATEGORIES),
      services: pick(b.services, GOALS),
      serve: serve.includes(home) ? serve : [home, ...serve],
      enlistment: oneOf(b.enlistment, ENLISTMENT.map((e) => e.value), "none"),
      created: new Date().toISOString(),
    };
    db.providers.push(p);
    return p;
  });
  return NextResponse.json({ id: created.id, ref: created.ref }, { status: 201 });
}
