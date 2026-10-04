import { TENDER } from "./data/tender";

export const UTILITIES = ["BREB (পল্লী বিদ্যুৎ)", "BPDB", "DPDC", "DESCO", "WZPDC (ওজোপাডিকো)", "NESCO"];
/** Installation categories named in the BPDB invitation */
export const CATEGORIES: readonly string[] = TENDER.scope;
export const ROOF_TYPES = ["পাকা (RCC) সমতল", "টিনের ঢালু ছাদ", "সেমি-পাকা", "খোলা জমি / জলাশয়"];
export const GOALS = ["নিজস্ব ব্যবহার", "গ্রিডে বিক্রি (নেট মিটারিং)", "ব্যাটারি ব্যাকআপ", "ছাদ ভাড়া দিতে চাই", "O&M / রক্ষণাবেক্ষণ"];
export const WHEN = [
  { value: "before-deadline", label: "২৮ ফেব্রুয়ারি ২০২৭-এর আগে (প্রণোদনা প্রযোজ্য)" },
  { value: "later", label: "২৮ ফেব্রুয়ারি ২০২৭-এর পরে" },
  { value: "undecided", label: "এখনো ঠিক করিনি" },
];
export const SOURCES = [
  { value: "QR-B", label: "QR-B (ছাদ মালিক পোস্টার)" },
  { value: "QR-A", label: "QR-A (প্রোভাইডার পোস্টার)" },
  { value: "direct", label: "সরাসরি / অন্যান্য" },
];
export const STAGES = ["নতুন অনুরোধ", "সাইট সার্ভে", "ডিজাইন", "কোটেশন", "স্থাপন", "গ্রিড সংযোগ"];
/** Closest Solset pipeline stage for each local stage */
export const SOLSET_STAGE = ["Enquiry", "Site Survey", "Design", "Quotation", "Build", "Commissioned"];
export const PROVIDER_KINDS = [
  { value: "new", label: "নতুন উদ্যোক্তা" },
  { value: "exp", label: "অভিজ্ঞ প্রতিষ্ঠান" },
  { value: "jv", label: "যৌথ উদ্যোগ (অভিজ্ঞের সঙ্গে)" },
];
export const ENLISTMENT = [
  { value: "none", label: "এখনো আবেদন করিনি" },
  { value: "applied", label: "বিতরণ অফিসে আবেদন জমা দিয়েছি" },
  { value: "enlisted", label: "জেলায় তালিকাভুক্ত" },
];
