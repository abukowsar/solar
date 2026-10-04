import type { Metadata, Viewport } from "next";
import { Hind_Siliguri, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const hind = Hind_Siliguri({ subsets: ["bengali", "latin"], weight: ["400", "500", "600", "700"], variable: "--font-hind" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "ছাদে সোলার · সংযোগ ডেস্ক",
  description: "জাতীয় রুফটপ সোলার কর্মসূচি — ছাদ মালিকের সেটআপ অনুরোধ, সার্ভিস প্রোভাইডার নিবন্ধন ও Solset AI-তে লিড পাঠানো।",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#006A4E",
};

// Apply saved theme / font size before paint to avoid a flash.
const prefsScript = `try{var d=document.documentElement,t=localStorage.getItem("rts-theme"),f=localStorage.getItem("rts-fs");if(t)d.dataset.theme=t;if(f)d.dataset.fs=f}catch(e){}`;

/** Bare document shell — the public site chrome lives in app/(site)/layout.tsx, the admin chrome in app/admin. */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className={`${hind.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: prefsScript }} />
      </head>
      <body id="top">{children}</body>
    </html>
  );
}
