"use client";

import { useState, useRef, useEffect } from "react";

interface InfoTooltipProps {
  text: string;
}

export default function InfoTooltip({ text }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex items-center ml-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-4 h-4 rounded-full border border-accent text-accent text-[0.625rem] leading-none font-bold flex items-center justify-center hover:bg-accent hover:text-white transition"
        aria-label="Hilfe"
        data-testid="info-tooltip-trigger"
      >
        i
      </button>
      {open && (
        <div
          className="absolute z-50 left-1/2 -translate-x-1/2 top-6 w-64 max-w-[calc(100vw-2rem)] bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 text-xs text-text/80"
          role="tooltip"
          data-testid="info-tooltip-content"
        >
          {text}
        </div>
      )}
    </div>
  );
}
