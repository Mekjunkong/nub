import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://nub-six.vercel.app";
  const locales = ["th", "en"];

  const staticPages = [
    "",
    "/blog",
    "/glossary",
    "/calendar",
    "/about",
    "/contact",
    "/legal",
    "/methodology",
    "/login",
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const page of staticPages) {
      entries.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === "/blog" ? "daily" : "weekly",
        priority: page === "" ? 1 : 0.8,
      });
    }
  }

  // TODO: Add dynamic blog posts and glossary terms from Supabase
  // when the database is seeded with production data.

  return entries;
}
