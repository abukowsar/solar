import { NextResponse } from "next/server";
import { denyUnlessAdmin } from "@/lib/auth";
import { STAGES } from "@/lib/options";
import { toSolsetCsv } from "@/lib/solset";
import { readDb } from "@/lib/store";

const cell = (v: unknown) => {
  const s = Array.isArray(v) ? v.join(" / ") : String(v ?? "");
  // Neutralise spreadsheet formulas (CSV injection) and quote when needed.
  const safe = /^[=+\-@]/.test(s) ? "'" + s : s;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};
const csv = (rows: unknown[][]) => "﻿" + rows.map((r) => r.map(cell).join(",")).join("\r\n");

/** GET ?type=requests|providers|designs|subscribers|solset */
export async function GET(req: Request) {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;
  const type = new URL(req.url).searchParams.get("type");
  const db = await readDb();
  let body: string;

  switch (type) {
    case "requests":
      body = csv([
        ["ref", "created", "name", "phone", "district", "upazila", "address", "utility", "category", "roof_sqft", "roof_type", "monthly_units", "load_kw", "kwp", "goals", "when", "source", "stage", "interested_providers", "geo", "notes"],
        ...db.requests.map((r) => [r.ref, r.created, r.name, r.phone, r.district, r.upazila, r.address, r.utility, r.category, r.roof, r.roofType, r.units, r.load, r.kw, r.goals, r.when, r.source, STAGES[r.stage], r.interests.map((id) => db.providers.find((p) => p.id === id)?.company ?? id), r.geo, r.notes]),
      ]);
      break;
    case "providers":
      body = csv([
        ["ref", "created", "company", "contact", "phone", "email", "home", "kind", "exp_kwp", "docs", "types", "services", "serve", "enlistment", "solset"],
        ...db.providers.map((p) => [p.ref, p.created, p.company, p.contact, p.phone, p.email, p.home, p.kind, p.expKw, p.docs, p.types, p.services, p.serve, p.enlistment, p.solset]),
      ]);
      break;
    case "designs":
      body = csv([
        ["ref", "created", "name", "phone", "district", "kwp", "panels", "panel_w", "inverter_kw", "battery_kwh", "capex_bdt", "lcoe", "annual_gen", "export_kwh", "solset_mode", "solset_id"],
        ...db.designs.map((d) => [d.ref, d.created, d.contact.name, d.contact.phone, d.contact.district, d.summary.kwp, d.summary.panels, d.summary.panelW, d.summary.inverterKw, d.summary.batteryKwh, d.summary.capex, d.summary.lcoe, d.summary.gen, d.summary.exp, d.solset.mode, d.solset.id ?? ""]),
      ]);
      break;
    case "subscribers":
      body = csv([["channel", "contact", "role", "district", "created"], ...db.subscribers.map((s) => [s.channel, s.contact, s.role, s.district, s.created])]);
      break;
    case "solset":
      body = toSolsetCsv(db.requests);
      break;
    default:
      return NextResponse.json({ error: "অজানা ধরন" }, { status: 400 });
  }

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${type}-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
