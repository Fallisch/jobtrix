export type DeviceKind = "android" | "ios" | "desktop";

export function detectDevice(): DeviceKind {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent.toLowerCase();
  if (/android/.test(ua)) return "android";
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  // iPadOS meldet sich teils als Mac mit Touch – als mobil behandeln.
  if (/macintosh/.test(ua) && typeof document !== "undefined" && "ontouchend" in document) {
    return "ios";
  }
  return "desktop";
}

export function isMobileDevice(): boolean {
  if (detectDevice() !== "desktop") return true;
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent.toLowerCase();
  // WebView-Browser, die blob:-URLs in neuen Tabs nicht unterstützen
  return /duckduckgo|fbav|fban|instagram|line\/|snapchat/i.test(ua);
}
