import { compressImage } from "@/lib/image-compress";

class MockImage {
  width = 1000;
  height = 800;
  onload: (() => void) | null = null;
  onerror: ((e: Event) => void) | null = null;

  set src(_: string) {
    Promise.resolve().then(() => this.onload?.());
  }
}

const COMPRESSED_DATA_URL = "data:image/jpeg;base64,compressedsmall";

let originalImage: typeof global.Image;

beforeEach(() => {
  originalImage = global.Image;
  (global as unknown as { Image: unknown }).Image = MockImage;
  jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    drawImage: jest.fn(),
  } as unknown as CanvasRenderingContext2D);
  jest.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(COMPRESSED_DATA_URL);
});

afterEach(() => {
  global.Image = originalImage;
  jest.restoreAllMocks();
});

describe("compressImage", () => {
  it("gibt eine Data-URL zurück", async () => {
    const file = new File(["imagedata"], "test.jpg", { type: "image/jpeg" });
    const result = await compressImage(file);
    expect(typeof result).toBe("string");
    expect(result).toMatch(/^data:/);
  });

  it("gibt die Canvas-Ausgabe zurück (komprimiertes Ergebnis)", async () => {
    const file = new File(["imagedata"], "test.jpg", { type: "image/jpeg" });
    const result = await compressImage(file);
    expect(result).toBe(COMPRESSED_DATA_URL);
  });

  it("skaliert große Bilder auf maximal 512px in der längsten Seite", async () => {
    let capturedCanvas: HTMLCanvasElement | null = null;
    jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(function (
      this: HTMLCanvasElement
    ) {
      capturedCanvas = this;
      return { drawImage: jest.fn() } as unknown as CanvasRenderingContext2D;
    });

    const file = new File(["imagedata"], "test.jpg", { type: "image/jpeg" });
    await compressImage(file);

    expect(capturedCanvas).not.toBeNull();
    expect(capturedCanvas!.width).toBeLessThanOrEqual(512);
    expect(capturedCanvas!.height).toBeLessThanOrEqual(512);
  });
});
