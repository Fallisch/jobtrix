"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface PricingTeaserSectionProps {
  locale: string;
  title: string;
  desc: string;
  link: string;
}

export default function PricingTeaserSection({ locale, title, desc, link }: PricingTeaserSectionProps) {
  return (
    <motion.section
      data-testid="pricing-teaser"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="py-20 px-4 text-center"
    >
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-primary dark:text-accent mb-4">{title}</h2>
        <p className="text-text/70 dark:text-white/60 mb-8">{desc}</p>
        <Link
          href={`/${locale}/pricing`}
          className="inline-block border-2 border-accent text-accent px-8 py-3 rounded-full font-semibold hover:bg-accent hover:text-white transition"
        >
          {link}
        </Link>
      </div>
    </motion.section>
  );
}
