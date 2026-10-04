import { CheckCircle2, Download, ExternalLink, FileText, Landmark } from "lucide-react";
import { PageHead } from "@/components/ui";
import { POLICY, incentiveOpen } from "@/lib/data/policy";
import { ELIGIBILITY, TENDER, TENDER_OFFICES, tenderStatus } from "@/lib/data/tender";
import { bn, fmt } from "@/lib/format";

export const metadata = { title: "নীতিমালা ও বিজ্ঞপ্তি · ছাদে সোলার" };
export const dynamic = "force-dynamic";

export default function PolicyPage() {
  const tender = tenderStatus();
  const open = incentiveOpen();

  return (
    <div className="wrap page">
      <PageHead crumb="নীতিমালা ও বিজ্ঞপ্তি" title="নীতিমালা ও বিজ্ঞপ্তি" desc="এই পোর্টালের সব হার, সময়সীমা, যোগ্যতা ও অফিসের তথ্য নিচের দুটি সরকারি দলিল থেকে নেওয়া।" />

      <div className="grid-2">
        <article className="card pad-lg role">
          <div className="card-head">
            <span className="icon-badge"><FileText size={22} /></span>
            <div>
              <h3>বিদ্যুৎ বিভাগের প্রজ্ঞাপন</h3>
              <span className={`tag ${open ? "green" : "red"}`}>{open ? "প্রণোদনা চলমান" : "স্থাপনের সময় শেষ"}</span>
            </div>
          </div>
          <dl className="kv">
            <dt>স্মারক</dt><dd className="ref" style={{ fontSize: ".85rem" }}>{POLICY.ref}</dd>
            <dt>জারিকারী</dt><dd>{POLICY.issuer}</dd>
            <dt>তারিখ</dt><dd>{POLICY.issuedBn}</dd>
            <dt>হার</dt><dd><span className="formula">৳{bn(POLICY.costCap)} × (১ + {bn(POLICY.profitPct)}% + {bn(POLICY.premiumPct)}%) = ৳{bn("10.50")}</span></dd>
            <dt>স্থাপনের শেষ তারিখ</dt><dd>২৮ ফেব্রুয়ারি ২০২৭</dd>
            <dt>হার প্রযোজ্য</dt><dd>২৮ ফেব্রুয়ারি ২০৩০ পর্যন্ত ({bn(POLICY.tariffYears)} বছর)</dd>
            <dt>পরিশোধ</dt><dd>প্রতি {bn(POLICY.payoutEveryMonths)} মাসে ব্যাংক হিসাবে, নগদে নয়</dd>
            <dt>মানদণ্ড</dt><dd>{POLICY.standards.join(" ও ")}</dd>
            <dt>যোগাযোগ</dt><dd>{POLICY.contact.name}, {POLICY.contact.title}<br />{POLICY.contact.phone} · <a href={`mailto:${POLICY.contact.email}`}>{POLICY.contact.email}</a></dd>
          </dl>
          <ul className="list-check">{POLICY.points.map((p) => <li key={p}><CheckCircle2 size={17} /> <span>{p}</span></li>)}</ul>
          <div className="foot">
            <a className="btn outline sm" href={POLICY.sourceUrl} target="_blank" rel="noopener">মূল PDF <ExternalLink size={13} /></a>
            <a className="btn outline sm" href={POLICY.localPdf} target="_blank"><Download size={14} /> স্থানীয় কপি</a>
          </div>
        </article>

        <article className="card pad-lg role red">
          <div className="card-head">
            <span className="icon-badge red"><Landmark size={22} /></span>
            <div>
              <h3>বিউবো সার্ভিস প্রোভাইডার আবেদন বিজ্ঞপ্তি</h3>
              <span className={`tag ${tender.closed ? "red" : "green"}`}>{tender.closed ? "আবেদন বন্ধ" : "আবেদন খোলা"}</span>
            </div>
          </div>
          <dl className="kv">
            <dt>রেফারেন্স</dt><dd className="ref" style={{ fontSize: ".85rem" }}>{TENDER.ref}</dd>
            <dt>তারিখ</dt><dd>{bn("27/08/2026")}</dd>
            <dt>কর্মসূচি</dt><dd>{TENDER.programme}</dd>
            <dt>এলাকা</dt><dd>চট্টগ্রাম বিভাগ (১১ জেলা)</dd>
            <dt>ফরম বিক্রির শেষ</dt><dd>২৭/০৯/২০২৬, দুপুর ১২টা</dd>
            <dt>জমার শেষ</dt><dd>২৭/০৯/২০২৬, বিকেল ৩টা</dd>
            <dt>ফি</dt><dd>ফরম ৳{bn(TENDER.formPrice)} · নিবন্ধন ৳{fmt(TENDER.registrationFee)}</dd>
            <dt>দায়িত্বপ্রাপ্ত</dt><dd>{TENDER.official.name}, {TENDER.official.title}<br />{TENDER.official.address}<br />{TENDER.official.phone} · {TENDER.official.emails.join(", ")}</dd>
          </dl>
          <h3>যোগ্যতা</h3>
          <ul className="list-check">{ELIGIBILITY.map((e) => <li key={e.key}><CheckCircle2 size={17} /> <span>{e.label}</span></li>)}</ul>
          <h3 style={{ marginTop: 16 }}>প্রোভাইডারের দায়িত্ব</h3>
          <ul className="list-check">{TENDER.responsibilities.map((r) => <li key={r}><CheckCircle2 size={17} /> <span>{r}</span></li>)}</ul>
          <p className="note">{TENDER.copies} {TENDER.perDistrict} কর্তৃপক্ষ সব আবেদন বাতিলের অধিকার রাখে।</p>
          <div className="foot">
            <a className="btn outline sm" href={TENDER.sourceUrl} target="_blank" rel="noopener">মূল PDF <ExternalLink size={13} /></a>
            <a className="btn outline sm" href={TENDER.localPdf} target="_blank"><Download size={14} /> স্থানীয় কপি</a>
          </div>
        </article>
      </div>

      <div className="section-title"><h2>জেলাভিত্তিক ফরম সংগ্রহ ও জমার অফিস</h2></div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>জেলা (চট্টগ্রাম বিভাগ)</th><th>বিউবো অফিস</th><th>পল্লী বিদ্যুৎ সমিতি</th></tr></thead>
          <tbody>
            {Object.entries(TENDER_OFFICES).map(([d, [bpdb, pbs]]) => (
              <tr key={d}><td><b>{d}</b></td><td className="wrap-cell">{bpdb}</td><td className="wrap-cell">{pbs ?? "—"}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
