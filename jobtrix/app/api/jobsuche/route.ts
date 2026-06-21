import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

const API_BASE = "https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v4";

// Öffentlich bekannter Default-API-Key der offiziellen BA-Jobsuche-App.
// Die inoffizielle API erfordert keine eigene Registrierung, kann sich aber
// jederzeit ändern – daher über ARBEITSAGENTUR_API_KEY konfigurierbar.
const DEFAULT_API_KEY = "jobboerse-jobsuche";

interface ArbeitsagenturJob {
  titel?: string;
  arbeitgeber?: string;
  arbeitsort?: { ort?: string };
  refnr?: string;
  externeUrl?: string;
}

export interface JobSearchResult {
  title: string;
  company: string;
  location: string;
  description: string | null;
  url: string;
}

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

async function fetchDescription(refnr: string, apiKey: string): Promise<string | null> {
  try {
    const encoded = Buffer.from(refnr).toString("base64");
    const res = await fetch(`${API_BASE}/jobdetails/${encoded}`, {
      headers: { "X-API-Key": apiKey },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.stellenangebotsBeschreibung ?? null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!(await checkRateLimit(`jobsuche:${session.user.id}`, 30))) {
    return NextResponse.json({ error: "tooManyRequests" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const was = searchParams.get("was") ?? "";
  const wo = searchParams.get("wo") ?? "";
  const umkreis = searchParams.get("umkreis") ?? "";
  const arbeitgeber = searchParams.get("arbeitgeber") ?? "";
  const branche = searchParams.get("branche") ?? "";
  const apiKey = process.env.ARBEITSAGENTUR_API_KEY || DEFAULT_API_KEY;

  try {
    const params = new URLSearchParams();
    const combinedWas = [was, arbeitgeber, branche].filter(Boolean).join(" ");
    if (combinedWas) params.set("was", combinedWas);
    if (wo) params.set("wo", wo);
    if (umkreis) params.set("umkreis", umkreis);

    const res = await fetch(`${API_BASE}/jobs?${params.toString()}`, {
      headers: { "X-API-Key": apiKey },
    });

    if (!res.ok) {
      return NextResponse.json({ results: [] });
    }

    const data = await res.json();
    const angebote: ArbeitsagenturJob[] = Array.isArray(data?.stellenangebote) ? data.stellenangebote : [];

    const results: JobSearchResult[] = await Promise.all(
      angebote.map(async (item) => {
        const title = item.titel ?? "";
        const company = item.arbeitgeber ?? "";
        const location = item.arbeitsort?.ort ?? "";
        const refnr = item.refnr ?? "";

        if (item.externeUrl && isHttpUrl(item.externeUrl)) {
          return { title, company, location, description: null, url: item.externeUrl };
        }

        const description = refnr ? await fetchDescription(refnr, apiKey) : null;
        const url = `https://www.arbeitsagentur.de/jobsuche/jobdetail/${encodeURIComponent(refnr)}`;

        return { title, company, location, description, url };
      })
    );

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
