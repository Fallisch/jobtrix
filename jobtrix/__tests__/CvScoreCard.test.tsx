import { render, screen, waitFor } from "@testing-library/react";
import CvScoreCard from "@/components/CvScoreCard";
import type { CvScoreResult } from "@/lib/cv-score";
import de from "@/messages/de.json";
import en from "@/messages/en.json";

jest.mock("next-intl", () => {
  const dict = require("@/messages/de.json");

  return {
    useTranslations:
      (namespace: string) =>
      (key: string, params?: Record<string, unknown>) => {
        const namespaceDict = (dict as Record<string, unknown>)[namespace] as
          | Record<string, unknown>
          | undefined;
        const raw = key
          .split(".")
          .reduce<unknown>((acc, part) => (acc as Record<string, unknown> | undefined)?.[part], namespaceDict);
        let value = typeof raw === "string" ? raw : key;
        if (params) {
          for (const [k, v] of Object.entries(params)) {
            value = value.replace(`{${k}}`, String(v));
          }
        }
        return value;
      },
  };
});

function mockMatchMedia(reducedMotion: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: reducedMotion,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })),
  });
}

const lowResult: CvScoreResult = {
  total: 18,
  categories: { completeness: 11, structure: 0, clarity: 0 },
  tips: [
    { id: "missing-name", impact: 15 },
    { id: "missing-experience", impact: 15 },
    { id: "missing-photo", impact: 10 },
  ],
};

const highResult: CvScoreResult = {
  total: 92,
  categories: { completeness: 100, structure: 88, clarity: 90 },
  tips: [{ id: "missing-photo", impact: 10 }],
};

describe("CvScoreCard", () => {
  beforeEach(() => {
    mockMatchMedia(true);
  });

  it("zeigt den Score-Wert an (bei reduced motion sofort)", () => {
    render(<CvScoreCard result={lowResult} />);
    expect(screen.getByText("18")).toBeInTheDocument();
  });

  it("zeigt die drei Kategorie-Werte an", () => {
    render(<CvScoreCard result={highResult} />);
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("88")).toBeInTheDocument();
    expect(screen.getByText("90")).toBeInTheDocument();
  });

  it("zeigt die Tipp-Texte mit Impact-Badge an", () => {
    render(<CvScoreCard result={lowResult} />);
    expect(screen.getByText(de.cvScore.tips["missing-name"])).toBeInTheDocument();
    expect(screen.getAllByText("+15").length).toBeGreaterThan(0);
    expect(screen.getByText("+10")).toBeInTheDocument();
  });

  it("zeigt bei niedrigem Score das Status-Wort 'Verbesserbar'", () => {
    render(<CvScoreCard result={lowResult} />);
    expect(screen.getByText(de.cvScore.statusLow)).toBeInTheDocument();
  });

  it("zeigt bei hohem Score das Status-Wort 'Stark'", () => {
    render(<CvScoreCard result={highResult} />);
    expect(screen.getByText(de.cvScore.statusHigh)).toBeInTheDocument();
  });

  it("respektiert prefers-reduced-motion: zeigt sofort den Endwert ohne Hochzählen", () => {
    mockMatchMedia(true);
    render(<CvScoreCard result={highResult} />);
    expect(screen.getByText("92")).toBeInTheDocument();
  });

  it("zählt den Wert hoch, wenn keine reduced-motion-Präferenz gesetzt ist", async () => {
    mockMatchMedia(false);
    render(<CvScoreCard result={highResult} />);
    await waitFor(() => expect(screen.getByText("92")).toBeInTheDocument());
  });
});

describe("cvScore i18n-Konsistenz", () => {
  function collectKeys(obj: Record<string, unknown>, prefix = ""): string[] {
    return Object.entries(obj).flatMap(([key, value]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === "object" && !Array.isArray(value)) {
        return collectKeys(value as Record<string, unknown>, path);
      }
      return [path];
    });
  }

  it("enthält dieselben Keys in de.json und en.json", () => {
    const deKeys = collectKeys(de.cvScore).sort();
    const enKeys = collectKeys(en.cvScore).sort();
    expect(enKeys).toEqual(deKeys);
  });

  it("enthält nicht-leere Texte für alle Keys in beiden Sprachen", () => {
    function getByPath(obj: Record<string, unknown>, path: string): unknown {
      return path.split(".").reduce<unknown>((acc, part) => (acc as Record<string, unknown> | undefined)?.[part], obj);
    }
    for (const key of collectKeys(de.cvScore)) {
      const deValue = getByPath(de.cvScore, key) as string;
      const enValue = getByPath(en.cvScore, key) as string;
      expect(deValue.length).toBeGreaterThan(0);
      expect(enValue.length).toBeGreaterThan(0);
    }
  });
});
