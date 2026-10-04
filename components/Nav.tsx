"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, FileText, Home, LayoutGrid, PencilRuler, SunMedium } from "lucide-react";

const TABS = [
  { href: "/", label: "প্রথম পাতা", short: "হোম", Icon: Home },
  { href: "/request", label: "ছাদ মালিকের আবেদন", short: "আবেদন", Icon: SunMedium },
  { href: "/design", label: "নিজে ডিজাইন করি", short: "ডিজাইন", Icon: PencilRuler },
  { href: "/provider", label: "প্রোভাইডার নিবন্ধন", short: "প্রোভাইডার", Icon: Briefcase },
  { href: "/board", label: "মিলান বোর্ড", short: "বোর্ড", Icon: LayoutGrid },
  { href: "/policy", label: "নীতিমালা ও বিজ্ঞপ্তি", short: "নীতিমালা", Icon: FileText },
];

export default function Nav() {
  const path = usePathname();
  const current = (href: string) => (path === href ? "page" : undefined);
  return (
    <>
      <nav className="main-nav" aria-label="প্রধান মেনু">
        <div className="wrap">
          {TABS.map(({ href, label, Icon }) => (
            <Link key={href} href={href} aria-current={current(href)}>
              <Icon size={17} aria-hidden="true" /> {label}
            </Link>
          ))}
        </div>
      </nav>
      <nav className="bottom-nav" aria-label="মোবাইল মেনু">
        {TABS.filter((t) => t.href !== "/policy").map(({ href, short, Icon }) => (
          <Link key={href} href={href} aria-current={current(href)}>
            <Icon size={21} aria-hidden="true" /> {short}
          </Link>
        ))}
      </nav>
    </>
  );
}
