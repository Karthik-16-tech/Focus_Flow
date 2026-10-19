import { useRef, useState } from "react";
import star from "@/assets/crystal-star.png";

const XIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M18.9 2H22l-7.6 8.7L23 22h-6.8l-5.3-6.9L4.8 22H1.7l8.1-9.3L1 2h7l4.8 6.3L18.9 2Zm-1.2 18h1.9L7.4 3.9h-2L17.7 20Z" /></svg>
);
const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M20.3 4.4A19.6 19.6 0 0 0 15.4 3l-.6 1.3a18 18 0 0 0-5.6 0L8.6 3a19.5 19.5 0 0 0-4.9 1.5C.6 9.1-.3 13.6.1 18a19.8 19.8 0 0 0 6 3l1.3-2.1a12.8 12.8 0 0 1-2-1l.5-.4a14 14 0 0 0 12.2 0l.5.4a12.8 12.8 0 0 1-2 1l1.3 2.1a19.7 19.7 0 0 0 6-3c.5-5.1-.9-9.6-3.6-13.6ZM8 15.3c-1.2 0-2.2-1.1-2.2-2.4S6.8 10.5 8 10.5s2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Zm8 0c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Z" /></svg>
);

const Ico = ({ d }: { d: string }) => (<svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d={d} /></svg>);
const GH = "M12 .5a11.5 11.5 0 0 0-3.6 22.4c.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.4 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A11.5 11.5 0 0 0 12 .5Z";
const LI = "M3 3h18v18H3V3Zm4.3 7H5v8h2.3v-8Zm-1.1-1.1a1.3 1.3 0 1 0 0-2.7 1.3 1.3 0 0 0 0 2.7ZM19 13.4c0-2.3-1.2-3.5-3-3.5-1.4 0-2 .8-2.3 1.3V10h-2.3v8h2.3v-4.3c0-1.1.4-1.8 1.4-1.8s1.3.8 1.3 1.9V18H19v-4.6Z";
const YT = "M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1c.4-1.6.5-4.8.5-4.8s0-3.2-.5-4.8ZM9.7 15V9l5.8 3-5.8 3Z";

const cols = [
  { n: "01", t: "Product", l: ["Home", "Features", "Pricing", "Docs", "Contact"] },
  { n: "02", t: "Resources", l: ["Blog", "Help Center", "Community", "Status", "Guides"] },
  { n: "03", t: "Company", l: ["About", "Careers", "Privacy", "Terms", "Security"] },
];

const socials = [
  { label: "X", el: <XIcon /> },
  { label: "GitHub", el: <Ico d={GH} /> },
  { label: "Discord", el: <DiscordIcon /> },
  { label: "LinkedIn", el: <Ico d={LI} /> },
  { label: "YouTube", el: <Ico d={YT} /> },
];

function Sparkle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <path d="M20 0 C21 14 26 19 40 20 C26 21 21 26 20 40 C19 26 14 21 0 20 C14 19 19 14 20 0Z" className="fill-electric" />
    </svg>
  );
}

function InteractiveStar() {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ x: 0, y: 0 });
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        setT({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 });
      }}
      onMouseLeave={() => setT({ x: 0, y: 0 })}
      className="pointer-events-auto absolute -right-3 -top-8 sm:-right-4 sm:-top-10 xl:-right-6 xl:-top-12 z-30 w-28 cursor-pointer select-none xl:w-32"
      style={{ perspective: 600 }}
    >
      <div className="animate-star-float overflow-visible">
        <img
          src={star}
          alt="Crystal Star"
          width={1024}
          height={1024}
          loading="lazy"
          className="w-full drop-shadow-[0_14px_22px_var(--electric)] transition-transform duration-200 ease-out select-none pointer-events-none"
          style={{ transform: `rotateX(${-t.y * 40}deg) rotateY(${t.x * 40}deg) rotate(${12 + t.x * 20}deg) scale(${t.x || t.y ? 1.08 : 1})` }}
        />
      </div>
    </div>
  );
}

