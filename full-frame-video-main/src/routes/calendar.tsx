import { createFileRoute } from "@tanstack/react-router";
import { AcademicCalendarDashboard } from "@/components/focusflow/AcademicCalendarDashboard";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Academic Calendar — FocusFlow" },
      { name: "description", content: "FocusFlow official student academic calendar and weekly schedule." },
    ],
  }),
  component: CalendarRouteComponent,
});

function CalendarRouteComponent() {
  return <AcademicCalendarDashboard />;
}
