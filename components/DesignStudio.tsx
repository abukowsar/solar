"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BatteryCharging, Calculator, CheckCircle2, ClipboardList, CloudUpload, Home, Printer, RotateCcw, Ruler, SunMedium, Zap,
} from "lucide-react";
import { DISTRICTS } from "@/lib/data/districts";
import { POLICY } from "@/lib/data/policy";
import { DEFAULT_DESIGN, DEFAULT_PRICES, PANELS, designSystem, type DesignInput, type DesignResult } from "@/lib/design";
import { api } from "@/lib/client";
import { bn, digitsOnly, fmt } from "@/lib/format";
import { Alert, Field } from "./ui";

const PRICE_LABELS: Record<keyof typeof DEFAULT_PRICES, string> = {
  panelPerW: "প্যানেল (৳/W)",
  inverterGridPerW: "অন-গ্রিড ইনভার্টার (৳/W)",
  inverterHybridPerW: "হাইব্রিড ইনভার্টার (৳/W)",
  batteryPerKwh: "ব্যাটারি (৳/kWh)",
  structureRccPerW: "স্ট্রাকচার, পাকা ছাদ (৳/W)",
  structureTinPerW: "স্ট্রাকচার, টিনের ছাদ (৳/W)",
  bosPerW: "ক্যাবল ও সুরক্ষা (৳/W)",
  installPerW: "স্থাপন (৳/W)",
  netMeter: "নেট মিটার ও আবেদন (৳)",
  retailTariff: "আপনার বিদ্যুৎ বিলের গড় হার (৳/ইউনিট)",
};

type Sync = { ref: string; solset: { mode: "solset" | "local" | "error"; id?: string; url?: string; error?: string } };

