import Link from "next/link";
import {
  ArrowRight, BadgeCheck, Banknote, Briefcase, Building2, CalendarClock, CheckCircle2, ClipboardList,
  FileText, Gauge, Handshake, MapPin, PencilRuler, PlugZap, SunMedium, Users,
} from "lucide-react";
import Countdown from "@/components/Countdown";
import { POLICY, incentiveOpen } from "@/lib/data/policy";
import { TENDER, tenderStatus } from "@/lib/data/tender";
import { bn, fmt } from "@/lib/format";
import { readDb } from "@/lib/store";

export const dynamic = "force-dynamic";

const FAQ = [
  {
    q: "প্রতি ইউনিট ১০.৫০ টাকা কীভাবে ঠিক হলো?",
    a: "ব্যাটারিসহ ছাদভিত্তিক সৌরবিদ্যুতের সর্বোচ্চ উৎপাদন ব্যয় ৮ টাকা ধরা হয়েছে। এর ওপর ২০% মুনাফা (১.৬০ টাকা) ও ১১.২৫% প্রিমিয়াম (০.৯০ টাকা) যোগ করে ১০.৫০ টাকা। কম খরচে বসাতে পারলে সাশ্রয়টুকু আপনার লাভ।",
  },
  {
    q: "টাকা কীভাবে পাব?",
    a: "নেট মিটারিং নির্দেশিকা, ২০২৫ অনুযায়ী বিতরণ সংস্থা গ্রিডে দেওয়া বিদ্যুতের হিসাব রাখবে এবং প্রতি তিন মাস অন্তর আপনার ব্যাংক হিসাবে টাকা পাঠাবে। নগদে কোনো টাকা দেওয়া হবে না।",
  },
  {
    q: "কত দিন এই হার পাব?",
    a: "২৮ ফেব্রুয়ারি ২০২৭-এর মধ্যে সিস্টেম স্থাপন করলে ২৮ ফেব্রুয়ারি ২০৩০ পর্যন্ত (৩ বছর) এই হার পাবেন। এর পরে স্থাপিত সিস্টেমে এই প্রণোদনা প্রযোজ্য নয়।",
  },
  {
    q: "কোন যন্ত্রপাতি ব্যবহার করতে হবে?",
    a: "সোলার প্যানেল, ব্যাটারি, ইনভার্টার, মিটার ইত্যাদি BSTI ও SREDA নির্ধারিত কারিগরি মানদণ্ড অনুযায়ী হতে হবে। তালিকাভুক্ত প্রোভাইডার এ বিষয়ে নিশ্চিত করবেন।",
  },
  {
    q: "আমার ফোন নম্বর কে দেখতে পাবে?",
    a: "শুধু যে প্রোভাইডার আপনার অনুরোধে আগ্রহ জানাবেন, তিনিই আপনার ফোন নম্বর ও ঠিকানা দেখতে পাবেন। অন্যরা শুধু জেলা, উপজেলা ও ছাদের তথ্য দেখবেন।",
  },
  {
    q: "সহায়তা কোথায় পাব?",
    a: "বিদ্যুৎ বিভাগের ওয়ান-স্টপ সার্ভিস সেন্টার এবং বিতরণ সংস্থার সব জেলা ও উপজেলা অফিস থেকে নীতিগত সহায়তা পাওয়া যাবে।",
  },
];

