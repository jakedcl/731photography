import type { MetadataRoute } from "next";

import { client } from "@/sanity/lib/client";
import { PHOTO_SLUGS_QUERY } from "@/sanity/lib/queries";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://thomaslurker.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/prints",
    "/about",
    "/book",
    "/contact",
    "/shipping",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" || path === "/prints" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/prints" ? 0.9 : 0.6,
  }));

  let photoRoutes: MetadataRoute.Sitemap = [];
  try {
    const slugs = await client
      .withConfig({ useCdn: false })
      .fetch<{ slug: string }[]>(PHOTO_SLUGS_QUERY);
    photoRoutes = (slugs || []).map((item) => ({
      url: `${siteUrl}/prints/${item.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    photoRoutes = [];
  }

  return [...staticRoutes, ...photoRoutes];
}
