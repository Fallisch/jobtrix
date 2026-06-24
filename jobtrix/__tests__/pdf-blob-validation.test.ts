/**
 * @jest-environment node
 */
import { generateValidatedBlob, EmptyPdfError } from "@/lib/pdf-blob";

jest.mock("@react-pdf/renderer", () => ({
  pdf: jest.fn(),
}));

import { pdf } from "@react-pdf/renderer";
import React from "react";

const mockPdf = pdf as jest.MockedFunction<typeof pdf>;
const element = React.createElement("div");

function fakeBlob(size: number): Blob {
  return new Blob([new Uint8Array(size)], { type: "application/pdf" });
}

describe("generateValidatedBlob", () => {
  beforeEach(() => jest.clearAllMocks());

  it("gibt den Blob zurück wenn er größer als 1024 Bytes ist", async () => {
    const blob = fakeBlob(2000);
    mockPdf.mockReturnValue({ toBlob: () => Promise.resolve(blob) } as ReturnType<typeof pdf>);

    const result = await generateValidatedBlob(element);
    expect(result.size).toBe(2000);
    expect(mockPdf).toHaveBeenCalledTimes(1);
  });

  it("macht einen Retry wenn der erste Blob zu klein ist", async () => {
    const smallBlob = fakeBlob(500);
    const goodBlob = fakeBlob(2000);
    mockPdf
      .mockReturnValueOnce({ toBlob: () => Promise.resolve(smallBlob) } as ReturnType<typeof pdf>)
      .mockReturnValueOnce({ toBlob: () => Promise.resolve(goodBlob) } as ReturnType<typeof pdf>);

    const result = await generateValidatedBlob(element);
    expect(result.size).toBe(2000);
    expect(mockPdf).toHaveBeenCalledTimes(2);
  });

  it("wirft EmptyPdfError wenn auch der Retry zu klein ist", async () => {
    const smallBlob = fakeBlob(500);
    mockPdf.mockReturnValue({ toBlob: () => Promise.resolve(smallBlob) } as ReturnType<typeof pdf>);

    await expect(generateValidatedBlob(element)).rejects.toThrow(EmptyPdfError);
    expect(mockPdf).toHaveBeenCalledTimes(2);
  });
});
