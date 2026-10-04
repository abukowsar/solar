import { NextResponse } from "next/server";
import { DISTRICT_BY_BN } from "@/lib/data/districts";
import { systemSize } from "@/lib/calc";
import { CATEGORIES, GOALS, ROOF_TYPES, SOURCES, UTILITIES, WHEN } from "@/lib/options";
import { mutate, nextRef, readDb, uid, viewRequest } from "@/lib/store";
import { num, oneOf, PHONE_RE, pick, str } from "@/lib/validate";
import type { SetupRequest } from "@/lib/types";

export async function GET(req: Request) {
  const as = new URL(req.url).searchParams.get("as");
  const { requests } = await readDb();
  const list = requests
    .slice()
    .sort((a, b) => b.created.localeCompare(a.created))
    .map((r) => viewRequest(r, as));
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b || typeof b !== "object") return NextResponse.json({ error: "অবৈধ অনুরোধ" }, { status: 400 });

  const errors: string[] = [];
  const name = str(b.name, 100);
  const phone = str(b.phone, 11);
  const district = str(b.district, 40);
  const upazila = str(b.upazila, 80);
  const address = str(b.address, 300);
  const utility = oneOf(b.utility, UTILITIES);
  const roof = num(b.roof, 0, 1_000_000);

  if (!name) errors.push("নাম দিন");
  if (!PHONE_RE.test(phone)) errors.push("সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)");
  if (!DISTRICT_BY_BN[district]) errors.push("জেলা বেছে নিন");
  if (!upazila) errors.push("উপজেলা দিন");
  if (!address) errors.push("ঠিকানা দিন");
  if (!utility) errors.push("বিতরণ সংস্থা বেছে নিন");
  if (roof < 50) errors.push("ছাদের আয়তন অন্তত ৫০ বর্গফুট হতে হবে");
  if (b.consent !== true) errors.push("তথ্য শেয়ারের সম্মতি প্রয়োজন");
  if (errors.length) return NextResponse.json({ error: errors.join("; ") }, { status: 422 });

  const created = await mutate((db) => {
    const r: SetupRequest = {
      id: uid(),
      ref: nextRef("SR", db.requests.length),
      name, phone, district, upazila, address, utility,
      category: oneOf(b.category, CATEGORIES, CATEGORIES[0]),
      roof,
      roofType: oneOf(b.roofType, ROOF_TYPES, ROOF_TYPES[0]),
      units: num(b.units, 0, 1_000_000),
      load: num(b.load, 0, 100_000),
      goals: pick(b.goals, GOALS),
      when: oneOf(b.when, WHEN.map((w) => w.value), "undecided"),
      source: oneOf(b.source, SOURCES.map((s) => s.value), "direct"),
      geo: str(b.geo, 60),
      notes: str(b.notes, 1000),
      kw: systemSize(roof),
      stage: 0,
      interests: [],
      created: new Date().toISOString(),
    };
    db.requests.push(r);
    return r;
  });
  return NextResponse.json({ id: created.id, ref: created.ref, kw: created.kw }, { status: 201 });
}
