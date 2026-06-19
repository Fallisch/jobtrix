const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function validatePassword(password: string): string | undefined {
  if (!password) return "required";
  if (password.length < MIN_PASSWORD_LENGTH) return "tooShort";
  if (!/[A-Z]/.test(password)) return "missingUppercase";
  if (!/[a-z]/.test(password)) return "missingLowercase";
  if (!/[0-9]/.test(password)) return "missingDigit";
  if (!/[^A-Za-z0-9]/.test(password)) return "missingSpecial";
  return undefined;
}

export interface RegistrationData {
  email: string;
  password: string;
  passwordConfirm: string;
  termsAccepted: boolean;
}

export interface RegistrationErrors {
  email?: string;
  password?: string;
  passwordConfirm?: string;
  termsAccepted?: string;
}

export function validateRegistration(data: RegistrationData): RegistrationErrors {
  const errors: RegistrationErrors = {};

  if (!data.email.trim()) {
    errors.email = "required";
  } else if (!EMAIL_REGEX.test(data.email)) {
    errors.email = "invalid";
  }

  const pwError = validatePassword(data.password);
  if (pwError) errors.password = pwError;

  if (data.passwordConfirm !== data.password) {
    errors.passwordConfirm = "mismatch";
  }

  if (!data.termsAccepted) {
    errors.termsAccepted = "required";
  }

  return errors;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginErrors {
  email?: string;
  password?: string;
}

export function validateLogin(data: LoginData): LoginErrors {
  const errors: LoginErrors = {};

  if (!data.email.trim()) errors.email = "required";
  if (!data.password) errors.password = "required";

  return errors;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ForgotPasswordErrors {
  email?: string;
}

export function validateForgotPassword(data: ForgotPasswordData): ForgotPasswordErrors {
  const errors: ForgotPasswordErrors = {};

  if (!data.email.trim()) {
    errors.email = "required";
  } else if (!EMAIL_REGEX.test(data.email)) {
    errors.email = "invalid";
  }

  return errors;
}

export interface ResetPasswordData {
  password: string;
  passwordConfirm: string;
}

export interface ResetPasswordErrors {
  password?: string;
  passwordConfirm?: string;
}

export function validateResetPassword(data: ResetPasswordData): ResetPasswordErrors {
  const errors: ResetPasswordErrors = {};

  const pwError = validatePassword(data.password);
  if (pwError) errors.password = pwError;

  if (data.passwordConfirm !== data.password) {
    errors.passwordConfirm = "mismatch";
  }

  return errors;
}
