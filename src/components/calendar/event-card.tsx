"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";

const typeColors: Record<string, "danger" | "warning" | "primary" | "default"> = {
  tax_deadline: "danger",
  ssf_rmf: "warning",
  gpf: "primary",
  general: "default",
};

interface EventCardProps {
  title: string;
  description: string;
  eventType: string;
  eventDate: string;
  recurringYearly: boolean;
}

export function EventCard({ title, description, eventType, eventDate, recurringYearly }: EventCardProps) {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="flex gap-4 p-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Calendar className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={typeColors[eventType] || "default"}>{eventType.replace(/_/g, " ")}</Badge>
            {recurringYearly && <span className="text-xs text-text-muted">Yearly</span>}
          </div>
          <h3 className="font-medium text-sm text-text">{title}</h3>
          <p className="text-xs text-text-muted mt-0.5">{description}</p>
          <p className="text-xs text-primary mt-1 font-medium">{new Date(eventDate).toLocaleDateString()}</p>
        </div>
      </CardContent>
    </Card>
  );
}
