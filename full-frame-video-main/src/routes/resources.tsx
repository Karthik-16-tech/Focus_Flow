import { createFileRoute } from "@tanstack/react-router";
import { SpatialCreationStudio } from "@/components/focusflow/SpatialCreationStudio";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Chat & Spatial Studio — FocusFlow" },
      { name: "description", content: "FocusFlow Spatial Creation Studio and AI Chat." },
    ],
  }),
  component: ResourcesRouteComponent,
});

function ResourcesRouteComponent() {
  return <SpatialCreationStudio />;
}
