"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface HeroSectionProps {
  locale: string;
  headline: string;
  subline: string;
  cta: string;
  freeBadge: string;
}

export default function HeroSection({ locale, headline, subline, cta, freeBadge }: HeroSectionProps) {
  return (
    <motion.section
      data-testid="hero"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 text-center"
    >
      <h1 className="text-5xl sm:text-6xl font-extrabold text-primary dark:text-accent mb-6 leading-tight">
        {headline}
      </h1>
      <p className="text-lg sm:text-xl text-text/70 dark:text-white/60 max-w-xl mb-10">
        {subline}
      </p>
      <Link
        href={`/${locale}/register`}
        className="bg-accent text-white px-10 py-4 rounded-full font-semibold text-lg min-h-[44px] hover:shadow-md hover:scale-[1.02] transition-all duration-200 shadow-sm"
      >
        {cta}
      </Link>
      <p className="mt-4 text-sm font-medium text-accent dark:text-accent/80">
        {freeBadge}
      </p>
    </motion.section>
  );
}
