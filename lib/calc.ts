import { POLICY } from "./data/policy";

/** Rough planning assumptions for Bangladesh; a provider's site survey + Solset design replaces these. */
export const YIELD_KWH_PER_KWP_DAY = 4.2;
export const SQFT_PER_KWP = 100;

export function systemSize(roofSqft: number) {
  return Math.floor((Math.max(0, roofSqft) / SQFT_PER_KWP) * 2) / 2;
}

export function estimate(roofSqft: number, monthlyUnits: number) {
  const kw = systemSize(roofSqft);
  const gen = kw * YIELD_KWH_PER_KWP_DAY * 365;
  const use = Math.max(0, monthlyUnits) * 12;
  const exp = Math.max(0, gen - use);
  const yearlyIncome = exp * POLICY.tariff;
  return {
    kw,
    gen,
    use,
    exp,
    quarterly: yearlyIncome / 4,
    /** Income across the full incentive window (3 years, until 28 Feb 2030) */
    windowTotal: yearlyIncome * POLICY.tariffYears,
    /** Upper bound on generation cost at the notified ৳8/unit cap */
    costCapYearly: gen * POLICY.costCap,
  };
}
