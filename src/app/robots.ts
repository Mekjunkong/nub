import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard/",
        "/calculator/",
        "/chat/",
        "/profile/",
        "/onboarding/",
      ],
    },
    sitemap: "https://nub-six.vercel.app/sitemap.xml",
  };
}
