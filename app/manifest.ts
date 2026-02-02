import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MOLIP",
    short_name: "MOLIP",
    description: "molip",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#F8F8F8",
    theme_color: "#F8F8F8",
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
