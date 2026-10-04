// Source: BPDB Invitation of Applications from Service Providers, docs/tender_27083_0.pdf
export const TENDER = {
  ref: "27.11.1500.750.4.21.2026-385",
  date: "2026-08-27",
  agency: "বাংলাদেশ বিদ্যুৎ উন্নয়ন বোর্ড (BPDB)",
  ministry: "Ministry of Power, Energy and Mineral Resources / Power Division",
  programme: "National Rooftop Solar Programme",
  division: "Chattogram",
  lastSelling: "2026-09-27T12:00:00+06:00",
  closing: "2026-09-27T15:00:00+06:00",
  formPrice: 500,
  registrationFee: 5000,
  copies: "মূল আবেদন ও দুটি কপি নির্ধারিত সময়ের মধ্যে জমা দিতে হবে।",
  perDistrict:
    "জেলাভিত্তিক তালিকাভুক্তি: যে জেলার জন্য আবেদন, শুধু সেই জেলাতেই তালিকাভুক্তির জন্য বিবেচিত হবে।",
  sourceUrl: "https://misc.bpdb.gov.bd/storage/tender/tender_27083_0.pdf",
  localPdf: "/docs/tender_27083_0.pdf",
  official: {
    name: "Mohammad Anowarul Islam",
    title: "Superintending Engineer, O&M Circle, Chattogram (South), BPDB",
    address: "Biddut Bhaban (2nd Floor), Agrabad, Chattogram",
    phone: "01777-760034",
    emails: ["se_southctgpdb@yahoo.com", "se.south.ctg@bpdb.gov.bd"],
  },
  scope: [
    "বাসাবাড়ি",
    "বাণিজ্যিক স্থাপনা",
    "সোলার সেচ পাম্প",
    "সোলার কোল্ড স্টোরেজ",
    "EV চার্জিং স্টেশন",
    "ভাসমান সোলার",
    "অন্যান্য ব্যক্তিমালিকানাধীন স্থাপনা",
  ],
  responsibilities: [
    "বাসাবাড়ি, বাণিজ্যিক স্থাপনা, সেচ পাম্প ও অন্যান্য ব্যক্তিমালিকানাধীন স্থাপনায় রুফটপ সোলার স্থাপনের সেবা দেওয়া",
    "ব্যক্তিমালিকানাধীন ছাদ/প্রাঙ্গণ ভাড়া নিয়ে সোলার বসানো এবং উদ্বৃত্ত বিদ্যুৎ বিতরণ সংস্থার কাছে বিক্রি",
    "সিস্টেম চালু রাখতে পরিচালন ও রক্ষণাবেক্ষণ (O&M)",
    "রুফটপ সোলার স্থাপনে সহায়তায় হেল্পলাইন ডেস্ক চালু ও পরিচালনা",
    "বিভিন্ন মডেল, প্যাকেজ ও আর্থিক সুবিধা নিয়ে সম্পত্তি মালিকদের উদ্বুদ্ধ ও প্রচার করা",
  ],
} as const;

export const ELIGIBILITY = [
  { key: "trade", label: "বৈধ ট্রেড লাইসেন্স" },
  { key: "tin", label: "TIN" },
  { key: "solv", label: "১০ লাখ টাকার ব্যাংক সলভেন্সি সার্টিফিকেট (তফসিলি ব্যাংক, জমার ৬ মাসের মধ্যে ইস্যু)" },
  { key: "tax", label: "সর্বশেষ অর্থবছরের সব কর পরিশোধের সনদ" },
  { key: "exp", label: "ন্যূনতম ২ kW সোলার সিস্টেম স্থাপনের অভিজ্ঞতা" },
] as const;
export type EligibilityKey = (typeof ELIGIBILITY)[number]["key"];

/** Offices that sell and receive application forms, per district (same list for both). Keyed by Bangla district name. */
export const TENDER_OFFICES: Record<string, string[]> = {
  চট্টগ্রাম: ["Operation & Maintenance (O&M) Circle, South, BPDB, Chittagong", "GM office, Chittagong Palli Bidyut Samity-1"],
  কুমিল্লা: ["Sales and Distribution Division-2, BPDB, Cumilla", "GM office, Cumilla Palli Bidyut Samity-1"],
  ব্রাহ্মণবাড়িয়া: ["Sales and Distribution Division-1, BPDB, Brahmanbaria", "GM office, Brahmanbaria Palli Bidyut Samity"],
  নোয়াখালী: ["Sales and Distribution Division, BPDB, Choumuhani, Noakhali", "GM office, Noakhali Palli Bidyut Samity"],
  কক্সবাজার: ["Cox's Bazar Distribution Division, BPDB, Cox's Bazar", "GM office, Cox's Bazar Palli Bidyut Samity"],
  ফেনী: ["Feni Distribution Division, BPDB, Feni", "GM office, Feni Palli Bidyut Samity"],
  চাঁদপুর: ["Sales and Distribution Division, BPDB, Chandpur", "GM office, Chandpur Palli Bidyut Samity-1"],
  লক্ষ্মীপুর: ["Sales and Distribution Division, BPDB, Laxmipur", "GM office, Laxmipur Palli Bidyut Samity"],
  রাঙ্গামাটি: ["Sales and Distribution Division, BPDB, Rangamati"],
  খাগড়াছড়ি: ["Distribution Division-Khagrachari, BPDB"],
  বান্দরবান: ["Sales and Distribution Division, BPDB, Bandarban"],
};

export function tenderStatus(now = new Date()) {
  const close = new Date(TENDER.closing);
  return { closed: now > close, close };
}
