import Link from "next/link";
import {
  AlertTriangle, BatteryCharging, Building2, CheckCircle2, ChevronRight, Droplets, Factory, Home, Info, Snowflake, Waves,
  type LucideIcon,
} from "lucide-react";

export function PageHead({ title, desc, crumb }: { title: string; desc?: React.ReactNode; crumb: string }) {
  return (
    <div className="page-head">
      <div className="crumbs"><Link href="/">প্রথম পাতা</Link> <ChevronRight size={14} aria-hidden="true" /> <span>{crumb}</span></div>
      <h2>{title}</h2>
      {desc && <p>{desc}</p>}
    </div>
  );
}

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="stepper" aria-label="ধাপ">
      {steps.map((s, i) => (
        <li key={s} className={i < current ? "done" : i === current ? "current" : ""} aria-current={i === current ? "step" : undefined}>
          <span>{s}</span>
        </li>
      ))}
    </ol>
  );
}

export function Field({ label, hint, required, full, children }: {
  label: string; hint?: string; required?: boolean; full?: boolean; children: React.ReactNode;
}) {
  return (
    <label className={`field${full ? " full" : ""}`}>
      <span>{label}{required && <span className="reqmark" aria-hidden="true">*</span>} {hint && <span className="hint">· {hint}</span>}</span>
      {children}
    </label>
  );
}

export function Chips({ options, value, onToggle, label }: {
  options: readonly string[]; value: string[]; onToggle: (v: string) => void; label: string;
}) {
  return (
    <div className="chips" role="group" aria-label={label}>
      {options.map((o) => (
        <label className="chip-opt" key={o}>
          <input type="checkbox" checked={value.includes(o)} onChange={() => onToggle(o)} />
          <span>{o}</span>
        </label>
      ))}
    </div>
  );
}

export function Alert({ kind, children }: { kind: "ok" | "err" | "info"; children: React.ReactNode }) {
  const Icon = kind === "ok" ? CheckCircle2 : kind === "err" ? AlertTriangle : Info;
  return (
    <div className={`alert ${kind}`} role={kind === "err" ? "alert" : "status"}>
      <Icon size={18} aria-hidden="true" /> <div>{children}</div>
    </div>
  );
}

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "বাসাবাড়ি": Home,
  "বাণিজ্যিক স্থাপনা": Building2,
  "সোলার সেচ পাম্প": Droplets,
  "সোলার কোল্ড স্টোরেজ": Snowflake,
  "EV চার্জিং স্টেশন": BatteryCharging,
  "ভাসমান সোলার": Waves,
  "অন্যান্য ব্যক্তিমালিকানাধীন স্থাপনা": Factory,
};

/** Run native validation on every control inside `el`; focus the first invalid one. */
export function validateWithin(el: HTMLElement | null) {
  if (!el) return true;
  for (const c of el.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input,select,textarea")) {
    if (!c.checkValidity()) {
      c.reportValidity();
      c.focus();
      return false;
    }
  }
  return true;
}
