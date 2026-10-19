import { useEffect, useRef, useState } from "react";
import {
  BriefcaseBusiness,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  Crosshair,
  Rocket,
  Sparkles,
} from "lucide-react";

const splineScene = "https://prod.spline.design/e7jMjsSO4d-c2Osc/scene.splinecode";
const splineViewerScript =
  "https://cdn.spline.design/@splinetool/viewer@2.0.93/build/spline-viewer.js";

const features = [
  {
    title: "AI Learning",
    description: "Understand difficult topics",
    Icon: Sparkles,
    side: "left",
  },
  {
    title: "Smart Planning",
    description: "Classes, tasks and deadlines",
    Icon: CalendarDays,
    side: "left",
  },
  {
    title: "Focus Mode",
    description: "Build distraction-free sessions",
    Icon: Crosshair,
    side: "left",
  },
  {
    title: "Portfolio",
    description: "Showcase your projects",
    Icon: BriefcaseBusiness,
    side: "right",
  },
  {
    title: "Opportunities",
    description: "Discover hackathons and internships",
    Icon: Rocket,
    side: "right",
  },
  {
    title: "Progress",
    description: "Track milestones and growth",
    Icon: ChartNoAxesColumnIncreasing,
    side: "right",
  },
] as const;

export function FocusFlowSplineShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const checkVisibility = () => {
      const rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.95) {
        section.classList.add("is-visible");
      }
    };
    checkVisibility();

    const revealObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        section.classList.add("is-visible");
        revealObserver.disconnect();
      },
      { threshold: 0.05 }
    );
    revealObserver.observe(section);

    const stage = stageRef.current;
    let sceneObserver: IntersectionObserver | undefined;

    if (stage) {
      sceneObserver = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting) return;
          sceneObserver?.disconnect();

          if (!customElements.get("spline-viewer")) {
            const existingScript = document.querySelector<HTMLScriptElement>(
              `script[src="${splineViewerScript}"]`
            );
            if (!existingScript) {
              const script = document.createElement("script");
              script.type = "module";
              script.src = splineViewerScript;
              script.async = true;
              document.head.append(script);
            }
          }

          if (!stage.querySelector("spline-viewer")) {
            const viewer = document.createElement("spline-viewer");
            viewer.setAttribute("url", splineScene);
            viewer.setAttribute("loading", "lazy");
            viewer.setAttribute("aria-label", "Interactive 3D FocusFlow scene");

            // Strip/hide the "Built with Spline" watermark badge using MutationObserver & shadowRoot injection
            const cleanShadow = () => {
              try {
                if (viewer.shadowRoot) {
                  const logo = viewer.shadowRoot.querySelector("#logo") || viewer.shadowRoot.querySelector('a[href*="spline"]');
                  if (logo) logo.remove();

                  if (!viewer.shadowRoot.querySelector("#no-spline-watermark")) {
                    const style = document.createElement("style");
                    style.id = "no-spline-watermark";
                    style.textContent = `
                      #logo, a, [id*="logo"], [class*="watermark"], [class*="logo"] {
                        display: none !important;
                        opacity: 0 !important;
                        visibility: hidden !important;
                        pointer-events: none !important;
                        width: 0 !important;
                        height: 0 !important;
                        position: absolute !important;
                        left: -9999px !important;
                      }
                      canvas {
                        outline: none !important;
                      }
                    `;
                    viewer.shadowRoot.appendChild(style);
                  }
                }
              } catch (_) {}
            };

            const shadowObserver = new MutationObserver(() => cleanShadow());
            const checkShadow = setInterval(() => {
              if (viewer.shadowRoot) {
                cleanShadow();
                shadowObserver.observe(viewer.shadowRoot, { childList: true, subtree: true });
                clearInterval(checkShadow);
              }
            }, 30);
            setTimeout(() => clearInterval(checkShadow), 8000);

            stage.append(viewer);
          }
        },
        { rootMargin: "160px", threshold: 0.01 }
      );
      sceneObserver.observe(stage);
    }

    return () => {
      revealObserver.disconnect();
      sceneObserver?.disconnect();
    };
  }, []);

  return (
    <section className="focusflow-section pt-8 md:pt-14" ref={sectionRef} id="why-focusflow" aria-label="Why FocusFlow">

      <div className="feature-layout" aria-label="FocusFlow features">
        <svg
          className={`feature-connectors${activeFeature ? " has-active" : ""}`}
          viewBox="0 0 1000 500"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path pathLength={1} className={`connector-path${activeFeature === "AI Learning" ? " is-active" : ""}`} d="M 370 75 C 415 75, 455 180, 500 250" />
          <path pathLength={1} className={`connector-path${activeFeature === "Smart Planning" ? " is-active" : ""}`} d="M 370 250 C 415 250, 460 250, 500 250" />
          <path pathLength={1} className={`connector-path${activeFeature === "Focus Mode" ? " is-active" : ""}`} d="M 370 425 C 415 425, 455 320, 500 250" />
          <path pathLength={1} className={`connector-path${activeFeature === "Portfolio" ? " is-active" : ""}`} d="M 630 75 C 585 75, 545 180, 500 250" />
          <path pathLength={1} className={`connector-path${activeFeature === "Opportunities" ? " is-active" : ""}`} d="M 630 250 C 585 250, 540 250, 500 250" />
          <path pathLength={1} className={`connector-path${activeFeature === "Progress" ? " is-active" : ""}`} d="M 630 425 C 585 425, 545 320, 500 250" />
          <circle className="connector-endpoint" cx="370" cy="75" r="3.5" />
          <circle className="connector-endpoint" cx="370" cy="250" r="3.5" />
          <circle className="connector-endpoint" cx="370" cy="425" r="3.5" />
          <circle className="connector-endpoint" cx="630" cy="75" r="3.5" />
          <circle className="connector-endpoint" cx="630" cy="250" r="3.5" />
          <circle className="connector-endpoint" cx="630" cy="425" r="3.5" />
        </svg>

        <div className="center-stage" ref={stageRef} data-active={activeFeature !== null}>
          <div className="stage-ring stage-ring-outer" />
          <div className="stage-ring stage-ring-middle" />
          <div className="stage-ring stage-ring-inner" />
          <div className="stage-core" />
          <div className="stage-glow" />
        </div>

        {features.map(({ title, description, Icon, side }, index) => (
          <article
            key={title}
            className={`spline-feature-item spline-feature-item-${side}`}
            style={{
              "--reveal-delay": `${300 + index * 115}ms`,
              "--feature-row": (index % 3) + 1,
            } as React.CSSProperties}
            tabIndex={0}
            aria-label={`${title}: ${description}`}
            onPointerEnter={() => setActiveFeature(title)}
            onPointerLeave={() => setActiveFeature(null)}
            onFocus={() => setActiveFeature(title)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setActiveFeature(null);
              }
            }}
          >
            {side === "left" ? (
              <>
                <div className="feature-copy">
                  <h2>{title}</h2>
                  <p>{description}</p>
                </div>
                <div className="icon-tile" aria-hidden="true">
                  <Icon size={31} strokeWidth={1.7} />
                </div>
              </>
            ) : (
              <>
                <div className="icon-tile" aria-hidden="true">
                  <Icon size={31} strokeWidth={1.7} />
                </div>
                <div className="feature-copy">
                  <h2>{title}</h2>
                  <p>{description}</p>
                </div>
              </>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
