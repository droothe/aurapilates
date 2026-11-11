import { cn } from "@/lib/utils";

/** Location pin with a pilates "teaser" figure inside — mirrors the Adres Pilates mark. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 56" fill="none" aria-hidden="true" className={cn("text-primary", className)}>
      <path
        d="M24 53c0 0 19-17.6 19-31.5C43 10.7 34.5 3 24 3S5 10.7 5 21.5C5 35.4 24 53 24 53Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <circle cx="17.5" cy="15.5" r="3" fill="currentColor" />
      <path
        d="M14 31c3.5-1.4 6.2-3.8 7.6-7.2L24 28l12-10.5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M21.6 23.8 30 21" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <LogoMark className="h-9 w-8 shrink-0" />
      <span className="flex min-w-0 flex-col leading-none">
        <span className="truncate font-display text-xl font-semibold tracking-tight text-foreground">
          Adres Pilates
        </span>
        <span className="mt-1 truncate text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          Kübra Çay · Master Trainer
        </span>
      </span>
    </span>
  );
}
