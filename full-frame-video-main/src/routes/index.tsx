import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { Button } from "@/components/ui/button";
import posterAsset from "@/assets/focusflow-poster.jpg.asset.json";
import videoAsset from "@/assets/focusflow-background.mp4.asset.json";
import { FocusFlowSplineShowcase } from "@/components/focusflow-spline-showcase";
import { FocusFlowShowcase } from "@/components/focusflow-showcase";
import { FocusFlowFeatures } from "@/components/focusflow-features";
import { FocusFooter } from "@/components/FocusFooter";
import { ScrollTextReveal } from "@/components/scroll-text-reveal";
import { gsapScrollTo } from "@/hooks/use-gsap-smooth-scroll";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
}

const navigationItems = ["Home", "About", "Shop", "For students", "Opportunities"];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Your Student Life, In One Flow | FocusFlow" },
      {
        name: "description",
        content:
          "Bring your studies, plans, and student opportunities together with FocusFlow.",
      },
      { property: "og:title", content: "Your Student Life, In One Flow | FocusFlow" },
      {
        property: "og:description",
        content: "Bring your studies, plans, and student opportunities together with FocusFlow.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FocusFlowHome,
});

function Sparkle() {
  return (
    <svg className="focusflow-brand__sparkle" viewBox="0 0 36 40" aria-hidden="true">
      <path d="M18 0c3.8 10.2 6.7 13.2 18 19-11.3 5.8-14.2 8.8-18 21C14.2 27.8 11.3 24.8 0 19 11.3 13.2 14.2 10.2 18 0Z" />
    </svg>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4.75 12h14.5m-6.25-6.25L19.25 12 13 18.25" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <span className="focusflow-play" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="m9 6.75 9 5.25-9 5.25V6.75Z" />
      </svg>
    </span>
  );
}

