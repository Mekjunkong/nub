"use client";

import { useLocale } from "next-intl";
import { EventCard } from "@/components/calendar/event-card";

const mockEvents = [
  { title_th: "วันสุดท้ายยื่นภาษีเงินได้บุคคลธรรมดา", title_en: "Personal Income Tax Filing Deadline", description_th: "วันสุดท้ายสำหรับยื่นแบบ ภ.ง.ด. 90/91", description_en: "Last day to file PND 90/91", event_type: "tax_deadline", event_date: "2026-03-31", recurring_yearly: true },
  { title_th: "วันสุดท้ายซื้อ SSF/RMF", title_en: "SSF/RMF Purchase Deadline", description_th: "วันสุดท้ายซื้อ SSF/RMF เพื่อลดหย่อนภาษี", description_en: "Last day to purchase SSF/RMF for tax deduction", event_type: "ssf_rmf", event_date: "2026-12-30", recurring_yearly: true },
  { title_th: "วันจ่ายเงินสมทบ กบข. งวดสุดท้าย", title_en: "Last GPF Contribution", description_th: "งวดสุดท้ายของการจ่ายเงินสมทบ กบข.", description_en: "Final GPF contribution period", event_type: "gpf", event_date: "2026-12-25", recurring_yearly: true },
];

export default function CalendarPage() {
  const locale = useLocale();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-text font-heading">
        {locale === "th" ? "ปฏิทินการเงิน" : "Financial Calendar"}
      </h1>
      <p className="mb-6 text-text-muted">
        {locale === "th" ? "วันสำคัญทางการเงินและภาษีในประเทศไทย" : "Important financial and tax dates in Thailand"}
      </p>
      <div className="flex flex-col gap-4">
        {mockEvents
          .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
          .map((event) => (
            <EventCard
              key={event.event_date}
              title={locale === "th" ? event.title_th : event.title_en}
              description={locale === "th" ? event.description_th : event.description_en}
              eventType={event.event_type}
              eventDate={event.event_date}
              recurringYearly={event.recurring_yearly}
            />
          ))}
      </div>
    </div>
  );
}
