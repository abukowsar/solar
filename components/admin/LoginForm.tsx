"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { api } from "@/lib/client";
import { Alert, Field } from "../ui";

export default function LoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!configured) {
    return (
      <Alert kind="info">
        অ্যাডমিন পাসওয়ার্ড এখনো সেট করা হয়নি। প্রকল্পের <code>.env.local</code> ফাইলে <code>ADMIN_PASSWORD=...</code> যোগ করে সার্ভার আবার চালু করুন।
      </Alert>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/api/admin/session", { method: "POST", body: JSON.stringify({ password: pw }) });
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 14 }}>
      <Field label="পাসওয়ার্ড">
        <input type="password" required autoFocus autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} />
      </Field>
      {error && <Alert kind="err">{error}</Alert>}
      <button className="btn primary block" type="submit" disabled={busy || !pw}><LogIn size={18} /> {busy ? "যাচাই হচ্ছে…" : "লগইন"}</button>
    </form>
  );
}
