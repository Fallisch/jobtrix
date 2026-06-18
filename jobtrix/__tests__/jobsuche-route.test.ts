/**
 * @jest-environment node
 */
import { GET } from "@/app/api/jobsuche/route";
import { NextRequest } from "next/server";

jest.mock("next-auth/next", () => ({
  getServerSession: () => Promise.resolve({ user: { id: "user-1" } }),
}));

jest.mock("@/lib/auth", () => ({ authOptions: {} }));

const mockFetch = jest.fn();
global.fetch = mockFetch;

function makeRequest(params: Record<string, string>) {
  const url = new URL("http://localhost/api/jobsuche");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new NextRequest(url);
}

beforeEach(() => mockFetch.mockReset());

describe("GET /api/jobsuche", () => {
  it("sendet den Firmennamen als Teil des was-Parameters an die BA-API", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ stellenangebote: [] }),
    });

    await GET(makeRequest({ arbeitgeber: "Siemens" }));

    const baCall = mockFetch.mock.calls.find((c) =>
      String(c[0]).includes("rest.arbeitsagentur.de")
    );
    expect(baCall).toBeDefined();
    expect(baCall![0]).toContain("was=Siemens");
  });

  it("kombiniert Stellentitel und Firmenname im was-Parameter", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ stellenangebote: [] }),
    });

    await GET(makeRequest({ was: "Entwickler", wo: "Berlin", arbeitgeber: "SAP" }));

    const baCall = mockFetch.mock.calls.find((c) =>
      String(c[0]).includes("rest.arbeitsagentur.de")
    );
    expect(baCall![0]).toContain("was=Entwickler+SAP");
    expect(baCall![0]).toContain("wo=Berlin");
  });

  it("funktioniert ohne arbeitgeber-Parameter (Rückwärtskompatibilität)", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ stellenangebote: [] }),
    });

    await GET(makeRequest({ was: "Entwickler" }));

    const baCall = mockFetch.mock.calls.find((c) =>
      String(c[0]).includes("rest.arbeitsagentur.de")
    );
    expect(baCall![0]).toContain("was=Entwickler");
    expect(baCall![0]).not.toContain("arbeitgeber");
  });
});
