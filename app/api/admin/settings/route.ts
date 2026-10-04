import { NextResponse } from "next/server";
import { denyUnlessAdmin } from "@/lib/auth";
import { DEFAULT_SETTINGS, parseSettings } from "@/lib/settings";
import { audit, mutate } from "@/lib/store";

/** PUT { ...settings } or { reset: true } — replace site settings. */
export async function PUT(req: Request) {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;
  const b = await req.json().catch(() => null);
  const settings = b?.reset === true ? structuredClone(DEFAULT_SETTINGS) : parseSettings(b);
  await mutate((db) => {
    db.settings = settings;
    audit(db, b?.reset === true ? "সেটিংস ডিফল্টে ফেরত" : "সেটিংস হালনাগাদ", "সাইট");
  });
  return NextResponse.json(settings);
}
