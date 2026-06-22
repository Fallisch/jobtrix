"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

const SLIDE_ICONS = [
  <svg key="1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21" /></svg>,
  <svg key="2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0" /></svg>,
  <svg key="3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>,
  <svg key="4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>,
  <svg key="5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" /></svg>,
];

const TOTAL_SLIDES = 5;

interface WelcomeSlidesProps {
  onDone: () => void;
}

export default function WelcomeSlides({ onDone }: WelcomeSlidesProps) {
  const t = useTranslations("welcome");
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  function next() {
    if (current === TOTAL_SLIDES - 1) {
      onDone();
    } else {
      setDirection(1);
      setCurrent((c) => c + 1);
    }
  }

  function prev() {
    if (current > 0) {
      setDirection(-1);
      setCurrent((c) => c - 1);
    }
  }

  const slideKeys = ["slide1", "slide2", "slide3", "slide4", "slide5"] as const;
  const key = slideKeys[current];

  return (
    <div className="fixed inset-0 z-[100] bg-primary flex items-center justify-center" data-testid="welcome-slides">
      <div className="max-w-md w-full mx-4 text-center space-y-8">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            initial={{ opacity: 0, x: direction * 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 100 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="text-accent flex justify-center">
              {SLIDE_ICONS[current]}
            </div>
            <h2 className="text-2xl font-bold text-white">{t(`${key}Title`)}</h2>
            <p className="text-white/70 text-base">{t(`${key}Text`)}</p>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex justify-center gap-2">
          {slideKeys.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${i === current ? "bg-accent" : "bg-white/30"}`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={onDone}
            className="text-sm text-white/50 hover:text-white transition min-h-[44px]"
            data-testid="welcome-skip"
          >
            {t("skip")}
          </button>
          <div className="flex gap-3">
            {current > 0 && (
              <button
                type="button"
                onClick={prev}
                className="text-sm text-white/70 hover:text-white transition min-h-[44px] px-4"
              >
                &larr;
              </button>
            )}
            <button
              type="button"
              onClick={next}
              className="bg-accent text-white px-6 py-2 rounded-full font-semibold text-sm hover:brightness-110 transition min-h-[44px]"
              data-testid="welcome-next"
            >
              {current === TOTAL_SLIDES - 1 ? t("done") : t("next")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
