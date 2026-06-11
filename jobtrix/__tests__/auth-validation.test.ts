import { validateRegistration, validateLogin, validateForgotPassword, validateResetPassword } from "@/lib/auth-validation";

describe("validateRegistration", () => {
  const validData = {
    email: "test@example.com",
    password: "correct-password",
    passwordConfirm: "correct-password",
    termsAccepted: true,
  };

  it("liefert keine Fehler bei gültigen Daten", () => {
    expect(validateRegistration(validData)).toEqual({});
  });

  it("verlangt eine E-Mail-Adresse", () => {
    const errors = validateRegistration({ ...validData, email: "" });
    expect(errors.email).toBe("required");
  });

  it("lehnt eine ungültige E-Mail-Adresse ab", () => {
    const errors = validateRegistration({ ...validData, email: "keine-email" });
    expect(errors.email).toBe("invalid");
  });

  it("verlangt ein Passwort", () => {
    const errors = validateRegistration({ ...validData, password: "", passwordConfirm: "" });
    expect(errors.password).toBe("required");
  });

  it("lehnt ein zu kurzes Passwort ab", () => {
    const errors = validateRegistration({ ...validData, password: "kurz", passwordConfirm: "kurz" });
    expect(errors.password).toBe("tooShort");
  });

  it("verlangt übereinstimmende Passwort-Bestätigung", () => {
    const errors = validateRegistration({ ...validData, passwordConfirm: "anderes-passwort" });
    expect(errors.passwordConfirm).toBe("mismatch");
  });

  it("verlangt das Akzeptieren der AGB/Datenschutz-Checkbox", () => {
    const errors = validateRegistration({ ...validData, termsAccepted: false });
    expect(errors.termsAccepted).toBe("required");
  });
});

describe("validateLogin", () => {
  it("liefert keine Fehler bei ausgefüllten Feldern", () => {
    expect(validateLogin({ email: "test@example.com", password: "correct-password" })).toEqual({});
  });

  it("verlangt eine E-Mail-Adresse", () => {
    const errors = validateLogin({ email: "", password: "correct-password" });
    expect(errors.email).toBe("required");
  });

  it("verlangt ein Passwort", () => {
    const errors = validateLogin({ email: "test@example.com", password: "" });
    expect(errors.password).toBe("required");
  });
});

describe("validateForgotPassword", () => {
  it("liefert keine Fehler bei gültiger E-Mail", () => {
    expect(validateForgotPassword({ email: "test@example.com" })).toEqual({});
  });

  it("verlangt eine E-Mail-Adresse", () => {
    expect(validateForgotPassword({ email: "" }).email).toBe("required");
  });

  it("lehnt eine ungültige E-Mail-Adresse ab", () => {
    expect(validateForgotPassword({ email: "keine-email" }).email).toBe("invalid");
  });
});

describe("validateResetPassword", () => {
  const validData = { password: "correct-password", passwordConfirm: "correct-password" };

  it("liefert keine Fehler bei gültigen Daten", () => {
    expect(validateResetPassword(validData)).toEqual({});
  });

  it("verlangt ein Passwort", () => {
    const errors = validateResetPassword({ password: "", passwordConfirm: "" });
    expect(errors.password).toBe("required");
  });

  it("lehnt ein zu kurzes Passwort ab", () => {
    const errors = validateResetPassword({ password: "kurz", passwordConfirm: "kurz" });
    expect(errors.password).toBe("tooShort");
  });

  it("verlangt übereinstimmende Passwort-Bestätigung", () => {
    const errors = validateResetPassword({ ...validData, passwordConfirm: "anderes-passwort" });
    expect(errors.passwordConfirm).toBe("mismatch");
  });
});
