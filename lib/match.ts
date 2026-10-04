import type { PublicProvider, SetupRequest } from "./types";

/**
 * Internal ranking used to order providers on the board. Not an official evaluation —
 * enlistment is decided by the distribution utility's committee.
 */
export function matchScore(p: PublicProvider, r: Pick<SetupRequest, "district" | "category" | "goals">) {
  const serves = p.serve.includes(r.district);
  if (!serves && p.home !== r.district) return -1;
  let s = 0;
  if (p.home === r.district) s += 30;
  if (serves) s += 15;
  if (p.enlistment === "enlisted") s += 25;
  else if (p.enlistment === "applied") s += 10;
  if (p.types.includes(r.category)) s += 10;
  s += r.goals.filter((g) => p.services.includes(g)).length * 4;
  s += Math.min(15, Math.floor(p.expKw / 20));
  s += p.docs.length * 2;
  return s;
}

export function rankProviders(providers: PublicProvider[], r: SetupRequest) {
  return providers
    .map((p) => ({ p, score: matchScore(p, r) }))
    .filter((x) => x.score >= 0)
    .sort((a, b) => b.score - a.score);
}
