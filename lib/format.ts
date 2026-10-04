const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

export const bn = (v: string | number) => String(v).replace(/\d/g, (d) => BN_DIGITS[+d]);

export const fmt = (n: number, digits = 0) =>
  bn(Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: digits, minimumFractionDigits: digits }));

export const bdDate = (iso: string) =>
  bn(new Date(iso).toLocaleDateString("en-GB", { timeZone: "Asia/Dhaka" }));

/** Convert Bangla digits to ASCII and strip everything else (for phone inputs). */
export const digitsOnly = (s: string) =>
  s.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d))).replace(/\D/g, "");
