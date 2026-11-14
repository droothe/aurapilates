import { createFileRoute } from "@tanstack/react-router";
import { AdminReadOnlyDashboard } from "@/components/admin/AdminReadOnlyDashboard";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Yönetim Paneli — Aura Pilates" },
      { name: "description", content: "Aura Pilates demo yönetim paneli." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminReadOnlyDashboard,
});
