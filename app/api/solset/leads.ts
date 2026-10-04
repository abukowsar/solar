import { readDb } from "@/lib/store";

/**
 * Leads a caller may export with full contact details:
 * - ?provider=<id>  → requests that provider has expressed interest in
 * - ?token=<ADMIN_TOKEN> → every request (only if ADMIN_TOKEN is configured)
 */
export async function leadsFor(provider: string | null, token: string | null) {
  const { requests, providers } = await readDb();
  const admin = !!process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN;
  if (admin) return { ok: true as const, rows: requests, label: "all" };
  const p = provider ? providers.find((x) => x.id === provider) : undefined;
  if (!p) return { ok: false as const };
  return { ok: true as const, rows: requests.filter((r) => r.interests.includes(p.id)), label: p.ref.replace(/\//g, "-"), provider: p };
}
