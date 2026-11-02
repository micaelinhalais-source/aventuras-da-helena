// Single guarded service-worker registration. Never registers in dev,
// iframes or Lovable preview hosts; unregisters stale app workers there.
const SW_URL = "/sw.js";

function refused(): boolean {
  if (!import.meta.env.PROD) return true;
  if (window.self !== window.top) return true;
  const url = new URL(window.location.href);
  if (url.searchParams.get("sw") === "off") return true;
  const h = window.location.hostname.toLowerCase();
  const previewLabel = /^(?:id-preview|preview)(?:-[a-z0-9]+)?--.+$/;
  for (const d of [".lovable.app", ".gpt-eng.com", ".gptengineer.run"]) {
    if (h.endsWith(d)) {
      const label = h.slice(0, -d.length).split(".")[0];
      if (previewLabel.test(label)) return true;
      if (label === "project--c2e560e9-786d-4189-bd29-1c86c73595a8-dev") return true;
    }
  }
  for (const d of ["lovableproject.com", "lovableproject-dev.com", "beta.lovable.dev"]) {
    if (h === d || h.endsWith(`.${d}`)) return true;
  }
  return false;
}

async function unregisterApp() {
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    regs.filter((r) => r.active?.scriptURL.endsWith(SW_URL) || r.installing?.scriptURL.endsWith(SW_URL) || r.waiting?.scriptURL.endsWith(SW_URL)).map((r) => r.unregister()),
  );
}

export function registerPWA() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  if (refused()) {
    void unregisterApp();
    return;
  }
  void navigator.serviceWorker.register(SW_URL, { scope: "/" });
}
