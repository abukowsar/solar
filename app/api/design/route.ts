import { NextResponse } from "next/server";
import { DISTRICT_BY_BN } from "@/lib/data/districts";
import { designSystem, parseDesignInput } from "@/lib/design";
import { pushDesignToSolset, solsetConfigured } from "@/lib/solset-api";
import { mutate, nextRef, uid } from "@/lib/store";
import { PHONE_RE, str } from "@/lib/validate";
import type { SavedDesign } from "@/lib/types";

/** GET → whether the Solset API is wired up (so the UI can label the button honestly). */
export async function GET() {
  return NextResponse.json({ solset: solsetConfigured() });
}

/**
 * POST { input, contact? } — recomputes the design on the server (never trusts client numbers),
 * saves it, and pushes it to Solset when the API is configured.
 */
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b || typeof b !== "object") return NextResponse.json({ error: "অবৈধ অনুরোধ" }, { status: 400 });

  const input = parseDesignInput(b.input);
  const r = designSystem(input);
  if (!r.count) return NextResponse.json({ error: "এই ছাদে কোনো প্যানেল বসানো যাচ্ছে না — মাপ বা সেটব্যাক দেখুন" }, { status: 422 });

  const c = (b.contact ?? {}) as Record<string, unknown>;
  const phone = str(c.phone, 11);
  const district = str(c.district, 40);
  if (phone && !PHONE_RE.test(phone)) return NextResponse.json({ error: "সঠিক মোবাইল নম্বর দিন" }, { status: 422 });
  const contact = { name: str(c.name, 100), phone, district: DISTRICT_BY_BN[district] ? district : "", geo: str(c.geo, 60) };

  const saved = await mutate((db) => {
    const d: SavedDesign = {
      id: uid(),
      ref: nextRef(db, "DS"),
      created: new Date().toISOString(),
      contact,
      input,
      summary: {
        kwp: r.kwp, panels: r.count, panelW: r.panel.w, inverterKw: r.inverterKw, batteryKwh: r.batteryKwh,
        capex: Math.round(r.capex), lcoe: Number(r.lcoe.toFixed(2)), gen: Math.round(r.gen), exp: Math.round(r.exp),
      },
      solset: { mode: "local" },
    };
    db.designs.push(d);
    return d;
  });

  const solset = await pushDesignToSolset(saved.ref, input, r, contact);
  if (solset.mode !== "local") {
    await mutate((db) => {
      const d = db.designs.find((x) => x.id === saved.id);
      if (d) d.solset = solset;
    });
  }
  return NextResponse.json({ ref: saved.ref, summary: saved.summary, solset }, { status: 201 });
}
