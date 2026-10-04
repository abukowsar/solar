import { NextResponse } from "next/server";
import {
  SESSION_COOKIE, adminConfigured, checkPassword, clearLoginFailures, createSessionValue, loginThrottled, recordLoginFailure,
} from "@/lib/auth";
import { audit, mutate } from "@/lib/store";

const ipOf = (req: Request) => req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";

/** POST { password } — sign in. */
export async function POST(req: Request) {
  if (!adminConfigured()) {
    return NextResponse.json({ error: ".env.local-এ ADMIN_PASSWORD সেট করা নেই" }, { status: 503 });
  }
  const ip = ipOf(req);
  if (loginThrottled(ip)) {
    return NextResponse.json({ error: "অনেকবার ভুল পাসওয়ার্ড — ১০ মিনিট পরে চেষ্টা করুন" }, { status: 429 });
  }
  const b = await req.json().catch(() => null);
  if (typeof b?.password !== "string" || !checkPassword(b.password)) {
    recordLoginFailure(ip);
    return NextResponse.json({ error: "পাসওয়ার্ড সঠিক নয়" }, { status: 401 });
  }
  clearLoginFailures(ip);
  await mutate((db) => audit(db, "লগইন", ip));

  const { value, maxAge } = createSessionValue();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, value, {
    httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge,
  });
  return res;
}

/** DELETE — sign out. */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "strict", path: "/", maxAge: 0 });
  return res;
}
