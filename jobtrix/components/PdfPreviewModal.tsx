"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { isMobileDevice } from "@/lib/device";
import { generateValidatedBlob } from "@/lib/pdf-blob";

interface PreviewState {
  doc: React.ReactElement | null;
  filename: string;
}

type Listener = (state: PreviewState) => void;

let currentState: PreviewState = { doc: null, filename: "Vorschau.pdf" };
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l(currentState));
}

function setPreviewDoc(doc: React.ReactElement | null, filename = "Vorschau.pdf") {
  currentState = { doc, filename };
  emit();
}

export function closePdfPreview() {
  setPreviewDoc(null, "Vorschau.pdf");
}

function triggerDownload(url: string, filename: string) {
  const a = window.document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  window.document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    window.document.body.removeChild(a);
  }, 500);
}

/**
 * Öffnet eine PDF-Vorschau.
 * - Mobil: zuverlässige In-App-Vorschau (kein window.open, das mobile
 *   Popup-Blocker verhindern). Der Host rendert ein Modal mit eingebettetem PDF.
 * - Desktop: weiterhin neuer Tab (wie bisher). Wird das Popup blockiert, greift
 *   als Fallback dasselbe In-App-Modal (kein stiller Fehlschlag).
 */
export async function openPdfPreview(document: React.ReactElement, filename = "Vorschau.pdf") {
  if (isMobileDevice()) {
    setPreviewDoc(document, filename);
    return;
  }

  // Desktop: Tab synchron im Klick-Kontext öffnen, dann Blob laden.
  const win = window.open("", "_blank");
  try {
    const blob = await generateValidatedBlob(document);
    const url = URL.createObjectURL(blob);
    if (win && !win.closed) {
      win.location.href = url;
      return;
    }
    // Popup blockiert → Download anstoßen und In-App-Modal als Rückmeldung zeigen.
    triggerDownload(url, filename);
    setPreviewDoc(document, filename);
  } catch {
    win?.close();
    setPreviewDoc(document, filename);
  }
}

export function PdfPreviewHost() {
  const t = useTranslations("generate");
  const [doc, setDoc] = useState<React.ReactElement | null>(currentState.doc);
  const [filename, setFilename] = useState(currentState.filename);
  const [url, setUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const listener: Listener = (state) => {
      setDoc(state.doc);
      setFilename(state.filename);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  useEffect(() => {
    if (!doc) {
      setUrl(null);
      setStatus("loading");
      return;
    }
    let active = true;
    let objectUrl: string | null = null;
    setStatus("loading");
    setUrl(null);
    generateValidatedBlob(doc)
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
        setStatus("ready");
      })
      .catch(() => {
        if (active) setStatus("error");
      });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [doc]);

  if (!doc) return null;

  function close() {
    setPreviewDoc(null);
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-black/70"
      role="dialog"
      aria-modal="true"
      aria-label={t("pdfPreviewTitle")}
      data-testid="pdf-preview-modal"
    >
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-surface px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-base font-semibold text-primary dark:text-accent">{t("pdfPreviewTitle")}</h2>
        <div className="flex items-center gap-2">
          {url && (
            <>
              <a
                href={url}
                download={filename}
                data-testid="pdf-preview-download"
                className="rounded-full border border-accent text-accent px-3.5 py-1.5 text-sm font-semibold hover:bg-accent hover:text-white transition min-h-[44px] inline-flex items-center"
              >
                {t("pdfPreviewDownload")}
              </a>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="pdf-preview-newtab"
                className="rounded-full border border-gray-300 dark:border-gray-600 text-text/70 px-3.5 py-1.5 text-sm font-semibold hover:border-accent hover:text-accent transition min-h-[44px] inline-flex items-center"
              >
                {t("pdfPreviewOpenNewTab")}
              </a>
            </>
          )}
          <button
            type="button"
            onClick={close}
            data-testid="pdf-preview-close"
            aria-label={t("pdfPreviewClose")}
            className="rounded-full border border-gray-300 dark:border-gray-600 text-text/70 px-3.5 py-1.5 text-sm font-semibold hover:border-accent hover:text-accent transition min-h-[44px]"
          >
            {t("pdfPreviewClose")}
          </button>
        </div>
      </div>

      <div className="flex-1 bg-gray-100 dark:bg-gray-900 relative">
        {status === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center" data-testid="pdf-preview-loading">
            <div className="animate-spin h-10 w-10 rounded-full border-4 border-accent/20 border-t-accent" />
          </div>
        )}
        {status === "error" && (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
            <p className="text-sm text-text/80" data-testid="pdf-preview-error">{t("pdfPreviewError")}</p>
          </div>
        )}
        {status === "ready" && url && (
          <iframe
            src={url}
            title={t("pdfPreviewTitle")}
            data-testid="pdf-preview-frame"
            className="w-full h-full border-0"
          />
        )}
      </div>

      <p className="bg-white dark:bg-surface px-4 py-2 text-xs text-text/60 border-t border-gray-200 dark:border-gray-700">
        {t("pdfPreviewHint")}
      </p>
    </div>
  );
}
