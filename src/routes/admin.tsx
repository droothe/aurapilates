import { createFileRoute } from "@tanstack/react-router";
import { Loader2, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useAdminSession } from "@/hooks/use-admin-session";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Yönetim Paneli — Adres Pilates" },
      { name: "description", content: "Adres Pilates başvuru ve eğitim takvimi yönetim paneli." },
      { property: "og:title", content: "Yönetim Paneli — Adres Pilates" },
      { property: "og:description", content: "Adres Pilates başvuru ve eğitim takvimi yönetim paneli." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { loading, session, isAdmin } = useAdminSession();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!session) return <AdminLogin />;
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted px-5">
        <div className="max-w-sm rounded-3xl border border-border bg-card p-8 text-center shadow-card">
          <ShieldAlert className="mx-auto h-8 w-8 text-primary" />
          <h1 className="mt-4 text-2xl text-foreground">Yetkiniz yok</h1>
          <p className="mt-2 text-sm text-muted-foreground">{session.user.email} hesabının yönetici yetkisi bulunmuyor.</p>
          <Button variant="ink" className="mt-6" onClick={() => supabase.auth.signOut()}>Çıkış yap</Button>
        </div>
      </div>
    );
  }
  return <AdminDashboard email={session.user.email ?? ""} />;
}