function FocusFlowHome() {
  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [activeItem, setActiveItem] = useState("Home");
  const navigate = useNavigate();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleNavigateToDashboard = (e?: React.MouseEvent) => {
    if (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) {
        return;
      }
      e.preventDefault();
    }

    if (isTransitioning) return;
    setIsTransitioning(true);

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      navigate({ to: "/dashboard" });
      return;
    }

    const pageEl = document.querySelector(".focusflow-page");
    if (pageEl) {
      gsap.to(pageEl, {
        opacity: 0,
        y: -16,
        scale: 0.985,
        filter: "blur(8px)",
        duration: 0.38,
        ease: "power2.inOut",
        onComplete: () => {
          navigate({ to: "/dashboard" });
        },
      });
      // Safety timeout in case gsap onComplete is interrupted
      setTimeout(() => {
        navigate({ to: "/dashboard" });
      }, 420);
    } else {
      navigate({ to: "/dashboard" });
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    const playVideo = () => {
      video.play().catch(() => {});
    };

    playVideo();

    const onInteract = () => {
      playVideo();
      window.removeEventListener("pointerdown", onInteract);
      window.removeEventListener("touchstart", onInteract);
      window.removeEventListener("scroll", onInteract);
    };

    window.addEventListener("pointerdown", onInteract, { once: true });
    window.addEventListener("touchstart", onInteract, { once: true });
    window.addEventListener("scroll", onInteract, { once: true });

    return () => {
      window.removeEventListener("pointerdown", onInteract);
      window.removeEventListener("touchstart", onInteract);
      window.removeEventListener("scroll", onInteract);
    };
  }, []);

  useLayoutEffect(() => {
    const tabs = tabsRef.current;
    const indicator = indicatorRef.current;
    const activeTab = tabRefs.current[activeItem];
    if (!tabs || !indicator || !activeTab) return;

    const moveIndicator = () => {
      const tabsRect = tabs.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();
      indicator.style.width = `${tabRect.width}px`;
      indicator.style.transform = `translateX(${tabRect.left - tabsRect.left}px)`;
    };

    moveIndicator();
    const observer = new ResizeObserver(moveIndicator);
    observer.observe(tabs);
    observer.observe(activeTab);
    window.addEventListener("resize", moveIndicator);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", moveIndicator);
    };
  }, [activeItem]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      // 0. Initial Hero Title Entrance - subtle staggered fade-up & blur-to-sharp
      if (!prefersReducedMotion) {
        gsap.fromTo(
          ".focusflow-title > span",
          { opacity: 0, y: 32, filter: "blur(8px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1.1,
            stagger: 0.15,
            ease: "power3.out",
          }
        );

        gsap.fromTo(
          ".focusflow-actions",
          { opacity: 0, y: 24, filter: "blur(6px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.9,
            delay: 0.35,
            ease: "power2.out",
          }
        );
      }

      // 1. Hero text gracefully ascends and fades out as user scrolls toward second page
      gsap.to(".focusflow-copy", {
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom 45%",
          scrub: 0.8,
        },
        y: -90,
        opacity: 0,
        filter: prefersReducedMotion ? "none" : "blur(6px)",
        ease: "power2.out",
      });

      // 2. Video maintains seamless 3D depth and parallax smoothly synced with scroll
      if (videoRef.current) {
        gsap.to(videoRef.current, {
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
          scale: 1.05,
          y: 45,
          ease: "none",
        });
      }

      // 3. "Why FocusFlow" Spline Showcase: Feature cards & center stage entrance
      if (!prefersReducedMotion) {

        // Feature cards staggered entrance
        gsap.fromTo(
          "#why-focusflow .spline-feature-item",
          { opacity: 0, y: 32, filter: "blur(4px)" },
          {
            scrollTrigger: {
              trigger: "#why-focusflow .feature-layout",
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.8,
            stagger: 0.08,
            ease: "power2.out",
          }
        );

        // Center stage subtle parallax float
        gsap.fromTo(
          "#why-focusflow .center-stage",
          { y: 30, scale: 0.95 },
          {
            scrollTrigger: {
              trigger: "#why-focusflow",
              start: "top 80%",
              end: "bottom 30%",
              scrub: 1.2,
            },
            y: -15,
            scale: 1,
            ease: "power1.out",
          }
        );
      }

      // 4. "Why FocusFlow" Feature layout smooth entrance
      gsap.fromTo(
        "#why-focusflow .feature-layout",
        { y: 45, opacity: 0.9, scale: 0.98 },
        {
          scrollTrigger: {
            trigger: "#why-focusflow",
            start: "top 85%",
            end: "top 40%",
            scrub: 1,
          },
          y: 0,
          opacity: 1,
          scale: 1,
          ease: "power2.out",
        }
      );

      // 5. Flowing Waves Showcase: Header reveal with blur-to-sharp
      if (!prefersReducedMotion) {
        gsap.fromTo(
          "#showcase .flow-headline > *",
          { opacity: 0, y: 26, filter: "blur(6px)" },
          {
            scrollTrigger: {
              trigger: "#showcase",
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.85,
            stagger: 0.1,
            ease: "power2.out",
          }
        );
      }

      // 6. Flowing Waves Showcase entrance
      gsap.fromTo(
        "#showcase .flow-composition",
        { y: 55, opacity: 0.88, scale: 0.97 },
        {
          scrollTrigger: {
            trigger: "#showcase",
            start: "top 85%",
            end: "top 35%",
            scrub: 1,
          },
          y: 0,
          opacity: 1,
          scale: 1,
          ease: "power2.out",
        }
      );

      // 7. Features Section smooth entrance
      gsap.fromTo(
        "#features",
        { opacity: 0.92, y: 35 },
        {
          scrollTrigger: {
            trigger: "#features",
            start: "top 88%",
            end: "top 45%",
            scrub: 1,
          },
          opacity: 1,
          y: 0,
          ease: "power2.out",
        }
      );

      // 8. Footer subtle reveal
      gsap.fromTo(
        ".footer-bg",
        { opacity: 0.88, y: 30 },
        {
          scrollTrigger: {
            trigger: ".footer-bg",
            start: "top 92%",
            end: "top 55%",
            scrub: 1,
          },
          opacity: 1,
          y: 0,
          ease: "power2.out",
        }
      );
    });

    return () => ctx.revert();
  }, []);

  const handleNavClick = (item: string) => {
    setActiveItem(item);
    if (typeof window === "undefined") return;

    if (item === "Home") {
      gsapScrollTo(0, { duration: 1 });
    } else if (item === "About") {
      const el = document.getElementById("about") || document.getElementById("why-focusflow");
      if (el) gsapScrollTo(el, { duration: 1.1 });
    } else if (item === "Shop") {
      const el = document.getElementById("showcase") || document.getElementById("why-focusflow");
      if (el) gsapScrollTo(el, { duration: 1.1 });
    } else if (item === "For students" || item === "Opportunities") {
      const el = document.getElementById("features") || document.getElementById("why-focusflow");
      if (el) gsapScrollTo(el, { duration: 1.1 });
    }
  };

  return (
    <div className="focusflow-page">
      <main className="focusflow-hero hero" id="hero" ref={heroRef}>
        <div className="focusflow-video-stage" aria-hidden="true">
          <video
            ref={videoRef}
            className="focusflow-video hero-video"
            src={videoAsset.url}
            poster={posterAsset.url}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            tabIndex={-1}
            aria-hidden="true"
          >
            <source src={videoAsset.url} type="video/mp4" />
          </video>
        </div>

        <header className="focusflow-header">
          <a className="focusflow-brand" href="#hero" aria-label="FocusFlow home">
            <span>FocusFlow</span>
            <Sparkle />
          </a>

          <nav className="focusflow-nav" aria-label="Main navigation">
            <div className="focusflow-nav__tabs" ref={tabsRef}>
              <span className="focusflow-nav__indicator" ref={indicatorRef} aria-hidden="true" />
              {navigationItems.map((item) => (
                <Button
                  key={item}
                  ref={(node) => {
                    tabRefs.current[item] = node;
                  }}
                  type="button"
                  variant="ghost"
                  className={`focusflow-nav__tab${activeItem === item ? " is-active" : ""}`}
                  aria-pressed={activeItem === item}
                  onClick={() => handleNavClick(item)}
                >
                  {item}
                </Button>
              ))}
            </div>
          </nav>

          <Button
            asChild
            className="focusflow-button focusflow-header__cta"
          >
            <Link
              to="/dashboard"
              onClick={handleNavigateToDashboard}
              aria-label="Enter FocusFlow dashboard"
            >
              Enter FocusFlow <Arrow />
            </Link>
          </Button>
        </header>

        <section className="focusflow-copy" aria-labelledby="focusflow-title">
          <h1 className="focusflow-title" id="focusflow-title">
            <span>YOUR STUDENT LIFE.</span>
            <span>
              IN ONE <span className="focusflow-title__flow">FLOW.</span>
            </span>
          </h1>
          <div className="focusflow-actions">
            <Button
              asChild
              className="focusflow-button focusflow-actions__primary"
            >
              <Link
                to="/dashboard"
                onClick={handleNavigateToDashboard}
                aria-label="Start your flow and enter dashboard"
              >
                <span>Start your flow</span>
                <Arrow />
              </Link>
            </Button>
          </div>
        </section>

        {/* Seamless feathered blend at bottom of hero so it fades smoothly into the second page */}
        <div className="hero-bottom-blend" aria-hidden="true" />
      </main>

      <ScrollTextReveal id="about" />

      <FocusFlowSplineShowcase />
      <FocusFlowShowcase />
      <FocusFlowFeatures />
      <FocusFooter />
    </div>
  );
}