import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ludo Party",
    short_name: "Ludo Party",
    description: "Ludo Party game app",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#8b2bcf",
    theme_color: "#8b2bcf",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/maskable-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
