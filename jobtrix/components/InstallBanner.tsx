"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string; platform: string }>;
}

export default function InstallBanner() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!promptEvent) return null;

  return (
    <AnimatePresence>
      <motion.div
        role="region"
        aria-label="App installieren"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 bg-primary text-white p-4 flex items-center justify-between shadow-lg z-50"
      >
        <span className="text-sm font-medium">
          JobTRIX auf dem Startbildschirm installieren
        </span>
        <div className="flex gap-2">
          <button
            aria-label="Installieren"
            onClick={() => promptEvent.prompt()}
            className="bg-accent text-white px-4 py-2 rounded-md text-sm font-semibold hover:brightness-110 transition"
          >
            Installieren
          </button>
          <button
            aria-label="Schließen"
            onClick={() => setPromptEvent(null)}
            className="text-white/70 hover:text-white text-sm px-2"
          >
            ✕
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
