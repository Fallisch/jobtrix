import React from "react";
import { pdf } from "@react-pdf/renderer";
import { ProfileData } from "@/lib/profile-storage";
import { CoverLetterDocument, CvDocument } from "@/lib/pdf-documents";

function buildFilename(prefix: string, name: string): string {
  const sanitized = name.trim().replace(/\s+/g, "_").replace(/[^a-zA-ZäöüÄÖÜß_-]/g, "");
  return sanitized ? `${prefix}_${sanitized}.pdf` : `${prefix}.pdf`;
}

async function triggerDownload(element: React.ReactElement, filename: string) {
  const blob = await pdf(element).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

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
