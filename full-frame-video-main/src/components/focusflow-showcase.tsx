import { useEffect, useRef } from "react";
import gsap from "gsap";
import { flowPointerDelta, wrapFlowOffset } from "@/lib/flow-motion";
import { flowFramePath } from "@/lib/flow-frame";
import bannerImg from "@/assets/drag/FocusFlow Student Life Banner.png";
import sunsetImg from "@/assets/drag/Futuristic Study at Sunset.png";
import plannerImg from "@/assets/drag/Futuristic AI Day Planner Interface.png";

const artwork = [
  { src: bannerImg, alt: "FocusFlow Student Life Banner" },
  { src: sunsetImg, alt: "Futuristic Study at Sunset" },
  { src: plannerImg, alt: "Futuristic AI Day Planner Interface" },
  { src: bannerImg, alt: "FocusFlow Student Life Banner" },
  { src: sunsetImg, alt: "Futuristic Study at Sunset" },
];
const frameCurve = flowFramePath();

export function FocusFlowShowcase() {
  const root = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const scenes = element.querySelectorAll<HTMLElement>(".flow-scene");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let target = 0;
    let current = 0;
    let velocity = 0;
    let previousX: number | undefined;
    let dragging = false;
    let frame = 0;
    let width = element.clientWidth * 3.25;
    let waveEnergy = 0;
    const paths = root.current?.querySelectorAll<SVGPathElement>(".wave-path");

    const paint = () => {
      const offset = wrapFlowOffset(current, width);
      scenes.forEach((scene, index) => gsap.set(scene, { x: offset + (index - 1) * width }));
      const path = reduced.matches ? frameCurve : flowFramePath((current / element.clientWidth) * 2.4, waveEnergy);
      paths?.forEach((item) => item.setAttribute("d", path));
    };

    const tick = () => {
      if (!dragging && Math.abs(velocity) > 0.1) {
        target += velocity;
        velocity *= 0.92;
      }
      waveEnergy += ((reduced.matches ? 0 : Math.abs(velocity)) - waveEnergy) * 0.12;
      current += (target - current) * (reduced.matches ? 1 : 0.2);
      paint();
      if (Math.abs(target - current) > 0.05 || Math.abs(velocity) > 0.1 || waveEnergy > 0.1) {
        frame = requestAnimationFrame(tick);
      } else {
        frame = 0;
      }
    };

    const start = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const down = (event: PointerEvent) => {
      if (event.button !== 0) return;
      dragging = true;
      velocity = 0;
      previousX = event.clientX;
      element.setPointerCapture(event.pointerId);
      element.classList.add("is-dragging");
    };

    const move = (event: PointerEvent) => {
      if (!dragging && (event.pointerType !== "mouse" || !finePointer.matches || reduced.matches)) return;
      if (previousX !== undefined) {
        const delta = flowPointerDelta(event.clientX - previousX, dragging);
        target += delta;
        if (!reduced.matches) waveEnergy = Math.min(30, waveEnergy + Math.abs(delta) * 0.3);
        velocity = dragging && !reduced.matches ? Math.max(-28, Math.min(28, delta * 0.6)) : 0;
        start();
      }
      previousX = event.clientX;
    };

    const up = (event: PointerEvent) => {
      dragging = false;
      previousX = undefined;
      element.classList.remove("is-dragging");
      if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId);
      start();
    };

    const leave = () => {
      if (!dragging) previousX = undefined;
    };

    const key = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      target += element.clientWidth * 0.65 * (event.key === "ArrowLeft" ? 1 : -1);
      velocity = 0;
      start();
    };

    const resize = new ResizeObserver(() => {
      width = element.clientWidth * 3.25;
      paint();
    });
    resize.observe(element);
    paint();

    element.addEventListener("pointerdown", down);
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerup", up);
    element.addEventListener("pointercancel", up);
    element.addEventListener("pointerleave", leave);
    element.addEventListener("keydown", key);

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      element.removeEventListener("pointerdown", down);
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerup", up);
      element.removeEventListener("pointercancel", up);
      element.removeEventListener("pointerleave", leave);
      element.removeEventListener("keydown", key);
    };
  }, []);

  useEffect(() => {
    const context = gsap.context(() => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
        timeline
          .from(".micro-header > *", { opacity: 0, y: 9, duration: 1, stagger: 0.12 })
          .from(".flow-viewport", { opacity: 0, duration: 1.4 }, 0.2)
          .from(".contour", { opacity: 0, duration: 1.2 }, 0.5);
      });
    }, root);
    return () => context.revert();
  }, []);

  return (
    <section className="focusflow-showcase" ref={root} id="showcase">
      <header className="micro-header">
        <div className="micro-brand">
          <span className="square-mark" />
          <span>F O C U S F L O W</span>
          <span className="registered">®</span>
        </div>
        <span className="plus-mark" aria-hidden="true" />
        <div className="micro-tagline">
          <span>A SMARTER STUDENT TOMORROW</span>
          <span className="square-mark" />
        </div>
      </header>

      <div className="flow-composition" aria-label="FocusFlow — Your student life in one flow">
        <svg className="flow-definitions" aria-hidden="true">
          <defs>
            <clipPath id="flow-frame" clipPathUnits="objectBoundingBox">
              <path className="wave-path" transform="scale(.000833333 .001666667)" d={frameCurve} />
            </clipPath>
          </defs>
        </svg>
        <div
          className="flow-viewport"
          ref={viewport}
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label="FocusFlow artwork, draggable left and right"
        >
          {[-1, 0, 1].map((position) => (
            <FlowScene key={position} duplicate={position !== 0} />
          ))}
        </div>
        <svg className="contour" viewBox="0 0 1200 600" preserveAspectRatio="none" aria-hidden="true">
          <path className="wave-path" d={frameCurve} />
        </svg>
      </div>
    </section>
  );
}

function FlowScene({ duplicate }: { duplicate: boolean }) {
  return (
    <div className="flow-scene" aria-hidden={duplicate || undefined}>
      {artwork.map((image, index) => (
        <img
          key={`${image.src}-${index}`}
          className="flow-image"
          src={image.src}
          alt={image.alt}
          width={1536}
          height={1024}
          loading={index < 2 ? "eager" : "lazy"}
          fetchPriority={!duplicate && index === 0 ? "high" : "auto"}
          draggable={false}
        />
      ))}
    </div>
  );
}
