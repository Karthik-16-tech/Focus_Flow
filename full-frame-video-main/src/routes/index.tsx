import { useLayoutEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import posterAsset from "@/assets/focusflow-poster.jpg.asset.json";
import videoAsset from "@/assets/focusflow-background.mp4.asset.json";
import { useVideoScrub } from "@/hooks/use-video-scrub";
import { FocusFlowShowcase } from "@/components/focusflow-showcase";
import { FocusFlowFeatures } from "@/components/focusflow-features";
import { FocusFlowFooter } from "@/components/focusflow-footer";

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

  useVideoScrub(heroRef, videoRef, {
    src: videoAsset.url,
    lerpFactor: 0.32,
    reverseDirection: true,
    autoplayOnIdle: false,
    useBlobPrebuffer: true,
  });

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

  return (
    <div className="focusflow-page">
      <main className="focusflow-hero hero" id="hero" ref={heroRef}>
      <div className="focusflow-video-stage" aria-hidden="true">
        <video
          ref={videoRef}
          className="focusflow-video hero-video"
          src={videoAsset.url}
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
                onClick={() => setActiveItem(item)}
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
          <Link to="/dashboard">
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
            <Link to="/dashboard">
              Start your flow <Arrow />
            </Link>
          </Button>
        </div>
      </section>
    </main>

    <FocusFlowShowcase />
    <FocusFlowFeatures />
    <FocusFlowFooter />
  </div>
  );
}