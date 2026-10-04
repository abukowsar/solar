"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, ExternalLink, LayoutGrid, MapPin, Send } from "lucide-react";
import { DISTRICTS, DISTRICT_BY_BN } from "@/lib/data/districts";
import { ELIGIBILITY, TENDER, TENDER_OFFICES, tenderStatus } from "@/lib/data/tender";
import { api } from "@/lib/client";
import { bn, digitsOnly, fmt } from "@/lib/format";
import { CATEGORIES, ENLISTMENT, GOALS, PROVIDER_KINDS } from "@/lib/options";
import { Alert, CATEGORY_ICONS, Chips, Field, Stepper, validateWithin } from "./ui";

const STEPS = ["প্রতিষ্ঠানের তথ্য", "যোগ্যতা", "সেবা ও এলাকা"];
const DIVISIONS = [...new Set(DISTRICTS.map((d) => d.division))];
const DIVISION_BN: Record<string, string> = {
  Dhaka: "ঢাকা", Chattogram: "চট্টগ্রাম", Rajshahi: "রাজশাহী", Khulna: "খুলনা",
  Barishal: "বরিশাল", Sylhet: "সিলেট", Rangpur: "রংপুর", Mymensingh: "ময়মনসিংহ",
};

const initial = {
  company: "", contact: "", phone: "", email: "", home: "", kind: "new", expKw: 0,
  docs: [] as string[], types: [CATEGORIES[0], CATEGORIES[1]], services: [GOALS[0], GOALS[1]],
  serve: [] as string[], enlistment: "none", solset: "",
};
type Form = typeof initial;

