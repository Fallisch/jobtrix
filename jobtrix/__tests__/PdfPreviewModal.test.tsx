/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { openPdfPreview, closePdfPreview, PdfPreviewHost } from "@/components/PdfPreviewModal";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

function setUserAgent(ua: string) {
  Object.defineProperty(navigator, "userAgent", { value: ua, configurable: true });
}

const MOBILE_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15";
const DESKTOP_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120";

const sampleDoc = React.createElement("div", null, "doc");

beforeEach(() => {
  global.URL.createObjectURL = jest.fn(() => "blob:preview-url");
  global.URL.revokeObjectURL = jest.fn();
});

afterEach(() => {
  // Modul-weiten Store zwischen Tests zurücksetzen.
  act(() => {
    closePdfPreview();
  });
});

describe("PdfPreviewHost (mobile)", () => {
  beforeEach(() => setUserAgent(MOBILE_UA));

  it("rendert initial nichts", () => {
    render(<PdfPreviewHost />);
    expect(screen.queryByTestId("pdf-preview-modal")).not.toBeInTheDocument();
  });

  it("zeigt auf Mobilgeräten ein In-App-Modal mit eingebettetem PDF ohne window.open", async () => {
    const openSpy = jest.spyOn(window, "open").mockImplementation(() => null);
    render(<PdfPreviewHost />);

    await act(async () => {
      await openPdfPreview(sampleDoc);
    });

    expect(await screen.findByTestId("pdf-preview-modal")).toBeInTheDocument();
    const frame = await screen.findByTestId("pdf-preview-frame");
    expect(frame).toHaveAttribute("src", "blob:preview-url");
    // Mobil: kein Popup-Versuch → window.open darf nicht aufgerufen werden.
    expect(openSpy).not.toHaveBeenCalled();
    openSpy.mockRestore();
  });

  it("bietet einen Download- und Neuer-Tab-Fallback im Modal", async () => {
    render(<PdfPreviewHost />);
    await act(async () => {
      await openPdfPreview(sampleDoc);
    });

    expect(await screen.findByTestId("pdf-preview-download")).toHaveAttribute("download", "Vorschau.pdf");
    expect(screen.getByTestId("pdf-preview-newtab")).toHaveAttribute("href", "blob:preview-url");
  });

  it("schließt das Modal über den Schließen-Button", async () => {
    render(<PdfPreviewHost />);
    await act(async () => {
      await openPdfPreview(sampleDoc);
    });
    expect(await screen.findByTestId("pdf-preview-modal")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("pdf-preview-close"));

    await waitFor(() => {
      expect(screen.queryByTestId("pdf-preview-modal")).not.toBeInTheDocument();
    });
  });
});

describe("openPdfPreview (desktop)", () => {
  beforeEach(() => setUserAgent(DESKTOP_UA));

  it("öffnet auf dem Desktop weiterhin einen neuen Tab", async () => {
    const fakeWin = { closed: false, location: { href: "" }, close: jest.fn() } as unknown as Window;
    const openSpy = jest.spyOn(window, "open").mockReturnValue(fakeWin);
    render(<PdfPreviewHost />);

    await act(async () => {
      await openPdfPreview(sampleDoc);
    });

    expect(openSpy).toHaveBeenCalledWith("", "_blank");
    await waitFor(() => {
      expect((fakeWin as unknown as { location: { href: string } }).location.href).toBe("blob:preview-url");
    });
    // Kein In-App-Modal, wenn der Tab erfolgreich geöffnet wurde.
    expect(screen.queryByTestId("pdf-preview-modal")).not.toBeInTheDocument();
    openSpy.mockRestore();
  });

  it("zeigt das In-App-Modal als Fallback, wenn das Popup blockiert wird", async () => {
    const openSpy = jest.spyOn(window, "open").mockReturnValue(null);
    render(<PdfPreviewHost />);

    await act(async () => {
      await openPdfPreview(sampleDoc);
    });

    expect(openSpy).toHaveBeenCalledWith("", "_blank");
    expect(await screen.findByTestId("pdf-preview-modal")).toBeInTheDocument();
    openSpy.mockRestore();
  });
});
