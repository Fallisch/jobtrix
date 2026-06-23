/**
 * @jest-environment jsdom
 */
import { detectDevice, isMobileDevice } from "@/lib/device";

function setUserAgent(ua: string) {
  Object.defineProperty(navigator, "userAgent", { value: ua, configurable: true });
}

describe("detectDevice", () => {
  it("erkennt Android", () => {
    setUserAgent("Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36");
    expect(detectDevice()).toBe("android");
    expect(isMobileDevice()).toBe(true);
  });

  it("erkennt iOS (iPhone)", () => {
    setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15");
    expect(detectDevice()).toBe("ios");
    expect(isMobileDevice()).toBe(true);
  });

  it("erkennt Desktop", () => {
    setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120");
    expect(detectDevice()).toBe("desktop");
    expect(isMobileDevice()).toBe(false);
  });
});
