import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ChevronDown,
  BookOpen,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  SquareCheck,
  Star,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FEATURE_COUNT, featureFromKey, featureFromProgress } from "@/lib/feature-progress";

const features = [
  {
    title: "SMART PLANNING",
    icon: CalendarDays,
    detail: "Map the week ahead and turn every deadline into a realistic daily plan.",
  },
  {
    title: "PROGRESS TRACKING",
    icon: ChartNoAxesColumnIncreasing,
    detail: "Watch streaks, hours, and momentum build across every subject you study.",
  },
  {
    title: "TASK MANAGEMENT",
    icon: SquareCheck,
    detail: "Break big assignments into small steps and check them off as you go.",
  },
  {
    title: "STUDY RESOURCES",
    icon: BookOpen,
    detail: "Keep notes, PDFs, and saved links together in one searchable place.",
  },
  {
    title: "FOCUSED COMMUNITY",
    icon: UsersRound,
    detail: "Study alongside peers in quiet rooms and share what actually works.",
  },
  {
    title: "PERSONAL GROWTH",
    icon: Star,
    detail: "Reflect each week, set an intention, and see how far you have come.",
  },
];

const formatIndex = (index: number) => String(index + 1).padStart(2, "0");
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function FocusFlowFeatures() {
  const [active, setActive] = useState(0);
  const [metrics, setMetrics] = useState({ row: 62, detail: 68 });
  const sequence = useRef<HTMLElement>(null);
  const sticky = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const manuallySelectedAt = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();

  useIsoLayoutEffect(() => {
    const node = list.current;
    if (!node) return;
    const read = () => {
      const style = getComputedStyle(node);
      const row = parseFloat(style.getPropertyValue("--row-height")) || 62;
      const detail = parseFloat(style.getPropertyValue("--detail-height")) || 68;
      setMetrics((cur) => (cur.row === row && cur.detail === detail ? cur : { row, detail }));
    };
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const section = sequence.current;
      const inner = sticky.current;
      if (!section || !inner) return;
      const pinned = window.matchMedia("(min-width: 768px) and (min-height: 651px)").matches;
      if (pinned) {
        const range = section.offsetHeight - inner.offsetHeight;
        if (range > 0) setActive(featureFromProgress(-section.getBoundingClientRect().top / range));
      } else {
        if (manuallySelectedAt.current !== null) {
          if (Math.abs(window.scrollY - manuallySelectedAt.current) < 2) return;
          manuallySelectedAt.current = null;
        }
        const center = window.innerHeight * 0.56;
        let closest = 0;
        let distance = Infinity;
        rowRefs.current.forEach((row, index) => {
          if (!row) return;
          const rect = row.getBoundingClientRect();
          const currentDistance = Math.abs(rect.top + rect.height / 2 - center);
          if (currentDistance < distance) {
            distance = currentDistance;
            closest = index;
          }
        });
        setActive(closest);
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const activate = (index: number) => {
    setActive(index);
    manuallySelectedAt.current = window.scrollY;
    const section = sequence.current;
    const inner = sticky.current;
    if (!section || !inner) return;
    if (window.matchMedia("(min-width: 768px) and (min-height: 651px)").matches) {
      const top = section.getBoundingClientRect().top + window.scrollY;
      const range = section.offsetHeight - inner.offsetHeight;
      window.scrollTo({ top: top + (range * index) / (FEATURE_COUNT - 1), behavior: "instant" });
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = featureFromKey(event.key, index);
    activate(next);
    rowRefs.current[next]?.focus({ preventScroll: true });
  };

  const transition = { duration: reduceMotion ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <section className="features-sequence" ref={sequence} id="features" aria-label="FocusFlow features">
      <div className="features-sticky" ref={sticky}>
        <div className="features-composition">
          <div className="features-editorial">
            <div className="section-label">FEATURES</div>
            <h2 className="features-headline">
              <span className="headline-line">YOUR</span>
              <span className="headline-line">STUDENT LIFE.</span>
              <span className="headline-line">IN ONE</span>
              <span className="headline-line headline-flow">FLOW.</span>
            </h2>
            <div className="feature-progress" aria-label={`Feature ${active + 1} of 6`}>
              <div className="progress-ticks" aria-hidden="true">
                {features.map((feature, index) => (
                  <span className="progress-tick" key={feature.title} data-active={index === active} />
                ))}
              </div>
            </div>
          </div>

          <div className="feature-panel">
            <div className="feature-list" role="group" aria-label="Select a feature" ref={list}>
              <motion.div
                className="feature-glass"
                aria-hidden="true"
                initial={false}
                animate={{ y: active * metrics.row, height: metrics.row + metrics.detail }}
                transition={transition}
              />
              {features.map(({ title, icon: Icon, detail }, index) => {
                const isOpen = active === index;
                return (
                  <div className="feature-item" key={title} data-active={isOpen}>
                    <Button
                      variant="feature"
                      size="feature"
                      ref={(node) => {
                        rowRefs.current[index] = node;
                      }}
                      data-active={isOpen}
                      aria-pressed={isOpen}
                      aria-expanded={isOpen}
                      aria-controls={`feature-detail-${index}`}
                      onClick={() => activate(index)}
                      onKeyDown={(event) => onKeyDown(event, index)}
                    >
                      <span className="feature-icon">
                        <Icon strokeWidth={1.65} aria-hidden="true" />
                      </span>
                      <span className="feature-title">{title}</span>
                      <span className="feature-arrow" aria-hidden="true">
                        <ChevronDown strokeWidth={1.6} />
                      </span>
                    </Button>
                    <motion.div
                      className="feature-item-detail"
                      id={`feature-detail-${index}`}
                      aria-hidden={!isOpen}
                      aria-live={isOpen ? "polite" : undefined}
                      initial={false}
                      animate={{ height: isOpen ? metrics.detail : 0, opacity: isOpen ? 1 : 0 }}
                      transition={transition}
                    >
                      <div className="detail-inner">
                        <p className="detail-copy">{detail}</p>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
