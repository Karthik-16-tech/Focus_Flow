 import { createFileRoute } from "@tanstack/react-router";
import { FocusFlowDashboard } from "@/components/focusflow/FocusFlow";

export const Route = createFileRoute("/goals")({
  head: () => ({
    meta: [
      { title: "Goals — FocusFlow" },
      { name: "description", content: "Small steps. Big possibilities. FocusFlow goals." },
    ],
  }),
  component: GoalsRouteComponent,
});

function GoalsRouteComponent() {
  return <FocusFlowDashboard initialTab={4} />;
}
