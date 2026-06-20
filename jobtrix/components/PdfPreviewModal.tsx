"use client";

import { useEffect, useState } from "react";
import React from "react";
import { pdf } from "@react-pdf/renderer";
import { useTranslations } from "next-intl";

interface PdfPreviewModalProps {
  document: React.ReactElement;
  onClose: () => void;
}

export default function PdfPreviewModal({ document: pdfDocument, onClose }: PdfPreviewModalProps) {
  const t = useTranslations("generate");
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let revoked = false;
    pdf(pdfDocument)
      .toBlob()
      .then((blob) => {
        if (revoked) return;
        setUrl(URL.createObjectURL(blob));
      })
      .catch(() => setError(true));

    return () => {
      revoked = true;
      if (url) URL.revokeObjectURL(url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-surface rounded-2xl shadow-2xl w-full max-w-3xl h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-base font-semibold text-primary dark:text-accent">{t("pdfPreviewTitle")}</h3>
          <button
            onClick={onClose}
            className="text-text/50 hover:text-text text-xl leading-none px-2"
            aria-label={t("pdfPreviewClose")}
          >
            &times;
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          {error ? (
            <p className="p-8 text-center text-red-600">{t("pdfPreviewError")}</p>
          ) : url ? (
            <iframe src={url} className="w-full h-full" title="PDF Vorschau" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
