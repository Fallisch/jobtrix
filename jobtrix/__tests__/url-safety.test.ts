/**
 * @jest-environment node
 */
import { isHttpUrl, isPrivateIp, isSafeExternalUrl } from "@/lib/url-safety";

jest.mock("dns/promises", () => ({ lookup: jest.fn() }));
import { lookup } from "dns/promises";
const mockLookup = lookup as jest.Mock;

beforeEach(() => mockLookup.mockReset());

describe("isHttpUrl", () => {
  it("akzeptiert http und https", () => {
    expect(isHttpUrl("http://example.com")).toBe(true);
    expect(isHttpUrl("https://example.com/job/1")).toBe(true);
  });

  it("lehnt andere Protokolle und Müll ab", () => {
    expect(isHttpUrl("ftp://example.com")).toBe(false);
    expect(isHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isHttpUrl("file:///etc/passwd")).toBe(false);
    expect(isHttpUrl("keineurl")).toBe(false);
    expect(isHttpUrl("")).toBe(false);
  });
});

describe("isPrivateIp", () => {
  it("erkennt private/loopback/link-local IPv4", () => {
    expect(isPrivateIp("127.0.0.1")).toBe(true);
    expect(isPrivateIp("10.1.2.3")).toBe(true);
    expect(isPrivateIp("192.168.0.1")).toBe(true);
    expect(isPrivateIp("172.16.5.5")).toBe(true);
    expect(isPrivateIp("172.31.255.255")).toBe(true);
    expect(isPrivateIp("169.254.169.254")).toBe(true); // Cloud-Metadata
    expect(isPrivateIp("0.0.0.0")).toBe(true);
  });

  it("erkennt private/loopback IPv6", () => {
    expect(isPrivateIp("::1")).toBe(true);
    expect(isPrivateIp("fe80::1")).toBe(true);
    expect(isPrivateIp("fc00::1")).toBe(true);
  });

  it("lässt öffentliche IPs zu", () => {
    expect(isPrivateIp("8.8.8.8")).toBe(false);
    expect(isPrivateIp("93.184.216.34")).toBe(false);
    expect(isPrivateIp("172.32.0.1")).toBe(false); // außerhalb 172.16/12
  });
});

describe("isSafeExternalUrl", () => {
  it("lehnt nicht-http(s)-URLs ohne DNS-Auflösung ab", async () => {
    await expect(isSafeExternalUrl("ftp://example.com")).resolves.toBe(false);
    expect(mockLookup).not.toHaveBeenCalled();
  });

  it("lehnt localhost und .local ab", async () => {
    await expect(isSafeExternalUrl("http://localhost/x")).resolves.toBe(false);
    await expect(isSafeExternalUrl("http://printer.local/x")).resolves.toBe(false);
  });

  it("lehnt literale private IP-Ziele ab, ohne DNS aufzulösen", async () => {
    await expect(isSafeExternalUrl("http://127.0.0.1/admin")).resolves.toBe(false);
    await expect(isSafeExternalUrl("http://169.254.169.254/latest/meta-data")).resolves.toBe(false);
    expect(mockLookup).not.toHaveBeenCalled();
  });

  it("erlaubt einen Hostnamen, der auf eine öffentliche IP auflöst", async () => {
    mockLookup.mockResolvedValue([{ address: "93.184.216.34", family: 4 }]);
    await expect(isSafeExternalUrl("https://example.com/job/1")).resolves.toBe(true);
  });

  it("blockt einen Hostnamen, der auf eine interne IP auflöst (DNS-Rebinding)", async () => {
    mockLookup.mockResolvedValue([{ address: "10.0.0.5", family: 4 }]);
    await expect(isSafeExternalUrl("https://evil.example.com")).resolves.toBe(false);
  });

  it("blockt, wenn die DNS-Auflösung fehlschlägt", async () => {
    mockLookup.mockRejectedValue(new Error("ENOTFOUND"));
    await expect(isSafeExternalUrl("https://does-not-exist.example")).resolves.toBe(false);
  });
});
