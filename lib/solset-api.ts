import "server-only";
import type { DesignInput, DesignResult } from "./design";

/**
 * Server-side adapter for the Solset AI API.
 *
 * Solset does not publish a public API yet (no docs at solset.ai/api, /docs or /developers);
 * access is arranged through https://solset.ai/contact/enterprise. Once you have credentials,
 * set these env vars and adjust `toSolsetPayload` / the response mapping to their contract:
 *
 *   SOLSET_API_URL        e.g. https://api.solset.ai
 *   SOLSET_API_KEY        bearer token issued by Solset
 *   SOLSET_DESIGN_PATH    default /v1/designs
 *   SOLSET_WORKSPACE_ID   optional, the programme's Solset workspace
 *
 * Until configured, designs are kept locally and nothing is sent anywhere.
 */
export function solsetConfigured() {
  return !!(process.env.SOLSET_API_URL && process.env.SOLSET_API_KEY);
}

export type SolsetSyncResult =
  | { mode: "solset"; id: string; url?: string }
  | { mode: "local" }
  | { mode: "error"; error: string };

type Contact = { name?: string; phone?: string; district?: string; geo?: string };

function toSolsetPayload(ref: string, input: DesignInput, r: DesignResult, contact: Contact) {
  return {
    externalRef: ref,
    workspaceId: process.env.SOLSET_WORKSPACE_ID || undefined,
    source: "bd-rooftop-solar",
    country: "BD",
    customer: { name: contact.name, phone: contact.phone, city: contact.district, location: contact.geo },
    site: {
      roof: { lengthFt: input.roofL, widthFt: input.roofW, type: input.roofType === "rcc" ? "flat_rcc" : "metal_sloped", setbackFt: input.setback, obstructionPct: input.obstruction },
      monthlyConsumptionKwh: input.units,
      sanctionedLoadKw: input.load,
    },
    system: {
      capacityKwp: r.kwp,
      modules: { watt: r.panel.w, count: r.count, tiltDeg: r.tilt, azimuth: "south" },
      inverter: { kw: r.inverterKw, type: input.battery ? "hybrid" : "on_grid" },
      battery: r.batteryKwh ? { kwh: r.batteryKwh, chemistry: "LiFePO4", modules: r.batteryModules } : null,
    },
    estimate: {
      annualGenerationKwh: Math.round(r.gen),
      exportKwh: Math.round(r.exp),
      capexBdt: Math.round(r.capex),
      lcoeBdtPerKwh: Number(r.lcoe.toFixed(2)),
      bom: r.bom.map((b) => ({ item: b.item, spec: b.spec, qty: b.qty, unit: b.unit, amountBdt: Math.round(b.amount) })),
    },
    incentive: { scheme: "Power Division net-metering incentive 2026", tariffBdtPerKwh: 10.5, installBy: "2027-02-28", validUntil: "2030-02-28" },
  };
}

export async function pushDesignToSolset(ref: string, input: DesignInput, r: DesignResult, contact: Contact): Promise<SolsetSyncResult> {
  if (!solsetConfigured()) return { mode: "local" };
  const base = process.env.SOLSET_API_URL!.replace(/\/$/, "");
  const path = process.env.SOLSET_DESIGN_PATH || "/v1/designs";
  try {
    const res = await fetch(base + path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SOLSET_API_KEY}`,
        "Idempotency-Key": ref,
      },
      body: JSON.stringify(toSolsetPayload(ref, input, r, contact)),
      signal: AbortSignal.timeout(15_000),
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) return { mode: "error", error: `Solset API ${res.status}${data.message ? `: ${data.message}` : ""}` };
    const id = String(data.id ?? data.designId ?? "");
    const url = typeof data.url === "string" ? data.url : undefined;
    return { mode: "solset", id, url };
  } catch (e) {
    return { mode: "error", error: e instanceof Error && e.name === "TimeoutError" ? "Solset API সময়মতো সাড়া দেয়নি" : "Solset API-তে সংযোগ ব্যর্থ" };
  }
}
