"use client";

import { motion } from "framer-motion";

interface Step {
  title: string;
  desc: string;
}

interface HowItWorksSectionProps {
  title: string;
  steps: [Step, Step, Step];
}

const stepVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5, ease: "easeOut" },
  }),
};

export default function HowItWorksSection({ title, steps }: HowItWorksSectionProps) {
  return (
    <section data-testid="how-it-works" className="py-20 px-4 bg-background dark:bg-background">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-primary dark:text-accent mb-12">
          {title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              data-testid="step"
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stepVariants}
              className="flex flex-col items-center text-center"
            >
              <span className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center text-xl font-bold mb-4">
                {i + 1}
              </span>
              <h3 className="text-lg font-semibold text-primary dark:text-white mb-2">{step.title}</h3>
              <p className="text-text/70 dark:text-white/60 text-sm">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
