import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-bewusste Navigation: setzt das URL-Locale-Präfix korrekt gemäß der
// next-intl-Routing-Konfiguration (statt manuellem Segment-Tausch, #227).
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
