import { NextResponse } from "next/server";
import { STAGES } from "@/lib/options";
import { mutate, viewRequest } from "@/lib/store";

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/**
 * Body: { as: providerId, action: "interest" } toggles that provider's interest;
 *       { as: providerId, stage: n } moves the pipeline (only an interested provider may).
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await req.json().catch(() => null);
  const as = typeof b?.as === "string" ? b.as : "";

  try {
    const updated = await mutate((db) => {
      const r = db.requests.find((x) => x.id === id);
      if (!r) throw new HttpError(404, "অনুরোধ পাওয়া যায়নি");
      if (!db.providers.some((p) => p.id === as)) throw new HttpError(403, "নিবন্ধিত প্রোভাইডার হিসেবে বেছে নিন");

      if (b.action === "interest") {
        r.interests = r.interests.includes(as) ? r.interests.filter((x) => x !== as) : [...r.interests, as];
      } else if (Number.isInteger(b.stage) && b.stage >= 0 && b.stage < STAGES.length) {
        if (!r.interests.includes(as)) throw new HttpError(403, "ধাপ বদলাতে আগে আগ্রহ জানান");
        r.stage = b.stage;
      } else {
        throw new HttpError(400, "অবৈধ হালনাগাদ");
      }
      return r;
    });
    return NextResponse.json(viewRequest(updated, as));
  } catch (e) {
    if (e instanceof HttpError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
