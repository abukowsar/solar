"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Copy, Crosshair, LayoutGrid, Phone, Send, Wrench } from "lucide-react";
import { DISTRICTS } from "@/lib/data/districts";
import { POLICY } from "@/lib/data/policy";
import { TENDER_OFFICES } from "@/lib/data/tender";
import { estimate, SQFT_PER_KWP, YIELD_KWH_PER_KWP_DAY } from "@/lib/calc";
import { api, copyText } from "@/lib/client";
import { bn, digitsOnly, fmt } from "@/lib/format";
import { CATEGORIES, GOALS, ROOF_TYPES, SOURCES, UTILITIES, WHEN } from "@/lib/options";
import { Alert, CATEGORY_ICONS, Chips, Field, Stepper, validateWithin } from "./ui";

const STEPS = ["যোগাযোগ", "ছাদ ও বিদ্যুৎ", "আপনার চাহিদা", "যাচাই ও জমা"];

const initial = {
  name: "", phone: "", district: "", upazila: "", address: "", utility: "",
  category: CATEGORIES[0], roof: 800, roofType: ROOF_TYPES[0], units: 250, load: 5,
  goals: [GOALS[0], GOALS[1], GOALS[2]], when: "before-deadline", source: "QR-B",
  geo: "", notes: "", consent: false,
};
type Form = typeof initial;

