import { createFileRoute } from "@tanstack/react-router";
import { FocusFlowDashboard } from "@/components/focusflow/FocusFlow";

export const Route = createFileRoute("/competitions")({
  head: () => ({
    meta: [
      { title: "Competitions — FocusFlow" },
      { name: "description", content: "Student hackathons, coding challenges, and competitions." },
    ],
  }),
  component: CompetitionsRouteComponent,
});

function CompetitionsRouteComponent() {
  return <FocusFlowDashboard initialTab={7} />;
}
