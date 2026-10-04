import { POLICY } from "./data/policy";
import { TENDER } from "./data/tender";

export type Notice = { text: string; href: string };
export type Settings = {
  notices: Notice[];
  helpline: { label: string; phone: string };
  announcement: { active: boolean; kind: "info" | "warn"; text: string; href: string };
};

/** Defaults come from the two source documents; admins can override everything in /admin/settings. */
export const DEFAULT_SETTINGS: Settings = {
  notices: [
    { href: "/policy", text: "ছাদভিত্তিক সৌরবিদ্যুৎ: গ্রিডে সরবরাহকৃত প্রতি ইউনিট ১০.৫০ টাকা — বিদ্যুৎ বিভাগের প্রজ্ঞাপন, ০১ সেপ্টেম্বর ২০২৬" },
    { href: "/request", text: "২৮ ফেব্রুয়ারি ২০২৭-এর মধ্যে স্থাপন করলে ২৮ ফেব্রুয়ারি ২০৩০ পর্যন্ত প্রণোদনা — আজই আবেদন করুন" },
    { href: "/policy", text: "প্রণোদনার অর্থ প্রতি তিন মাস অন্তর সরাসরি ব্যাংক হিসাবে; নগদে কোনো লেনদেন নয়" },
    { href: "/provider", text: `চট্টগ্রাম বিভাগে রুফটপ সোলার সার্ভিস প্রোভাইডার তালিকাভুক্তি — বিউবো বিজ্ঞপ্তি ${TENDER.ref}` },
    { href: POLICY.sourceUrl, text: "যন্ত্রপাতি BSTI ও SREDA নির্ধারিত কারিগরি মানদণ্ড অনুযায়ী হতে হবে" },
  ],
  helpline: { label: "সহায়তা (বিউবো, চট্টগ্রাম)", phone: TENDER.official.phone },
  announcement: { active: false, kind: "info", text: "", href: "" },
};

const s = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
/** Internal paths or http(s) URLs only — never javascript: or other schemes. */
const safeHref = (v: unknown) => {
  const h = s(v, 500);
  return /^(\/[^\s]*|https?:\/\/[^\s]+)$/i.test(h) ? h : "";
};

export function parseSettings(b: unknown): Settings {
  const x = (b ?? {}) as Record<string, any>;
  const notices = Array.isArray(x.notices)
    ? x.notices.slice(0, 12).map((n: any) => ({ text: s(n?.text, 300), href: safeHref(n?.href) || "/" })).filter((n: Notice) => n.text)
    : DEFAULT_SETTINGS.notices;
  return {
    notices,
    helpline: {
      label: s(x.helpline?.label, 80) || DEFAULT_SETTINGS.helpline.label,
      phone: s(x.helpline?.phone, 20).replace(/[^\d+\- ]/g, "") || DEFAULT_SETTINGS.helpline.phone,
    },
    announcement: {
      active: x.announcement?.active === true,
      kind: x.announcement?.kind === "warn" ? "warn" : "info",
      text: s(x.announcement?.text, 300),
      href: safeHref(x.announcement?.href),
    },
  };
}
