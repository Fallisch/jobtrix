"use client";

import React from "react";
import { pdf } from "@react-pdf/renderer";

export async function openPdfPreview(document: React.ReactElement) {
  const blob = await pdf(document).toBlob();
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}
