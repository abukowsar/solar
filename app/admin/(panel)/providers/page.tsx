"use client";
import { useMemo, useState } from "react";
import { Download, Search, Trash2 } from "lucide-react";
import { useAdmin } from "@/components/admin/AdminShell";
import { DISTRICTS } from "@/lib/data/districts";
import { ELIGIBILITY } from "@/lib/data/tender";
import { bn, bdDate, fmt } from "@/lib/format";
import { ENLISTMENT, PROVIDER_KINDS } from "@/lib/options";

export default function AdminProviders() {
  const { data, act } = useAdmin();
  const [q, setQ] = useState("");
  const [dist, setDist] = useState("");
  const [status, setStatus] = useState("");

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (data?.providers ?? []).filter((p) =>
      (!dist || p.home === dist || p.serve.includes(dist)) &&
      (!status || p.enlistment === status) &&
      (!needle || [p.company, p.contact, p.phone, p.email, p.ref].some((v) => v.toLowerCase().includes(needle))));
  }, [data, q, dist, status]);

  if (!data) return null;
  const leads = (id: string) => data.requests.filter((r) => r.interests.includes(id)).length;

  return (
    <>
      <div className="toolbar">
        <label className="search">
          <Search size={16} aria-hidden="true" />
          <input type="search" placeholder="প্রতিষ্ঠান, ফোন বা রেফ খুঁজুন" value={q} onChange={(e) => setQ(e.target.value)} aria-label="খুঁজুন" />
        </label>
        <select value={dist} onChange={(e) => setDist(e.target.value)} aria-label="জেলা">
          <option value="">সব জেলা</option>
          {DISTRICTS.map((d) => <option key={d.bn}>{d.bn}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="তালিকাভুক্তি">
          <option value="">সব অবস্থা</option>
          {ENLISTMENT.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
        </select>
        <span className="toolbar-right">
          <a className="btn outline sm" href="/api/admin/export?type=providers"><Download size={15} /> CSV</a>
        </span>
      </div>
      <p className="note" style={{ margin: "0 0 10px" }}>
        {bn(list.length)} / {bn(data.providers.length)}টি প্রোভাইডার · প্রোভাইডারের ঘোষিত তথ্য — তালিকাভুক্তি নিশ্চিত করার আগে কাগজপত্র যাচাই করুন।
      </p>

      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>রেফ / তারিখ</th><th>প্রতিষ্ঠান</th><th>যোগাযোগ</th><th>জেলা</th><th>কাগজপত্র</th><th>অভিজ্ঞতা</th><th>লিড</th><th>তালিকাভুক্তি</th><th aria-label="কাজ" /></tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id}>
                <td><span className="ref">{p.ref}</span><br /><small>{bdDate(p.created)}</small></td>
                <td><b>{p.company}</b><br /><small>{PROVIDER_KINDS.find((k) => k.value === p.kind)?.label}</small></td>
                <td>{p.contact}<br /><a href={`tel:${p.phone}`}>{p.phone}</a>{p.email && <><br /><small>{p.email}</small></>}</td>
                <td>{p.home}<br /><small title={p.serve.join(", ")}>{bn(p.serve.length)}টি জেলায় সেবা</small></td>
                <td>
                  <span className={`tag ${p.docs.length === ELIGIBILITY.length ? "green" : "sun"}`} title={ELIGIBILITY.filter((e) => !p.docs.includes(e.key)).map((e) => e.label).join("; ") || "সব আছে"}>
                    {bn(p.docs.length)}/{bn(ELIGIBILITY.length)}
                  </span>
                </td>
                <td>{fmt(p.expKw, 1)} kWp</td>
                <td>{bn(leads(p.id))}</td>
                <td>
                  <select className="mini" value={p.enlistment} aria-label="তালিকাভুক্তি পরিবর্তন"
                    onChange={(e) => act(`/api/admin/providers/${p.id}`, { method: "PATCH", body: JSON.stringify({ enlistment: e.target.value }) }, `${p.company}: তালিকাভুক্তি হালনাগাদ`)}>
                    {ENLISTMENT.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
                  </select>
                </td>
                <td>
                  <button className="icon-btn danger" type="button" aria-label={`${p.company} মুছুন`}
                    onClick={() => confirm(`${p.company} মুছে ফেলবেন? এদের সব আগ্রহও সরে যাবে।`) && act(`/api/admin/providers/${p.id}`, { method: "DELETE" }, `${p.company} মুছে ফেলা হয়েছে`)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {!list.length && <tr><td colSpan={9}><div className="empty" style={{ border: 0 }}>কোনো প্রোভাইডার পাওয়া যায়নি।</div></td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
