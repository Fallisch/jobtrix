import React from "react";
import { ProfileData } from "@/lib/profile-storage";
import { CoverLetterDocument, CvDocument } from "@/lib/pdf-documents";
import { generateValidatedBlob, EmptyPdfError } from "@/lib/pdf-blob";

export function buildFilename(prefix: string, name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return `${prefix}.pdf`;
  const parts = trimmed.split(/\s+/).map((p) => p.replace(/[^a-zA-ZäöüÄÖÜß-]/g, "")).filter(Boolean);
  if (parts.length === 0) return `${prefix}.pdf`;
  if (parts.length === 1) return `${prefix}_${parts[0]}.pdf`;
  const nachname = parts[parts.length - 1];
  const vorname = parts.slice(0, -1).join("_");
  return `${prefix}_${nachname}_${vorname}.pdf`;
}

async function triggerDownload(element: React.ReactElement, filename: string) {
  const blob = await generateValidatedBlob(element);
  const file = new File([blob], filename, { type: "application/pdf" });
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 500);
}

export { EmptyPdfError } from "@/lib/pdf-blob";

export async function downloadCoverLetterPdf(coverLetter: string, profile: ProfileData, template: "classic" | "modern" | "traditional" | "accent" | "creative" = "classic", accentColor?: string) {
  await triggerDownload(
    React.createElement(CoverLetterDocument, { coverLetter, profile, template, accentColor }),
    buildFilename("Anschreiben", profile.name)
  );
}

export async function downloadCvPdf(cv: string, profile: ProfileData, template: "classic" | "modern" | "traditional" | "accent" | "creative" = "classic", cvStyle: "classic" | "american" = "classic", accentColor?: string) {
  await triggerDownload(
    React.createElement(CvDocument, { cv, profile, template, cvStyle, accentColor }),
    buildFilename("Lebenslauf", profile.name)
  );
}
