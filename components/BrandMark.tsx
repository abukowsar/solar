/** Sun rising over a solar rooftop, in flag green and red. Decorative. */
export default function BrandMark({ className = "brand-mark" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="#006A4E" />
      <circle cx="32" cy="26" r="11" fill="#F42A41" />
      <g stroke="#F2A900" strokeWidth="2.5" strokeLinecap="round">
        <path d="M32 8v4M17 14l3 3M47 14l-3 3M11 27h4M49 27h4" />
      </g>
      <path d="M8 46 32 33l24 13v10H8z" fill="#fff" />
      <path d="M14 47.5 32 38l18 9.5" fill="none" stroke="#006A4E" strokeWidth="2" />
      <path d="M20 44.4v8M26 41.2v11M32 38.3v14M38 41.2v11M44 44.4v8" stroke="#006A4E" strokeWidth="1.6" />
    </svg>
  );
}
