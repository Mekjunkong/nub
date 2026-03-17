"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface BlogCardProps {
  slug: string;
  title: string;
  description: string;
  category: string;
  coverImageUrl: string | null;
  publishedAt: string | null;
  locale: string;
}

export function BlogCard({ slug, title, description, category, coverImageUrl, publishedAt, locale }: BlogCardProps) {
  return (
    <Link href={`/${locale}/blog/${slug}`}>
      <Card className="overflow-hidden transition-all hover:shadow-md">
        {coverImageUrl && (
          <div className="relative aspect-video w-full overflow-hidden bg-surface-hover">
            <Image src={coverImageUrl} alt={title} fill className="object-cover" unoptimized />
          </div>
        )}
        <CardContent className="p-4">
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="primary">{category}</Badge>
            {publishedAt && (
              <span className="text-xs text-text-muted">{new Date(publishedAt).toLocaleDateString()}</span>
            )}
          </div>
          <h3 className="font-semibold text-text line-clamp-2">{title}</h3>
          <p className="mt-1 text-sm text-text-muted line-clamp-2">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
