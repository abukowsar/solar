import Link from "next/link";
import {
  ArrowUp, Briefcase, ClipboardList, ExternalLink, FileText, LayoutGrid, PencilRuler, SunMedium,
} from "lucide-react";
import BrandMark from "./BrandMark";
import Newsletter from "./Newsletter";

const LINKS = [
  { href: "/request", label: "সেটআপের অনুরোধ", Icon: ClipboardList },
  { href: "/design", label: "নিজে ডিজাইন করি", Icon: PencilRuler },
  { href: "/provider", label: "প্রোভাইডার নিবন্ধন", Icon: Briefcase },
  { href: "/board", label: "মিলান বোর্ড", Icon: LayoutGrid },
  { href: "/policy", label: "নীতিমালা ও বিজ্ঞপ্তি", Icon: FileText },
];

const TIMELINE = [
  { date: "০১ সেপ্টেম্বর ২০২৬", text: "প্রজ্ঞাপন কার্যকর", iso: "2026-09-01" },
  { date: "২৮ ফেব্রুয়ারি ২০২৭", text: "স্থাপনের শেষ তারিখ", iso: "2027-02-28" },
  { date: "২৮ ফেব্রুয়ারি ২০৩০", text: "৳১০.৫০ হার প্রযোজ্য পর্যন্ত", iso: "2030-02-28" },
];

const OFFICES = [
  { href: "https://powerdivision.gov.bd", label: "বিদ্যুৎ বিভাগ" },
  { href: "https://www.bpdb.gov.bd", label: "বাংলাদেশ বিদ্যুৎ উন্নয়ন বোর্ড" },
  { href: "https://sreda.gov.bd", label: "টেকসই ও নবায়নযোগ্য জ্বালানি উন্নয়ন কর্তৃপক্ষ (SREDA)" },
];

/** Rooftops with solar panels under a rising sun — decorative divider. */
function Skyline() {
  return (
    <svg className="skyline" viewBox="0 0 1200 90" preserveAspectRatio="none" aria-hidden="true">
      <circle cx="960" cy="58" r="34" fill="#F42A41" />
      <path fill="currentColor" d="M0 90V62h70V40l30-14 30 14v22h40V50h90V30h60v20h30V58l40-22 40 22v4h70V44h110v18h40V34l50-18 50 18v28h60V48h80V26h70v36h50V52l40-20 40 20v10h80V40h90v22h50v28z" />
      <g fill="#7fc3ff" opacity=".55">
        <path d="M78 36l22-10 22 10-22 10zM312 44l28-15 28 15-28 15zM618 28l32-11 32 11-32 11zM1020 46l30-14 30 14-30 14z" />
      </g>
    </svg>
  );
}

export default function Footer() {
  const now = new Date();
  return (
    <footer className="site-footer">
      <Skyline />
      <div className="footer-body">
        <div className="wrap"><Newsletter /></div>
        <div className="wrap cols">
          <div className="f-brand">
            <Link href="/" className="f-logo">
              <BrandMark className="f-mark" />
              <span><b>ছাদে সোলার</b><small>সংযোগ ডেস্ক</small></span>
            </Link>
            <p>
              বিদ্যুৎ বিভাগের প্রজ্ঞাপন (০১/০৯/২০২৬) ও বিউবোর সার্ভিস প্রোভাইডার আবেদন বিজ্ঞপ্তি (২৭/০৮/২০২৬) অনুযায়ী তৈরি। আনুমানিক হিসাব শুধু প্রাথমিক
              ধারণার জন্য; চূড়ান্ত সিদ্ধান্ত সংশ্লিষ্ট বিতরণ সংস্থার।
            </p>
            <div className="f-pills">
              <span><SunMedium size={14} aria-hidden="true" /> ৳১০.৫০ / ইউনিট</span>
              <span>প্রতি ৩ মাসে ব্যাংকে</span>
              <span>BSTI · SREDA মান</span>
            </div>
          </div>

          <nav aria-label="দ্রুত লিংক">
            <h4>দ্রুত লিংক</h4>
            <ul className="f-links">
              {LINKS.map(({ href, label, Icon }) => (
                <li key={href}><Link href={href}><Icon size={15} aria-hidden="true" /> {label}</Link></li>
              ))}
            </ul>
          </nav>

          <div>
            <h4>গুরুত্বপূর্ণ তারিখ</h4>
            <ol className="f-timeline">
              {TIMELINE.map((t) => (
                <li key={t.iso} className={new Date(t.iso + "T23:59:59+06:00") < now ? "past" : ""}>
                  <b>{t.date}</b>
                  <span>{t.text}</span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h4>সংশ্লিষ্ট দপ্তর</h4>
            <ul className="f-offices">
              {OFFICES.map((o) => (
                <li key={o.href}><a href={o.href} target="_blank" rel="noopener">{o.label} <ExternalLink size={12} aria-hidden="true" /></a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="wrap bottom">
          <span>© {now.getFullYear().toString().replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d])} ছাদে সোলার · সংযোগ ডেস্ক · পরিকল্পনা ও বাস্তবায়ন: বিউবো, চট্টগ্রাম</span>
          <span className="bottom-right">
            ডিজাইন ও লিড: Solset AI
            <a className="to-top" href="#top" aria-label="উপরে যান"><ArrowUp size={16} /></a>
          </span>
        </div>
      </div>
    </footer>
  );
}
