import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { useApply } from "./ApplyDialog";

export type NavItem = { label: string; target: string; tab?: "egitmenlik" | "studyo" };

export const navItems: NavItem[] = [
  { label: "Home", target: "home" },
  { label: "Eğitmenlik Eğitimleri", target: "egitimler", tab: "egitmenlik" },
  { label: "Ders Paketleri", target: "egitimler", tab: "studyo" },
  { label: "Eğitim Takvimi", target: "takvim" },
  { label: "Hakkımızda", target: "hakkimizda" },
  { label: "İletişim", target: "iletisim" },
];

export function SiteHeader({ onNavigate }: { onNavigate: (item: NavItem) => void }) {
  const { open } = useApply();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "border-b border-border/70 bg-background/85 backdrop-blur-lg" : "bg-transparent",
      )}
    >
      <div className="mx-auto grid h-20 max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 lg:flex lg:justify-between lg:px-8">
        <button type="button" onClick={() => onNavigate(navItems[0]!)} className="min-w-0 text-left" aria-label="Adres Pilates ana sayfa">
          <Logo />
        </button>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Ana menü">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onNavigate(item)}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="hero" className="hidden sm:inline-flex" onClick={() => open()}>
            Eğitime Başvur
          </Button>
          <Button asChild variant="soft" size="sm" className="h-10 px-3">
            <Link to="/admin" aria-label="Yönetici Girişi">
              <ShieldCheck className="!size-4" />
              <span className="hidden sm:inline">Yönetici Girişi</span>
            </Link>
          </Button>
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="soft" size="icon" className="h-11 w-11 lg:hidden" aria-label="Menüyü aç">
                <Menu className="!size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex w-[86vw] max-w-sm flex-col border-border bg-background p-0">
              <SheetHeader className="border-b border-border px-6 py-5 text-left">
                <SheetTitle asChild>
                  <div><Logo /></div>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-1 flex-col gap-1 px-4 py-6" aria-label="Mobil menü">
                {navItems.map((item, i) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setTimeout(() => onNavigate(item), 250);
                    }}
                    className="flex items-center justify-between rounded-2xl px-4 py-3.5 text-left font-display text-xl text-foreground transition-colors hover:bg-secondary"
                  >
                    {item.label}
                    <span className="text-xs font-sans text-muted-foreground">0{i + 1}</span>
                  </button>
                ))}
              </nav>
              <div className="border-t border-border p-5">
                <Button
                  variant="hero"
                  size="xl"
                  className="w-full"
                  onClick={() => {
                    setMenuOpen(false);
                    open();
                  }}
                >
                  Eğitime Başvur
                </Button>
                <Button asChild variant="soft" size="xl" className="mt-2 w-full">
                  <Link to="/admin" onClick={() => setMenuOpen(false)}>
                    <ShieldCheck /> Yönetici Girişi
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
