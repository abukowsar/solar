import { DISTRICT_BY_BN } from "./data/districts";
import { SOLSET_STAGE } from "./options";
import type { SetupRequest } from "./types";

/**
 * Solset (https://solset.ai) has no public lead API; it imports leads from CSV
 * (and via Zoho / WhatsApp / ad forms). These columns map onto its CSV importer.
 */
export const SOLSET_COLUMNS = [
  "Name", "Phone", "Address", "City", "State", "Country", "Source",
  "Requirement", "Capacity (kWp)", "Stage", "Notes", "Reference",
];

export function solsetRow(r: SetupRequest): (string | number)[] {
  const d = DISTRICT_BY_BN[r.district];
  return [
    r.name,
    r.phone,
    `${r.address}, ${r.upazila}`,
    d?.en ?? r.district,
    d ? `${d.division} Division` : "",
    "Bangladesh",
    `BD Rooftop Solar ${r.source}`,
    `${r.category} · ${r.goals.join("/")}`,
    r.kw,
    SOLSET_STAGE[r.stage] ?? "Enquiry",
    [
      `Roof ${r.roof} sqft ${r.roofType}`,
      `${r.units} kWh/mo`,
      `sanctioned load ${r.load} kW`,
      r.utility,
      r.when === "before-deadline" ? "wants net-metering incentive (install by 28 Feb 2027)" : `timeline: ${r.when}`,
      r.geo && `GPS ${r.geo}`,
      r.notes,
    ].filter(Boolean).join("; "),
    r.ref,
  ];
}

const cell = (v: unknown) => {
  const s = String(v ?? "");
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function toSolsetCsv(rows: SetupRequest[]) {
  // BOM so Excel and Solset read Bangla text as UTF-8
  return "﻿" + [SOLSET_COLUMNS, ...rows.map(solsetRow)].map((r) => r.map(cell).join(",")).join("\r\n");
}

export function leadText(r: SetupRequest) {
  return [
    `${r.name} — ${r.category}, ${r.kw} kWp`,
    `ফোন: ${r.phone}`,
    `ঠিকানা: ${r.address}, ${r.upazila}, ${r.district}`,
    `বিতরণ: ${r.utility} · অনুমোদিত লোড ${r.load} kW · মাসিক ${r.units} ইউনিট`,
    `ছাদ: ${r.roof} বর্গফুট ${r.roofType}`,
    `চাহিদা: ${r.goals.join(", ")}`,
    r.geo ? `অবস্থান: ${r.geo}` : "",
    `রেফ: ${r.ref}`,
  ].filter(Boolean).join("\n");
}
