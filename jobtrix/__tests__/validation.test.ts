import {
  validateBirthdate,
  validatePhone,
  validateLocation,
  validateYearRange,
} from "@/lib/validation";

describe("validateBirthdate", () => {
  it("accepts a valid date", () => {
    expect(validateBirthdate("15", "6", "1990")).toBeNull();
  });

  it("accepts single-digit day and month", () => {
    expect(validateBirthdate("1", "1", "2000")).toBeNull();
  });

  it("accepts boundary day 31 for January", () => {
    expect(validateBirthdate("31", "1", "1990")).toBeNull();
  });

  it("accepts Feb 29 in a leap year", () => {
    expect(validateBirthdate("29", "2", "2000")).toBeNull();
    expect(validateBirthdate("29", "2", "1996")).toBeNull();
  });

  it("rejects Feb 29 in a non-leap year", () => {
    expect(validateBirthdate("29", "2", "1999")).not.toBeNull();
    expect(validateBirthdate("29", "2", "1900")).not.toBeNull();
  });

  it("rejects Feb 30", () => {
    expect(validateBirthdate("30", "2", "2000")).not.toBeNull();
  });

  it("rejects day 0", () => {
    expect(validateBirthdate("0", "6", "1990")).not.toBeNull();
  });

  it("rejects day > 31", () => {
    expect(validateBirthdate("32", "1", "1990")).not.toBeNull();
  });

  it("rejects month 0", () => {
    expect(validateBirthdate("15", "0", "1990")).not.toBeNull();
  });

  it("rejects month 13", () => {
    expect(validateBirthdate("15", "13", "1990")).not.toBeNull();
  });

  it("rejects month 44 (13.44.5555 example)", () => {
    expect(validateBirthdate("13", "44", "5555")).not.toBeNull();
  });

  it("rejects year below 1920", () => {
    expect(validateBirthdate("1", "1", "1919")).not.toBeNull();
  });

  it("rejects year above 2015", () => {
    expect(validateBirthdate("1", "1", "2016")).not.toBeNull();
  });

  it("accepts boundary year 1920", () => {
    expect(validateBirthdate("1", "1", "1920")).toBeNull();
  });

  it("accepts boundary year 2015", () => {
    expect(validateBirthdate("1", "1", "2015")).toBeNull();
  });

  it("rejects non-numeric input", () => {
    expect(validateBirthdate("abc", "6", "1990")).not.toBeNull();
    expect(validateBirthdate("15", "abc", "1990")).not.toBeNull();
    expect(validateBirthdate("15", "6", "abc")).not.toBeNull();
  });

  it("rejects April 31", () => {
    expect(validateBirthdate("31", "4", "1990")).not.toBeNull();
  });

  it("rejects June 31", () => {
    expect(validateBirthdate("31", "6", "1990")).not.toBeNull();
  });

  it("returns null for all-empty (optional field)", () => {
    expect(validateBirthdate("", "", "")).toBeNull();
  });

  it("rejects partial input (only day filled)", () => {
    expect(validateBirthdate("15", "", "")).not.toBeNull();
  });

  it("rejects partial input (only year filled)", () => {
    expect(validateBirthdate("", "", "1990")).not.toBeNull();
  });
});

describe("validatePhone", () => {
  it("accepts a valid German number", () => {
    expect(validatePhone("0151 12345678")).toBeNull();
  });

  it("accepts international format with +", () => {
    expect(validatePhone("+49 151 12345678")).toBeNull();
  });

  it("accepts digits with hyphens", () => {
    expect(validatePhone("0151-1234-5678")).toBeNull();
  });

  it("accepts minimal 6-digit number", () => {
    expect(validatePhone("123456")).toBeNull();
  });

  it("rejects input shorter than 6 chars", () => {
    expect(validatePhone("12345")).not.toBeNull();
  });

  it("rejects input without any digits", () => {
    expect(validatePhone("abcdef")).not.toBeNull();
  });

  it("rejects pure letters", () => {
    expect(validatePhone("telefon")).not.toBeNull();
  });

  it("returns null for empty (optional field)", () => {
    expect(validatePhone("")).toBeNull();
  });
});

describe("validateLocation", () => {
  it("accepts a normal city name", () => {
    expect(validateLocation("Berlin")).toBeNull();
  });

  it("accepts city with street and number", () => {
    expect(validateLocation("Musterstr. 12, 12345 Berlin")).toBeNull();
  });

  it("accepts name with spaces", () => {
    expect(validateLocation("Bad Homburg")).toBeNull();
  });

  it("rejects pure numbers", () => {
    expect(validateLocation("12345")).not.toBeNull();
  });

  it("rejects a single digit", () => {
    expect(validateLocation("1")).not.toBeNull();
  });

  it("accepts mixed with at least 2 consecutive letters", () => {
    expect(validateLocation("12 AB")).toBeNull();
  });

  it("rejects single letter only", () => {
    expect(validateLocation("A")).not.toBeNull();
  });

  it("returns null for empty (optional field)", () => {
    expect(validateLocation("")).toBeNull();
  });
});

describe("validateYearRange", () => {
  it("accepts a single valid year", () => {
    expect(validateYearRange("2019")).toBeNull();
  });

  it("accepts a valid year range", () => {
    expect(validateYearRange("2019 - 2022")).toBeNull();
  });

  it("accepts range without spaces around dash", () => {
    expect(validateYearRange("2019-2022")).toBeNull();
  });

  it("rejects text input like 'gestern'", () => {
    expect(validateYearRange("gestern")).not.toBeNull();
  });

  it("rejects mixed invalid input '2019 - abc'", () => {
    expect(validateYearRange("2019 - abc")).not.toBeNull();
  });

  it("rejects year below 1950", () => {
    expect(validateYearRange("1800")).not.toBeNull();
  });

  it("rejects year above 2030", () => {
    expect(validateYearRange("2031")).not.toBeNull();
  });

  it("accepts boundary year 1950", () => {
    expect(validateYearRange("1950")).toBeNull();
  });

  it("accepts boundary year 2030", () => {
    expect(validateYearRange("2030")).toBeNull();
  });

  it("returns null for empty (optional field)", () => {
    expect(validateYearRange("")).toBeNull();
  });
});
