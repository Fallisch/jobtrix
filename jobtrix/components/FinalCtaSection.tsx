"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface FinalCtaSectionProps {
  locale: string;
  title: string;
  desc: string;
  cta: string;
}

export default function FinalCtaSection({ locale, title, desc, cta }: FinalCtaSectionProps) {
  return (
    <motion.section
      data-testid="final-cta"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="py-24 px-4 text-center bg-primary dark:bg-accent/20"
    >
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white dark:text-white mb-4">{title}</h2>
        <p className="text-white/80 mb-10 text-lg">{desc}</p>
        <Link
          href={`/${locale}/register`}
          className="bg-accent text-white px-10 py-4 rounded-full font-semibold text-lg hover:brightness-110 transition shadow-lg"
        >
          {cta}
        </Link>
      </div>
    </motion.section>
  );
}
