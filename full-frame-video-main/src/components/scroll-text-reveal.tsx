import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollTextRevealProps {
  eyebrow?: string;
  lines?: string[];
  className?: string;
  id?: string;
}

// Exactly four lines requested for the FocusFlow journey
const DEFAULT_LINES = [
  "Smarter tools for a brighter",
  "student journey.",
  "Everything you need to learn, grow and create your future —",
  "all in one place.",
];

export function ScrollTextReveal({
  eyebrow = "WHY FOCUSFLOW",
  lines = DEFAULT_LINES,
  className = "",
  id = "about",
}: ScrollTextRevealProps) {
  const containerRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);

  const fullText = lines.join(" ");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const container = containerRef.current;
    const textEl = textRef.current;
    if (!container || !textEl) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      const chars = textEl.querySelectorAll<HTMLElement>(".reveal-char");
      chars.forEach((c) => {
        c.style.color = "#000000";
        c.style.opacity = "1";
      });
      return;
    }

    const ctx = gsap.context(() => {
      const chars = textEl.querySelectorAll<HTMLElement>(".reveal-char");
      if (!chars.length) return;

      // 1. Initial state: light muted gray (#C9C9C9) with soft opacity
      gsap.set(chars, { color: "#C9C9C9", opacity: 0.65 });

      // 2. Eyebrow subtle entrance
      if (eyebrowRef.current) {
        gsap.fromTo(
          eyebrowRef.current,
          { opacity: 0, y: 16 },
          {
            scrollTrigger: {
              trigger: container,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
          }
        );
      }

      // 3. Ultra-smooth scroll-driven character reveal with center pin
      const charTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "center center",
          end: "+=135%",
          pin: true,
          scrub: 1.2,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      charTimeline.to(chars, {
        color: "#000000",
        opacity: 1,
        duration: 1,
        stagger: {
          each: 0.02,
          ease: "linear",
        },
        ease: "power1.inOut",
      });
    }, container);

    // Refresh after fonts settle
    if (document.fonts) {
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    }

    return () => ctx.revert();
  }, [lines]);

  return (
    <section
      ref={containerRef}
      id={id}
      className={`scroll-text-reveal-section relative w-full bg-white text-black py-20 sm:py-24 md:py-32 px-6 sm:px-10 md:px-14 lg:px-20 overflow-hidden flex flex-col justify-center min-h-screen ${className}`}
      aria-label={`${eyebrow}: ${fullText}`}
    >
      <div className="max-w-[1360px] mx-auto w-full">
        {eyebrow && (
          <p
            ref={eyebrowRef}
            className="text-[12px] sm:text-[13px] font-semibold tracking-[0.28em] text-[#868e96] uppercase mb-6 sm:mb-8 md:mb-10 font-sans select-none"
          >
            {eyebrow}
          </p>
        )}

        <h2
          ref={textRef}
          aria-hidden="true"
          className="scroll-text-reveal-headline font-bold text-[#C9C9C9] tracking-[-0.025em] text-[15px] sm:text-[21px] md:text-[27px] lg:text-[33px] xl:text-[37px] leading-[1.3] sm:leading-[1.26] md:leading-[1.22]"
          style={{
            fontFamily: "'Michroma', sans-serif",
            fontWeight: 700,
          }}
        >
          {lines.map((lineText, lineIndex) => {
            const lineWords = lineText.split(" ");
            return (
              <span
                key={`line-${lineIndex}`}
                className="block mb-2 sm:mb-2.5 md:mb-3 last:mb-0"
              >
                {lineWords.map((word, wordIndex) => (
                  <span
                    key={`${word}-${wordIndex}`}
                    className="inline-block whitespace-nowrap mr-[0.26em] last:mr-0"
                  >
                    {Array.from(word).map((char, charIndex) => (
                      <span
                        key={`${char}-${charIndex}`}
                        className="reveal-char inline-block transition-none will-change-[color,opacity]"
                      >
                        {char}
                      </span>
                    ))}
                  </span>
                ))}
              </span>
            );
          })}
        </h2>

        {/* Screen reader text */}
        <span className="sr-only">{fullText}</span>
      </div>
    </section>
  );
}
