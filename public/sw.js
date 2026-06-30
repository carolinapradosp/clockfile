const CACHE_NAME = "clockfile-v1";

self.addEventListener("install", (event) => {
  console.log("[SW] Instalado");

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Ativado");

  event.waitUntil(clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Na próxima etapa adicionaremos cache.
});