import { test, expect, Page } from "@playwright/test";

function parseRgb(value: string): [number, number, number] {
  const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) throw new Error(`Unerwartetes Farbformat: ${value}`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const channel = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(colorA: string, colorB: string): number {
  const la = relativeLuminance(parseRgb(colorA));
  const lb = relativeLuminance(parseRgb(colorB));
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

const MIN_CONTRAST = 4.5;

async function colorsOf(page: Page, selector: string): Promise<{ color: string; backgroundColor: string }> {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) throw new Error(`Element nicht gefunden: ${sel}`);
    const color = getComputedStyle(el).color;
    let bgEl: Element | null = el;
    let backgroundColor = getComputedStyle(bgEl).backgroundColor;
    while (backgroundColor === "rgba(0, 0, 0, 0)" && bgEl.parentElement) {
      bgEl = bgEl.parentElement;
      backgroundColor = getComputedStyle(bgEl).backgroundColor;
    }
    return { color, backgroundColor };
  }, selector);
}

test.describe("Issue #42 – Dark Mode: Startseite, Login, Registrierung, Passwort & Bezahlseite (ohne Anmeldung)", () => {
  test("Story: / übernimmt die System-Dunkeldarstellung und zeigt kontrastreiche Inhalte", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/de");
    await expect(page.locator("html")).toHaveClass(/dark/);

    const { color: headingColor, backgroundColor: pageBg } = await colorsOf(page, "h1");
    expect(contrastRatio(headingColor, pageBg)).toBeGreaterThanOrEqual(MIN_CONTRAST);
  });

  test("Story: /login zeigt im Dark Mode kontrastreiches Formular ohne aktive Anmeldung", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/de/login");
    await expect(page.locator("html")).toHaveClass(/dark/);

    const { color: headingColor, backgroundColor: pageBg } = await colorsOf(page, "h1");
    expect(contrastRatio(headingColor, pageBg)).toBeGreaterThanOrEqual(MIN_CONTRAST);

    const { backgroundColor: cardBg } = await colorsOf(page, "form");
    expect(cardBg).not.toBe("rgb(255, 255, 255)");

    const { backgroundColor: inputBg } = await colorsOf(page, "#email");
    expect(inputBg).not.toBe("rgb(255, 255, 255)");
  });

  test("Story: /register zeigt im Dark Mode kontrastreiches Formular ohne aktive Anmeldung", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/de/register");
    await expect(page.locator("html")).toHaveClass(/dark/);

    const { color: headingColor, backgroundColor: pageBg } = await colorsOf(page, "h1");
    expect(contrastRatio(headingColor, pageBg)).toBeGreaterThanOrEqual(MIN_CONTRAST);

    const { backgroundColor: inputBg } = await colorsOf(page, "#email");
    expect(inputBg).not.toBe("rgb(255, 255, 255)");
  });

  test("Story: /forgot-password und /reset-password zeigen im Dark Mode kontrastreiche Inhalte", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });

    await page.goto("/de/forgot-password");
    await expect(page.locator("html")).toHaveClass(/dark/);
    const { color: forgotHeadingColor, backgroundColor: forgotBg } = await colorsOf(page, "h1");
    expect(contrastRatio(forgotHeadingColor, forgotBg)).toBeGreaterThanOrEqual(MIN_CONTRAST);
    const { backgroundColor: forgotInputBg } = await colorsOf(page, "#email");
    expect(forgotInputBg).not.toBe("rgb(255, 255, 255)");

    await page.goto("/de/reset-password?token=invalid-token");
    await expect(page.locator("html")).toHaveClass(/dark/);
    const { color: resetHeadingColor, backgroundColor: resetBg } = await colorsOf(page, "h1");
    expect(contrastRatio(resetHeadingColor, resetBg)).toBeGreaterThanOrEqual(MIN_CONTRAST);
    const { backgroundColor: resetInputBg } = await colorsOf(page, "#password");
    expect(resetInputBg).not.toBe("rgb(255, 255, 255)");
  });

  test("Story: /pricing zeigt im Dark Mode kontrastreiche Karten ohne aktive Anmeldung", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/de/pricing");
    await expect(page.locator("html")).toHaveClass(/dark/);

    const { color: headingColor, backgroundColor: pageBg } = await colorsOf(page, "h1");
    expect(contrastRatio(headingColor, pageBg)).toBeGreaterThanOrEqual(MIN_CONTRAST);

    const { color: cardHeadingColor, backgroundColor: cardBg } = await colorsOf(page, "h2");
    expect(cardBg).not.toBe("rgb(255, 255, 255)");
    expect(contrastRatio(cardHeadingColor, cardBg)).toBeGreaterThanOrEqual(MIN_CONTRAST);
  });
});
