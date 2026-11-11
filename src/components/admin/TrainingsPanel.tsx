import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarPlus, MapPin, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

type Training = Database["public"]["Tables"]["trainings"]["Row"];
type TrainingStatus = Database["public"]["Enums"]["training_status"];

export const trainingStatusMeta: Record<TrainingStatus, { label: string; className: string }> = {
  open: { label: "Kayıtlar açık", className: "bg-sage-soft text-sage" },
  limited: { label: "Son kontenjanlar", className: "bg-amber-soft text-amber" },
  full: { label: "Kontenjan dolu", className: "bg-primary-soft text-primary" },
  closed: { label: "Gizli / Kapalı", className: "bg-muted text-muted-foreground" },
};

export const trainingsAdminKey = ["admin", "trainings"];

export function useAdminTrainings() {
  return useQuery({
    queryKey: trainingsAdminKey,
    queryFn: async () => {
      const { data, error } = await supabase.from("trainings").select("*").order("start_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

const formSchema = z.object({
  code: z.string().trim().min(2, "Modül adı gerekli").max(60),
  category: z.enum(["mat", "reformer", "trapeze"]),
  subtitle: z.string().trim().max(120),
  date_label: z.string().trim().min(1, "Gün bilgisi gerekli").max(30),
  month_label: z.string().trim().min(1, "Ay / yıl gerekli").max(30),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Başlangıç tarihi seçin"),
  duration_days: z.coerce.number().int().min(1, "En az 1 gün").max(30),
  format: z.string().trim().min(1).max(40),
  city: z.string().trim().min(1).max(60),
  venue: z.string().trim().max(120),
  early_bird: z.boolean(),
  status: z.enum(["open", "limited", "full", "closed"]),
});
type FormState = z.input<typeof formSchema>;

const empty: FormState = {
  code: "", category: "mat", subtitle: "", date_label: "", month_label: "", start_date: "",
  duration_days: 2, format: "Yüz yüze", city: "İstanbul", venue: "", early_bird: false, status: "open",
};

function toForm(t: Training): FormState {
  return {
    code: t.code, category: t.category as FormState["category"], subtitle: t.subtitle ?? "", date_label: t.date_label,
    month_label: t.month_label, start_date: t.start_date, duration_days: t.duration_days, format: t.format,
    city: t.city, venue: t.venue ?? "", early_bird: t.early_bird, status: t.status,
  };
}

export function TrainingsPanel() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useAdminTrainings();
  const [editing, setEditing] = useState<Training | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(empty);
  const [formError, setFormError] = useState<string | null>(null);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: trainingsAdminKey });
    qc.invalidateQueries({ queryKey: ["trainings", "public"] });
  };

  const save = useMutation({
    mutationFn: async (values: z.output<typeof formSchema>) => {
      const row = { ...values, subtitle: values.subtitle || null, venue: values.venue || null };
      const res = editing
        ? await supabase.from("trainings").update(row).eq("id", editing.id)
        : await supabase.from("trainings").insert(row);
      if (res.error) throw res.error;
    },
    onSuccess: () => {
      invalidate();
      setDialogOpen(false);
      toast.success(editing ? "Eğitim güncellendi" : "Eğitim eklendi");
    },
    onError: () => toast.error("Kaydedilemedi"),
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TrainingStatus }) => {
      const { error } = await supabase.from("trainings").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Durum güncellendi");
    },
    onError: () => toast.error("Güncellenemedi"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("trainings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Eğitim silindi");
    },
    onError: () => toast.error("Silinemedi"),
  });

  function openNew() {
    setEditing(null);
    setForm(empty);
    setFormError(null);
    setDialogOpen(true);
  }
  function openEdit(t: Training) {
    setEditing(t);
    setForm(toForm(t));
    setFormError(null);
    setDialogOpen(true);
  }
  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = formSchema.safeParse(form);
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Bilgileri kontrol edin");
      return;
    }
    save.mutate(parsed.data);
  }
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="rounded-3xl border border-border bg-card shadow-card">
      <div className="flex items-center justify-between gap-3 border-b border-border p-5">
        <p className="text-sm text-muted-foreground">Sitedeki eğitim takvimi buradan yönetilir. “Gizli” eğitimler sitede görünmez.</p>
        <Button variant="hero" onClick={openNew} className="shrink-0"><CalendarPlus /> <span className="hidden sm:inline">Yeni eğitim</span></Button>
      </div>
      {isLoading ? (
        <p className="p-10 text-center text-muted-foreground">Yükleniyor…</p>
      ) : (
        <ul className="divide-y divide-border">
          {data.map((t) => (
            <li key={t.id} className="grid gap-4 p-5 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
              <div className="w-fit rounded-2xl bg-primary-soft px-4 py-2.5 text-primary">
                <p className="font-display text-lg leading-none">{t.date_label}</p>
                <p className="mt-1 text-[0.68rem] font-semibold uppercase tracking-wider">{t.month_label}</p>
              </div>
              <div className="min-w-0">
                <p className="font-display text-xl text-foreground">
                  {t.code}
                  {t.early_bird && <span className="ml-2 align-middle text-[0.65rem] font-sans font-semibold uppercase tracking-wider text-primary">Erken kayıt</span>}
                </p>
                <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0" /> {t.city}{t.venue ? ` · ${t.venue}` : ""} · {t.duration_days} gün
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Select value={t.status} onValueChange={(v) => setStatus.mutate({ id: t.id, status: v as TrainingStatus })}>
                  <SelectTrigger className={cn("h-9 w-[11.5rem] rounded-full border-transparent text-xs font-semibold", trainingStatusMeta[t.status].className)}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(trainingStatusMeta) as TrainingStatus[]).map((s) => (
                      <SelectItem key={s} value={s}>{trainingStatusMeta[s].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" className="rounded-full" aria-label="Düzenle" onClick={() => openEdit(t)}><Pencil /></Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-destructive" aria-label="Sil"><Trash2 /></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-3xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t.code} silinsin mi?</AlertDialogTitle>
                      <AlertDialogDescription>Eğitim takvimden kaldırılır. Bu eğitime yapılmış başvurular silinmez.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-full">Vazgeç</AlertDialogCancel>
                      <AlertDialogAction className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => remove.mutate(t.id)}>Sil</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto rounded-3xl sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{editing ? "Eğitimi düzenle" : "Yeni eğitim"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="t-code">Modül adı</Label>
              <Input id="t-code" value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="MAT 1" />
            </div>
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select value={form.category} onValueChange={(v) => set("category", v as FormState["category"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mat">Mat</SelectItem>
                  <SelectItem value="reformer">Reformer</SelectItem>
                  <SelectItem value="trapeze">Trapeze Table</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Durum</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v as TrainingStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(trainingStatusMeta) as TrainingStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>{trainingStatusMeta[s].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="t-sub">Alt başlık</Label>
              <Input id="t-sub" value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} placeholder="+ Hareket Temelleri" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-days">Günler (görünen)</Label>
              <Input id="t-days" value={form.date_label} onChange={(e) => set("date_label", e.target.value)} placeholder="20–21–22" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-month">Ay / Yıl</Label>
              <Input id="t-month" value={form.month_label} onChange={(e) => set("month_label", e.target.value)} placeholder="Kasım 2026" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-start">Başlangıç tarihi (sıralama)</Label>
              <Input id="t-start" type="date" value={form.start_date} onChange={(e) => set("start_date", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-dur">Süre (gün)</Label>
              <Input id="t-dur" type="number" min={1} max={30} value={String(form.duration_days)} onChange={(e) => set("duration_days", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-city">Şehir</Label>
              <Input id="t-city" value={form.city} onChange={(e) => set("city", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-format">Format</Label>
              <Input id="t-format" value={form.format} onChange={(e) => set("format", e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="t-venue">Stüdyo</Label>
              <Input id="t-venue" value={form.venue} onChange={(e) => set("venue", e.target.value)} placeholder="Mec Pilates Studio" />
            </div>
            <label className="flex items-center justify-between gap-3 rounded-2xl bg-secondary px-4 py-3 sm:col-span-2">
              <span className="text-sm font-medium">Erken kayıt indirimi etiketi</span>
              <Switch checked={form.early_bird} onCheckedChange={(v) => set("early_bird", v)} />
            </label>
            {formError && <p className="text-sm text-destructive sm:col-span-2">{formError}</p>}
            <DialogFooter className="gap-2 sm:col-span-2">
              <Button type="button" variant="soft" onClick={() => setDialogOpen(false)}>Vazgeç</Button>
              <Button type="submit" variant="hero" disabled={save.isPending}>{editing ? "Kaydet" : "Ekle"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
