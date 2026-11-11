import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { applicationSchema } from "@/lib/application-schema";
import { submitApplication, type PublicTraining } from "@/lib/site.functions";
import { instructorCourses, studioCourses } from "@/lib/courses";
import { LogoMark } from "./Logo";

type ApplyCtx = { open: (course?: string) => void };
const Ctx = createContext<ApplyCtx | null>(null);

export function useApply() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApply must be used inside ApplyProvider");
  return ctx;
}

type FieldErrors = Partial<Record<"full_name" | "phone" | "course" | "notes", string>>;

export function trainingOptionValue(t: PublicTraining) {
  return `${t.code} · ${t.date_label} ${t.month_label}`;
}

export function ApplyProvider({ trainings, children }: { trainings: PublicTraining[]; children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [course, setCourse] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const submit = useServerFn(submitApplication);

  const open = useCallback((preset?: string) => {
    setCourse(preset ?? "");
    setErrors({});
    setDone(false);
    setIsOpen(true);
  }, []);

  const value = useMemo(() => ({ open }), [open]);

  const trainingByLabel = useMemo(() => {
    const map = new Map<string, string>();
    trainings.forEach((t) => map.set(trainingOptionValue(t), t.id));
    return map;
  }, [trainings]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      full_name: fullName,
      phone,
      course,
      notes,
      training_id: trainingByLabel.get(course) ?? null,
    };
    const parsed = applicationSchema.safeParse(payload);
    if (!parsed.success) {
      const next: FieldErrors = {};
      parsed.error.issues.forEach((i) => {
        const k = i.path[0] as keyof FieldErrors;
        if (!next[k]) next[k] = i.message;
      });
      setErrors(next);
      return;
    }
    setErrors({});
    setPending(true);
    try {
      const res = await submit({ data: parsed.data });
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      setDone(true);
      setFullName("");
      setPhone("");
      setNotes("");
    } catch {
      toast.error("Başvurunuz gönderilemedi. Lütfen tekrar deneyin.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Ctx.Provider value={value}>
      {children}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto rounded-3xl border-border bg-card p-0 sm:max-w-lg">
          {done ? (
            <div className="flex flex-col items-center px-8 py-12 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-sage-soft text-sage">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <DialogTitle className="mt-6 text-2xl">Başvurunuz alındı</DialogTitle>
              <DialogDescription className="mt-3 max-w-sm text-muted-foreground">
                Teşekkürler! Kontenjan ve detaylar için en kısa sürede sizinle iletişime geçeceğiz.
              </DialogDescription>
              <Button variant="hero" size="xl" className="mt-8" onClick={() => setIsOpen(false)}>
                Tamam
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader className="space-y-3 border-b border-border bg-warm px-7 pb-6 pt-8 text-left">
                <LogoMark className="h-9 w-8" />
                <DialogTitle className="text-2xl sm:text-3xl">Eğitime Başvur</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Ön kaydınızı oluşturun, kontenjan durumu ve detaylar için size dönüş yapalım.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={onSubmit} className="space-y-5 px-7 py-7" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="full_name">Ad Soyad</Label>
                  <Input
                    id="full_name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    maxLength={100}
                    autoComplete="name"
                    placeholder="Adınız Soyadınız"
                    className="h-11 rounded-xl"
                  />
                  {errors.full_name && <p className="text-sm text-destructive">{errors.full_name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={20}
                    autoComplete="tel"
                    placeholder="05xx xxx xx xx"
                    className="h-11 rounded-xl"
                  />
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course">Eğitim / Modül</Label>
                  <Select value={course} onValueChange={setCourse}>
                    <SelectTrigger id="course" className="h-11 rounded-xl">
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      {trainings.length > 0 && (
                        <SelectGroup>
                          <SelectLabel>Eğitim Takvimi</SelectLabel>
                          {trainings.map((t) => (
                            <SelectItem key={t.id} value={trainingOptionValue(t)} disabled={t.status === "full"}>
                              {trainingOptionValue(t)}
                              {t.status === "full" ? " (Dolu)" : ""}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      )}
                      <SelectGroup>
                        <SelectLabel>Eğitmenlik Eğitimleri</SelectLabel>
                        {instructorCourses.map((c) => (
                          <SelectItem key={c.title} value={c.title}>
                            {c.title}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Stüdyo Dersleri</SelectLabel>
                        {studioCourses.map((c) => (
                          <SelectItem key={c.title} value={c.title}>
                            {c.title}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.course && <p className="text-sm text-destructive">{errors.course}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notlar <span className="font-normal text-muted-foreground">(isteğe bağlı)</span></Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    maxLength={1000}
                    rows={3}
                    placeholder="Deneyiminiz, sorularınız…"
                    className="rounded-xl"
                  />
                  {errors.notes && <p className="text-sm text-destructive">{errors.notes}</p>}
                </div>
                <Button type="submit" variant="hero" size="xl" className="w-full" disabled={pending}>
                  {pending && <Loader2 className="animate-spin" />}
                  Başvuruyu Gönder
                </Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Ctx.Provider>
  );
}
