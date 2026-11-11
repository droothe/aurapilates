import { Link } from "@tanstack/react-router";
import { CalendarDays, ExternalLink, Inbox, ShieldCheck, Sparkles, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/site/Logo";

const demoStats = [
  { icon: Inbox, label: "Toplam başvuru", value: "12" },
  { icon: Sparkles, label: "Yeni başvuru", value: "4" },
  { icon: UserCheck, label: "Kayıt olan", value: "3" },
  { icon: CalendarDays, label: "Yayındaki eğitim", value: "3" },
];

const demoApplications = [
  { name: "Örnek Başvuru 01", course: "Mat Eğitmenlik", status: "Yeni" },
  { name: "Örnek Başvuru 02", course: "Reformer Eğitmenlik", status: "Görüşüldü" },
  { name: "Örnek Başvuru 03", course: "Trapeze Table", status: "Kayıt oldu" },
];

const demoTrainings = [
  { name: "Mat Eğitmenlik", date: "Örnek tarih", status: "Kayıtlar açık" },
  { name: "Reformer Eğitmenlik", date: "Örnek tarih", status: "Son kontenjanlar" },
  { name: "Trapeze Table", date: "Örnek tarih", status: "Planlanıyor" },
];

export function AdminReadOnlyDashboard() {
  return (
    <div className="min-h-screen bg-muted">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-4 px-5 py-3">
          <Link to="/" className="min-w-0"><Logo /></Link>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-medium text-primary sm:inline-flex">
              <ShieldCheck className="h-3.5 w-3.5" /> Salt okunur demo
            </span>
            <Button asChild variant="soft" size="sm" className="h-9">
              <Link to="/"><ExternalLink /> <span className="hidden sm:inline">Siteyi gör</span></Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10">
        <div className="rounded-2xl border border-primary/20 bg-primary-soft px-5 py-4 text-sm text-foreground">
          Bu demo yalnızca örnek veriler gösterir. Supabase’e bağlanmaz ve hiçbir kayıt üzerinde değişiklik yapmaz.
        </div>
        <p className="eyebrow mt-8">Demo Yönetim Paneli</p>
        <h1 className="mt-2 text-4xl text-foreground">Hoş geldiniz</h1>
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {demoStats.map(({ icon: Icon, label, value }) => (
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
          <TabsContent value="applications" className="mt-6">
            <DemoTable columns={["Başvuru", "Eğitim", "Durum"]} rows={demoApplications.map(({ name, course, status }) => [name, course, status])} />
          </TabsContent>
          <TabsContent value="trainings" className="mt-6">
            <DemoTable columns={["Eğitim", "Tarih", "Durum"]} rows={demoTrainings.map(({ name, date, status }) => [name, date, status])} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function DemoTable({ columns, rows }: { columns: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-border bg-card shadow-card">
      <table className="w-full min-w-[32rem] text-left text-sm">
        <thead className="border-b border-border bg-secondary/60 text-muted-foreground">
          <tr>{columns.map((column) => <th key={column} className="px-5 py-4 font-medium">{column}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row[0]}>
              {row.map((cell, index) => (
                <td key={`${row[0]}-${index}`} className={index === 0 ? "px-5 py-4 font-medium text-foreground" : "px-5 py-4 text-muted-foreground"}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
