import { NextResponse } from "next/server";
import { SOLSET_COLUMNS, solsetRow } from "@/lib/solset";
import { leadsFor } from "../leads";

export async function GET() {
  return NextResponse.json({ enabled: !!process.env.SOLSET_WEBHOOK_URL });
}

/**
 * POST { provider } — forwards the provider's leads as JSON to SOLSET_WEBHOOK_URL
 * (e.g. a Zoho/Zapier/Make flow that creates leads in the provider's Solset workspace).
 */
export async function POST(req: Request) {
  const hook = process.env.SOLSET_WEBHOOK_URL;
  if (!hook) return NextResponse.json({ error: "SOLSET_WEBHOOK_URL কনফিগার করা নেই" }, { status: 501 });

  const b = await req.json().catch(() => null);
  const res = await leadsFor(typeof b?.provider === "string" ? b.provider : null, null);
  if (!res.ok) return NextResponse.json({ error: "প্রোভাইডার বেছে নিন" }, { status: 403 });

  const leads = res.rows.map((r) => Object.fromEntries(SOLSET_COLUMNS.map((c, i) => [c, solsetRow(r)[i]])));
  const out = await fetch(hook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source: "bd-rooftop-solar",
      provider: { ref: res.provider?.ref, company: res.provider?.company, solset: res.provider?.solset },
      leads,
    }),
  }).catch(() => null);

  if (!out?.ok) return NextResponse.json({ error: `ওয়েবহুক ব্যর্থ (${out?.status ?? "network"})` }, { status: 502 });
  return NextResponse.json({ sent: leads.length });
}
