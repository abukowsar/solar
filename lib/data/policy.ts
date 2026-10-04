// Source: Power Division notification (প্রজ্ঞাপন), docs/fe3b2074-53e1-4111-98cf-8a2b3a1ee85a.pdf
export const POLICY = {
  ref: "২৭.০০.০০০০.০০০.০৯৬.২২.০০০৭.২৬.৪৮",
  issuer: "বিদ্যুৎ বিভাগ, বিদ্যুৎ, জ্বালানি ও খনিজ সম্পদ মন্ত্রণালয় · নবায়নযোগ্য জ্বালানি-২ শাখা",
  issuedBn: "১৭ ভাদ্র ১৪৩৩ / ০১ সেপ্টেম্বর ২০২৬",
  effective: "2026-09-01",
  /** Max production cost per unit (BDT) for rooftop solar with battery */
  costCap: 8,
  profitPct: 20,
  premiumPct: 11.25,
  /** 8 × (1 + 0.20 + 0.1125) = 10.50 BDT per unit exported */
  tariff: 10.5,
  /** System must be installed by this date to qualify */
  installDeadline: "2027-02-28",
  /** Tariff paid for 3 years, until this date */
  tariffUntil: "2030-02-28",
  tariffYears: 3,
  payoutEveryMonths: 3,
  guideline: "নেট মিটারিং নির্দেশিকা, ২০২৫",
  standards: ["BSTI", "SREDA"],
  sourceUrl:
    "https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-powerdivision/2026/8/fe3b2074-53e1-4111-98cf-8a2b3a1ee85a.pdf",
  localPdf: "/docs/fe3b2074-53e1-4111-98cf-8a2b3a1ee85a.pdf",
  contact: {
    name: "তাহমিলুর রহমান",
    title: "সিনিয়র সহকারী সচিব",
    phone: "০২৪১০৫৩৯৪৫",
    email: "re-2@pd.gov.bd",
  },
  points: [
    "ব্যাটারিসহ ছাদভিত্তিক সৌরবিদ্যুৎ উৎপাদনের ব্যয় প্রতি ইউনিট সর্বোচ্চ ৮ টাকা ধরা হয়েছে; তার ওপর ২০% মুনাফা ও ১১.২৫% প্রিমিয়াম যোগ করে হার ১০.৫০ টাকা।",
    "নির্ধারিত ব্যয়ের চেয়ে কম খরচে স্থাপন করতে পারলে সাশ্রয়কৃত অর্থ গ্রাহকের লভ্যাংশ।",
    "নেট মিটারিং নির্দেশিকা, ২০২৫ অনুযায়ী ২৮ ফেব্রুয়ারি ২০২৭-এর মধ্যে স্থাপন করে উদ্বৃত্ত বিদ্যুৎ গ্রিডে দিলে ২৮ ফেব্রুয়ারি ২০৩০ পর্যন্ত (৩ বছর) প্রতি ইউনিট ১০.৫০ টাকা।",
    "বিতরণ সংস্থা গ্রাহকের তথ্য, গ্রিডে সরবরাহকৃত বিদ্যুৎ ও মূল্য সংরক্ষণ করবে; প্রণোদনার অর্থ প্রতি তিন মাস অন্তর ব্যাংক হিসাবে যাবে, নগদে নয়।",
    "২৮ ফেব্রুয়ারি ২০২৭-এর পরে স্থাপিত সিস্টেমে এই প্রণোদনা প্রযোজ্য নয়।",
    "সোলার প্যানেল, ব্যাটারি, ইনভার্টার, মিটার ইত্যাদি BSTI ও SREDA-র কারিগরি মানদণ্ড অনুযায়ী হতে হবে।",
    "বিদ্যুৎ বিভাগের ওয়ান-স্টপ সার্ভিস সেন্টার এবং বিতরণ সংস্থার সব জেলা ও উপজেলা অফিস থেকে নীতিগত সহায়তা মিলবে।",
    "০১ সেপ্টেম্বর ২০২৬ থেকে কার্যকর।",
  ],
} as const;

export function incentiveOpen(now = new Date()) {
  return now <= new Date(POLICY.installDeadline + "T23:59:59+06:00");
}
