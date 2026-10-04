import { redirect } from "next/navigation";
import BrandMark from "@/components/BrandMark";
import LoginForm from "@/components/admin/LoginForm";
import { adminConfigured, isAdmin } from "@/lib/auth";

export const metadata = { title: "অ্যাডমিন লগইন · ছাদে সোলার", robots: { index: false } };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <div className="admin-login">
      <div className="card pad-lg">
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 18 }}>
          <BrandMark />
          <div>
            <h1 style={{ margin: 0, fontSize: "1.3rem" }}>অ্যাডমিন প্যানেল</h1>
            <p style={{ margin: 0, color: "var(--muted)", fontSize: ".88rem" }}>ছাদে সোলার · সংযোগ ডেস্ক</p>
          </div>
        </div>
        <LoginForm configured={adminConfigured()} />
      </div>
    </div>
  );
}
