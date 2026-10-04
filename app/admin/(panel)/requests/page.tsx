"use client";
import { Fragment, useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Download, Search, Trash2 } from "lucide-react";
import { useAdmin } from "@/components/admin/AdminShell";
import { DISTRICTS } from "@/lib/data/districts";
import { bn, bdDate, fmt } from "@/lib/format";
import { STAGES, WHEN } from "@/lib/options";

export default function AdminRequests() {
  const { data, act } = useAdmin();
  const [q, setQ] = useState("");
  const [dist, setDist] = useState("");
  const [stage, setStage] = useState("");
  const [onlyUnmatched, setOnlyUnmatched] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    if (new URLSearchParams(location.search).get("filter") === "unmatched") setOnlyUnmatched(true);
  }, []);

  const providers = data?.providers ?? [];
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (data?.requests ?? []).filter((r) =>
      (!dist || r.district === dist) &&
      (stage === "" || String(r.stage) === stage) &&
      (!onlyUnmatched || !r.interests.length) &&
      (!needle || [r.name, r.phone, r.ref, r.upazila, r.address].some((v) => v.toLowerCase().includes(needle))));
  }, [data, q, dist, stage, onlyUnmatched]);

  if (!data) return null;

  const remove = (id: string, ref: string) =>
    confirm(`${ref} মুছে ফেলবেন? এটি ফেরত আনা যাবে না।`) && act(`/api/admin/requests/${id}`, { method: "DELETE" }, `${ref} মুছে ফেলা হয়েছে`);

  return (
    <>
      <div className="toolbar">
        <label className="search">
          <Search size={16} aria-hidden="true" />
          <input type="search" placeholder="নাম, ফোন, রেফ বা ঠিকানা খুঁজুন" value={q} onChange={(e) => setQ(e.target.value)} aria-label="খুঁজুন" />
        </label>
        <select value={dist} onChange={(e) => setDist(e.target.value)} aria-label="জেলা">
          <option value="">সব জেলা</option>
          {DISTRICTS.map((d) => <option key={d.bn}>{d.bn}</option>)}
        </select>
        <select value={stage} onChange={(e) => setStage(e.target.value)} aria-label="ধাপ">
          <option value="">সব ধাপ</option>
          {STAGES.map((s, i) => <option key={s} value={i}>{s}</option>)}
        </select>
        <label className="chip-opt"><input type="checkbox" checked={onlyUnmatched} onChange={(e) => setOnlyUnmatched(e.target.checked)} /><span>প্রোভাইডারহীন</span></label>
        <span className="toolbar-right">
          <a className="btn outline sm" href="/api/admin/export?type=requests"><Download size={15} /> CSV</a>
          <a className="btn outline sm" href="/api/admin/export?type=solset"><Download size={15} /> Solset CSV</a>
        </span>
      </div>
      <p className="note" style={{ margin: "0 0 10px" }}>{bn(list.length)} / {bn(data.requests.length)}টি অনুরোধ</p>

      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th aria-label="বিস্তারিত" /><th>রেফ / তারিখ</th><th>নাম ও ফোন</th><th>এলাকা</th><th>সিস্টেম</th><th>আগ্রহী</th><th>ধাপ</th><th aria-label="কাজ" /></tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <Fragment key={r.id}>
                <tr className={open === r.id ? "open" : ""}>
                  <td>
                    <button className="icon-btn" type="button" aria-expanded={open === r.id} aria-label="বিস্তারিত" onClick={() => setOpen(open === r.id ? null : r.id)}>
                      {open === r.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                  </td>
                  <td><span className="ref">{r.ref}</span><br /><small>{bdDate(r.created)}</small></td>
                  <td><b>{r.name}</b><br /><a href={`tel:${r.phone}`}>{r.phone}</a></td>
                  <td>{r.district}<br /><small>{r.upazila}</small></td>
                  <td>{fmt(r.kw, 1)} kWp<br /><small>{r.category}</small></td>
                  <td>{r.interests.length ? bn(r.interests.length) : <span className="tag red">নেই</span>}</td>
                  <td>
                    <select className="mini" value={r.stage} aria-label="ধাপ পরিবর্তন"
                      onChange={(e) => act(`/api/admin/requests/${r.id}`, { method: "PATCH", body: JSON.stringify({ stage: +e.target.value }) }, `${r.ref}: ধাপ হালনাগাদ`)}>
                      {STAGES.map((s, i) => <option key={s} value={i}>{s}</option>)}
                    </select>
                  </td>
                  <td><button className="icon-btn danger" type="button" aria-label={`${r.ref} মুছুন`} onClick={() => remove(r.id, r.ref)}><Trash2 size={16} /></button></td>
                </tr>
                {open === r.id && (
                  <tr className="detail-row">
                    <td colSpan={8}>
                      <dl className="kv">
                        <dt>ঠিকানা</dt><dd>{r.address}, {r.upazila}, {r.district}{r.geo && ` · GPS ${r.geo}`}</dd>
                        <dt>বিতরণ সংস্থা</dt><dd>{r.utility} · অনুমোদিত লোড {fmt(r.load, 1)} kW · মাসিক {fmt(r.units)} ইউনিট</dd>
                        <dt>ছাদ</dt><dd>{fmt(r.roof)} বর্গফুট · {r.roofType}</dd>
                        <dt>চাহিদা</dt><dd>{r.goals.join(", ") || "—"}</dd>
                        <dt>সময়</dt><dd>{WHEN.find((w) => w.value === r.when)?.label} · উৎস {r.source}</dd>
                        <dt>আগ্রহী প্রোভাইডার</dt>
                        <dd>{r.interests.map((id) => providers.find((p) => p.id === id)?.company ?? id).join(", ") || "—"}</dd>
                        {r.notes && <><dt>নোট</dt><dd>{r.notes}</dd></>}
                      </dl>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {!list.length && <tr><td colSpan={8}><div className="empty" style={{ border: 0 }}>কোনো অনুরোধ পাওয়া যায়নি।</div></td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
