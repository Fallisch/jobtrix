const DAYS_IN_MONTH = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function isLeapYear(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

export function validateBirthdate(
  day: string,
  month: string,
  year: string,
): string | null {
  if (!day && !month && !year) return null;
  if (!day || !month || !year) return "birthdateIncomplete";

  const d = Number(day);
  const m = Number(month);
  const y = Number(year);

  if (!Number.isInteger(d) || !Number.isInteger(m) || !Number.isInteger(y))
    return "birthdateInvalid";

  if (y < 1920 || y > 2015) return "birthdateYearRange";
  if (m < 1 || m > 12) return "birthdateInvalid";

  let maxDay = DAYS_IN_MONTH[m];
  if (m === 2 && !isLeapYear(y)) maxDay = 28;

  if (d < 1 || d > maxDay) return "birthdateInvalid";

  return null;
}

const PHONE_REGEX = /^\+?[\d\s\-]{6,}$/;

export function validatePhone(phone: string): string | null {
  if (!phone) return null;
  if (!PHONE_REGEX.test(phone)) return "phoneInvalid";
  return null;
}

const CONSECUTIVE_LETTERS = /[a-zA-ZÀ-ÿ]{2,}/;

export function validateLocation(location: string): string | null {
  if (!location) return null;
  if (!CONSECUTIVE_LETTERS.test(location)) return "locationInvalid";
  return null;
}

const YEAR_RANGE_REGEX = /^\d{4}(\s*-\s*\d{4})?$/;

export function validateYearRange(yearRange: string): string | null {
  if (!yearRange) return null;
  if (!YEAR_RANGE_REGEX.test(yearRange)) return "yearRangeInvalid";

  const years = yearRange.split("-").map((s) => Number(s.trim()));
  for (const y of years) {
    if (y < 1950 || y > 2030) return "yearRangeOutOfBounds";
  }

  return null;
}