export default function DesignStudio() {
  const router = useRouter();
  const [d, setD] = useState<DesignInput>(DEFAULT_DESIGN);
  const [contact, setContact] = useState({ name: "", phone: "", district: "", geo: "" });
  const [apiOn, setApiOn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sync, setSync] = useState<Sync | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ solset: boolean }>("/api/design").then((r) => setApiOn(r.solset)).catch(() => {});
  }, []);

  const r = useMemo(() => designSystem(d), [d]);
  const set = <K extends keyof DesignInput>(k: K, v: DesignInput[K]) => { setSync(null); setD((x) => ({ ...x, [k]: v })); };
  const setPrice = (k: keyof typeof DEFAULT_PRICES, v: number) => set("prices", { ...d.prices, [k]: v });
  const num = (k: keyof DesignInput) => (e: React.ChangeEvent<HTMLInputElement>) => set(k, +e.target.value as never);

  async function send() {
    setBusy(true);
    setError("");
    try {
      setSync(await api<Sync>("/api/design", { method: "POST", body: JSON.stringify({ input: d, contact }) }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function toRequest() {
    try {
      localStorage.setItem("rts-design", JSON.stringify({
        roof: r.roofSqft, units: d.units, load: d.load, roofType: d.roofType === "rcc" ? "পাকা (RCC) সমতল" : "টিনের ঢালু ছাদ",
        name: contact.name, phone: contact.phone, district: contact.district, geo: contact.geo,
        notes: `নিজে ডিজাইন: ${r.kwp.toFixed(2)} kWp (${r.count}×${r.panel.w}W), ইনভার্টার ${r.inverterKw} kW${r.batteryKwh ? `, ব্যাটারি ${r.batteryKwh.toFixed(1)} kWh` : ""}, আনুমানিক ৳${Math.round(r.capex).toLocaleString("en-IN")}${sync ? ` · ডিজাইন রেফ ${sync.ref}` : ""}`,
      }));
    } catch {}
    router.push("/request?src=direct&from=design");
  }

  return (
    <div className="split design">
      <div className="design-inputs">
        <section className="card">
          <div className="card-head"><span className="icon-badge"><Ruler size={20} /></span><h3>১. আপনার ছাদ</h3></div>
          <div className="form-grid">
            <Field label="দৈর্ঘ্য" hint="ফুট"><input type="number" min={5} value={d.roofL} onChange={num("roofL")} /></Field>
            <Field label="প্রস্থ" hint="ফুট"><input type="number" min={5} value={d.roofW} onChange={num("roofW")} /></Field>
            <div className="field full">
              <span>ছাদের ধরন</span>
              <div className="tiles">
                {([["rcc", "পাকা (RCC) সমতল", "২৩° কোণে দক্ষিণমুখী সারি"], ["tin", "টিনের ঢালু ছাদ", "ছাদের ওপর সমান্তরাল"]] as const).map(([v, t, s]) => (
                  <label className="tile" key={v}>
                    <input type="radio" name="roofType" checked={d.roofType === v} onChange={() => set("roofType", v)} />
                    <span><Home size={20} aria-hidden="true" />{t}<small style={{ color: "var(--muted)", fontWeight: 400 }}>{s}</small></span>
                  </label>
                ))}
              </div>
            </div>
            <Field label="কিনারা থেকে ফাঁকা" hint="ফুট, চলাচল ও নিরাপত্তা"><input type="number" min={0} max={20} step={0.5} value={d.setback} onChange={num("setback")} /></Field>
            <Field label={`বাধা / ছায়া: ${bn(d.obstruction)}%`} hint="পানির ট্যাংক, সিঁড়িঘর">
              <input type="range" min={0} max={60} step={5} value={d.obstruction} onChange={num("obstruction")} />
            </Field>
          </div>
        </section>

        <section className="card">
          <div className="card-head"><span className="icon-badge sun"><SunMedium size={20} /></span><h3>২. প্যানেল ও ব্যাটারি</h3></div>
          <div className="form-grid">
            <Field label="প্যানেল" full>
              <select value={d.panelW} onChange={(e) => set("panelW", +e.target.value)}>
                {PANELS.map((p) => <option key={p.w} value={p.w}>{p.label} · {p.l}×{p.wd} মি.</option>)}
              </select>
            </Field>
            <label className="check-row full">
              <input type="checkbox" checked={d.battery} onChange={(e) => set("battery", e.target.checked)} />
              <span><b>ব্যাটারি ব্যাকআপ</b> — প্রজ্ঞাপনের হার ব্যাটারিসহ সিস্টেমের ব্যয় ধরে নির্ধারিত; লোডশেডিংয়ে চলবে</span>
            </label>
            {d.battery && (
              <>
                <Field label="জরুরি লোড" hint="kW — ফ্যান, লাইট, ফ্রিজ"><input type="number" min={0} step={0.25} value={d.essentialKw} onChange={num("essentialKw")} /></Field>
                <Field label="ব্যাকআপ সময়" hint="ঘণ্টা"><input type="number" min={0} max={48} value={d.backupHours} onChange={num("backupHours")} /></Field>
              </>
            )}
          </div>
        </section>

        <section className="card">
          <div className="card-head"><span className="icon-badge"><Zap size={20} /></span><h3>৩. বিদ্যুৎ ব্যবহার</h3></div>
          <div className="form-grid">
            <Field label="মাসিক ব্যবহার" hint="ইউনিট, বিল থেকে"><input type="number" min={0} value={d.units} onChange={num("units")} /></Field>
            <Field label="অনুমোদিত লোড" hint="kW, বিল থেকে"><input type="number" min={0} step={0.5} value={d.load} onChange={num("load")} /></Field>
            <label className="check-row full">
              <input type="checkbox" checked={d.limitToLoad} onChange={(e) => set("limitToLoad", e.target.checked)} />
              <span>সিস্টেম অনুমোদিত লোডের মধ্যে রাখুন <span className="hint">(নেট মিটারিং সংযোগে সাধারণত প্রযোজ্য)</span></span>
            </label>
          </div>
        </section>

        <details className="card">
          <summary style={{ cursor: "pointer", fontWeight: 600, display: "flex", gap: 10, alignItems: "center" }}>
            <Calculator size={18} /> ৪. দর পরিবর্তন করুন (ঐচ্ছিক)
          </summary>
          <p className="note">ডিফল্ট দর শুধু আনুমানিক ধারণার জন্য; প্রোভাইডারের কোটেশন পেলে এখানে বসিয়ে মিলিয়ে নিন।</p>
          <div className="form-grid" style={{ marginTop: 12 }}>
            {(Object.keys(DEFAULT_PRICES) as (keyof typeof DEFAULT_PRICES)[]).map((k) => (
              <Field key={k} label={PRICE_LABELS[k]}>
                <input type="number" min={0} value={d.prices[k]} onChange={(e) => setPrice(k, +e.target.value)} />
              </Field>
            ))}
          </div>
          <button type="button" className="btn outline sm" style={{ marginTop: 12 }} onClick={() => set("prices", DEFAULT_PRICES)}>
            <RotateCcw size={15} /> ডিফল্ট দর
          </button>
        </details>

        <section className="card">
          <div className="card-head"><span className="icon-badge red"><CloudUpload size={20} /></span><h3>৫. ডিজাইন সংরক্ষণ ও পাঠান</h3></div>
          <div className="form-grid">
            <Field label="নাম" hint="ঐচ্ছিক"><input type="text" value={contact.name} onChange={(e) => { setSync(null); setContact({ ...contact, name: e.target.value }); }} /></Field>
            <Field label="মোবাইল" hint="ঐচ্ছিক">
              <input type="tel" inputMode="numeric" maxLength={11} pattern="01[3-9][0-9]{8}" placeholder="01XXXXXXXXX" value={contact.phone}
                onChange={(e) => { setSync(null); setContact({ ...contact, phone: digitsOnly(e.target.value) }); }} />
            </Field>
            <Field label="জেলা" full>
              <select value={contact.district} onChange={(e) => { setSync(null); setContact({ ...contact, district: e.target.value }); }}>
                <option value="">জেলা বেছে নিন</option>
                {DISTRICTS.map((x) => <option key={x.bn} value={x.bn}>{x.bn}</option>)}
              </select>
            </Field>
          </div>
          {error && <Alert kind="err">{error}</Alert>}
          {sync && <SyncStatus sync={sync} />}
          <div className="row-actions" style={{ marginTop: 16 }}>
            <button className="btn red" type="button" onClick={send} disabled={busy || !r.count}>
              <CloudUpload size={18} /> {busy ? "পাঠানো হচ্ছে…" : apiOn ? "Solset-এ পাঠান" : "ডিজাইন সংরক্ষণ করুন"}
            </button>
            <button className="btn primary" type="button" onClick={toRequest} disabled={!r.count}><ClipboardList size={18} /> এই ডিজাইনে সেটআপ অনুরোধ</button>
            <button className="btn outline" type="button" onClick={() => window.print()}><Printer size={18} /> প্রিন্ট</button>
          </div>
          {!apiOn && <p className="note">Solset API এখনো সংযুক্ত হয়নি — ডিজাইন এই পোর্টালে সংরক্ষিত হবে এবং সেটআপ অনুরোধের সঙ্গে প্রোভাইডারের কাছে যাবে।</p>}
        </section>
      </div>

      <aside className="sticky design-result" aria-live="polite">
        <div className="card">
          <h3>ছাদের লেআউট</h3>
          <RoofPlan d={d} r={r} />
          <div className="legend" style={{ marginTop: 8 }}>
            <span><i style={{ background: "var(--green)" }} />প্যানেল</span>
            <span><i style={{ background: "transparent", border: "1.5px dashed var(--red)" }} />কিনারা ফাঁকা</span>
            <span>↓ দক্ষিণ</span>
          </div>
        </div>
        <Results r={r} d={d} />
      </aside>

      <section className="card full-span">
        <h3>উপকরণের তালিকা (BOM) ও আনুমানিক ব্যয়</h3>
        <div className="table-wrap" style={{ border: 0 }}>
          <table>
            <thead><tr><th>উপকরণ</th><th>বিবরণ</th><th>পরিমাণ</th><th style={{ textAlign: "right" }}>আনুমানিক ৳</th></tr></thead>
            <tbody>
              {r.bom.map((b) => (
                <tr key={b.item}><td><b>{b.item}</b></td><td className="wrap-cell">{b.spec}</td><td>{bn(b.qty)} {b.unit}</td><td style={{ textAlign: "right" }}>{fmt(b.amount)}</td></tr>
              ))}
              <tr><td colSpan={3}><b>মোট</b></td><td style={{ textAlign: "right" }}><b>৳ {fmt(r.capex)}</b></td></tr>
            </tbody>
          </table>
        </div>
        <p className="note">সব যন্ত্রপাতি BSTI ও SREDA নির্ধারিত কারিগরি মানদণ্ড অনুযায়ী হতে হবে (প্রজ্ঞাপন অনুচ্ছেদ ৪)। চূড়ান্ত ডিজাইন সাইট সার্ভের পর প্রোভাইডার নিশ্চিত করবেন।</p>
      </section>
    </div>
  );
}

function SyncStatus({ sync }: { sync: Sync }) {
  const s = sync.solset;
  if (s.mode === "solset")
    return <Alert kind="ok">Solset-এ পাঠানো হয়েছে · রেফ {sync.ref}{s.id && ` · Solset ID ${s.id}`}{s.url && <> · <a href={s.url} target="_blank" rel="noopener">Solset-এ খুলুন</a></>}</Alert>;
  if (s.mode === "error") return <Alert kind="err">ডিজাইন সংরক্ষিত (রেফ {sync.ref}), কিন্তু Solset-এ পাঠানো যায়নি: {s.error}</Alert>;
  return <Alert kind="ok">ডিজাইন সংরক্ষিত হয়েছে · রেফ {sync.ref}</Alert>;
}

function Results({ r, d }: { r: DesignResult; d: DesignInput }) {
  if (!r.count) return <Alert kind="err">এই মাপে কোনো প্যানেল বসছে না — দৈর্ঘ্য/প্রস্থ বাড়ান বা কিনারার ফাঁকা কমান।</Alert>;
  return (
    <div className="card estimate" style={{ marginTop: 16 }}>
      <div className="hero-num">
        <small>প্রস্তাবিত সিস্টেম</small>
        <b>{fmt(r.kwp, 2)} kWp</b>
        <small>{bn(r.count)}টি × {bn(r.panel.w)}W · ইনভার্টার {bn(r.inverterKw)} kW{r.batteryKwh ? ` · ব্যাটারি ${fmt(r.batteryKwh, 1)} kWh` : ""}</small>
      </div>
      <dl className="kv-list">
        <dt>বার্ষিক উৎপাদন</dt><dd>{fmt(r.gen)} ইউনিট</dd>
        <dt>নিজের ব্যবহার</dt><dd>{fmt(r.selfUse)} ইউনিট</dd>
        <dt>গ্রিডে বিক্রি</dt><dd>{fmt(r.exp)} ইউনিট</dd>
        <dt>প্রতি ৩ মাসে গ্রিড আয়</dt><dd>৳ {fmt(r.quarterlyExport)}</dd>
        <dt>বছরে বিল সাশ্রয়</dt><dd>৳ {fmt(r.yearlySaving)}</dd>
        <dt>আনুমানিক মোট ব্যয়</dt><dd>৳ {fmt(r.capex)}</dd>
        <dt>খরচ উঠে আসবে</dt><dd>~{fmt(r.payback, 1)} বছরে</dd>
      </dl>
      <div className={`lcoe ${r.underCap ? "ok" : "over"}`}>
        <div>
          <small>প্রতি ইউনিট উৎপাদন ব্যয় (২০ বছর)</small>
          <b>৳ {fmt(r.lcoe, 2)}</b>
        </div>
        <div style={{ textAlign: "right" }}>
          <small>প্রজ্ঞাপনের সর্বোচ্চ</small>
          <b>৳ {bn(POLICY.costCap)}</b>
        </div>
      </div>
      <p className="note" style={{ marginTop: 8 }}>
        {r.underCap
          ? <><CheckCircle2 size={13} /> নির্ধারিত ব্যয়ের চেয়ে কম — প্রজ্ঞাপন অনুযায়ী সাশ্রয়কৃত অর্থ আপনার লভ্যাংশ।</>
          : "নির্ধারিত সর্বোচ্চ ৳৮/ইউনিটের বেশি — দর বা সিস্টেমের আকার পুনর্বিবেচনা করুন।"}
      </p>
      {r.cappedByLoad && <Alert kind="info">ছাদে {bn(r.fit)}টি প্যানেল ধরে, কিন্তু অনুমোদিত লোড {fmt(d.load, 1)} kW অনুযায়ী {bn(r.count)}টিতে সীমিত করা হয়েছে।</Alert>}
      {d.battery && <p className="note"><BatteryCharging size={13} /> ব্যাটারি ১০ বছরে একবার বদলানোর খরচ ব্যয়ে ধরা হয়েছে।</p>}
    </div>
  );
}

/** Top-down roof plan in feet: setback margin, then panel rows filled south-first. */
function RoofPlan({ d, r }: { d: DesignInput; r: DesignResult }) {
  const pad = 2;
  const W = d.roofW, L = d.roofL;
  const rects = [];
  for (let i = 0; i < r.count; i++) {
    const row = Math.floor(i / r.cols), col = i % r.cols;
    rects.push(
      <rect key={i} x={d.setback + col * (r.pw + 0.08)} y={L - d.setback - r.depth - row * r.pitch}
        width={r.pw} height={r.depth} rx={0.15} className="pv" />,
    );
  }
  return (
    <svg className="roof-plan" viewBox={`${-pad} ${-pad} ${W + pad * 2} ${L + pad * 2 + 3}`} role="img"
      aria-label={`${W}×${L} ফুট ছাদে ${r.count}টি প্যানেল`}>
      <rect x={0} y={0} width={W} height={L} className="roof" />
      {d.setback > 0 && <rect x={d.setback} y={d.setback} width={r.usable.w} height={r.usable.l} className="setback" />}
      {rects}
      <text x={W / 2} y={L + 2.6} textAnchor="middle" className="dim">{bn(W)} ফুট</text>
    </svg>
  );
}
