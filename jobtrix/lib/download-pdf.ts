import React from "react";
import { pdf } from "@react-pdf/renderer";
import { ProfileData } from "@/lib/profile-storage";
import { CoverLetterDocument, CvDocument } from "@/lib/pdf-documents";

async function triggerDownload(element: React.ReactElement, filename: string) {
  const blob = await pdf(element).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadCoverLetterPdf(coverLetter: string, profile: ProfileData) {
  await triggerDownload(
    React.createElement(CoverLetterDocument, { coverLetter, profile }),
    "anschreiben.pdf"
  );
}

export async function downloadCvPdf(cv: string, profile: ProfileData) {
  await triggerDownload(
    React.createElement(CvDocument, { cv, profile }),
    "lebenslauf.pdf"
  );
}
