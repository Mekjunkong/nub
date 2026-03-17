"use client";

import { EventCard } from "@/components/calendar/event-card";

interface CalendarEventRow {
  id: string;
  title_th: string;
  title_en: string;
  description_th: string;
  description_en: string;
  event_type: string;
  event_date: string;
  recurring_yearly: boolean;
}

interface CalendarPageClientProps {
  events: CalendarEventRow[];
  locale: string;
}

export function CalendarPageClient({ events, locale }: CalendarPageClientProps) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-text font-heading">
        {locale === "th" ? "ปฏิทินการเงิน" : "Financial Calendar"}
      </h1>
      <p className="mb-6 text-text-muted">
        {locale === "th" ? "วันสำคัญทางการเงินและภาษีในประเทศไทย" : "Important financial and tax dates in Thailand"}
      </p>
      <div className="flex flex-col gap-4">
        {events.length > 0 ? (
          events.map((event) => (
            <EventCard
              key={event.id}
              title={locale === "th" ? event.title_th : event.title_en}
              description={locale === "th" ? event.description_th : event.description_en}
              eventType={event.event_type}
              eventDate={event.event_date}
              recurringYearly={event.recurring_yearly}
            />
          ))
        ) : (
          <div className="py-12 text-center">
            <p className="text-text-muted text-sm">
              {locale === "th" ? "ไม่มีกิจกรรมในขณะนี้" : "No events at this time"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
