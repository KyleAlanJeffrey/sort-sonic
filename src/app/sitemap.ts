import { MetadataRoute } from "next";
import { algorithmSlugs } from "@/algorithms/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://sortsonic.com";

  const algorithmPages = algorithmSlugs.map((slug) => ({
    url: `${baseUrl}/algorithms/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...algorithmPages,
    {
      url: `${baseUrl}/playground`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
