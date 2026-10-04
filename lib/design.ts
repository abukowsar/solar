import { POLICY } from "./data/policy";
import { YIELD_KWH_PER_KWP_DAY } from "./calc";

/** Common BD-market module sizes (dimensions in metres). */
export const PANELS = [
  { w: 450, l: 2.094, wd: 1.038, label: "৪৫০ W (মনো PERC)" },
  { w: 550, l: 2.278, wd: 1.134, label: "৫৫০ W (মনো PERC)" },
  { w: 580, l: 2.278, wd: 1.134, label: "৫৮০ W (N-type TOPCon)" },
] as const;

const INVERTER_KW = [3, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50, 60, 80, 100];
const BATTERY_MODULE_KWH = 5.12; // 51.2 V 100 Ah LiFePO4
const DOD = 0.9;
const LIFE_YEARS = 20;
const DEGRADATION = 0.005;
const FT_PER_M = 3.28084;
const MODULE_GAP_FT = 0.08;
/** 1 / tan(winter-solstice noon sun altitude ≈ 43° in Bangladesh) — row spacing so rows don't shade each other */
const SHADOW_FACTOR = 1.08;

/**
 * Indicative unit rates (BDT) used only to give owners a ballpark. Every rate is editable in the UI;
 * the provider's quotation replaces these.
 */
export const DEFAULT_PRICES = {
  panelPerW: 24,
  inverterGridPerW: 9,
  inverterHybridPerW: 14,
  batteryPerKwh: 18000,
  structureRccPerW: 4,
  structureTinPerW: 2.5,
  bosPerW: 5,
  installPerW: 3,
  netMeter: 15000,
  retailTariff: 9,
};
export type Prices = typeof DEFAULT_PRICES;

export const DEFAULT_DESIGN = {
  roofL: 40,
  roofW: 30,
  roofType: "rcc" as "rcc" | "tin",
  setback: 3,
  obstruction: 10,
  panelW: 550,
  battery: true,
  essentialKw: 1,
  backupHours: 4,
  units: 250,
  load: 5,
  limitToLoad: true,
  prices: DEFAULT_PRICES,
};
export type DesignInput = typeof DEFAULT_DESIGN;

export type BomLine = { item: string; spec: string; qty: number; unit: string; amount: number };

