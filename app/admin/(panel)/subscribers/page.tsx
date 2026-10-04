"use client";
import { useMemo, useState } from "react";
import { Download, Mail, MessageSquareText, Search, Trash2 } from "lucide-react";
import { useAdmin } from "@/components/admin/AdminShell";
import { DISTRICTS } from "@/lib/data/districts";
import { bn, bdDate } from "@/lib/format";

const ROLE: Record<string, string> = { owner: "ছাদ মালিক", provider: "প্রোভাইডার", other: "অন্যান্য" };

export default function AdminSubscribers() {
  const { data, act } = useAdmin();
  const [q, setQ] = useState("");
  const [channel, setChannel] = useState("");
  const [role, setRole] = useState("");
  const [dist, setDist] = useState("");

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (data?.subscribers ?? []).filter((s) =>
      (!channel || s.channel === channel) && (!role || s.role === role) && (!dist || s.district === dist) &&
      (!needle || s.contact.includes(needle)));
  }, [data, q, channel, role, dist]);

  if (!data) return null;

  return (
    <>
      <div className="toolbar">
        <label className="search">
          <Search size={16} aria-hidden="true" />
          <input type="search" placeholder="ইমেইল বা ফোন খুঁজুন" value={q} onChange={(e) => setQ(e.target.value)} aria-label="খুঁজুন" />
        </label>
        <select value={channel} onChange={(e) => setChannel(e.target.value)} aria-label="মাধ্যম">
          <option value="">SMS ও ইমেইল</option><option value="sms">SMS</option><option value="email">ইমেইল</option>
        </select>
        <select value={role} onChange={(e) => setRole(e.target.value)} aria-label="ভূমিকা">
          <option value="">সব ভূমিকা</option>
          {Object.entries(ROLE).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={dist} onChange={(e) => setDist(e.target.value)} aria-label="জেলা">
          <option value="">সব জেলা</option>
          {DISTRICTS.map((d) => <option key={d.bn}>{d.bn}</option>)}
        </select>
        <span className="toolbar-right">
          <a className="btn outline sm" href="/api/admin/export?type=subscribers"><Download size={15} /> CSV</a>
        </span>
      </div>
      <p className="note" style={{ margin: "0 0 10px" }}>{bn(list.length)} / {bn(data.subscribers.length)} জন · বার্তা পাঠাতে CSV নামিয়ে SMS গেটওয়ে বা ইমেইল সেবায় ইমপোর্ট করুন।</p>

      <div className="table-wrap">
        <table className="admin-table">
          <thead><tr><th>মাধ্যম</th><th>যোগাযোগ</th><th>ভূমিকা</th><th>জেলা</th><th>যোগদান</th><th aria-label="কাজ" /></tr></thead>
          <tbody>
            {list.map((s) => (
              <tr key={s.id}>
                <td>{s.channel === "sms" ? <span className="tag green"><MessageSquareText size={13} /> SMS</span> : <span className="tag"><Mail size={13} /> ইমেইল</span>}</td>
                <td>{s.contact}</td>
                <td>{ROLE[s.role]}</td>
                <td>{s.district || "সব জেলা"}</td>
                <td>{bdDate(s.created)}</td>
                <td>
                  <button className="icon-btn danger" type="button" aria-label={`${s.contact} মুছুন`}
                    onClick={() => confirm(`${s.contact} তালিকা থেকে সরাবেন?`) && act(`/api/admin/subscribers/${s.id}`, { method: "DELETE" }, "সাবস্ক্রাইবার সরানো হয়েছে")}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {!list.length && <tr><td colSpan={6}><div className="empty" style={{ border: 0 }}>কোনো সাবস্ক্রাইবার নেই।</div></td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
