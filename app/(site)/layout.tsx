import Link from "next/link";
import { Info, Phone, TriangleAlert } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import Footer from "@/components/Footer";
import GovStrip from "@/components/GovStrip";
import Nav from "@/components/Nav";
import Ticker from "@/components/Ticker";
import { getSettings } from "@/lib/store";

// Header, ticker and banner are editable from /admin/settings, so render per request.
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const ann = settings.announcement;

  return (
    <>
      <a className="skip" href="#content">মূল বিষয়বস্তুতে যান</a>
      <GovStrip />
      <header className="site-header">
        <div className="wrap">
          <Link href="/" className="brand">
            <BrandMark />
            <div>
              <h1>ছাদে সোলার · সংযোগ ডেস্ক</h1>
              <p>জাতীয় রুফটপ সোলার কর্মসূচি — ছাদ মালিক ও সার্ভিস প্রোভাইডারের সংযোগ</p>
            </div>
          </Link>
          <div className="header-cta">
            <a className="helpline" href={`tel:${settings.helpline.phone.replace(/[^\d+]/g, "")}`}>
              <Phone size={22} color="var(--red)" aria-hidden="true" />
              <span>{settings.helpline.label}<b>{settings.helpline.phone}</b></span>
            </a>
          </div>
        </div>
        <div className="flag-rule" aria-hidden="true" />
      </header>
      <Nav />
      {ann.active && ann.text && (
        <div className={`announce ${ann.kind}`} role="status">
          <div className="wrap">
            {ann.kind === "warn" ? <TriangleAlert size={18} aria-hidden="true" /> : <Info size={18} aria-hidden="true" />}
            <span>{ann.text}</span>
            {ann.href && <a href={ann.href}>বিস্তারিত →</a>}
          </div>
        </div>
      )}
      <Ticker notices={settings.notices} />
      <main id="content">{children}</main>
      <Footer />
    </>
  );
}
