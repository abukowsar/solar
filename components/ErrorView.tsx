"use client";
import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, TriangleAlert } from "lucide-react";

/** Shared body for error.tsx boundaries: friendly message, retry, and a way home. */
export default function ErrorView({ error, reset, home = "/" }: { error: Error & { digest?: string }; reset: () => void; home?: string }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="wrap page">
      <div className="card success" role="alert">
        <div className="tick" style={{ background: "var(--red-50)", color: "var(--red-text)" }}><TriangleAlert size={36} /></div>
        <h2 style={{ margin: "0 0 6px" }}>দুঃখিত, পাতাটি এখন লোড করা যাচ্ছে না</h2>
        <p style={{ color: "var(--muted)", margin: "0 auto 18px", maxWidth: 520 }}>
          সার্ভার বা ডেটাবেসে সাময়িক সমস্যা হতে পারে। কিছুক্ষণ পরে আবার চেষ্টা করুন।
          {error.digest && <><br /><small className="ref">ত্রুটি কোড: {error.digest}</small></>}
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn primary" type="button" onClick={reset}><RefreshCw size={17} /> আবার চেষ্টা করুন</button>
          <Link className="btn outline" href={home}>শুরুর পাতা</Link>
        </div>
      </div>
    </div>
  );
}
