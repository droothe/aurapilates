import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { listTrainings } from "@/lib/site.functions";
import { ApplyProvider } from "@/components/site/ApplyDialog";
import { SiteHeader, type NavItem } from "@/components/site/SiteHeader";
import { AboutSection, CalendarSection, ContactSection, CoursesSection, Hero, SiteFooter } from "@/components/site/Sections";

export const trainingsQuery = queryOptions({
  queryKey: ["trainings", "public"],
  queryFn: () => listTrainings(),
});

const title = "Adres Pilates | Kübra Çay — Pilates Eğitmenlik Eğitimleri İstanbul";
const description =
  "Kübra Çay öncülüğünde Mat, Reformer ve Trapeze Table eğitmenlik eğitimleri. İstanbul eğitim takvimi, ders paketleri ve online ön kayıt.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(trainingsQuery),
  component: Index,
});

function Index() {
  const { data: trainings } = useSuspenseQuery(trainingsQuery);
  const [tab, setTab] = useState("egitmenlik");

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onNavigate = (item: NavItem) => {
    if (item.tab) setTab(item.tab);
    if (item.target === "home") window.scrollTo({ top: 0, behavior: "smooth" });
    else scrollTo(item.target);
  };

  return (
    <ApplyProvider trainings={trainings}>
      <SiteHeader onNavigate={onNavigate} />
      <main>
        <Hero next={trainings.find((t) => t.status !== "full")} onCalendar={() => scrollTo("takvim")} />
        <CalendarSection trainings={trainings} />
        <CoursesSection tab={tab} onTabChange={setTab} />
        <AboutSection />
        <ContactSection />
      </main>
      <SiteFooter />
    </ApplyProvider>
  );
}
