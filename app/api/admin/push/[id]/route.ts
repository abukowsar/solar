import { NextResponse } from "next/server";
import { denyUnlessAdmin } from "@/lib/auth";
import { designSystem } from "@/lib/design";
import { pushDesignToSolset, solsetConfigured } from "@/lib/solset-api";
import { audit, mutate, readDb } from "@/lib/store";

/** POST — (re)send a saved design to the Solset API. */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;
  if (!solsetConfigured()) return NextResponse.json({ error: "Solset API কনফিগার করা নেই (SOLSET_API_URL / SOLSET_API_KEY)" }, { status: 501 });

  const { id } = await params;
  const d = (await readDb()).designs.find((x) => x.id === id);
  if (!d) return NextResponse.json({ error: "ডিজাইন পাওয়া যায়নি" }, { status: 404 });

  const solset = await pushDesignToSolset(d.ref, d.input, designSystem(d.input), d.contact);
  await mutate((db) => {
    const x = db.designs.find((y) => y.id === id);
    if (x) x.solset = solset;
    audit(db, solset.mode === "solset" ? "Solset-এ পাঠানো হয়েছে" : "Solset-এ পাঠানো ব্যর্থ", d.ref);
  });
  return NextResponse.json({ solset });
}
