import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Phone, Search, Trash2, Inbox } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export type Application = Database["public"]["Tables"]["applications"]["Row"];
type AppStatus = Database["public"]["Enums"]["application_status"];

export const applicationStatusMeta: Record<AppStatus, { label: string; className: string }> = {
  new: { label: "Yeni", className: "bg-primary-soft text-primary" },
  contacted: { label: "İletişime geçildi", className: "bg-amber-soft text-amber" },
  enrolled: { label: "Kayıt oldu", className: "bg-sage-soft text-sage" },
  cancelled: { label: "İptal", className: "bg-muted text-muted-foreground" },
};

export const applicationsQueryKey = ["admin", "applications"];

export function useApplications() {
  return useQuery({
    queryKey: applicationsQueryKey,
    queryFn: async () => {
      const { data, error } = await supabase.from("applications").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

const dateFmt = new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function ApplicationsPanel() {
  const qc = useQueryClient();
  const { data = [], isLoading, error } = useApplications();
  const [filter, setFilter] = useState<"all" | AppStatus>("all");
  const [q, setQ] = useState("");

  const update = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AppStatus }) => {
      const { error } = await supabase.from("applications").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: applicationsQueryKey });
      toast.success("Durum güncellendi");
    },
    onError: () => toast.error("Güncellenemedi"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("applications").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: applicationsQueryKey });
      toast.success("Başvuru silindi");
    },
    onError: () => toast.error("Silinemedi"),
  });

  const rows = useMemo(() => {
    const term = q.trim().toLocaleLowerCase("tr");
    return data.filter(
      (a) =>
        (filter === "all" || a.status === filter) &&
        (!term || `${a.full_name} ${a.phone} ${a.course}`.toLocaleLowerCase("tr").includes(term)),
    );
  }, [data, filter, q]);

  return (
    <div className="rounded-3xl border border-border bg-card shadow-card">
      <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="İsim, telefon, eğitim ara" className="h-10 rounded-full pl-10" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["all", "new", "contacted", "enrolled", "cancelled"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                filter === s ? "bg-ink text-ink-foreground" : "bg-secondary text-muted-foreground hover:text-foreground",
              )}
            >
              {s === "all" ? "Tümü" : applicationStatusMeta[s].label}
              <span className="ml-1.5 opacity-60">{s === "all" ? data.length : data.filter((a) => a.status === s).length}</span>
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="p-10 text-center text-muted-foreground">Yükleniyor…</p>
      ) : error ? (
        <p className="p-10 text-center text-destructive">Başvurular yüklenemedi.</p>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center p-14 text-center text-muted-foreground">
          <Inbox className="h-8 w-8" />
          <p className="mt-3">Gösterilecek başvuru yok.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {rows.map((a) => (
            <li key={a.id} className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.3fr)_auto] lg:items-center">
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">{a.full_name}</p>
                <a href={`tel:${a.phone.replace(/\s/g, "")}`} className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
                  <Phone className="h-3.5 w-3.5" /> {a.phone}
                </a>
                <p className="mt-1 text-xs text-muted-foreground">{dateFmt.format(new Date(a.created_at))}</p>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{a.course}</p>
                {a.notes && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{a.notes}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Select value={a.status} onValueChange={(v) => update.mutate({ id: a.id, status: v as AppStatus })}>
                  <SelectTrigger className={cn("h-9 w-[11.5rem] rounded-full border-transparent text-xs font-semibold", applicationStatusMeta[a.status].className)}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(applicationStatusMeta) as AppStatus[]).map((s) => (
                      <SelectItem key={s} value={s}>{applicationStatusMeta[s].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Başvuruyu sil" className="rounded-full text-muted-foreground hover:text-destructive">
                      <Trash2 />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-3xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Başvuru silinsin mi?</AlertDialogTitle>
                      <AlertDialogDescription>{a.full_name} adlı kişinin başvurusu kalıcı olarak silinecek.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-full">Vazgeç</AlertDialogCancel>
                      <AlertDialogAction className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => remove.mutate(a.id)}>
                        Sil
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
