"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Fs = "sm" | "md" | "lg";
type Theme = "light" | "dark";

const BN_MONTHS = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
const BN_DAYS = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];
const bnNum = (n: number) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);

function save(key: string, v: string) {
  try { localStorage.setItem(key, v); } catch {}
}

export default function GovStrip() {
  const [fs, setFs] = useState<Fs>("md");
  const [theme, setTheme] = useState<Theme>("light");
  const [today, setToday] = useState("");

  useEffect(() => {
    const el = document.documentElement;
    setFs((el.dataset.fs as Fs) || "md");
    setTheme(el.dataset.theme === "dark" || (!el.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light");
    const d = new Date();
    setToday(`${BN_DAYS[d.getDay()]}, ${bnNum(d.getDate())} ${BN_MONTHS[d.getMonth()]} ${bnNum(d.getFullYear())}`);
  }, []);

  const changeFs = (v: Fs) => {
    setFs(v);
    document.documentElement.dataset.fs = v;
    save("rts-fs", v);
  };
  const toggleTheme = () => {
    const v: Theme = theme === "dark" ? "light" : "dark";
    setTheme(v);
    document.documentElement.dataset.theme = v;
    save("rts-theme", v);
  };

  return (
    <div className="gov-strip">
      <div className="wrap">
        <div className="left">
          <span>গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</span>
          <span className="dot" aria-hidden="true" />
          <span className="ministry">বিদ্যুৎ, জ্বালানি ও খনিজ সম্পদ মন্ত্রণালয় · বিদ্যুৎ বিভাগ</span>
          {today && <><span className="dot" aria-hidden="true" /><span suppressHydrationWarning>{today}</span></>}
        </div>
        <div className="tools" role="group" aria-label="প্রদর্শন সেটিং">
          {(["sm", "md", "lg"] as Fs[]).map((v, i) => (
            <button key={v} type="button" aria-pressed={fs === v} onClick={() => changeFs(v)} aria-label={["ছোট লেখা", "স্বাভাবিক লেখা", "বড় লেখা"][i]}>
              {["অ−", "অ", "অ+"][i]}
            </button>
          ))}
          <button type="button" onClick={toggleTheme} aria-label={theme === "dark" ? "হালকা থিম" : "গাঢ় থিম"} title={theme === "dark" ? "হালকা থিম" : "গাঢ় থিম"}>
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}
