"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import WelcomeSlides from "@/components/WelcomeSlides";

export default function WelcomeGate() {
  const { status } = useSession();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/welcome")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && !data.hasSeenWelcome) {
          setShowWelcome(true);
        }
      })
      .catch(() => {});
  }, [status]);

  function handleDone() {
    setShowWelcome(false);
    fetch("/api/welcome", { method: "POST" }).catch(() => {});
  }

  if (!showWelcome) return null;

  return <WelcomeSlides onDone={handleDone} />;
}
