"use client";
import { Download, ExternalLink, Send, Trash2 } from "lucide-react";
import { useAdmin } from "@/components/admin/AdminShell";
import { bn, bdDate, fmt } from "@/lib/format";

const MODE = {
  solset: { label: "Solset-এ আছে", tone: "green" },
  local: { label: "স্থানীয়", tone: "" },
  error: { label: "পাঠানো ব্যর্থ", tone: "red" },
} as const;

export default function AdminDesigns() {
  const { data, act } = useAdmin();
  if (!data) return null;
  const apiOn = data.integrations.solsetApi;

  return (
    <>
      <div className="toolbar">
        <span>{bn(data.designs.length)}টি সংরক্ষিত ডিজাইন</span>
        <span className={`tag ${apiOn ? "green" : "sun"}`}>Solset API: {apiOn ? "সংযুক্ত" : "কনফিগার করা নেই"}</span>
        <span className="toolbar-right">
          <a className="btn outline sm" href="/api/admin/export?type=designs"><Download size={15} /> CSV</a>
        </span>
      </div>

      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>রেফ / তারিখ</th><th>গ্রাহক</th><th>সিস্টেম</th><th>ব্যয়</th><th>প্রতি ইউনিট</th><th>Solset</th><th aria-label="কাজ" /></tr>
          </thead>
          <tbody>
            {data.designs.map((d) => {
              const m = MODE[d.solset.mode];
              return (
                <tr key={d.id}>
                  <td><span className="ref">{d.ref}</span><br /><small>{bdDate(d.created)}</small></td>
                  <td>{d.contact.name || "—"}{d.contact.phone && <><br /><a href={`tel:${d.contact.phone}`}>{d.contact.phone}</a></>}<br /><small>{d.contact.district}</small></td>
                  <td>
                    <b>{fmt(d.summary.kwp, 2)} kWp</b><br />
                    <small>{bn(d.summary.panels)}×{bn(d.summary.panelW)}W · {bn(d.summary.inverterKw)} kW{d.summary.batteryKwh ? ` · ${fmt(d.summary.batteryKwh, 1)} kWh` : ""}</small>
                  </td>
                  <td>৳ {fmt(d.summary.capex)}</td>
                  <td><span className={`tag ${d.summary.lcoe <= 8 ? "green" : "red"}`}>৳ {fmt(d.summary.lcoe, 2)}</span></td>
                  <td>
                    <span className={`tag ${m.tone}`} title={d.solset.error}>{m.label}</span>
                    {d.solset.url && <><br /><a href={d.solset.url} target="_blank" rel="noopener"><small>খুলুন <ExternalLink size={11} /></small></a></>}
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <button className="icon-btn" type="button" disabled={!apiOn} title={apiOn ? "Solset-এ (আবার) পাঠান" : "Solset API কনফিগার করা নেই"}
                      aria-label={`${d.ref} Solset-এ পাঠান`} onClick={() => act(`/api/admin/push/${d.id}`, { method: "POST" }, `${d.ref}: Solset-এ পাঠানো হয়েছে`)}>
                      <Send size={16} />
                    </button>
                    <button className="icon-btn danger" type="button" aria-label={`${d.ref} মুছুন`}
                      onClick={() => confirm(`${d.ref} মুছে ফেলবেন?`) && act(`/api/admin/designs/${d.id}`, { method: "DELETE" }, `${d.ref} মুছে ফেলা হয়েছে`)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {!data.designs.length && <tr><td colSpan={7}><div className="empty" style={{ border: 0 }}>এখনো কোনো ডিজাইন সংরক্ষিত হয়নি।</div></td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
