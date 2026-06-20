"use client";

import { motion } from "framer-motion";

interface Feature {
  title: string;
  desc: string;
}

interface FeaturesSectionProps {
  title: string;
  features: Feature[];
}

const tileVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" as const },
  }),
};

export default function FeaturesSection({ title, features }: FeaturesSectionProps) {
  return (
    <section data-testid="features" className="py-20 px-4 bg-primary/5 dark:bg-white/5">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-primary dark:text-accent mb-12">
          {title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              data-testid="feature-tile"
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={tileVariants}
              className="bg-background dark:bg-white/10 rounded-2xl p-6 shadow-sm"
            >
              <h3 className="font-semibold text-primary dark:text-white mb-2">{f.title}</h3>
              <p className="text-sm text-text/70 dark:text-white/60">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
