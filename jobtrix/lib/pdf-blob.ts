import React from "react";
import { pdf } from "@react-pdf/renderer";

const MIN_PDF_SIZE = 1024;
const RETRY_DELAY_MS = 500;

export class EmptyPdfError extends Error {
  constructor() {
    super("PDF konnte nicht erzeugt werden. Bitte erneut versuchen.");
    this.name = "EmptyPdfError";
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateValidatedBlob(element: React.ReactElement): Promise<Blob> {
  const blob = await pdf(element).toBlob();
  if (blob.size >= MIN_PDF_SIZE) return blob;

  await delay(RETRY_DELAY_MS);
  const retryBlob = await pdf(element).toBlob();
  if (retryBlob.size >= MIN_PDF_SIZE) return retryBlob;

  throw new EmptyPdfError();
}