export default async function Home() {
  const { requests, providers } = await readDb();
  const tender = tenderStatus();
  const open = incentiveOpen();
  const kw = requests.reduce((a, r) => a + r.kw, 0);

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <div>
            <span className="eyebrow"><BadgeCheck size={15} aria-hidden="true" /> বিদ্যুৎ বিভাগের প্রজ্ঞাপন · ০১ সেপ্টেম্বর ২০২৬ থেকে কার্যকর</span>
            <h2>এবার <em>ছাদ থেকেই আয়</em> — সৌরবিদ্যুৎ বসান, উদ্বৃত্ত বিদ্যুৎ গ্রিডে বিক্রি করুন</h2>
            <p className="lead">
              ছাদের তথ্য দিন, আনুমানিক আয় দেখুন, আর আপনার জেলার নিবন্ধিত সার্ভিস প্রোভাইডারের সঙ্গে যুক্ত হন — পুরো প্রক্রিয়া এক জায়গায়।
            </p>
            <div className="actions">
              <Link className="btn red" href="/request?src=QR-B"><SunMedium size={19} aria-hidden="true" /> সেটআপের অনুরোধ করুন</Link>
              <Link className="btn white" href="/design"><PencilRuler size={18} aria-hidden="true" /> নিজে ডিজাইন করি</Link>
              <Link className="btn outline-light" href="/provider"><Briefcase size={18} aria-hidden="true" /> প্রোভাইডার নিবন্ধন</Link>
            </div>
          </div>

          <aside className="rate-card" aria-label="প্রণোদনার হার">
            <div style={{ color: "var(--muted)", fontSize: ".88rem" }}>জাতীয় গ্রিডে সরবরাহকৃত প্রতি ইউনিট</div>
            <div className="big">৳{bn("10.50")} <small>/ kWh</small></div>
            <div className="formula">৳৮ × (১ + ২০% + ১১.২৫%) = ৳১০.৫০</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600 }}>
              <CalendarClock size={18} color="var(--red)" aria-hidden="true" />
              {open ? "স্থাপনের শেষ সময় ২৮ ফেব্রুয়ারি ২০২৭ — বাকি" : "স্থাপনের সময়সীমা শেষ হয়েছে"}
            </div>
            {open && <Countdown to={POLICY.installDeadline + "T23:59:59+06:00"} />}
          </aside>
        </div>
      </section>

      <div className="wrap">
        <div className="stats">
          <div><span className="icon-badge"><ClipboardList size={20} /></span><span><b>{bn(requests.length)}</b><small>সেটআপ অনুরোধ</small></span></div>
          <div><span className="icon-badge red"><Users size={20} /></span><span><b>{bn(providers.length)}</b><small>নিবন্ধিত প্রোভাইডার</small></span></div>
          <div><span className="icon-badge sun"><Gauge size={20} /></span><span><b>{fmt(kw, 1)}</b><small>প্রস্তাবিত kWp</small></span></div>
          <div><span className="icon-badge"><MapPin size={20} /></span><span><b>{bn(new Set(requests.map((r) => r.district)).size)}</b><small>জেলা থেকে অনুরোধ</small></span></div>
        </div>

        <div className="section-title"><h2>আপনি কে?</h2></div>
        <div className="grid-2">
          <article className="card pad-lg role">
            <div className="card-head">
              <span className="icon-badge"><Building2 size={22} /></span>
              <div><h3>ছাদ / স্থাপনার মালিক</h3><div className="ref">QR-B · প্রজ্ঞাপন {POLICY.ref}</div></div>
            </div>
            <ul>
              <li><CheckCircle2 size={18} /> উদ্বৃত্ত বিদ্যুৎ গ্রিডে দিলে প্রতি ইউনিট ৳১০.৫০</li>
              <li><CheckCircle2 size={18} /> প্রতি ৩ মাসে সরাসরি ব্যাংক অ্যাকাউন্টে</li>
              <li><CheckCircle2 size={18} /> ২০৩০ সালের ফেব্রুয়ারি পর্যন্ত নিশ্চিত হার</li>
              <li><CheckCircle2 size={18} /> আগ্রহী প্রোভাইডার ছাড়া কেউ আপনার নম্বর দেখবে না</li>
            </ul>
            <div className="foot">
              <Link className="btn primary" href="/request?src=QR-B">আবেদন শুরু করুন <ArrowRight size={18} /></Link>
              <a className="src" href={POLICY.sourceUrl} target="_blank" rel="noopener">প্রজ্ঞাপন (PDF)</a>
            </div>
          </article>

          <article className="card pad-lg role red">
            <div className="card-head">
              <span className="icon-badge red"><Briefcase size={22} /></span>
              <div><h3>সোলার সার্ভিস প্রোভাইডার</h3><div className="ref">QR-A · বিউবো {TENDER.ref}</div></div>
            </div>
            <ul>
              <li><CheckCircle2 size={18} /> নিজের জেলার সেটআপ অনুরোধ সরাসরি দেখুন</li>
              <li><CheckCircle2 size={18} /> আগ্রহ দেখানো লিড এক ক্লিকে Solset AI-তে</li>
              <li><CheckCircle2 size={18} /> যোগ্যতা যাচাই ও জেলার জমার অফিসের তথ্য</li>
              <li><CheckCircle2 size={18} /> ফরম ৳{bn(TENDER.formPrice)} · নিবন্ধন ফি ৳{fmt(TENDER.registrationFee)}</li>
            </ul>
            <div className="foot">
              <Link className="btn red" href="/provider">নিবন্ধন করুন <ArrowRight size={18} /></Link>
              <span className={`tag ${tender.closed ? "red" : "green"}`}>
                চট্টগ্রাম বিজ্ঞপ্তি: {tender.closed ? "২৭/০৯/২০২৬-এ বন্ধ" : "আবেদন চলছে"}
              </span>
            </div>
          </article>
        </div>

        <div className="section-title"><h2>কীভাবে কাজ করে</h2></div>
        <div className="how">
          {[
            { Icon: ClipboardList, t: "অনুরোধ জমা", d: "ছাদের আয়তন, বিদ্যুৎ বিল ও জেলা দিয়ে ৪ ধাপে আবেদন করুন।" },
            { Icon: Handshake, t: "প্রোভাইডার যুক্ত", d: "আপনার জেলায় সেবা দেওয়া প্রোভাইডার আগ্রহ জানিয়ে যোগাযোগ করবেন।" },
            { Icon: PencilRuler, t: "সার্ভে ও ডিজাইন", d: "সাইট সার্ভের পর Solset AI-তে ছাদের ডিজাইন ও কোটেশন তৈরি হবে।" },
            { Icon: PlugZap, t: "স্থাপন ও নেট মিটার", d: "BSTI/SREDA মানের যন্ত্রপাতি বসিয়ে বিতরণ সংস্থার নেট মিটার সংযোগ।" },
            { Icon: Banknote, t: "ব্যাংকে আয়", d: "গ্রিডে দেওয়া প্রতি ইউনিটের টাকা প্রতি তিন মাসে ব্যাংক হিসাবে।" },
          ].map(({ Icon, t, d }, i) => (
            <div className="card" key={t}>
              <span className="num">{bn(i + 1)}</span>
              <Icon size={26} color="var(--green)" aria-hidden="true" />
              <h3 style={{ margin: "8px 0 0" }}>{t}</h3>
              <p>{d}</p>
            </div>
          ))}
        </div>

        <div className="section-title">
          <h2>সাধারণ জিজ্ঞাসা</h2>
          <Link className="btn outline sm" href="/policy"><FileText size={16} /> পূর্ণ নীতিমালা</Link>
        </div>
        <div className="faq">
          {FAQ.map((f, i) => (
            <details key={f.q} open={i === 0}>
              <summary>{f.q}</summary>
              <div>{f.a}</div>
            </details>
          ))}
        </div>
      </div>
    </>
  );
}
