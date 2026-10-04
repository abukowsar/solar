"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, ExternalLink, Webhook } from "lucide-react";
import { api, useActingProvider, useProviders } from "@/lib/client";
import { bn } from "@/lib/format";
import { Alert, Field } from "./ui";

type Preview = { columns: string[]; rows: (string | number)[][] };

const TOOLS = [
  { href: "https://solset.ai/signup?next=first-design", label: "প্রথম ডিজাইন বিনামূল্যে" },
  { href: "https://solset.ai/signup?next=design-credit", label: "প্রতি ডিজাইনে পেমেন্ট" },
  { href: "https://solset.ai/features", label: "ফিচার" },
  { href: "https://solset.ai/marketplace", label: "মার্কেটপ্লেস" },
  { href: "https://solset.ai/contact/enterprise", label: "এন্টারপ্রাইজ / API" },
];

export default function SolsetExport() {
  const providers = useProviders();
  const [as, setAs] = useActingProvider();
  const [preview, setPreview] = useState<Preview | null>(null);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    api<{ enabled: boolean }>("/api/solset/push").then((r) => setPushEnabled(r.enabled)).catch(() => {});
  }, []);

  useEffect(() => {
    setPreview(null);
    if (!as) return;
    api<Preview>(`/api/solset/export?provider=${encodeURIComponent(as)}&format=json`)
      .then(setPreview)
      .catch((e) => setMsg({ ok: false, text: e.message }));
  }, [as]);

  async function push() {
    setMsg(null);
    try {
      const r = await api<{ sent: number }>("/api/solset/push", { method: "POST", body: JSON.stringify({ provider: as }) });
      setMsg({ ok: true, text: `${bn(r.sent)}টি লিড ওয়েবহুকে পাঠানো হয়েছে` });
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    }
  }

  const count = preview?.rows.length ?? 0;

  return (
    <>
      <div className="card">
        <div className="card-head"><span className="icon-badge red"><Download size={20} /></span><h3>লিড এক্সপোর্ট</h3></div>
        <Field label="কোন প্রোভাইডারের লিড">
          <select value={as} onChange={(e) => setAs(e.target.value)}>
            <option value="">প্রোভাইডার বেছে নিন…</option>
            {providers.map((p) => <option key={p.id} value={p.id}>{p.company} ({p.home})</option>)}
          </select>
        </Field>
        <div style={{ margin: "14px 0", display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a className="btn primary" href={as ? `/api/solset/export?provider=${encodeURIComponent(as)}` : undefined} aria-disabled={!as || !count} download>
            <Download size={18} /> Solset CSV ({bn(count)})
          </a>
          {pushEnabled && <button className="btn red" disabled={!as || !count} onClick={push}><Webhook size={18} /> ওয়েবহুকে পাঠান</button>}
        </div>
        {msg && <Alert kind={msg.ok ? "ok" : "err"}>{msg.text}</Alert>}
        {as && preview && !count && <Alert kind="info">এই প্রোভাইডার এখনো কোনো লিডে আগ্রহ জানাননি — <Link href="/board">মিলান বোর্ডে</Link> যান।</Alert>}
        <p className="note">Solset-এ Leads → Import CSV খুলে কলাম মিলিয়ে নিন। শুধু আগ্রহ দেখানো লিড পূর্ণ যোগাযোগের তথ্যসহ আসে।</p>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <h3>Solset টুল</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {TOOLS.map((t) => (
            <a key={t.href} className="btn outline sm" href={t.href} target="_blank" rel="noopener">{t.label} <ExternalLink size={13} /></a>
          ))}
        </div>
      </div>

      {preview && count > 0 && (
        <>
          <h3 style={{ marginTop: 24 }}>প্রিভিউ</h3>
          <div className="table-wrap">
            <table>
              <thead><tr>{preview.columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
              <tbody>{preview.rows.slice(0, 20).map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
