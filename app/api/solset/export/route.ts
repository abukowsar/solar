import { NextResponse } from "next/server";
import { SOLSET_COLUMNS, solsetRow, toSolsetCsv } from "@/lib/solset";
import { leadsFor } from "../leads";

/** GET /api/solset/export?provider=<id>[&format=json] — Solset-ready CSV of a provider's leads */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const res = await leadsFor(q.get("provider"), q.get("token"));
  if (!res.ok) return NextResponse.json({ error: "প্রোভাইডার বা অ্যাডমিন টোকেন দিন" }, { status: 403 });

  if (q.get("format") === "json") {
    return NextResponse.json({ columns: SOLSET_COLUMNS, rows: res.rows.map(solsetRow) });
  }
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(toSolsetCsv(res.rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="solset-leads-${res.label}-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
