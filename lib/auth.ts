import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const SESSION_COOKIE = "rts_admin";
const SESSION_HOURS = 8;

/** Signing key: ADMIN_SECRET if set, else derived from the password (rotating the password logs everyone out). */
function secret() {
  return process.env.ADMIN_SECRET || (process.env.ADMIN_PASSWORD ? `pw:${process.env.ADMIN_PASSWORD}` : "");
}

export const adminConfigured = () => !!process.env.ADMIN_PASSWORD;

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function checkPassword(pw: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  // Compare HMACs so length differences don't leak through timing.
  return safeEqual(sign(`pw|${pw}`), sign(`pw|${expected}`));
}

export function createSessionValue() {
  const exp = Date.now() + SESSION_HOURS * 3600_000;
  return { value: `${exp}.${sign(String(exp))}`, maxAge: SESSION_HOURS * 3600 };
}

function validSession(value: string | undefined) {
  if (!value || !secret()) return false;
  const [exp, sig] = value.split(".");
  return !!exp && !!sig && Number(exp) > Date.now() && safeEqual(sig, sign(exp));
}

export async function isAdmin() {
  return validSession((await cookies()).get(SESSION_COOKIE)?.value);
}

/** For admin route handlers: returns a 401 response when not signed in, otherwise null. */
export async function denyUnlessAdmin() {
  return (await isAdmin()) ? null : NextResponse.json({ error: "লগইন প্রয়োজন" }, { status: 401 });
}

// Naive in-memory login throttle: 5 failed attempts per IP per 10 minutes.
const attempts = new Map<string, { n: number; until: number }>();
export function loginThrottled(ip: string) {
  const a = attempts.get(ip);
  return !!a && a.n >= 5 && a.until > Date.now();
}
export function recordLoginFailure(ip: string) {
  const a = attempts.get(ip);
  if (!a || a.until < Date.now()) attempts.set(ip, { n: 1, until: Date.now() + 10 * 60_000 });
  else a.n++;
}
export function clearLoginFailures(ip: string) {
  attempts.delete(ip);
}
