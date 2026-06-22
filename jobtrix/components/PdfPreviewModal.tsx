"use client";

import React from "react";
import { pdf } from "@react-pdf/renderer";

export async function openPdfPreview(document: React.ReactElement) {
  const blob = await pdf(document).toBlob();
  const url = URL.createObjectURL(blob);
  const opened = window.open(url, "_blank");
  if (!opened) {
    const a = window.document.createElement("a");
    a.href = url;
    a.download = "Vorschau.pdf";
    a.style.display = "none";
    window.document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 500);
  }
}
