import { generateResetToken, verifyResetToken } from "@/lib/reset-token";

describe("reset-token", () => {
  it("erzeugt ein Token, das die userId enthaelt und sich verifizieren laesst", () => {
    const token = generateResetToken("user-123");
    const result = verifyResetToken(token);

    expect(result).toEqual({ userId: "user-123" });
  });

  it("lehnt ein abgelaufenes Token ab", () => {
    const realNow = Date.now;
    const start = realNow();
    jest.spyOn(Date, "now").mockReturnValue(start);

    const token = generateResetToken("user-123");

    jest.spyOn(Date, "now").mockReturnValue(start + 60 * 60 * 1000 + 1);

    expect(verifyResetToken(token)).toBeNull();

    Date.now = realNow;
  });

  it("lehnt ein manipuliertes Token ab", () => {
    const token = generateResetToken("user-123");
    const [payload] = token.split(".");
    const tampered = `${payload}.invalidsignature`;

    expect(verifyResetToken(tampered)).toBeNull();
  });

  it("lehnt ein Token fuer eine andere userId ab, wenn die Signatur nicht passt", () => {
    const token = generateResetToken("user-123");
    const [, signature] = token.split(".");
    const otherPayload = Buffer.from(JSON.stringify({ userId: "user-456", exp: Date.now() + 1000 })).toString(
      "base64url"
    );

    expect(verifyResetToken(`${otherPayload}.${signature}`)).toBeNull();
  });
});
