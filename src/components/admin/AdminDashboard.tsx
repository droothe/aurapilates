import { Link } from "@tanstack/react-router";
import { CalendarDays, ExternalLink, Inbox, LogOut, Sparkles, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/site/Logo";
import { ApplicationsPanel, useApplications } from "./ApplicationsPanel";
import { TrainingsPanel, useAdminTrainings } from "./TrainingsPanel";

export function AdminDashboard({ email }: { email: string }) {
  const { data: apps = [] } = useApplications();
  const { data: trainings = [] } = useAdminTrainings();

  const stats = [
    { icon: Inbox, label: "Toplam başvuru", value: apps.length },
    { icon: Sparkles, label: "Yeni başvuru", value: apps.filter((a) => a.status === "new").length },
    { icon: UserCheck, label: "Kayıt olan", value: apps.filter((a) => a.status === "enrolled").length },
    { icon: CalendarDays, label: "Yayındaki eğitim", value: trainings.filter((t) => t.status !== "closed").length },
  ];

  return (
    <div className="min-h-screen bg-muted">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto grid h-18 max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3">
          <Link to="/" className="min-w-0"><Logo /></Link>
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden text-sm text-muted-foreground md:inline">{email}</span>
            <Button asChild variant="soft" size="sm" className="h-9">
              <Link to="/"><ExternalLink /> <span className="hidden sm:inline">Siteyi gör</span></Link>
            </Button>
            <Button variant="ink" size="sm" className="h-9" onClick={() => supabase.auth.signOut()}>
              <LogOut /> <span className="hidden sm:inline">Çıkış</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10">
        <p className="eyebrow">Yönetim Paneli</p>
        <h1 className="mt-2 text-4xl text-foreground">Hoş geldiniz</h1>
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-3xl border border-border bg-card p-5 shadow-card">
              <Icon className="h-5 w-5 text-primary" />
              <p className="mt-4 font-display text-4xl text-foreground">{value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
        <Tabs defaultValue="applications" className="mt-10">
          <TabsList className="h-auto rounded-full border border-border bg-card p-1.5">
            <TabsTrigger value="applications" className="rounded-full px-5 py-2 data-[state=active]:bg-ink data-[state=active]:text-ink-foreground">Başvurular</TabsTrigger>
            <TabsTrigger value="trainings" className="rounded-full px-5 py-2 data-[state=active]:bg-ink data-[state=active]:text-ink-foreground">Eğitim Takvimi</TabsTrigger>
          </TabsList>
          <TabsContent value="applications" className="mt-6"><ApplicationsPanel /></TabsContent>
          <TabsContent value="trainings" className="mt-6"><TrainingsPanel /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
