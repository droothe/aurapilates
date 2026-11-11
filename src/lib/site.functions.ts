import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { applicationSchema } from "./application-schema";

function publicClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export type PublicTraining = {
  id: string;
  code: string;
  category: string;
  subtitle: string | null;
  date_label: string;
  month_label: string;
  start_date: string;
  duration_days: number;
  format: string;
  city: string;
  venue: string | null;
  early_bird: boolean;
  status: "open" | "limited" | "full" | "closed";
};

export const listTrainings = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("trainings")
    .select(
      "id, code, category, subtitle, date_label, month_label, start_date, duration_days, format, city, venue, early_bird, status",
    )
    .neq("status", "closed")
    .order("start_date", { ascending: true });
  if (error) {
    console.error("listTrainings failed", error);
    return [] as PublicTraining[];
  }
  return (data ?? []) as PublicTraining[];
});

export const submitApplication = createServerFn({ method: "POST" })
  .validator((input: unknown) => applicationSchema.parse(input))
  .handler(async ({ data }) => {
    const { error } = await publicClient().from("applications").insert({
      full_name: data.full_name,
      phone: data.phone,
      course: data.course,
      training_id: data.training_id ?? null,
      notes: data.notes ? data.notes : null,
    });
    if (error) {
      console.error("submitApplication failed", error);
      return { ok: false as const, message: "Başvurunuz şu an alınamadı. Lütfen tekrar deneyin." };
    }
    return { ok: true as const };
  });
