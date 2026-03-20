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

  const calculatorPages = [
    "/calculator/retirement",
    "/calculator/withdrawal",
    "/calculator/stress-test",
    "/calculator/mpt",
    "/calculator/dca",
    "/calculator/tax",
    "/calculator/cashflow",
    "/calculator/roic",
    "/calculator/gpf-optimizer",
    "/calculator/tipp",
    "/calculator/bumnan95",
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

  for (const locale of locales) {
    for (const page of calculatorPages) {
      entries.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  // Dynamic blog posts and glossary terms from Supabase
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const { data: blogPosts } = await supabase
      .from("blog_posts")
      .select("slug, updated_at")
      .eq("published", true);

    if (blogPosts) {
      for (const post of blogPosts) {
        for (const locale of locales) {
          entries.push({
            url: `${baseUrl}/${locale}/blog/${post.slug}`,
            lastModified: new Date(post.updated_at),
            changeFrequency: "weekly",
            priority: 0.6,
          });
        }
      }
    }

    const { data: glossaryTerms } = await supabase
      .from("glossary_terms")
      .select("slug, updated_at");

    if (glossaryTerms) {
      for (const term of glossaryTerms) {
        for (const locale of locales) {
          entries.push({
            url: `${baseUrl}/${locale}/glossary/${term.slug}`,
            lastModified: new Date(term.updated_at),
            changeFrequency: "monthly",
            priority: 0.5,
          });
        }
      }
    }
  } catch {
    // Supabase may not be configured — skip dynamic entries
  }

  return entries;
}
