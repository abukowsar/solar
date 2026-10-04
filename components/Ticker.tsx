import Link from "next/link";
import { Megaphone } from "lucide-react";
import type { Notice } from "@/lib/settings";

export default function Ticker({ notices }: { notices: Notice[] }) {
  if (!notices.length) return null;
  return (
    <div className="ticker">
      <div className="wrap">
        <div className="ticker-label"><Megaphone size={16} aria-hidden="true" /> নোটিশ</div>
        <div className="ticker-track">
          <div className="ticker-items">
            {/* Rendered twice so the -50% scroll loops seamlessly; the copy is hidden from screen readers */}
            {[...notices, ...notices].map((n, i) => (
              <span key={i} aria-hidden={i >= notices.length || undefined}>
                {n.href.startsWith("http")
                  ? <a href={n.href} target="_blank" rel="noopener" tabIndex={i >= notices.length ? -1 : undefined}>{n.text}</a>
                  : <Link href={n.href} tabIndex={i >= notices.length ? -1 : undefined}>{n.text}</Link>}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
