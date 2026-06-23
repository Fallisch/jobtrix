// On-Device Hintergrund-Entfernung. Läuft vollständig im Browser des Nutzers –
// das Foto verlässt das Gerät nicht (kein Netzwerk-Call). Bewusst dependency-frei
// (Canvas-basiert) und hinter einer stabilen Schnittstelle, sodass später ein
// stärkeres On-Device-Segmentierungsmodell dahinter ausgetauscht werden kann.
//
// Dieses Modul wird von den Formularen per dynamischem import() nur bei Bedarf
// geladen, damit es den initialen App-Start nicht belastet.

export interface RemoveBackgroundOptions {
  onProgress?: (progress: number) => void;
  /** Ziel-Hintergrundfarbe des freigestellten Fotos (Standard: Weiß). */
  background?: { r: number; g: number; b: number };
  /** Toleranz für die Hintergrund-Erkennung (0..1, Standard 0.2). */
  tolerance?: number;
}

const MAX_COLOR_DISTANCE = Math.sqrt(3 * 255 * 255);

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Bild konnte nicht geladen werden"));
    img.src = src;
  });
}

function normalizedColorDistance(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number
): number {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return Math.sqrt(dr * dr + dg * dg + db * db) / MAX_COLOR_DISTANCE;
}

function floodFillBackground(
  imageData: ImageData,
  background: { r: number; g: number; b: number },
  tolerance: number,
  onProgress?: (progress: number) => void
) {
  const { data, width, height } = imageData;
  const total = width * height;
  if (total === 0) return;

  const visited = new Uint8Array(total);
  const corners = [0, width - 1, (height - 1) * width, total - 1];
  const seeds = corners.map((idx) => {
    const p = idx * 4;
    return { r: data[p], g: data[p + 1], b: data[p + 2] };
  });

  const stack: number[] = [...corners];
  let processed = 0;

  while (stack.length) {
    const idx = stack.pop()!;
    if (idx < 0 || idx >= total || visited[idx]) continue;
    visited[idx] = 1;

    const p = idx * 4;
    const isBackground = seeds.some(
      (s) => normalizedColorDistance(data[p], data[p + 1], data[p + 2], s.r, s.g, s.b) <= tolerance
    );
    if (!isBackground) continue;

    data[p] = background.r;
    data[p + 1] = background.g;
    data[p + 2] = background.b;
    data[p + 3] = 255;
    processed++;

    const x = idx % width;
    const y = (idx - x) / width;
    if (x > 0) stack.push(idx - 1);
    if (x < width - 1) stack.push(idx + 1);
    if (y > 0) stack.push(idx - width);
    if (y < height - 1) stack.push(idx + width);

    if (onProgress && processed % 5000 === 0) {
      onProgress(0.3 + 0.6 * Math.min(1, processed / total));
    }
  }
}

/**
 * Stellt eine Person frei: erkennt den zusammenhängenden Hintergrund ausgehend
 * von den Bildecken und ersetzt ihn durch eine neutrale Farbe (Standard: Weiß).
 * Gibt bei jedem Fehler das Originalbild zurück (kein harter Fehlschlag).
 */
export async function removeBackground(
  dataUrl: string,
  options: RemoveBackgroundOptions = {}
): Promise<string> {
  const { onProgress, background = { r: 255, g: 255, b: 255 }, tolerance = 0.2 } = options;
  onProgress?.(0);

  if (typeof document === "undefined") return dataUrl;

  let img: HTMLImageElement;
  try {
    img = await loadImage(dataUrl);
  } catch {
    return dataUrl;
  }
  onProgress?.(0.15);

  const canvas = document.createElement("canvas");
  canvas.width = img.width || 1;
  canvas.height = img.height || 1;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;

  ctx.drawImage(img, 0, 0);

  let imageData: ImageData;
  try {
    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  } catch {
    return dataUrl;
  }
  onProgress?.(0.3);

  floodFillBackground(imageData, background, tolerance, onProgress);
  ctx.putImageData(imageData, 0, 0);

  onProgress?.(1);
  return canvas.toDataURL("image/jpeg", 0.85);
}
