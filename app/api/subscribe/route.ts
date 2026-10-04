import { NextResponse } from "next/server";
import { DISTRICT_BY_BN } from "@/lib/data/districts";
import { mutate, readDb, uid } from "@/lib/store";
import { PHONE_RE, oneOf, str } from "@/lib/validate";
import type { Subscriber } from "@/lib/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseContact(channel: string, raw: unknown) {
  const v = str(raw, 150).toLowerCase();
  if (channel === "sms") return PHONE_RE.test(v) ? v : null;
  return EMAIL_RE.test(v) ? v : null;
}

/** POST { channel: "email"|"sms", contact, role?, district? } — subscribe (idempotent). */
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const channel = oneOf(b?.channel, ["email", "sms"], "email") as Subscriber["channel"];
  const contact = parseContact(channel, b?.contact);
  if (!contact) {
    return NextResponse.json({ error: channel === "sms" ? "সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)" : "সঠিক ইমেইল ঠিকানা দিন" }, { status: 422 });
  }
  const district = str(b?.district, 40);
  const role = oneOf(b?.role, ["owner", "provider", "other"], "other") as Subscriber["role"];

  const existed = await mutate((db) => {
    const found = db.subscribers.find((s) => s.contact === contact);
    if (found) {
      found.role = role;
      if (DISTRICT_BY_BN[district]) found.district = district;
      return true;
    }
    db.subscribers.push({ id: uid(), channel, contact, role, district: DISTRICT_BY_BN[district] ? district : "", created: new Date().toISOString() });
    return false;
  });
  return NextResponse.json({ ok: true, existed }, { status: existed ? 200 : 201 });
}

/** DELETE { channel, contact } — unsubscribe. Always answers ok so it can't be used to probe who's subscribed. */
export async function DELETE(req: Request) {
  const b = await req.json().catch(() => null);
  const contact = parseContact(oneOf(b?.channel, ["email", "sms"], "email"), b?.contact);
  if (!contact) return NextResponse.json({ error: "সঠিক ইমেইল বা মোবাইল নম্বর দিন" }, { status: 422 });
  await mutate((db) => {
    db.subscribers = db.subscribers.filter((s) => s.contact !== contact);
  });
  return NextResponse.json({ ok: true });
}

/** GET ?token=ADMIN_TOKEN — subscriber list as CSV, for sending the newsletter/SMS. */
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: "অনুমতি নেই" }, { status: 403 });
  }
  const { subscribers } = await readDb();
  const rows = [["channel", "contact", "role", "district", "created"], ...subscribers.map((s) => [s.channel, s.contact, s.role, s.district, s.created])];
  return new NextResponse("﻿" + rows.map((r) => r.join(",")).join("\r\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="subscribers.csv"', "Cache-Control": "no-store" },
  });
}