export default function ProviderForm() {
  const [f, setF] = useState<Form>(initial);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const stepRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((x) => ({ ...x, [k]: v }));
  const toggle = (k: "docs" | "types" | "services" | "serve", v: string) =>
    set(k, f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v]);

  const docs = new Set(f.docs);
  if (f.expKw >= 2) docs.add("exp");
  const missing = ELIGIBILITY.filter((e) => !docs.has(e.key));
  const pct = Math.round(((ELIGIBILITY.length - missing.length) / ELIGIBILITY.length) * 100);
  const inCtg = DISTRICT_BY_BN[f.home]?.division === "Chattogram";
  const tender = tenderStatus();

  const go = (n: number) => {
    setError("");
    setStep(n);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validateWithin(stepRef.current)) return;
    if (step < STEPS.length - 1) return go(step + 1);
    const serve = f.serve.includes(f.home) ? f.serve : [f.home, ...f.serve];
    setBusy(true);
    setError("");
    try {
      const r = await api<{ id: string; ref: string }>("/api/providers", { method: "POST", body: JSON.stringify({ ...f, serve }) });
      try { localStorage.setItem("rts-as", r.id); } catch {}
      setDone(r.ref);
      setF(initial);
      setStep(0);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="card success">
        <div className="tick"><CheckCircle2 size={40} /></div>
        <h2 style={{ margin: 0 }}>নিবন্ধন সম্পন্ন হয়েছে</h2>
        <div className="ref-box">{done}</div>
        <p style={{ color: "var(--muted)", maxWidth: 520, margin: "0 auto 18px" }}>
          এই ব্রাউজারে আপনাকে প্রোভাইডার হিসেবে বেছে রাখা হয়েছে। মিলান বোর্ডে নিজের জেলার অনুরোধে আগ্রহ জানান, তারপর Solset-এ লিড নিন।
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <Link className="btn primary" href="/board"><LayoutGrid size={18} /> মিলান বোর্ডে যান</Link>
          <button className="btn outline" type="button" onClick={() => setDone(null)}>আরেকটি নিবন্ধন</button>
        </div>
      </div>
    );
  }

  return (
    <div className="split" ref={topRef} style={{ scrollMarginTop: 70 }}>
      <form className="card pad-lg" onSubmit={submit} noValidate>
        <Stepper steps={STEPS} current={step} />

        <div ref={stepRef}>
          {step === 0 && (
            <div className="form-grid">
              <Field label="প্রতিষ্ঠানের নাম" required full><input type="text" required value={f.company} onChange={(e) => set("company", e.target.value)} /></Field>
              <Field label="যোগাযোগকারীর নাম" required><input type="text" required value={f.contact} onChange={(e) => set("contact", e.target.value)} /></Field>
              <Field label="মোবাইল" required>
                <input type="tel" required pattern="01[3-9][0-9]{8}" inputMode="numeric" maxLength={11} placeholder="01XXXXXXXXX"
                  value={f.phone} onChange={(e) => set("phone", digitsOnly(e.target.value))} title="01 দিয়ে শুরু ১১ ডিজিটের নম্বর" />
              </Field>
              <Field label="ইমেইল" hint="ঐচ্ছিক"><input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} /></Field>
              <Field label="ব্যবসা নিবন্ধিত জেলা" required>
                <select required value={f.home} onChange={(e) => { set("home", e.target.value); if (e.target.value && !f.serve.includes(e.target.value)) set("serve", [...f.serve, e.target.value]); }}>
                  <option value="">জেলা বেছে নিন</option>
                  {DISTRICTS.map((d) => <option key={d.bn} value={d.bn}>{d.bn}</option>)}
                </select>
              </Field>
              <Field label="প্রতিষ্ঠানের ধরন">
                <select value={f.kind} onChange={(e) => set("kind", e.target.value)}>
                  {PROVIDER_KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
                </select>
              </Field>
              <Field label="সম্পন্ন প্রকল্প" hint="মোট kWp">
                <input type="number" min={0} step={0.5} value={f.expKw} onChange={(e) => set("expKw", +e.target.value)} />
              </Field>
              <Field label="সরকারি তালিকাভুক্তির অবস্থা" full>
                <select value={f.enlistment} onChange={(e) => set("enlistment", e.target.value)}>
                  {ENLISTMENT.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
                </select>
              </Field>
            </div>
          )}

          {step === 1 && (
            <>
              <p style={{ marginTop: 0, color: "var(--muted)" }}>বিউবো বিজ্ঞপ্তির অনুচ্ছেদ ১০ অনুযায়ী যেগুলো আপনার আছে, টিক দিন। না থাকলেও নিবন্ধন করা যাবে।</p>
              <div className="check-list">
                {ELIGIBILITY.map((d) => {
                  const auto = d.key === "exp" && f.expKw >= 2;
                  return (
                    <label key={d.key} className={`check-row${docs.has(d.key) ? " done" : ""}`}>
                      <input type="checkbox" checked={docs.has(d.key)} disabled={auto} onChange={() => toggle("docs", d.key)} />
                      <span>{d.label}{auto && <span className="hint"> · আপনার {fmt(f.expKw, 1)} kWp অভিজ্ঞতা থেকে পূরণ হয়েছে</span>}</span>
                    </label>
                  );
                })}
              </div>
            </>
          )}

          {step === 2 && (
            <div className="form-grid">
              <div className="field full">
                <span>যে ধরনের স্থাপনায় কাজ করেন</span>
                <div className="tiles">
                  {CATEGORIES.map((x) => {
                    const Icon = CATEGORY_ICONS[x];
                    return (
                      <label className="tile" key={x}>
                        <input type="checkbox" checked={f.types.includes(x)} onChange={() => toggle("types", x)} />
                        <span>{Icon && <Icon size={22} aria-hidden="true" />}{x}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="field full">
                <span>সেবা</span>
                <Chips label="সেবা" options={GOALS} value={f.services} onToggle={(v) => toggle("services", v)} />
              </div>
              <div className="field full">
                <span>যে জেলাগুলোতে সেবা দেবেন <span className="hint">· {bn(f.serve.length)}টি বেছে নেওয়া</span></span>
                <div className="district-picker">
                  {DIVISIONS.map((div) => (
                    <div key={div}>
                      <div className="div-head">{DIVISION_BN[div]} বিভাগ</div>
                      <div className="chips">
                        {DISTRICTS.filter((d) => d.division === div).map((d) => (
                          <label className="chip-opt" key={d.bn}>
                            <input type="checkbox" checked={f.serve.includes(d.bn)} onChange={() => toggle("serve", d.bn)} />
                            <span>{d.bn}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Field label="Solset ওয়ার্কস্পেস লিংক" hint="ঐচ্ছিক" full>
                <input type="url" placeholder="https://solset.ai/…" value={f.solset} onChange={(e) => set("solset", e.target.value)} />
              </Field>
            </div>
          )}
        </div>

        {error && <Alert kind="err">{error}</Alert>}

        <div className="wizard-nav">
          {step > 0 && <button type="button" className="btn outline" onClick={() => go(step - 1)}><ArrowLeft size={18} /> আগের ধাপ</button>}
          <div className="right">
            {step < STEPS.length - 1
              ? <button type="submit" className="btn primary">পরের ধাপ <ArrowRight size={18} /></button>
              : <button type="submit" className="btn red" disabled={busy}><Send size={18} /> {busy ? "জমা হচ্ছে…" : "নিবন্ধন করুন"}</button>}
          </div>
        </div>
      </form>

      <aside className="card estimate sticky">
        <h3>যোগ্যতা যাচাই</h3>
        <div className="hero-num">
          <small>প্রয়োজনীয় কাগজপত্র</small>
          <b>{bn(ELIGIBILITY.length - missing.length)} / {bn(ELIGIBILITY.length)}</b>
          <div className="meter" style={{ background: "rgba(255,255,255,.25)", margin: "8px 0 0" }}>
            <i style={{ width: `${pct}%`, background: "var(--sun)" }} />
          </div>
        </div>
        <dl className="kv-list">
          <dt>আবেদন ফরমের মূল্য</dt><dd>৳{bn(TENDER.formPrice)}</dd>
          <dt>নিবন্ধন / তালিকাভুক্তি ফি</dt><dd>৳{fmt(TENDER.registrationFee)}</dd>
          <dt>জমা দিতে হবে</dt><dd>মূল + ২ কপি</dd>
        </dl>
        {missing.length
          ? <Alert kind="info">সরকারি আবেদনের আগে সংগ্রহ করুন: {missing.map((m) => m.label).join("; ")}।</Alert>
          : <Alert kind="ok">সব প্রয়োজনীয় কাগজ আছে।</Alert>}
        {inCtg && (
          <div className="office-box">
            <b><MapPin size={14} /> {f.home}: ফরম সংগ্রহ ও জমার অফিস</b>{" "}
            <span className={`tag ${tender.closed ? "red" : "green"}`}>{tender.closed ? "২৭/০৯/২০২৬-এ বন্ধ" : "খোলা"}</span>
            <ul>{TENDER_OFFICES[f.home]?.map((o) => <li key={o}>{o}</li>)}</ul>
          </div>
        )}
        {f.home && !inCtg && (
          <p className="note">বিউবোর এই বিজ্ঞপ্তি শুধু চট্টগ্রাম বিভাগের জন্য। {f.home} জেলার জন্য এলাকার বিতরণ সংস্থার (BREB/BPDB/DPDC/DESCO/WZPDC/NESCO) বিজ্ঞপ্তি দেখুন।</p>
        )}
        <p className="note">
          {TENDER.perDistrict} এখানকার নিবন্ধন শুধু মিলান বোর্ডে লিড দেখার জন্য; সরকারি তালিকাভুক্তির বিকল্প নয়।{" "}
          <a href={TENDER.sourceUrl} target="_blank" rel="noopener">বিজ্ঞপ্তি <ExternalLink size={12} /></a>
        </p>
      </aside>
    </div>
  );
}
