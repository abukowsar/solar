import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { isAdmin } from "@/lib/auth";

export const metadata = { title: "অ্যাডমিন · ছাদে সোলার", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  // Server-side guard for every admin page; the admin APIs check the session independently.
  if (!(await isAdmin())) redirect("/admin/login");
  return <AdminShell>{children}</AdminShell>;
}
