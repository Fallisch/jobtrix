/**
 * @jest-environment jsdom
 */
import { removeBackground } from "@/lib/remove-background";

class MockImage {
  width = 10;
  height = 10;
  onload: (() => void) | null = null;
  onerror: ((e: Event) => void) | null = null;
  set src(_: string) {
    Promise.resolve().then(() => this.onload?.());
  }
}

const REMOVED = "data:image/jpeg;base64,removed";
const ORIGINAL = "data:image/jpeg;base64,original";

let originalImage: typeof global.Image;

beforeEach(() => {
  originalImage = global.Image;
  (global as unknown as { Image: unknown }).Image = MockImage;
  jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    drawImage: jest.fn(),
    getImageData: jest.fn(() => ({ data: new Uint8ClampedArray(4 * 4 * 4), width: 4, height: 4 })),
    putImageData: jest.fn(),
  } as unknown as CanvasRenderingContext2D);
  jest.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(REMOVED);
});

afterEach(() => {
  global.Image = originalImage;
  jest.restoreAllMocks();
});

describe("removeBackground", () => {
  it("gibt ein freigestelltes Bild als Data-URL zurück", async () => {
    const result = await removeBackground(ORIGINAL);
    expect(result).toBe(REMOVED);
  });

  it("verlässt das Gerät nicht: ruft beim Freistellen keinen Netzwerk-Dienst auf", async () => {
    const fetchSpy = jest.fn();
    (global as unknown as { fetch: unknown }).fetch = fetchSpy;
    await removeBackground(ORIGINAL);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("meldet sichtbaren Fortschritt von 0 bis 1", async () => {
    const progress: number[] = [];
    await removeBackground(ORIGINAL, { onProgress: (p) => progress.push(p) });
    expect(progress[0]).toBe(0);
    expect(progress[progress.length - 1]).toBe(1);
  });

  it("gibt das Original zurück, wenn kein Canvas-Kontext verfügbar ist (kein harter Fehler)", async () => {
    (HTMLCanvasElement.prototype.getContext as jest.Mock).mockReturnValue(null);
    const result = await removeBackground(ORIGINAL);
    expect(result).toBe(ORIGINAL);
  });
});
