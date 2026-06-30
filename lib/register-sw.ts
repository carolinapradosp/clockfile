export async function registerServiceWorker() {
  if (typeof window === "undefined") return;

  if (!("serviceWorker" in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.getRegistration();

    if (registration) {
      console.log("[PWA] Service Worker já registrado.");
      return;
    }

    await navigator.serviceWorker.register("/sw.js");

    console.log("[PWA] Service Worker registrado.");
  } catch (error) {
    console.error("[PWA]", error);
  }
}