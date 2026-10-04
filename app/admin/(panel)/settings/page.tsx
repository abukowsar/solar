"use client";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, CheckCircle2, CircleDashed, Megaphone, Phone, Plus, RotateCcw, Save, Trash2, TriangleAlert } from "lucide-react";
import { useAdmin } from "@/components/admin/AdminShell";
import { Field } from "@/components/ui";
import type { Settings } from "@/lib/settings";

export default function AdminSettings() {
  const { data, act } = useAdmin();
  const [s, setS] = useState<Settings | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (data && !dirty) setS(structuredClone(data.settings));
  }, [data, dirty]);

  if (!data || !s) return null;
  const edit = (fn: (x: Settings) => void) => {
    const next = structuredClone(s);
    fn(next);
    setS(next);
    setDirty(true);
  };
  const move = (i: number, d: number) => edit((x) => { const [n] = x.notices.splice(i, 1); x.notices.splice(i + d, 0, n); });

  async function save() {
    if (await act("/api/admin/settings", { method: "PUT", body: JSON.stringify(s) }, "সেটিংস সংরক্ষিত — সাইটে এখনই দেখা যাবে")) setDirty(false);
  }
  async function reset() {
    if (confirm("সব সেটিংস ডিফল্টে ফেরত নেবেন?") && (await act("/api/admin/settings", { method: "PUT", body: JSON.stringify({ reset: true }) }, "ডিফল্ট সেটিংস ফেরত আনা হয়েছে"))) setDirty(false);
  }

  const i = data.integrations;
  const integrations = [
    { ok: i.solsetApi, label: "Solset ডিজাইন API", hint: "SOLSET_API_URL, SOLSET_API_KEY" },
    { ok: i.solsetWebhook, label: "Solset লিড ওয়েবহুক", hint: "SOLSET_WEBHOOK_URL" },
    { ok: i.adminToken, label: "API টোকেন এক্সপোর্ট", hint: "ADMIN_TOKEN" },
    { ok: i.adminSecret, label: "আলাদা সেশন সিক্রেট", hint: "ADMIN_SECRET (না থাকলে পাসওয়ার্ড থেকে তৈরি)" },
  ];

  return (
    <div className="admin-settings">
      <section className="card">
        <div className="card-head"><span className="icon-badge red"><Megaphone size={20} /></span><h3>নোটিশ টিকার</h3></div>
        <p className="note" style={{ marginTop: 0 }}>সাইটের ওপরের লাল “নোটিশ” স্ট্রিপে চলমান বার্তা। লিংক হতে পারে সাইটের পাথ (যেমন /request) বা https:// ঠিকানা।</p>
        <div className="notice-list">
          {s.notices.map((n, idx) => (
            <div className="notice-row" key={idx}>
              <input type="text" value={n.text} placeholder="নোটিশের লেখা" aria-label={`নোটিশ ${idx + 1}`} onChange={(e) => edit((x) => { x.notices[idx].text = e.target.value; })} />
              <input type="text" value={n.href} placeholder="/policy" aria-label={`নোটিশ ${idx + 1} লিংক`} className="href" onChange={(e) => edit((x) => { x.notices[idx].href = e.target.value; })} />
              <span className="row-btns">
                <button className="icon-btn" type="button" disabled={idx === 0} aria-label="ওপরে" onClick={() => move(idx, -1)}><ArrowUp size={15} /></button>
                <button className="icon-btn" type="button" disabled={idx === s.notices.length - 1} aria-label="নিচে" onClick={() => move(idx, 1)}><ArrowDown size={15} /></button>
                <button className="icon-btn danger" type="button" aria-label="মুছুন" onClick={() => edit((x) => { x.notices.splice(idx, 1); })}><Trash2 size={15} /></button>
              </span>
            </div>
          ))}
        </div>
        <button className="btn outline sm" type="button" style={{ marginTop: 10 }} disabled={s.notices.length >= 12}
          onClick={() => edit((x) => { x.notices.push({ text: "", href: "/" }); })}><Plus size={15} /> নোটিশ যোগ করুন</button>
      </section>

      <section className="card">
        <div className="card-head"><span className="icon-badge sun"><TriangleAlert size={20} /></span><h3>ঘোষণা ব্যানার</h3></div>
        <label className="check-row" style={{ marginBottom: 12 }}>
          <input type="checkbox" checked={s.announcement.active} onChange={(e) => edit((x) => { x.announcement.active = e.target.checked; })} />
          <span>সব পাতার ওপরে ব্যানার দেখান</span>
        </label>
        <div className="form-grid">
          <Field label="বার্তা" full>
            <input type="text" value={s.announcement.text} placeholder="যেমন: সার্ভার রক্ষণাবেক্ষণ আজ রাত ১১টায়" onChange={(e) => edit((x) => { x.announcement.text = e.target.value; })} />
          </Field>
          <Field label="ধরন">
            <select value={s.announcement.kind} onChange={(e) => edit((x) => { x.announcement.kind = e.target.value === "warn" ? "warn" : "info"; })}>
              <option value="info">তথ্য (সবুজ)</option>
              <option value="warn">সতর্কতা (লাল)</option>
            </select>
          </Field>
          <Field label="লিংক" hint="ঐচ্ছিক">
            <input type="text" value={s.announcement.href} placeholder="/policy" onChange={(e) => edit((x) => { x.announcement.href = e.target.value; })} />
          </Field>
        </div>
      </section>

      <section className="card">
        <div className="card-head"><span className="icon-badge"><Phone size={20} /></span><h3>হেডারের হেল্পলাইন</h3></div>
        <div className="form-grid">
          <Field label="লেবেল"><input type="text" value={s.helpline.label} onChange={(e) => edit((x) => { x.helpline.label = e.target.value; })} /></Field>
          <Field label="ফোন নম্বর"><input type="text" value={s.helpline.phone} onChange={(e) => edit((x) => { x.helpline.phone = e.target.value; })} /></Field>
        </div>
      </section>

      <section className="card">
        <h3>ইন্টিগ্রেশন অবস্থা</h3>
        <p className="note" style={{ marginTop: 0 }}>এগুলো সার্ভারের <code>.env.local</code> থেকে আসে; পরিবর্তনের পর সার্ভার আবার চালু করুন। ডেটা স্টোর: <code>{i.dataFile}</code></p>
        <ul className="integrations">
          {integrations.map((x) => (
            <li key={x.label}>
              {x.ok ? <CheckCircle2 size={18} color="var(--ok)" /> : <CircleDashed size={18} color="var(--muted)" />}
              <span><b>{x.label}</b><small>{x.hint}</small></span>
              <span className={`tag ${x.ok ? "green" : ""}`}>{x.ok ? "চালু" : "বন্ধ"}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="save-bar">
        <span>{dirty ? "অসংরক্ষিত পরিবর্তন আছে" : "সব পরিবর্তন সংরক্ষিত"}</span>
        <button className="btn outline sm" type="button" onClick={reset}><RotateCcw size={15} /> ডিফল্ট</button>
        <button className="btn primary sm" type="button" disabled={!dirty} onClick={save}><Save size={15} /> সংরক্ষণ</button>
      </div>
    </div>
  );
}
