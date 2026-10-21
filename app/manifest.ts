import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

/** PWA manifest — telefonda "Ana ekrana əlavə et" zamanı ad və ikon */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} — ${siteConfig.tagline}`,
    short_name: siteConfig.name,
    start_url: "/az",
    display: "standalone",
    background_color: "#F7F5EE",
    theme_color: "#153D2E",
    icons: [
      { src: "/icons/favicon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
