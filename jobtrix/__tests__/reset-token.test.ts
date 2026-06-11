import { generateResetToken, verifyResetToken, decodeResetTokenUserId } from "@/lib/reset-token";

const PASSWORD_HASH = "$2b$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQ";
const OTHER_PASSWORD_HASH = "$2b$10$zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz";

describe("reset-token", () => {
  it("erzeugt ein Token, das die userId enthaelt und sich verifizieren laesst", () => {
    const token = generateResetToken("user-123", PASSWORD_HASH);
    const result = verifyResetToken(token, PASSWORD_HASH);

    expect(result).toEqual({ userId: "user-123" });
  });

  it("lehnt ein abgelaufenes Token ab", () => {
    const realNow = Date.now;
    const start = realNow();
    jest.spyOn(Date, "now").mockReturnValue(start);

    const token = generateResetToken("user-123", PASSWORD_HASH);

    jest.spyOn(Date, "now").mockReturnValue(start + 60 * 60 * 1000 + 1);

    expect(verifyResetToken(token, PASSWORD_HASH)).toBeNull();

    Date.now = realNow;
  });

  it("lehnt ein manipuliertes Token ab", () => {
    const token = generateResetToken("user-123", PASSWORD_HASH);
    const [payload] = token.split(".");
    const tampered = `${payload}.invalidsignature`;

    expect(verifyResetToken(tampered, PASSWORD_HASH)).toBeNull();
  });

  it("lehnt ein Token fuer eine andere userId ab, wenn die Signatur nicht passt", () => {
    const token = generateResetToken("user-123", PASSWORD_HASH);
    const [, signature] = token.split(".");
    const otherPayload = Buffer.from(
      JSON.stringify({ userId: "user-456", pwfp: "x", exp: Date.now() + 1000 })
    ).toString("base64url");

    expect(verifyResetToken(`${otherPayload}.${signature}`, PASSWORD_HASH)).toBeNull();
  });

  it("lehnt ein bereits eingeloestes Token ab, nachdem sich das Passwort geaendert hat", () => {
    const token = generateResetToken("user-123", PASSWORD_HASH);

    expect(verifyResetToken(token, OTHER_PASSWORD_HASH)).toBeNull();
  });

  it("liest die userId aus einem Token, ohne die Signatur zu pruefen", () => {
    const token = generateResetToken("user-123", PASSWORD_HASH);

    expect(decodeResetTokenUserId(token)).toBe("user-123");
  });

  it("gibt null zurueck, wenn die userId aus einem ungueltigen Token nicht gelesen werden kann", () => {
    expect(decodeResetTokenUserId("ungueltiges-token")).toBeNull();
  });
});
