"use client";
import { useEffect, useState } from "react";
import { bn } from "@/lib/format";

/** Days/hours/minutes left until `to` (ISO). Renders nothing until mounted to avoid hydration drift. */
export default function Countdown({ to }: { to: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);
  if (now === null) return <div className="countdown" aria-hidden="true"><div><b>—</b><small>দিন</small></div><div><b>—</b><small>ঘণ্টা</small></div><div><b>—</b><small>মিনিট</small></div></div>;

  const ms = Math.max(0, new Date(to).getTime() - now);
  const d = Math.floor(ms / 864e5), h = Math.floor((ms % 864e5) / 36e5), m = Math.floor((ms % 36e5) / 6e4);
  return (
    <div className="countdown" role="timer" aria-label={`সময় বাকি ${bn(d)} দিন ${bn(h)} ঘণ্টা`}>
      <div><b>{bn(d)}</b><small>দিন</small></div>
      <div><b>{bn(h)}</b><small>ঘণ্টা</small></div>
      <div><b>{bn(m)}</b><small>মিনিট</small></div>
    </div>
  );
}
