import { createFileRoute } from "@tanstack/react-router";
import { FocusFlowDashboard } from "@/components/focusflow/FocusFlow";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — FocusFlow" },
      { name: "description", content: "Your FocusFlow student profile and settings." },
    ],
  }),
  component: ProfileRouteComponent,
});

function ProfileRouteComponent() {
  return <FocusFlowDashboard initialTab={6} />;
}
