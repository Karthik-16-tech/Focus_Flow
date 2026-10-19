import { createFileRoute } from "@tanstack/react-router";
import { GoalsDiscoveryDashboard } from "@/components/focusflow/GoalsDiscoveryDashboard";

export const Route = createFileRoute("/goals")({
  head: () => ({
    meta: [
      { title: "Goals & Challenges Discovery — FocusFlow" },
      {
        name: "description",
        content:
          "Discover upcoming hackathons, track student prototype submissions, and keep important deadlines in view.",
      },
      { property: "og:title", content: "Goals & Challenges Discovery — FocusFlow" },
      {
        property: "og:description",
        content: "Ultra-refined ice-glass challenge discovery and personal goals space.",
      },
    ],
  }),
  component: GoalsRouteComponent,
});

function GoalsRouteComponent() {
  return <GoalsDiscoveryDashboard />;
}
