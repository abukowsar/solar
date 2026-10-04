"use client";
import { useState } from "react";
import { BellRing, CheckCircle2, Mail, MessageSquareText, Send } from "lucide-react";
import { DISTRICTS } from "@/lib/data/districts";
import { api } from "@/lib/client";
import { digitsOnly } from "@/lib/format";

type Channel = "email" | "sms";

export default function Newsletter() {
  const [channel, setChannel] = useState<Channel>("sms");
  const [contact, setContact] = useState("");
  const [role, setRole] = useState("owner");
  const [district, setDistrict] = useState("");
  const [mode, setMode] = useState<"sub" | "unsub">("sub");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const switchChannel = (c: Channel) => { setChannel(c); setContact(""); setMsg(null); };

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!e.currentTarget.reportValidity()) return;
    setBusy(true);
    setMsg(null);
    try {
      if (mode === "unsub") {
        await api("/api/subscribe", { method: "DELETE", body: JSON.stringify({ channel, contact }) });
        setMsg({ ok: true, text: "সাবস্ক্রিপশন বাতিল হয়েছে। আর কোনো বার্তা পাঠানো হবে না।" });
      } else {
        const r = await api<{ existed: boolean }>("/api/subscribe", { method: "POST", body: JSON.stringify({ channel, contact, role, district }) });
        setMsg({ ok: true, text: r.existed ? "আপনি আগেই সাবস্ক্রাইব করেছেন — তথ্য হালনাগাদ হয়েছে।" : channel === "sms" ? "ধন্যবাদ! গুরুত্বপূর্ণ হালনাগাদ SMS-এ পাবেন।" : "ধন্যবাদ! গুরুত্বপূর্ণ হালনাগাদ ইমেইলে পাবেন।" });
      }
      setContact("");
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="newsletter" aria-labelledby="nl-title">
      <div className="nl-copy">
        <span className="nl-eyebrow"><BellRing size={15} aria-hidden="true" /> নিউজলেটার</span>
        <h3 id="nl-title">নতুন খবর সবার আগে পান</h3>
        <ul>
          <li>প্রণোদনার হার ও সময়সীমার হালনাগাদ</li>
          <li>আপনার জেলায় নতুন প্রোভাইডার ও বিজ্ঞপ্তি</li>
          <li>স্থাপনের শেষ তারিখের আগে রিমাইন্ডার</li>
        </ul>
      </div>

      <form className="nl-form" onSubmit={submit} noValidate>
        <div className="seg" role="radiogroup" aria-label="কীভাবে পেতে চান">
          <button type="button" role="radio" aria-checked={channel === "sms"} onClick={() => switchChannel("sms")}><MessageSquareText size={16} /> SMS</button>
          <button type="button" role="radio" aria-checked={channel === "email"} onClick={() => switchChannel("email")}><Mail size={16} /> ইমেইল</button>
        </div>

        <div className="nl-row">
          <label className="sr-only" htmlFor="nl-contact">{channel === "sms" ? "মোবাইল নম্বর" : "ইমেইল ঠিকানা"}</label>
          {channel === "sms" ? (
            <input id="nl-contact" type="tel" inputMode="numeric" required pattern="01[3-9][0-9]{8}" maxLength={11} placeholder="01XXXXXXXXX"
              title="01 দিয়ে শুরু ১১ ডিজিটের নম্বর" value={contact} onChange={(e) => setContact(digitsOnly(e.target.value))} />
          ) : (
            <input id="nl-contact" type="email" required placeholder="you@example.com" autoComplete="email" value={contact} onChange={(e) => setContact(e.target.value)} />
          )}
          <button className={`btn ${mode === "sub" ? "red" : "white"}`} type="submit" disabled={busy}>
            {mode === "sub" ? <><Send size={17} /> সাবস্ক্রাইব</> : "বাতিল করুন"}
          </button>
        </div>

        {mode === "sub" && (
          <div className="nl-row">
            <label className="sr-only" htmlFor="nl-role">আপনি কে</label>
            <select id="nl-role" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="owner">আমি ছাদ মালিক</option>
              <option value="provider">আমি প্রোভাইডার</option>
              <option value="other">অন্যান্য</option>
            </select>
            <label className="sr-only" htmlFor="nl-district">জেলা</label>
            <select id="nl-district" value={district} onChange={(e) => setDistrict(e.target.value)}>
              <option value="">সব জেলা</option>
              {DISTRICTS.map((d) => <option key={d.bn} value={d.bn}>{d.bn}</option>)}
            </select>
          </div>
        )}

        {msg && (
          <p className={`nl-msg ${msg.ok ? "ok" : "err"}`} role={msg.ok ? "status" : "alert"}>
            {msg.ok && <CheckCircle2 size={16} aria-hidden="true" />} {msg.text}
          </p>
        )}
        <p className="nl-fine">
          মাসে সর্বোচ্চ ২–৩টি বার্তা, কোনো বিজ্ঞাপন নয়।{" "}
          <button type="button" className="linkish" onClick={() => { setMode(mode === "sub" ? "unsub" : "sub"); setMsg(null); }}>
            {mode === "sub" ? "সাবস্ক্রিপশন বাতিল করতে চান?" : "← সাবস্ক্রাইব করুন"}
          </button>
        </p>
      </form>
    </section>
  );
}
