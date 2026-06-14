/**
 * @jest-environment node
 */
jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

import { GET } from "@/app/api/jobsuche/route";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";

const mockedGetServerSession = jest.mocked(getServerSession);

function makeRequest(params: Record<string, string>) {
  const url = new URL("http://localhost/api/jobsuche");
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  return new NextRequest(url);
}

beforeEach(() => {
  global.fetch = jest.fn();
  mockedGetServerSession.mockResolvedValue({ user: { id: "user-1" }, expires: "" });
  delete process.env.ARBEITSAGENTUR_API_KEY;
});

describe("GET /api/jobsuche", () => {
  it("liefert unauthorized ohne Session", async () => {
    mockedGetServerSession.mockResolvedValue(null);

    const res = await GET(makeRequest({ was: "Entwickler", wo: "Berlin" }));

    expect(res.status).toBe(401);
  });

  it("liefert normalisierte Treffer mit Beschreibungstext für Treffer ohne externeUrl", async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes("/jobs?")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              stellenangebote: [
                { titel: "Softwareentwickler", arbeitgeber: "Acme GmbH", arbeitsort: { ort: "Berlin" }, refnr: "10000-123" },
              ],
            }),
        });
      }
      if (url.includes("/jobdetails/")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ stellenangebotsBeschreibung: "Wir suchen einen Softwareentwickler..." }),
        });
      }
      return Promise.resolve({ ok: false });
    });

    const res = await GET(makeRequest({ was: "Entwickler", wo: "Berlin" }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.results).toHaveLength(1);
    expect(data.results[0]).toMatchObject({
      title: "Softwareentwickler",
      company: "Acme GmbH",
      location: "Berlin",
      description: "Wir suchen einen Softwareentwickler...",
    });
    expect(typeof data.results[0].url).toBe("string");
  });

  it("liefert Treffer mit externeUrl ohne Beschreibungstext und ohne Detail-Abfrage", async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes("/jobs?")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              stellenangebote: [
                {
                  titel: "Frontend Developer",
                  arbeitgeber: "External GmbH",
                  arbeitsort: { ort: "Hamburg" },
                  refnr: "20000-456",
                  externeUrl: "https://example.com/job/456",
                },
              ],
            }),
        });
      }
      return Promise.resolve({ ok: false });
    });

    const res = await GET(makeRequest({ was: "Developer", wo: "Hamburg" }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.results[0]).toEqual({
      title: "Frontend Developer",
      company: "External GmbH",
      location: "Hamburg",
      description: null,
      url: "https://example.com/job/456",
    });
    expect((global.fetch as jest.Mock).mock.calls.some((c) => String(c[0]).includes("/jobdetails/"))).toBe(false);
  });

  it("ignoriert externeUrl mit unsicherem URL-Schema (z. B. javascript:) und liefert stattdessen einen arbeitsagentur.de-Link", async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes("/jobs?")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              stellenangebote: [
                {
                  titel: "Böser Treffer",
                  arbeitgeber: "Evil Inc",
                  arbeitsort: { ort: "Berlin" },
                  refnr: "99999-999",
                  externeUrl: "javascript:alert(1)",
                },
              ],
            }),
        });
      }
      if (url.includes("/jobdetails/")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ stellenangebotsBeschreibung: "Beschreibung" }),
        });
      }
      return Promise.resolve({ ok: false });
    });

    const res = await GET(makeRequest({ was: "Entwickler", wo: "Berlin" }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.results[0].url).toMatch(/^https:\/\/www\.arbeitsagentur\.de\//);
    expect(data.results[0].url).not.toContain("javascript:");
  });

  it("liefert leere Trefferliste wenn keine Stellenangebote vorhanden sind", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ stellenangebote: [] }),
    });

    const res = await GET(makeRequest({ was: "Astronaut", wo: "Mars" }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.results).toEqual([]);
  });

  it("liefert leere Trefferliste ohne Fehlerstatus wenn die externe API nicht erreichbar ist", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("network error"));

    const res = await GET(makeRequest({ was: "Entwickler", wo: "Berlin" }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.results).toEqual([]);
  });

  it("sendet X-API-Key Header mit dem Wert aus ARBEITSAGENTUR_API_KEY", async () => {
    process.env.ARBEITSAGENTUR_API_KEY = "test-api-key";
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ stellenangebote: [] }),
    });

    await GET(makeRequest({ was: "Entwickler", wo: "Berlin" }));

    const call = (global.fetch as jest.Mock).mock.calls[0];
    const headers = call[1]?.headers as Record<string, string>;
    expect(headers["X-API-Key"]).toBe("test-api-key");
  });

  it("verwendet den Default-API-Key 'jobboerse-jobsuche' wenn keine Umgebungsvariable gesetzt ist", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ stellenangebote: [] }),
    });

    await GET(makeRequest({ was: "Entwickler", wo: "Berlin" }));

    const call = (global.fetch as jest.Mock).mock.calls[0];
    const headers = call[1]?.headers as Record<string, string>;
    expect(headers["X-API-Key"]).toBe("jobboerse-jobsuche");
  });
});
