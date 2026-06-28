"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

type Status = "yes" | "no" | "partial";

const rows: { key: string; chatgpt: Status; canva: Status; jobtrix: Status }[] = [
  { key: "coverLetter", chatgpt: "yes", canva: "no", jobtrix: "yes" },
  { key: "cv", chatgpt: "yes", canva: "yes", jobtrix: "yes" },
  { key: "pdf", chatgpt: "partial", canva: "yes", jobtrix: "yes" },
  { key: "aiMatch", chatgpt: "partial", canva: "no", jobtrix: "yes" },
  { key: "email", chatgpt: "yes", canva: "no", jobtrix: "yes" },
  { key: "jobSearch", chatgpt: "no", canva: "no", jobtrix: "yes" },
  { key: "oneClick", chatgpt: "no", canva: "no", jobtrix: "yes" },
];

function Check() {
  return (
    <svg data-testid="check" width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-green-500 mx-auto">
      <path d="M5 10l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Partial() {
  return (
    <svg data-testid="partial" width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-amber-400 mx-auto">
      <path d="M10 4v7M10 14v1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function Cross() {
  return (
    <svg data-testid="cross" width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-red-400/60 mx-auto">
      <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatusIcon({ status }: { status: Status }) {
  if (status === "yes") return <Check />;
  if (status === "partial") return <Partial />;
  return <Cross />;
}

export default function ComparisonSection() {
  const t = useTranslations("comparison");

  return (
    <section data-testid="comparison" className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-primary dark:text-accent mb-12">
          {t("title")}
        </h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-surface rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left px-4 py-3 font-semibold text-text/70 dark:text-white/60">{t("feature")}</th>
                <th className="px-4 py-3 font-semibold text-text/70 dark:text-white/60 text-center">ChatGPT</th>
                <th className="px-4 py-3 font-semibold text-text/70 dark:text-white/60 text-center">Canva</th>
                <th className="px-4 py-3 font-semibold text-primary dark:text-accent text-center">JobTRIX</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="border-b last:border-b-0 border-gray-50 dark:border-gray-800/50">
                  <td className="px-4 py-3 text-text dark:text-white/80">{t(row.key)}</td>
                  <td className="px-4 py-3 text-center"><StatusIcon status={row.chatgpt} /></td>
                  <td className="px-4 py-3 text-center"><StatusIcon status={row.canva} /></td>
                  <td className="px-4 py-3 text-center"><StatusIcon status={row.jobtrix} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="px-4 py-3 text-xs text-text/50 dark:text-white/40 border-t border-gray-50 dark:border-gray-800/50">
            {t("legend")}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
