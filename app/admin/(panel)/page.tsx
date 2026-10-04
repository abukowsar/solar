"use client";
import Link from "next/link";
import { BellRing, Briefcase, ClipboardList, Gauge, PencilRuler, ShieldCheck } from "lucide-react";
import { useAdmin } from "@/components/admin/AdminShell";
import { bn, fmt } from "@/lib/format";
import { STAGES } from "@/lib/options";

const when = (iso: string) =>
  new Date(iso).toLocaleString("bn-BD", { timeZone: "Asia/Dhaka", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/** Single-series ranked bars: one hue, value labelled in ink, hover tooltip via title. */
function Bars({ rows, unit }: { rows: { label: string; value: number }[]; unit: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (!rows.length) return <p className="note">এখনো কোনো তথ্য নেই।</p>;
  return (
    <ul className="hbars">
      {rows.map((r) => (
        <li key={r.label} title={`${r.label}: ${bn(r.value)} ${unit}`}>
          <span className="hb-label">{r.label}</span>
          <span className="hb-track"><i style={{ width: `${(r.value / max) * 100}%` }} /></span>
          <span className="hb-val">{bn(r.value)}</span>
        </li>
      ))}
    </ul>
  );
}

export default function Dashboard() {
  const { data } = useAdmin();
  if (!data) return null;
  const { requests, providers, designs, subscribers, audit } = data;

  const kw = requests.reduce((a, r) => a + r.kw, 0);
  const enlisted = providers.filter((p) => p.enlistment === "enlisted").length;
  const byDistrict = Object.entries(requests.reduce<Record<string, number>>((m, r) => ((m[r.district] = (m[r.district] ?? 0) + 1), m), {}))
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
  const byStage = STAGES.map((label, i) => ({ label, value: requests.filter((r) => r.stage === i).length }));
  const unmatched = requests.filter((r) => !r.interests.length).length;
  const week = Date.now() - 7 * 864e5;
  const newThisWeek = requests.filter((r) => new Date(r.created).getTime() > week).length;

  const tiles = [
    { label: "সেটআপ অনুরোধ", value: bn(requests.length), sub: `এই সপ্তাহে ${bn(newThisWeek)}টি নতুন`, Icon: ClipboardList, href: "/admin/requests", tone: "" },
    { label: "প্রস্তাবিত ক্ষমতা", value: `${fmt(kw, 1)} kWp`, sub: `${bn(designs.length)}টি সংরক্ষিত ডিজাইন`, Icon: Gauge, href: "/admin/designs", tone: "sun" },
    { label: "প্রোভাইডার", value: bn(providers.length), sub: `${bn(enlisted)}টি তালিকাভুক্ত`, Icon: Briefcase, href: "/admin/providers", tone: "red" },
    { label: "সাবস্ক্রাইবার", value: bn(subscribers.length), sub: `${bn(subscribers.filter((s) => s.channel === "sms").length)} SMS · ${bn(subscribers.filter((s) => s.channel === "email").length)} ইমেইল`, Icon: BellRing, href: "/admin/subscribers", tone: "" },
  ];

  return (
    <>
      <div className="admin-tiles">
        {tiles.map(({ label, value, sub, Icon, href, tone }) => (
          <Link key={label} href={href} className="card admin-tile">
            <span className={`icon-badge ${tone}`}><Icon size={20} /></span>
            <span><small>{label}</small><b>{value}</b><em>{sub}</em></span>
          </Link>
        ))}
      </div>

      {unmatched > 0 && (
        <div className="alert info" style={{ marginBottom: 18 }}>
          <ShieldCheck size={18} aria-hidden="true" />
          <div>{bn(unmatched)}টি অনুরোধে এখনো কোনো প্রোভাইডার আগ্রহ জানাননি। <Link href="/admin/requests?filter=unmatched">দেখুন →</Link></div>
        </div>
      )}

      <div className="grid-2">
        <section className="card">
          <h3>জেলাভিত্তিক অনুরোধ (শীর্ষ ৮)</h3>
          <Bars rows={byDistrict} unit="টি অনুরোধ" />
        </section>
        <section className="card">
          <h3>ধাপ অনুযায়ী অগ্রগতি</h3>
          <Bars rows={byStage} unit="টি অনুরোধ" />
        </section>
      </div>

      <div className="grid-2" style={{ marginTop: 20 }}>
        <section className="card">
          <div className="card-head" style={{ justifyContent: "space-between" }}>
            <h3>সাম্প্রতিক অনুরোধ</h3>
            <Link className="btn outline sm" href="/admin/requests">সব দেখুন</Link>
          </div>
          {requests.length ? (
            <ul className="admin-feed">
              {requests.slice(0, 6).map((r) => (
                <li key={r.id}>
                  <b>{r.name}</b> · {r.district} · {fmt(r.kw, 1)} kWp
                  <small>{r.ref} · {when(r.created)} · {STAGES[r.stage]}</small>
                </li>
              ))}
            </ul>
          ) : <p className="note">এখনো কোনো অনুরোধ নেই।</p>}
        </section>
        <section className="card">
          <h3>অ্যাডমিন কার্যক্রম লগ</h3>
          {audit.length ? (
            <ul className="admin-feed">
              {audit.slice(0, 8).map((a, i) => (
                <li key={i}><b>{a.action}</b> · {a.target}<small>{when(a.at)}</small></li>
              ))}
            </ul>
          ) : <p className="note">এখনো কোনো কার্যক্রম নেই।</p>}
        </section>
      </div>
    </>
  );
}
