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
  return detectDevice() !== "desktop";
}
