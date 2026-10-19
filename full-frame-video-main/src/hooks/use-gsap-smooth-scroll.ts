import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

let lenisInstance: Lenis | null = null;

export function getLenis(): Lenis | null {
  return lenisInstance;
}

export interface GsapSmoothScrollOptions {
  /**
   * Animation duration in seconds for inertial wheel easing.
   * Default: 1.15
   */
  duration?: number;
  /**
   * Custom easing function.
   * Default: exponential ease-out
   */
  easing?: (t: number) => number;
  /**
   * Wheel sensitivity multiplier.
   * Default: 1.0
   */
  wheelMultiplier?: number;
  /**
   * Touch multiplier for smooth touch scrolling.
   * Default: 1.8
   */
  touchMultiplier?: number;
}

/**
 * Programmatically smooth-scroll to a position, target element, or CSS selector using Lenis + GSAP.
 */
export function gsapScrollTo(
  target: number | HTMLElement | string,
  options: { duration?: number; offset?: number; immediate?: boolean; ease?: string } = {}
) {
  if (typeof window === "undefined") return;

  const { duration = 1.15, offset = 0, immediate = false } = options;

  if (lenisInstance) {
    if (typeof target === "number") {
      lenisInstance.scrollTo(target, { offset, duration, immediate });
    } else {
      const el = typeof target === "string" ? document.querySelector(target) : target;
      if (el) {
        lenisInstance.scrollTo(el as HTMLElement, { offset, duration, immediate });
      }
    }
    return;
  }

  // Fallback if Lenis is not active (e.g. reduced motion):
  let destY = 0;
  if (typeof target === "number") {
    destY = target;
  } else {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    if (el) {
      const rect = el.getBoundingClientRect();
      destY = window.scrollY + rect.top + offset;
    }
  }
  window.scrollTo({
    top: destY,
    behavior: immediate ? "auto" : "smooth",
  });
}

/**
 * Inline Lenis + GSAP Smooth Scrolling Hook.
 * Attaches Lenis natural inertial physics synchronized directly with GSAP's ticker
 * and ScrollTrigger updates.
 */
export function useGsapSmoothScroll(options: GsapSmoothScrollOptions = {}) {
  const {
    duration = 1.15,
    easing = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    wheelMultiplier = 1.0,
    touchMultiplier = 1.8,
  } = options;

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Respect user's motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      ScrollTrigger.refresh();
      return;
    }

    // Initialize Lenis
    const lenis = new Lenis({
      duration,
      easing,
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier,
      touchMultiplier,
      autoRaf: false, // Driven strictly by GSAP ticker for 100% sync
    });

    lenisInstance = lenis;

    // 1. Synchronize Lenis scroll position with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    // 2. Drive Lenis updates directly through GSAP's ticker
    const updateTicker = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateTicker);
    // Disable lagSmoothing so Lenis doesn't jump after frame drops
    gsap.ticker.lagSmoothing(0);

    // 3. Smooth in-page anchor links click handler (#hero, #why-focusflow, etc.)
    const onAnchorClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement)?.closest("a");
      if (!link) return;
      const href = link.getAttribute("href");
      if (href && href.startsWith("#") && href.length > 1) {
        const id = href.slice(1);
        const element = document.getElementById(id);
        if (element) {
          e.preventDefault();
          lenis.scrollTo(element, { offset: 0, duration: 1.15 });
        }
      }
    };
    document.addEventListener("click", onAnchorClick);

    // 4. Refresh ScrollTrigger once fonts and layout have settled
    if (document.fonts) {
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    }

    // Refresh after short delay for dynamic hydration
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 250);

    // 5. Cleanup on unmount
    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", onAnchorClick);
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
      if (lenisInstance === lenis) {
        lenisInstance = null;
      }
    };
  }, [duration, easing, wheelMultiplier, touchMultiplier]);
}

/**
 * Provider component for Lenis + GSAP Smooth Scrolling.
 */
export function GsapSmoothScroll({
  children,
  ...options
}: GsapSmoothScrollOptions & { children?: ReactNode }) {
  useGsapSmoothScroll(options);
  return children as any;
}
