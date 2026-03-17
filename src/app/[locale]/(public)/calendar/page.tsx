import { createClient } from "@/lib/supabase/server";
import { setRequestLocale } from "next-intl/server";
import { CalendarPageClient } from "./calendar-page-client";
import type { CalendarEvent } from "@/types/database";

type CalendarListItem = Pick<CalendarEvent, "id" | "title_th" | "title_en" | "description_th" | "description_en" | "event_type" | "event_date" | "recurring_yearly">;

export default async function CalendarPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data } = await supabase
    .from("calendar_events")
    .select("id, title_th, title_en, description_th, description_en, event_type, event_date, recurring_yearly")
    .order("event_date", { ascending: true });

  const events = (data ?? []) as CalendarListItem[];

  return <CalendarPageClient events={events} locale={locale} />;
}
