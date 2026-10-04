"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BellRing, Briefcase, ClipboardList, ExternalLink, LayoutDashboard, LogOut, PencilRuler, RefreshCw, Settings as SettingsIcon,
} from "lucide-react";
import BrandMark from "../BrandMark";
import { api } from "@/lib/client";
import type { Settings } from "@/lib/settings";
import type { AuditEntry, Provider, SavedDesign, SetupRequest, Subscriber } from "@/lib/types";

export type AdminData = {
  requests: SetupRequest[];
  providers: Provider[];
  designs: SavedDesign[];
  subscribers: Subscriber[];
  settings: Settings;
  audit: AuditEntry[];
  integrations: { solsetApi: boolean; solsetWebhook: boolean; adminToken: boolean; adminSecret: boolean; dataFile: string };
};

type Ctx = {
  data: AdminData | null;
  reload: () => Promise<void>;
  toast: (msg: string, ok?: boolean) => void;
  /** Call an admin API, then refresh data; surfaces errors as a toast. Returns true on success. */
  act: (url: string, init: RequestInit, done: string) => Promise<boolean>;
};
const AdminCtx = createContext<Ctx | null>(null);
export const useAdmin = () => useContext(AdminCtx)!;

const NAV = [
  { href: "/admin", label: "ড্যাশবোর্ড", Icon: LayoutDashboard, key: null },
  { href: "/admin/requests", label: "সেটআপ অনুরোধ", Icon: ClipboardList, key: "requests" },
  { href: "/admin/providers", label: "প্রোভাইডার", Icon: Briefcase, key: "providers" },
  { href: "/admin/designs", label: "ডিজাইন", Icon: PencilRuler, key: "designs" },
  { href: "/admin/subscribers", label: "সাবস্ক্রাইবার", Icon: BellRing, key: "subscribers" },
  { href: "/admin/settings", label: "সেটিংস", Icon: SettingsIcon, key: null },
] as const;

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [note, setNote] = useState<{ msg: string; ok: boolean } | null>(null);

  const toast = useCallback((msg: string, ok = true) => {
    setNote({ msg, ok });
    setTimeout(() => setNote(null), 3200);
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setData(await api<AdminData>("/api/admin/data"));
      setLoadError("");
    } catch (e) {
      if ((e as Error).message.includes("লগইন")) router.replace("/admin/login");
      else {
        setLoadError((e as Error).message);
        toast((e as Error).message, false);
      }
    } finally {
      setLoading(false);
    }
  }, [router, toast]);

  useEffect(() => { reload(); }, [reload]);

  const act = useCallback(async (url: string, init: RequestInit, done: string) => {
    try {
      await api(url, init);
      toast(done);
      await reload();
      return true;
    } catch (e) {
      toast((e as Error).message, false);
      return false;
    }
  }, [reload, toast]);

  async function logout() {
    await api("/api/admin/session", { method: "DELETE" }).catch(() => {});
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <AdminCtx.Provider value={{ data, reload, toast, act }}>
      <div className="admin">
        <aside className="admin-side">
          <Link href="/admin" className="admin-brand">
            <BrandMark className="admin-mark" />
            <span><b>ছাদে সোলার</b><small>অ্যাডমিন প্যানেল</small></span>
          </Link>
          <nav aria-label="অ্যাডমিন মেনু">
            {NAV.map(({ href, label, Icon, key }) => {
              const count = key && data ? data[key].length : null;
              const current = href === "/admin" ? path === href : path.startsWith(href);
              return (
                <Link key={href} href={href} aria-current={current ? "page" : undefined}>
                  <Icon size={18} aria-hidden="true" /> <span>{label}</span>
                  {count !== null && <em>{count.toLocaleString("bn-BD")}</em>}
                </Link>
              );
            })}
          </nav>
          <div className="admin-side-foot">
            <a href="/" target="_blank" rel="noopener"><ExternalLink size={16} aria-hidden="true" /> <span className="lbl">সাইট দেখুন</span></a>
            <button type="button" onClick={logout}><LogOut size={16} aria-hidden="true" /> <span className="lbl">লগআউট</span></button>
          </div>
        </aside>

        <div className="admin-main">
          <div className="admin-top">
            <span className="admin-top-title">{NAV.find((n) => (n.href === "/admin" ? path === n.href : path.startsWith(n.href)))?.label}</span>
            <button className="btn outline sm" type="button" onClick={reload} disabled={loading}>
              <RefreshCw size={15} className={loading ? "spin" : ""} /> রিফ্রেশ
            </button>
          </div>
          <div className="admin-content">
            {data ? children : loadError ? (
              <div className="empty">
                <p style={{ margin: "0 0 12px", color: "var(--red-text)" }}>{loadError}</p>
                <button className="btn primary sm" type="button" onClick={reload} disabled={loading}>
                  <RefreshCw size={15} className={loading ? "spin" : ""} /> আবার চেষ্টা করুন
                </button>
              </div>
            ) : <div className="empty">লোড হচ্ছে…</div>}
          </div>
        </div>
      </div>
      {note && <div className={`admin-toast ${note.ok ? "ok" : "err"}`} role="status">{note.msg}</div>}
    </AdminCtx.Provider>
  );
}
