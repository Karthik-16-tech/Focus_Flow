import { createFileRoute } from "@tanstack/react-router";
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
  return <FocusFlowDashboard initialTab={0} />;
}