export function designSystem(d: DesignInput) {
  const panel = PANELS.find((p) => p.w === d.panelW) ?? PANELS[1];
  const pl = panel.l * FT_PER_M;
  const pw = panel.wd * FT_PER_M;
  const tilt = d.roofType === "rcc" ? 23 : 0;
  const rad = (tilt * Math.PI) / 180;

  const uL = Math.max(0, d.roofL - 2 * d.setback);
  const uW = Math.max(0, d.roofW - 2 * d.setback);
  // Tilted rows on a flat roof need inter-row spacing; flush-mounted panels on tin don't.
  const depth = pl * Math.cos(rad);
  const pitch = tilt ? depth + pl * Math.sin(rad) * SHADOW_FACTOR : pl + MODULE_GAP_FT;
  const rows = uL >= depth ? Math.floor((uL - depth) / pitch) + 1 : 0;
  const cols = Math.floor((uW + MODULE_GAP_FT) / (pw + MODULE_GAP_FT));
  const fit = Math.floor(rows * cols * (1 - Math.min(90, Math.max(0, d.obstruction)) / 100));
  const loadCap = d.load > 0 ? Math.floor((d.load * 1000) / panel.w) : Infinity;
  const count = d.limitToLoad ? Math.min(fit, loadCap) : fit;
  const cappedByLoad = d.limitToLoad && loadCap < fit;

  const kwp = (count * panel.w) / 1000;
  const gen = kwp * YIELD_KWH_PER_KWP_DAY * 365 * (tilt ? 1 : 0.93);
  const use = Math.max(0, d.units) * 12;
  const selfUse = Math.min(use, gen);
  const exp = Math.max(0, gen - use);

  const inverterKw = kwp ? INVERTER_KW.find((k) => k >= kwp * 0.9) ?? Math.ceil(kwp) : 0;
  const batteryModules = d.battery && kwp ? Math.ceil((d.essentialKw * d.backupHours) / DOD / BATTERY_MODULE_KWH) : 0;
  const batteryKwh = batteryModules * BATTERY_MODULE_KWH;

  const p = d.prices;
  const W = kwp * 1000;
  const bom: BomLine[] = kwp
    ? [
        { item: "সোলার প্যানেল", spec: panel.label, qty: count, unit: "টি", amount: W * p.panelPerW },
        {
          item: d.battery ? "হাইব্রিড ইনভার্টার" : "অন-গ্রিড ইনভার্টার",
          spec: `${inverterKw} kW, নেট মিটারিং সমর্থিত`, qty: 1, unit: "টি",
          amount: inverterKw * 1000 * (d.battery ? p.inverterHybridPerW : p.inverterGridPerW),
        },
        ...(batteryModules
          ? [{ item: "LiFePO4 ব্যাটারি", spec: `${BATTERY_MODULE_KWH} kWh মডিউল · মোট ${batteryKwh.toFixed(1)} kWh`, qty: batteryModules, unit: "টি", amount: batteryKwh * p.batteryPerKwh }]
          : []),
        {
          item: "মাউন্টিং স্ট্রাকচার",
          spec: d.roofType === "rcc" ? `গ্যালভানাইজড/অ্যালুমিনিয়াম, ${tilt}° দক্ষিণমুখী` : "টিনের ছাদে ফ্লাশ রেল",
          qty: count, unit: "সেট", amount: W * (d.roofType === "rcc" ? p.structureRccPerW : p.structureTinPerW),
        },
        { item: "ক্যাবল, DCDB/ACDB, আর্থিং, সুরক্ষা", spec: "DC/AC ক্যাবল, SPD, MCB, লাইটনিং অ্যারেস্টার", qty: 1, unit: "লট", amount: W * p.bosPerW },
        { item: "স্থাপন ও কমিশনিং", spec: "শ্রম, পরিবহন, পরীক্ষা", qty: 1, unit: "লট", amount: W * p.installPerW },
        { item: "নেট মিটার ও আবেদন", spec: "বিতরণ সংস্থার দ্বিমুখী মিটার", qty: 1, unit: "টি", amount: p.netMeter },
      ]
    : [];
  const capex = bom.reduce((a, b) => a + b.amount, 0);

  // Levelised cost over 20 years: capex + 1%/yr O&M + one battery replacement, over degraded generation.
  let lifetimeGen = 0;
  for (let y = 0; y < LIFE_YEARS; y++) lifetimeGen += gen * (1 - DEGRADATION) ** y;
  const lifetimeCost = capex * (1 + 0.01 * LIFE_YEARS) + batteryKwh * p.batteryPerKwh;
  const lcoe = lifetimeGen ? lifetimeCost / lifetimeGen : 0;

  const yearlySaving = selfUse * p.retailTariff;
  const yearlyExport = exp * POLICY.tariff;
  const yearlyBenefit = yearlySaving + yearlyExport;

  return {
    panel, count, fit, cappedByLoad, rows, cols, kwp, tilt, pitch, depth, pl, pw,
    usable: { l: uL, w: uW },
    gen, use, selfUse, exp, inverterKw, batteryModules, batteryKwh,
    bom, capex, lcoe, underCap: lcoe > 0 && lcoe <= POLICY.costCap,
    yearlySaving, yearlyExport, yearlyBenefit,
    quarterlyExport: yearlyExport / 4,
    payback: yearlyBenefit ? capex / yearlyBenefit : 0,
    roofSqft: Math.round(d.roofL * d.roofW),
  };
}
export type DesignResult = ReturnType<typeof designSystem>;

const clamp = (v: unknown, lo: number, hi: number, dflt: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : dflt;
};

/** Sanitize untrusted input (server side) into a DesignInput. */
export function parseDesignInput(b: Record<string, unknown> | null | undefined): DesignInput {
  const x = b ?? {};
  const pr = (x.prices ?? {}) as Record<string, unknown>;
  const prices = Object.fromEntries(
    Object.entries(DEFAULT_PRICES).map(([k, v]) => [k, clamp(pr[k], 0, 10_000_000, v)]),
  ) as Prices;
  return {
    roofL: clamp(x.roofL, 5, 2000, DEFAULT_DESIGN.roofL),
    roofW: clamp(x.roofW, 5, 2000, DEFAULT_DESIGN.roofW),
    roofType: x.roofType === "tin" ? "tin" : "rcc",
    setback: clamp(x.setback, 0, 20, DEFAULT_DESIGN.setback),
    obstruction: clamp(x.obstruction, 0, 90, DEFAULT_DESIGN.obstruction),
    panelW: PANELS.some((p) => p.w === Number(x.panelW)) ? Number(x.panelW) : DEFAULT_DESIGN.panelW,
    battery: x.battery !== false,
    essentialKw: clamp(x.essentialKw, 0, 1000, DEFAULT_DESIGN.essentialKw),
    backupHours: clamp(x.backupHours, 0, 48, DEFAULT_DESIGN.backupHours),
    units: clamp(x.units, 0, 10_000_000, DEFAULT_DESIGN.units),
    load: clamp(x.load, 0, 100_000, DEFAULT_DESIGN.load),
    limitToLoad: x.limitToLoad !== false,
    prices,
  };
}