export default function RequestForm() {
  const [f, setF] = useState<Form>(initial);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ ref: string; district: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [fromDesign, setFromDesign] = useState(false);
  const stepRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const src = new URLSearchParams(location.search).get("src");
    if (src && SOURCES.some((s) => s.value === src)) setF((x) => ({ ...x, source: src }));
    if (new URLSearchParams(location.search).get("from") !== "design") return;
    try {
      const d = JSON.parse(localStorage.getItem("rts-design") || "null");
      if (!d) return;
      setF((x) => ({
        ...x,
        roof: d.roof || x.roof, units: d.units ?? x.units, load: d.load ?? x.load,
        roofType: ROOF_TYPES.includes(d.roofType) ? d.roofType : x.roofType,
        name: d.name || x.name, phone: d.phone || x.phone, district: d.district || x.district, geo: d.geo || x.geo,
        notes: d.notes || x.notes,
      }));
      setFromDesign(true);
    } catch {}
  }, []);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((x) => ({ ...x, [k]: v }));
  const toggleGoal = (g: string) => set("goals", f.goals.includes(g) ? f.goals.filter((x) => x !== g) : [...f.goals, g]);

  const c = estimate(f.roof, f.units);
  const overLoad = f.load > 0 && c.kw > f.load;
  const offices = TENDER_OFFICES[f.district];
  const usePct = c.gen ? Math.min(100, (Math.min(c.use, c.gen) / c.gen) * 100) : 0;

  const go = (n: number) => {
    setError("");
    setStep(n);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const next = () => validateWithin(stepRef.current) && go(step + 1);

  function locate() {
    if (!navigator.geolocation) return setError("এই ব্রাউজারে অবস্থান পাওয়া যায় না");
    navigator.geolocation.getCurrentPosition(
      (p) => set("geo", `${p.coords.latitude.toFixed(5)}, ${p.coords.longitude.toFixed(5)}`),
      () => setError("অবস্থান পাওয়া যায়নি — হাতে লিখে দিন বা খালি রাখুন"),
      { timeout: 8000 },
    );
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step < STEPS.length - 1) return next();
    if (!validateWithin(stepRef.current)) return;
    setBusy(true);
    setError("");
    try {
      const r = await api<{ ref: string }>("/api/requests", { method: "POST", body: JSON.stringify(f) });
      setDone({ ref: r.ref, district: f.district });
      setF({ ...initial, source: f.source });
      setStep(0);
      topRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div ref={topRef} className="card success">
        <div className="tick"><CheckCircle2 size={40} /></div>
        <h2 style={{ margin: 0 }}>আপনার অনুরোধ জমা হয়েছে</h2>
        <p style={{ color: "var(--muted)", margin: "6px 0 0" }}>রেফারেন্স নম্বরটি সংরক্ষণ করুন</p>
        <div className="ref-box">
          {done.ref}
          <button className="btn outline sm" type="button" onClick={async () => setCopied(await copyText(done.ref))} aria-label="রেফারেন্স কপি">
            <Copy size={15} /> {copied ? "কপি হয়েছে" : "কপি"}
          </button>
        </div>
        <div className="next-steps">
          <div><span className="icon-badge"><Phone size={18} /></span><span><b>প্রোভাইডারের ফোন</b><br /><small>{done.district} জেলার নিবন্ধিত প্রোভাইডার আগ্রহ জানালে আপনাকে ফোন করবেন।</small></span></div>
          <div><span className="icon-badge sun"><Wrench size={18} /></span><span><b>সাইট সার্ভে ও কোটেশন</b><br /><small>ছাদ দেখে Solset AI-তে ডিজাইন করে কোটেশন দেবেন। BSTI/SREDA মানের যন্ত্রপাতি নিশ্চিত করুন।</small></span></div>
          <div><span className="icon-badge red"><Send size={18} /></span><span><b>২৮ ফেব্রুয়ারি ২০২৭-এর মধ্যে স্থাপন</b><br /><small>তবেই ২০৩০ পর্যন্ত প্রতি ইউনিট ৳১০.৫০ পাবেন, প্রতি ৩ মাসে ব্যাংকে।</small></span></div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <Link className="btn primary" href="/board"><LayoutGrid size={18} /> মিলান বোর্ড দেখুন</Link>
          <button className="btn outline" type="button" onClick={() => { setDone(null); setCopied(false); }}>আরেকটি অনুরোধ</button>
        </div>
      </div>
    );
  }

  return (
    <div className="split" ref={topRef} style={{ scrollMarginTop: 70 }}>
      <form className="card pad-lg" onSubmit={submit} noValidate>
        <Stepper steps={STEPS} current={step} />
        {fromDesign && step === 0 && <Alert kind="ok">আপনার ডিজাইনের তথ্য (ছাদ, ব্যবহার, লোড ও সিস্টেমের বিবরণ) ফর্মে বসানো হয়েছে।</Alert>}

        <div ref={stepRef}>
          {step === 0 && (
            <div className="form-grid">
              <Field label="আপনার নাম" required><input type="text" required autoComplete="name" value={f.name} onChange={(e) => set("name", e.target.value)} /></Field>
              <Field label="মোবাইল নম্বর" hint="১১ ডিজিট" required>
                <input type="tel" required placeholder="01XXXXXXXXX" pattern="01[3-9][0-9]{8}" inputMode="numeric" maxLength={11} autoComplete="tel"
                  value={f.phone} onChange={(e) => set("phone", digitsOnly(e.target.value))} title="01 দিয়ে শুরু ১১ ডিজিটের নম্বর" />
              </Field>
              <Field label="জেলা" required>
                <select required value={f.district} onChange={(e) => set("district", e.target.value)}>
                  <option value="">জেলা বেছে নিন</option>
                  {DISTRICTS.map((d) => <option key={d.bn} value={d.bn}>{d.bn}</option>)}
                </select>
              </Field>
              <Field label="উপজেলা / থানা" required><input type="text" required value={f.upazila} onChange={(e) => set("upazila", e.target.value)} /></Field>
              <Field label="পূর্ণ ঠিকানা" hint="বাড়ি, রোড, গ্রাম/মহল্লা" required full>
                <input type="text" required autoComplete="street-address" value={f.address} onChange={(e) => set("address", e.target.value)} />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="form-grid">
              <div className="field full">
                <span>স্থাপনার ধরন</span>
                <div className="tiles" role="radiogroup" aria-label="স্থাপনার ধরন">
                  {CATEGORIES.map((x) => {
                    const Icon = CATEGORY_ICONS[x];
                    return (
                      <label className="tile" key={x}>
                        <input type="radio" name="category" checked={f.category === x} onChange={() => set("category", x)} />
                        <span>{Icon && <Icon size={22} aria-hidden="true" />}{x}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <Field label="বিদ্যুৎ বিতরণ সংস্থা" hint="বিলে লেখা থাকে" required>
                <select required value={f.utility} onChange={(e) => set("utility", e.target.value)}>
                  <option value="">বেছে নিন</option>
                  {UTILITIES.map((u) => <option key={u}>{u}</option>)}
                </select>
              </Field>
              <Field label="ছাদের ধরন">
                <select value={f.roofType} onChange={(e) => set("roofType", e.target.value)}>
                  {ROOF_TYPES.map((x) => <option key={x}>{x}</option>)}
                </select>
              </Field>
              <Field label="ব্যবহারযোগ্য ছাদের আয়তন" hint="বর্গফুট, ছায়ামুক্ত অংশ" required>
                <input type="number" min={50} step={10} required value={f.roof} onChange={(e) => set("roof", +e.target.value)} />
              </Field>
              <Field label="মাসিক বিদ্যুৎ ব্যবহার" hint="ইউনিট (kWh)">
                <input type="number" min={0} value={f.units} onChange={(e) => set("units", +e.target.value)} />
              </Field>
              <Field label="অনুমোদিত লোড" hint="kW, বিলে লেখা থাকে">
                <input type="number" min={0} step={0.5} value={f.load} onChange={(e) => set("load", +e.target.value)} />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="form-grid">
              <div className="field full">
                <span>আপনি কী চান <span className="hint">· একাধিক বেছে নিতে পারেন</span></span>
                <Chips label="চাহিদা" options={GOALS} value={f.goals} onToggle={toggleGoal} />
              </div>
              <div className="field full">
                <span>কখন চালু করতে চান</span>
                <div className="tiles" role="radiogroup" aria-label="সময়">
                  {WHEN.map((w) => (
                    <label className="tile" key={w.value}>
                      <input type="radio" name="when" checked={f.when === w.value} onChange={() => set("when", w.value)} />
                      <span>{w.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <Field label="কোথা থেকে জানলেন">
                <select value={f.source} onChange={(e) => set("source", e.target.value)}>
                  {SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </Field>
              <Field label="অবস্থান (ঐচ্ছিক)" hint="স্যাটেলাইট ডিজাইনে কাজে লাগে">
                <span className="input-group">
                  <input type="text" placeholder="অক্ষাংশ, দ্রাঘিমাংশ" value={f.geo} onChange={(e) => set("geo", e.target.value)} />
                  <button type="button" className="btn outline" onClick={locate} aria-label="বর্তমান অবস্থান নিন"><Crosshair size={18} /></button>
                </span>
              </Field>
              <Field label="অতিরিক্ত তথ্য (ঐচ্ছিক)" full>
                <textarea placeholder="যেমন: ছাদে পানির ট্যাংক আছে, পাশের ভবনের ছায়া পড়ে" value={f.notes} onChange={(e) => set("notes", e.target.value)} />
              </Field>
            </div>
          )}

          {step === 3 && (
            <>
              <dl className="review">
                <dt>নাম</dt><dd>{f.name}</dd>
                <dt>মোবাইল</dt><dd>{bn(f.phone)}</dd>
                <dt>ঠিকানা</dt><dd>{f.address}, {f.upazila}, {f.district}</dd>
                <dt>বিতরণ সংস্থা</dt><dd>{f.utility}</dd>
                <dt>স্থাপনা</dt><dd>{f.category} · {f.roofType} · {fmt(f.roof)} বর্গফুট</dd>
                <dt>ব্যবহার / লোড</dt><dd>মাসিক {fmt(f.units)} ইউনিট · {fmt(f.load, 1)} kW</dd>
                <dt>চাহিদা</dt><dd>{f.goals.join(", ") || "—"}</dd>
                <dt>সময়</dt><dd>{WHEN.find((w) => w.value === f.when)?.label}</dd>
                {f.geo && <><dt>অবস্থান</dt><dd>{f.geo}</dd></>}
              </dl>
              <label className="check-row" style={{ marginTop: 18 }}>
                <input type="checkbox" required checked={f.consent} onChange={(e) => set("consent", e.target.checked)} />
                <span>আমি সম্মত যে আমার তথ্য নিবন্ধিত প্রোভাইডারদের সঙ্গে শেয়ার করা হবে; ফোন নম্বর ও ঠিকানা শুধু আগ্রহী প্রোভাইডার দেখবেন।</span>
              </label>
            </>
          )}
        </div>

        {error && <Alert kind="err">{error}</Alert>}

        <div className="wizard-nav">
          {step > 0 && <button type="button" className="btn outline" onClick={() => go(step - 1)}><ArrowLeft size={18} /> আগের ধাপ</button>}
          <div className="right">
            {step < STEPS.length - 1
              ? <button type="submit" className="btn primary">পরের ধাপ <ArrowRight size={18} /></button>
              : <button type="submit" className="btn red" disabled={busy}><Send size={18} /> {busy ? "জমা হচ্ছে…" : "অনুরোধ জমা দিন"}</button>}
          </div>
        </div>
      </form>

      <aside className="card estimate sticky" aria-live="polite">
        <h3>আনুমানিক হিসাব</h3>
        <div className="hero-num">
          <small>প্রতি ৩ মাসে সম্ভাব্য আয়</small>
          <b>৳ {fmt(c.quarterly)}</b>
          <small>৩ বছরে (২০৩০ পর্যন্ত) মোট ৳ {fmt(c.windowTotal)}</small>
        </div>
        <dl className="kv-list">
          <dt>সম্ভাব্য সিস্টেম</dt><dd>{fmt(c.kw, 1)} kWp</dd>
          <dt>বার্ষিক উৎপাদন</dt><dd>{fmt(c.gen)} ইউনিট</dd>
          <dt>নিজের ব্যবহার</dt><dd>{fmt(c.use)} ইউনিট</dd>
          <dt>গ্রিডে উদ্বৃত্ত</dt><dd>{fmt(c.exp)} ইউনিট</dd>
        </dl>
        <div className="meter" aria-hidden="true"><i className="use" style={{ width: `${usePct}%` }} /><i className="exp" style={{ width: `${100 - usePct}%` }} /></div>
        <div className="legend"><span><i style={{ background: "var(--green)" }} />নিজের ব্যবহার</span><span><i style={{ background: "var(--sun)" }} />গ্রিডে বিক্রি</span></div>

        {overLoad && <Alert kind="err">সম্ভাব্য সিস্টেম ({fmt(c.kw, 1)} kWp) অনুমোদিত লোডের ({fmt(f.load, 1)} kW) চেয়ে বেশি — নেট মিটারিং সীমা বিতরণ সংস্থার কাছে যাচাই করুন।</Alert>}
        {f.when !== "before-deadline" && <Alert kind="info">২৮ ফেব্রুয়ারি ২০২৭-এর পরে স্থাপিত সিস্টেমে ৳১০.৫০ প্রণোদনা প্রযোজ্য নয়; উপরের আয় তখন প্রযোজ্য হবে না।</Alert>}
        {c.exp === 0 && c.kw > 0 && <Alert kind="info">উৎপাদনের সবটাই নিজের ব্যবহারে যাবে; বিলের সাশ্রয়ই মূল লাভ।</Alert>}
        {offices && (
          <div className="office-box">
            <b>{f.district} জেলায় সহায়তা অফিস</b>
            <ul>{offices.map((o) => <li key={o}>{o}</li>)}</ul>
          </div>
        )}
        <p className="note">
          ধরে নেওয়া হয়েছে: প্রতি kWp-এ ~{bn(SQFT_PER_KWP)} বর্গফুট ছাদ, দৈনিক ~{bn(YIELD_KWH_PER_KWP_DAY)} ইউনিট/kWp। প্রজ্ঞাপনের হার
          ব্যাটারিসহ সিস্টেমের সর্বোচ্চ ৳{bn(POLICY.costCap)}/ইউনিট ব্যয় ধরে নির্ধারিত; কম খরচে বসাতে পারলে সাশ্রয় আপনার।
        </p>
      </aside>
    </div>
  );
}
