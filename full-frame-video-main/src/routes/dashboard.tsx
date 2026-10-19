import { useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import gsap from "gsap";
import { FocusFlowDashboard } from "@/components/focusflow/FocusFlow";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "FocusFlow — Workspace Dashboard" },
      {
        name: "description",
        content: "Good morning, Karthik. Plan your day with FocusFlow.",
      },
      { property: "og:title", content: "FocusFlow — Workspace Dashboard" },
      {
        property: "og:description",
        content: "Same dreams. Better plans. Your interactive 3D student workspace.",
      },
    ],
  }),
  component: DashboardRouteComponent,
});

function DashboardRouteComponent() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || typeof window === "undefined") return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 14, filter: "blur(6px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.45,
        ease: "power3.out",
      }
    );
  }, []);

  return (
    <div ref={containerRef} className="focusflow-dashboard-entrance w-full min-h-screen">
      <FocusFlowDashboard initialTab={0} />
    </div>
  );
}
