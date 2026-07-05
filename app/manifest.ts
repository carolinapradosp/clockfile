import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Clockfile",
    short_name: "Clockfile",
    description: "Controle de horas trabalhadas",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0f172a",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-72.jpg",
        sizes: "72x72",
        type: "image/jpeg",
      },
      {
        src: "/icons/icon-96.jpg",
        sizes: "96x96",
        type: "image/jpeg",
      },
      {
        src: "/icons/icon-128.jpg",
        sizes: "128x128",
        type: "image/jpeg",
      },
      {
        src: "/icons/icon-192.jpg",
        sizes: "192x192",
        type: "image/jpeg",
      },
      {
        src: "/icons/icon-256.jpg",
        sizes: "256x256",
        type: "image/jpeg",
      },
      {
        src: "/icons/icon-512.jpg",
        sizes: "512x512",
        type: "image/jpeg",
      }
    ],
  };
}