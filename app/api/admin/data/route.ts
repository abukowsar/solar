import { NextResponse } from "next/server";
import { denyUnlessAdmin } from "@/lib/auth";
import { solsetConfigured } from "@/lib/solset-api";
import { readDb } from "@/lib/store";

/** Everything the admin panel needs, unmasked. */
export async function GET() {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;
  const db = await readDb();
  const byNewest = <T extends { created: string }>(xs: T[]) => xs.slice().sort((a, b) => b.created.localeCompare(a.created));
  return NextResponse.json(
    {
      requests: byNewest(db.requests),
      providers: byNewest(db.providers),
      designs: byNewest(db.designs),
      subscribers: byNewest(db.subscribers),
      settings: db.settings,
      audit: db.audit.slice(0, 100),
      integrations: {
        solsetApi: solsetConfigured(),
        solsetWebhook: !!process.env.SOLSET_WEBHOOK_URL,
        adminToken: !!process.env.ADMIN_TOKEN,
        adminSecret: !!process.env.ADMIN_SECRET,
        dataFile: process.env.DATA_FILE || "data/db.json",
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