export function FocusFooter() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <footer className="footer-bg relative w-full overflow-visible border-none px-6 pb-12 pt-24 font-sans text-ink lg:px-12 lg:pt-32 lg:pb-16 min-h-[660px]">
      <div className="mx-auto grid max-w-[1400px] gap-14 lg:grid-cols-[1.6fr_0.8fr_0.8fr_0.8fr_2fr] lg:gap-10">
        {/* Brand */}
        <div className="pt-2">
          <a href="/" className="flex items-center gap-4">
            <Sparkle className="h-7 w-7 drop-shadow-[0_0_8px_var(--electric)]" />
            <span className="font-display text-2xl tracking-tight">
              Focus<span className="text-electric">Flow</span>
            </span>
          </a>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-slate-ff">
            Your student life, in one flow.
          </p>
          <div className="mt-8 flex gap-3.5">
            {socials.map((s) => (
              <a key={s.label} href="#" aria-label={s.label} className="glass-btn grid h-9 w-9 place-items-center rounded-lg text-ink">
                {s.el}
              </a>
            ))}
          </div>
        </div>

        {/* Columns with animated hover progress bar */}
        {cols.map((c) => (
          <nav key={c.n} className="group pt-2">
            <span className="font-display text-xs text-slate-ff">{c.n}</span>
            <div className="relative mt-3 h-px w-28 overflow-visible bg-line">
              <span className="absolute -top-px left-0 h-[3px] w-8 rounded-full bg-electric shadow-[0_0_8px_var(--electric)] transition-all duration-700 ease-out group-hover:w-full" />
            </div>
            <h3 className="mt-6 font-display transition-colors group-hover:text-electric text-[10px] tracking-[0.3em] text-slate-ff">{c.t.toUpperCase()}</h3>
            <ul className="mt-5 space-y-4 text-sm font-medium">
              {c.l.map((l) => (
                <li key={l}>
                  <a href="#" className="transition-colors hover:text-electric">{l}</a>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        {/* Newsletter Card with Floating Crystal Star */}
        <div className="relative overflow-visible">
          <div className="relative overflow-visible">
            <InteractiveStar />
            <div className="glass-panel relative !overflow-visible rounded-[2.2rem] py-10 px-8 sm:py-11 sm:px-9 xl:py-12 xl:px-10 min-h-[260px] sm:min-h-[280px] flex flex-col justify-between">
              <div>
                <p className="flex items-center gap-2.5 font-display text-[9.5px] sm:text-[10px] tracking-[0.25em] text-slate-ff">
                  <span className="h-1.5 w-1.5 rounded-full bg-electric" /> STAY UPDATED
                </p>
                <h3 className="mt-3.5 max-w-[260px] text-[15px] sm:text-[16px] font-semibold leading-relaxed tracking-tight text-ink">
                  Updates, straight to your inbox.
                </h3>
              </div>
              <form
                onSubmit={(e) => { e.preventDefault(); if (email) setSent(true); }}
                className="mt-8 flex items-center gap-3 rounded-full border border-white/60 bg-white/80 py-1 pl-4 pr-1 shadow-[inset_0_1px_3px_var(--line)]"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-electric" strokeWidth="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={sent ? "You're on the list ✓" : "Your email address"}
                  className="min-w-0 flex-1 bg-transparent text-xs sm:text-[13px] outline-none placeholder:text-slate-ff"
                />
                <button aria-label="Subscribe" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-white shadow-[0_8px_20px_-4px_var(--electric)] transition-transform hover:scale-105">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Cyber-tech angular bottom bar */}
      <div className="relative mx-auto mt-20 h-28 max-w-[1400px] lg:mt-28">
        <svg viewBox="0 0 1800 150" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
          <path d="M60 2 H180 L210 30 H480 L530 72 H1760 L1790 100 L1740 148 H50 L2 100 V50 Z" fill="var(--glass)" stroke="var(--line)" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
          <path d="M60 2 L2 50 V100 L50 148" fill="none" stroke="var(--ink)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
          <path d="M1790 100 L1740 148" fill="none" stroke="var(--ink)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
          <path d="M80 2 H180" stroke="var(--electric)" strokeWidth="3" vectorEffect="non-scaling-stroke" />
          <path d="M1600 148 H1700" stroke="var(--electric)" strokeWidth="3" vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="relative flex h-full flex-col items-start justify-end gap-3 px-10 pb-7 sm:flex-row sm:items-end sm:justify-between lg:px-16">
          <p className="text-sm font-medium text-slate-ff">© 2026 FocusFlow</p>
          <div className="flex items-center gap-6 font-display text-[10px] tracking-[0.15em] text-slate-ff">
            <a href="#" className="hover:text-electric transition-colors">PRIVACY</a><span className="h-4 w-px bg-slate-ff/30" />
            <a href="#" className="hover:text-electric transition-colors">TERMS</a><span className="h-4 w-px bg-slate-ff/30" />
            <a href="#" className="hover:text-electric transition-colors">SECURITY</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
