import { createFileRoute } from "@tanstack/react-router";
import { TasksDashboard } from "@/components/focusflow/TasksDashboard";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks & Study Flow — FocusFlow" },
      { name: "description", content: "Plan your day, stay focused, and track your study progress in one calm workspace." },
    ],
  }),
  component: TasksRouteComponent,
});

function TasksRouteComponent() {
  return <TasksDashboard />;
}
