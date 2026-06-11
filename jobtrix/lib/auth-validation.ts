const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

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

  if (!data.password) {
    errors.password = "required";
  } else if (data.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = "tooShort";
  }

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
