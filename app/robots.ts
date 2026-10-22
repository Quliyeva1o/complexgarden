import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

/** Şəxsi və texniki səhifələr indekslənmir (səhifələrin özündə də noindex var) */
export default function robots(): MetadataRoute.Robots {
  const privatePaths = ["sebet", "sifaris", "secilmisler", "hesab", "axtaris", "design"];
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin", ...privatePaths.flatMap((p) => ["az", "ru", "en"].map((l) => `/${l}/${p}`))],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
