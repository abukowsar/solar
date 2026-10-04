"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarClock, Copy, Download, Gauge, Hand, Home, Inbox, Lock, MapPin, PencilRuler, Phone, Plug, Undo2 } from "lucide-react";
import { DISTRICTS } from "@/lib/data/districts";
import { api, copyText, useActingProvider, useProviders, useRequests } from "@/lib/client";
import { bn, bdDate, fmt } from "@/lib/format";
import { matchScore, rankProviders } from "@/lib/match";
import { STAGES } from "@/lib/options";
import { leadText } from "@/lib/solset";
import type { SetupRequest } from "@/lib/types";
import { Alert, CATEGORY_ICONS } from "./ui";

export default function Board() {
  const providers = useProviders();
  const [as, setAs] = useActingProvider();
  const { requests, setRequests, error } = useRequests(as);
  const [dist, setDist] = useState("");
  const [stage, setStage] = useState("");
  const [note, setNote] = useState("");

  const me = providers.find((p) => p.id === as);
  const list = useMemo(
    () => requests.filter((r) =>
      (!dist || r.district === dist) && (stage === "" || String(r.stage) === stage) && (!me || matchScore(me, r) >= 0)),
    [requests, dist, stage, me],
  );

  async function patch(r: SetupRequest, body: object, done: string) {
    try {
      const updated = await api<SetupRequest>(`/api/requests/${r.id}`, { method: "PATCH", body: JSON.stringify({ as, ...body }) });
      setRequests((xs) => xs.map((x) => (x.id === r.id ? updated : x)));
      setNote(done);
    } catch (e) {
      setNote((e as Error).message);
    }
  }

  return (
    <>
      <div className="toolbar">
        <select className="as" aria-label="আমি কোন প্রোভাইডার" value={as} onChange={(e) => setAs(e.target.value)}>
          <option value="">👤 প্রোভাইডার হিসেবে দেখুন…</option>
          {providers.map((p) => <option key={p.id} value={p.id}>{p.company} ({p.home})</option>)}
        </select>
        <select aria-label="জেলা ফিল্টার" value={dist} onChange={(e) => setDist(e.target.value)}>
          <option value="">সব জেলা</option>
          {DISTRICTS.map((d) => <option key={d.bn}>{d.bn}</option>)}
        </select>
        <select aria-label="ধাপ ফিল্টার" value={stage} onChange={(e) => setStage(e.target.value)}>
          <option value="">সব ধাপ</option>
          {STAGES.map((s, i) => <option key={s} value={i}>{s}</option>)}
        </select>
      </div>

      {me && <p className="note" style={{ margin: "0 0 12px" }}><Link href="/solset"><Download size={13} /> আগ্রহ দেখানো লিড Solset CSV হিসেবে নামান</Link></p>}
      {!me && providers.length > 0 && <Alert kind="info">উপরে নিজের প্রতিষ্ঠান বেছে নিন — তাহলে শুধু আপনার সেবা-জেলার অনুরোধ দেখবেন এবং আগ্রহ জানাতে পারবেন।</Alert>}
      {!providers.length && <Alert kind="info">এখনো কোনো প্রোভাইডার নিবন্ধিত নেই। <Link href="/provider">প্রোভাইডার নিবন্ধন</Link> করে লিডে আগ্রহ জানান।</Alert>}
      {note && <Alert kind="ok">{note}</Alert>}
      {error && <Alert kind="err">{error}</Alert>}

      <p className="note" style={{ margin: "16px 0 10px" }}>{bn(list.length)}টি অনুরোধ দেখানো হচ্ছে</p>

      {!list.length && (
        <div className="empty">
          <Inbox size={40} aria-hidden="true" />
          <div>{requests.length ? "এই ফিল্টারে কোনো অনুরোধ নেই।" : "এখনো কোনো সেটআপ অনুরোধ আসেনি।"}</div>
          {!requests.length && <Link className="btn primary sm" href="/request" style={{ marginTop: 12 }}>প্রথম অনুরোধ জমা দিন</Link>}
        </div>
      )}

      {list.map((r) => {
        const ranked = rankProviders(providers, r).slice(0, 5);
        const mine = !!me && r.interests.includes(me.id);
        const Icon = CATEGORY_ICONS[r.category] ?? Home;
        return (
          <article className={`req${mine ? " mine" : ""}`} key={r.id}>
            <div className="req-top">
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span className="icon-badge"><Icon size={20} /></span>
                <div>
                  <h3>{r.name}</h3>
                  <div className="contact-line" style={{ margin: 0 }}><span><MapPin size={14} /> {r.upazila}, {r.district}</span></div>
                </div>
              </div>
              <span className="ref">{r.ref}<br />{bdDate(r.created)}</span>
            </div>

            <div className="tags">
              <span className="tag green"><Gauge size={13} /> {fmt(r.kw, 1)} kWp</span>
              <span className="tag">{r.category}</span>
              <span className="tag">{fmt(r.roof)} বর্গফুট · {r.roofType}</span>
              <span className="tag"><Plug size={13} /> {r.utility}</span>
              {r.when === "before-deadline" && <span className="tag sun"><CalendarClock size={13} /> প্রণোদনার মেয়াদে চায়</span>}
              {r.goals.map((g) => <span className="tag" key={g}>{g}</span>)}
            </div>

            <div className="pipe" role="group" aria-label="ধাপ">
              {STAGES.map((s, i) => (
                <button key={s} type="button" className={`${i <= r.stage ? "done" : ""}${i === r.stage ? " at" : ""}`} disabled={!mine}
                  title={mine ? `ধাপ: ${s}` : "ধাপ বদলাতে আগ্রহ জানান"} onClick={() => patch(r, { stage: i }, `${r.ref}: ধাপ হালনাগাদ — ${s}`)}>
                  {s}
                </button>
              ))}
            </div>

            <div className="contact-line">
              <span>{r.masked ? <Lock size={14} /> : <Phone size={14} />} {r.phone}</span>
              {r.address ? <span><Home size={14} /> {r.address}</span> : <span>ঠিকানা: আগ্রহ জানালে দেখা যাবে</span>}
              {r.geo && <span><MapPin size={14} /> {r.geo}</span>}
            </div>

            <div className="matches">
              মিলে যাওয়া প্রোভাইডার:{" "}
              {ranked.length
                ? ranked.map((x) => (
                    <span key={x.p.id} className={`pchip${r.interests.includes(x.p.id) ? " int" : ""}`} title={`মিল স্কোর ${x.score}`}>
                      {x.p.company}{x.p.enlistment === "enlisted" ? " ✓" : ""}
                    </span>
                  ))
                : <em>এই জেলায় এখনো কোনো প্রোভাইডার নেই</em>}
            </div>

            <div className="row-actions">
              {me && (
                <button className={`btn sm ${mine ? "outline" : "red"}`}
                  onClick={() => patch(r, { action: "interest" }, mine ? "আগ্রহ প্রত্যাহার করা হয়েছে" : "আগ্রহ জানানো হয়েছে — যোগাযোগের তথ্য এখন দেখা যাচ্ছে")}>
                  {mine ? <><Undo2 size={15} /> আগ্রহ প্রত্যাহার</> : <><Hand size={15} /> আগ্রহ জানান</>}
                </button>
              )}
              {mine && <a className="btn primary sm" href={`tel:${r.phone}`}><Phone size={15} /> কল করুন</a>}
              {mine && (
                <button className="btn outline sm" onClick={async () => setNote((await copyText(leadText(r))) ? "লিড টেক্সট কপি হয়েছে — Solset-এ পেস্ট করুন" : "কপি করা যায়নি")}>
                  <Copy size={15} /> লিড কপি
                </button>
              )}
              <a className="btn outline sm" href="https://solset.ai/signup?next=first-design" target="_blank" rel="noopener"><PencilRuler size={15} /> Solset-এ ডিজাইন</a>
            </div>
          </article>
        );
      })}
    </>
  );
}
