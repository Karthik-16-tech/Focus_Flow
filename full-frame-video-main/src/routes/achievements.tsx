import { createFileRoute } from "@tanstack/react-router";
import { FocusFlowDashboard } from "@/components/focusflow/FocusFlow";

export const Route = createFileRoute("/achievements")({
  head: () => ({
    meta: [
      { title: "Achievements — FocusFlow" },
      { name: "description", content: "Your achievements, awards, and milestones in FocusFlow." },
    ],
  }),
  component: AchievementsRouteComponent,
});

function AchievementsRouteComponent() {
  return <FocusFlowDashboard initialTab={5} />;
}
