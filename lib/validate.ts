export const PHONE_RE = /^01[3-9]\d{8}$/;

export const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export const num = (v: unknown, min: number, max: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;
};

/** Keep only allowed values from an array input. */
export const pick = (v: unknown, allowed: readonly string[]) =>
  Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === "string" && allowed.includes(x)))] : [];

export const oneOf = (v: unknown, allowed: readonly string[], fallback = "") =>
  typeof v === "string" && allowed.includes(v) ? v : fallback;
