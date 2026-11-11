import { createFileRoute } from "@tanstack/react-router";
import { AdminReadOnlyDashboard } from "@/components/admin/AdminReadOnlyDashboard";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Demo Yönetim Paneli — Adres Pilates" },
      { name: "description", content: "Adres Pilates salt okunur demo yönetim paneli." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminReadOnlyDashboard,
});
