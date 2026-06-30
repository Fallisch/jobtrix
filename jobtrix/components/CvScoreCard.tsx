"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { CvScoreResult } from "@/lib/cv-score";

const RING_RADIUS = 52;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const STRONG_THRESHOLD = 70;
const ANIMATION_DURATION_MS = 700;

function scoreColor(score: number): string {
  if (score < 40) return "#EF4444";
  if (score < 70) return "#F59E0B";
  return "#22C55E";
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function useAnimatedValue(target: number): number {
  const [value, setValue] = useState(() => (prefersReducedMotion() ? target : 0));

  useEffect(() => {
    if (prefersReducedMotion()) {
      setValue(target);
      return;
    }

    let frame: number;
    const start = performance.now();

    function step(now: number) {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / ANIMATION_DURATION_MS);
      setValue(Math.round(target * progress));
      if (progress < 1) {
        frame = requestAnimationFrame(step);
      }
    }

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return value;
}

export default function CvScoreCard({ result }: { result: CvScoreResult }) {
  const t = useTranslations("cvScore");
  const animatedTotal = useAnimatedValue(result.total);
  const color = scoreColor(result.total);
  const statusKey = result.total >= STRONG_THRESHOLD ? "statusHigh" : "statusLow";
  const offset = RING_CIRCUMFERENCE * (1 - animatedTotal / 100);

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface p-6">
      <h2 className="text-lg font-semibold text-primary dark:text-accent mb-4">{t("title")}</h2>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative w-32 h-32 shrink-0">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle cx="60" cy="60" r={RING_RADIUS} fill="none" stroke="currentColor" className="text-gray-200 dark:text-gray-700" strokeWidth="10" />
            <circle
              cx="60"
              cy="60"
              r={RING_RADIUS}
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 100ms linear, stroke 300ms ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-text">{animatedTotal}</span>
            <span className="text-xs font-medium" style={{ color }}>{t(statusKey)}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 w-full">
          <CategoryValue label={t("categoryCompleteness")} value={result.categories.completeness} />
          <CategoryValue label={t("categoryStructure")} value={result.categories.structure} />
          <CategoryValue label={t("categoryClarity")} value={result.categories.clarity} />
        </div>
      </div>

      {result.tips.length > 0 && (
        <ul className="mt-6 space-y-2">
          {result.tips.map((tip, i) => (
            <li
              key={`${tip.id}-${i}`}
              className="flex items-center justify-between gap-3 text-sm text-text bg-surface dark:bg-background rounded-lg px-3 py-2"
            >
              <span>{t(`tips.${tip.id}`, tip.context as Record<string, string | number>)}</span>
              <span className="shrink-0 font-semibold text-accent">{t("tipImpact", { impact: tip.impact })}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CategoryValue({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="text-xl font-semibold text-text">{value}</div>
      <div className="text-xs text-text/60">{label}</div>
    </div>
  );
}
