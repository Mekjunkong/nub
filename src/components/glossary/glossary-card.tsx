"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface GlossaryCardProps {
  slug: string;
  termTh: string;
  termEn: string;
  definitionTh: string;
  definitionEn: string;
  category: string;
  locale: string;
}

export function GlossaryCard({ slug, termTh, termEn, definitionTh, definitionEn, category, locale }: GlossaryCardProps) {
  const term = locale === "th" ? termTh : termEn;
  const definition = locale === "th" ? definitionTh : definitionEn;

  return (
    <a href={`/${locale}/glossary/${slug}`}>
      <Card className="transition-all hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="primary">{category}</Badge>
          </div>
          <h3 className="font-semibold text-text">{term}</h3>
          <p className="mt-1 text-sm text-text-muted line-clamp-2">{definition}</p>
        </CardContent>
      </Card>
    </a>
  );
}
