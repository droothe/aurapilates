import { ArrowRight, ArrowUpRight, Award, CalendarDays, Check, Clock, Instagram, MapPin, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { PublicTraining } from "@/lib/site.functions";
import { instructorCourses, studioCourses, type Course } from "@/lib/courses";
import { trainingOptionValue, useApply } from "./ApplyDialog";
import { LogoMark } from "./Logo";
import heroImg from "@/assets/hero-studio.jpg";
import matImg from "@/assets/mat-pose.jpg";
import reformerImg from "@/assets/reformer-training.jpg";

export const statusMeta: Record<PublicTraining["status"], { label: string; variant: "open" | "limited" | "full" | "closed" }> = {
  open: { label: "Kayıtlar açık", variant: "open" },
  limited: { label: "Son kontenjanlar", variant: "limited" },
  full: { label: "Kontenjan dolu", variant: "full" },
  closed: { label: "Kapalı", variant: "closed" },
};

function SectionHeading({ eyebrow, title, text, className }: { eyebrow: string; title: React.ReactNode; text?: string; className?: string }) {
  return (
    <div className={cn("max-w-2xl", className)}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-4 text-4xl leading-[1.05] text-foreground sm:text-5xl">{title}</h2>
      {text && <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{text}</p>}
    </div>
  );
}

/* ---------------- Hero ---------------- */
export function Hero({ next, onCalendar }: { next?: PublicTraining | undefined; onCalendar: () => void }) {
  const { open } = useApply();
  return (
    <section id="home" className="relative overflow-hidden bg-hero pt-28 pb-20 sm:pt-36 lg:pb-28">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="animate-fade-up">
          <Badge variant="soft" className="gap-2 px-3.5 py-1.5 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Code Pilates onaylı eğitmenlik programları
          </Badge>
          <h1 className="mt-7 text-[2.6rem] leading-[1.02] text-foreground sm:text-6xl lg:text-[4.4rem]">
            Profesyonel Pilates Eğitmeni Olma <em className="font-normal italic text-primary">Yolculuğunuza</em> Başlayın
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Kübra Çay öncülüğünde Mat, Reformer ve Trapeze Table uzmanlık eğitimleri.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button variant="hero" size="xl" onClick={onCalendar}>
              Eğitim Takvimini İncele <ArrowRight />
            </Button>
            <Button variant="soft" size="xl" onClick={() => open()}>
              Ön Kayıt Oluştur
            </Button>
          </div>
          <dl className="mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-border pt-8">
            {[
              ["3", "Uzmanlık alanı"],
              ["Yüz yüze", "Uygulamalı eğitim"],
              ["İstanbul", "Eğitim şehri"],
            ].map(([v, l]) => (
              <div key={l} className="min-w-0">
                <dt className="font-display text-2xl text-foreground sm:text-3xl">{v}</dt>
                <dd className="mt-1 text-xs text-muted-foreground sm:text-sm">{l}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="arch overflow-hidden shadow-soft">
            <img src={heroImg} alt="Aydınlık, bej tonlarında reformer pilates stüdyosu" width={1600} height={1200} className="aspect-[4/5] h-full w-full object-cover" />
          </div>
          <div className="absolute -left-4 top-10 hidden h-28 w-28 overflow-hidden rounded-full border-4 border-background shadow-card sm:block">
            <img src={matImg} alt="" width={1024} height={1280} loading="lazy" className="h-full w-full object-cover" />
          </div>
          {next && (
            <button
              type="button"
              onClick={() => open(trainingOptionValue(next))}
              className="absolute -bottom-6 left-1/2 w-[86%] -translate-x-1/2 animate-float rounded-2xl border border-border bg-card/95 p-4 text-left shadow-soft backdrop-blur sm:left-auto sm:right-6 sm:w-72 sm:translate-x-0"
            >
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Sıradaki eğitim</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-display text-xl text-foreground">{next.code}</p>
                  <p className="text-sm text-muted-foreground">{next.date_label} {next.month_label}</p>
                </div>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Calendar ---------------- */
const categoryLabel: Record<string, string> = { mat: "Mat", reformer: "Reformer", trapeze: "Trapeze Table" };

function TrainingCard({ t }: { t: PublicTraining }) {
  const { open } = useApply();
  const s = statusMeta[t.status];
  const isFull = t.status === "full";
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-soft sm:p-7">
      {t.early_bird && (
        <span className="absolute right-0 top-6 rounded-l-full bg-primary px-3.5 py-1 text-[0.68rem] font-semibold uppercase tracking-wider text-primary-foreground">
          Erken kayıt indirimi
        </span>
      )}
      <div className="flex items-center gap-2">
        <Badge variant={s.variant} className="rounded-full">{s.label}</Badge>
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{categoryLabel[t.category] ?? t.category}</span>
      </div>

      <h3 className="mt-6 text-3xl leading-tight text-foreground">{t.code}</h3>
      {t.subtitle && <p className="mt-1.5 text-muted-foreground">{t.subtitle}</p>}

      <div className="mt-6 flex items-stretch gap-3">
        <div className="rounded-2xl bg-primary-soft px-4 py-3 text-primary">
          <p className="font-display text-2xl leading-none">{t.date_label}</p>
          <p className="mt-1.5 text-xs font-semibold uppercase tracking-wider">{t.month_label}</p>
        </div>
        <div className="flex flex-col justify-center rounded-2xl bg-secondary px-4 py-3">
          <p className="font-display text-2xl leading-none text-foreground">{t.duration_days}</p>
          <p className="mt-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">gün</p>
        </div>
      </div>

      <ul className="mt-6 space-y-2.5 text-sm text-muted-foreground">
        <li className="flex items-center gap-2.5"><MapPin className="h-4 w-4 shrink-0 text-primary" /> {t.city}{t.venue ? ` · ${t.venue}` : ""}</li>
        <li className="flex items-center gap-2.5"><Clock className="h-4 w-4 shrink-0 text-primary" /> {t.duration_days} gün · {t.format}</li>
      </ul>

      <Button
        variant={isFull ? "soft" : "ink"}
        size="lg"
        className="mt-8 w-full"
        onClick={() => open(isFull ? undefined : trainingOptionValue(t))}
      >
        {isFull ? "Bekleme listesine yazıl" : "Kontenjan Sorgula / Başvur"}
      </Button>
    </article>
  );
}

export function CalendarSection({ trainings }: { trainings: PublicTraining[] }) {
  return (
    <section id="takvim" className="bg-warm py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="Eğitim Takvimi"
            title={<>Yaklaşan <em className="italic text-primary">modüller</em></>}
            text="İstanbul'da yüz yüze, uygulamalı eğitmenlik modülleri. Kontenjanlar sınırlıdır."
          />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4 text-primary" /> 2026 – 2027 dönemi
          </div>
        </div>
        {trainings.length === 0 ? (
          <p className="mt-14 rounded-3xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
            Yeni eğitim tarihleri yakında burada olacak.
          </p>
        ) : (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trainings.map((t) => (
              <TrainingCard key={t.id} t={t} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------------- Courses ---------------- */
function CourseCard({ c }: { c: Course }) {
  const { open } = useApply();
  return (
    <article
      className={cn(
        "flex flex-col rounded-3xl border p-7 transition-all duration-300 hover:-translate-y-1",
        c.highlight ? "border-transparent bg-ink text-ink-foreground shadow-soft" : "border-border bg-card shadow-card",
      )}
    >
      <p className={cn("text-xs font-semibold uppercase tracking-[0.18em]", c.highlight ? "text-sand" : "text-primary")}>{c.tagline}</p>
      <h3 className="mt-4 text-2xl leading-tight sm:text-[1.7rem]">{c.title}</h3>
      <dl className={cn("mt-6 grid grid-cols-2 gap-3 border-y py-5 text-sm", c.highlight ? "border-ink-foreground/15" : "border-border")}>
        <div>
          <dt className={c.highlight ? "text-ink-foreground/60" : "text-muted-foreground"}>Süre</dt>
          <dd className="mt-1 font-semibold">{c.duration}</dd>
        </div>
        <div>
          <dt className={c.highlight ? "text-ink-foreground/60" : "text-muted-foreground"}>Seviye</dt>
          <dd className="mt-1 font-semibold">{c.level}</dd>
        </div>
        <div className="col-span-2 flex items-center gap-2">
          <Award className={cn("h-4 w-4 shrink-0", c.highlight ? "text-sand" : "text-primary")} />
          <dd className="font-medium">{c.certificate}</dd>
        </div>
      </dl>
      <ul className="mt-6 flex-1 space-y-3 text-sm">
        {c.features.map((f) => (
          <li key={f} className="flex items-start gap-3">
            <Check className={cn("mt-0.5 h-4 w-4 shrink-0", c.highlight ? "text-sand" : "text-primary")} />
            <span className={c.highlight ? "text-ink-foreground/85" : "text-muted-foreground"}>{f}</span>
          </li>
        ))}
      </ul>
      <Button variant={c.highlight ? "hero" : "soft"} size="lg" className="mt-8 w-full" onClick={() => open(c.title)}>
        Bilgi Al & Başvur
      </Button>
    </article>
  );
}

export function CoursesSection({ tab, onTabChange }: { tab: string; onTabChange: (v: string) => void }) {
  return (
    <section id="egitimler" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid items-end gap-10 lg:grid-cols-[1fr_auto]">
          <SectionHeading
            eyebrow="Eğitimler ve Dersler"
            title={<>Eğitmenlikten stüdyo derslerine, <em className="italic text-primary">tek adres</em></>}
            text="Eğitmen olmak isteyenler için sertifikalı programlar; kendi pratiğini derinleştirmek isteyenler için özel ve grup dersleri."
          />
        </div>
        <Tabs value={tab} onValueChange={onTabChange} className="mt-12">
          <TabsList className="h-auto w-full rounded-full border border-border bg-secondary p-1.5 sm:w-auto">
            <TabsTrigger value="egitmenlik" className="flex-1 rounded-full px-4 py-2.5 text-sm data-[state=active]:bg-card data-[state=active]:shadow-card sm:flex-none sm:px-6">
              Eğitmenlik Eğitimleri
            </TabsTrigger>
            <TabsTrigger value="studyo" className="flex-1 rounded-full px-4 py-2.5 text-sm data-[state=active]:bg-card data-[state=active]:shadow-card sm:flex-none sm:px-6">
              Stüdyo Dersleri <span className="hidden sm:inline">&nbsp;(Reformer & Mat)</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="egitmenlik" className="mt-10">
            <div className="grid gap-6 md:grid-cols-3">
              {instructorCourses.map((c) => <CourseCard key={c.title} c={c} />)}
            </div>
          </TabsContent>
          <TabsContent value="studyo" className="mt-10">
            <div className="grid gap-6 md:grid-cols-3">
              {studioCourses.map((c) => <CourseCard key={c.title} c={c} />)}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

/* ---------------- About ---------------- */
export function AboutSection() {
  return (
    <section id="hakkimizda" className="bg-secondary/60 py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 lg:grid-cols-2 lg:gap-20 lg:px-8">
        <div className="relative">
          <img src={reformerImg} alt="Eğitmen, reformer üzerinde öğrencisine birebir rehberlik ediyor" width={1280} height={1024} loading="lazy" className="aspect-[5/4] w-full rounded-[2rem] object-cover shadow-soft" />
          <div className="absolute -bottom-8 right-4 max-w-[15rem] rounded-2xl border border-border bg-card p-5 shadow-card sm:right-8">
            <LogoMark className="h-8 w-7" />
            <p className="mt-3 font-display text-lg leading-snug text-foreground">“Doğru hareket, doğru adresten başlar.”</p>
          </div>
        </div>
        <div>
          <SectionHeading
            eyebrow="Hakkımızda"
            title={<>Kübra Çay & <em className="italic text-primary">Adres Pilates</em></>}
          />
          <div className="mt-6 space-y-5 text-lg leading-relaxed text-muted-foreground">
            <p>
              Adres Pilates, Kübra Çay tarafından kurulan; spor ve egzersiz eğitimini bilimsel temelli, uygulamalı ve samimi bir
              yaklaşımla buluşturan bir pilates ve eğitmenlik akademisidir.
            </p>
            <p>
              Code Pilates bünyesinde Master Trainer & Educator olarak Mat, Reformer ve Trapeze Table eğitimleri veren Kübra Çay,
              yeni eğitmenlerin sahaya güvenle adım atmasını hedefler.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Award, t: "Master Trainer", d: "Code Pilates Educator" },
              { icon: Users, t: "Küçük gruplar", d: "Birebir ilgi" },
              { icon: MapPin, t: "İstanbul", d: "Yüz yüze eğitim" },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="rounded-2xl border border-border bg-card p-5">
                <Icon className="h-5 w-5 text-primary" />
                <p className="mt-3 font-semibold text-foreground">{t}</p>
                <p className="text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Contact ---------------- */
export function ContactSection() {
  const { open } = useApply();
  return (
    <section id="iletisim" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-ink px-6 py-16 text-ink-foreground sm:px-14 sm:py-20">
          <LogoMark className="pointer-events-none absolute -right-10 -top-10 h-80 w-72 text-ink-foreground/5" />
          <div className="relative grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <p className="eyebrow text-sand">İletişim</p>
              <h2 className="mt-4 text-4xl leading-[1.05] sm:text-5xl">
                Bir sonraki adımınız <em className="italic text-sand">burada</em> başlıyor.
              </h2>
              <p className="mt-5 max-w-lg text-lg text-ink-foreground/75">
                Eğitimler, kontenjanlar ve ders paketleri hakkında bilgi almak için başvuru formunu doldurun ya da Instagram'dan yazın.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button variant="hero" size="xl" onClick={() => open()}>Eğitime Başvur</Button>
                <Button asChild variant="soft" size="xl">
                  <a href="https://instagram.com/adrespilates" target="_blank" rel="noreferrer">
                    <Instagram /> @adrespilates
                  </a>
                </Button>
              </div>
            </div>
            <ul className="space-y-4">
              {[
                { icon: MapPin, t: "Konum", d: "İstanbul" },
                { icon: Instagram, t: "Instagram", d: "@adrespilates", href: "https://instagram.com/adrespilates" },
                { icon: Award, t: "Eğitim ortağı", d: "@codepilates", href: "https://instagram.com/codepilates" },
              ].map(({ icon: Icon, t, d, href }) => (
                <li key={t} className="flex items-center gap-4 rounded-2xl border border-ink-foreground/10 bg-ink-foreground/5 p-5">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-ink-foreground/60">{t}</p>
                    {href ? (
                      <a href={href} target="_blank" rel="noreferrer" className="font-semibold hover:text-sand">{d}</a>
                    ) : (
                      <p className="font-semibold">{d}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 text-sm text-muted-foreground sm:flex-row lg:px-8">
        <p>© {new Date().getFullYear()} Adres Pilates · Kübra Çay</p>
        <p>Reformer · Mat · Trapeze Table Eğitimleri</p>
      </div>
    </footer>
  );
}
