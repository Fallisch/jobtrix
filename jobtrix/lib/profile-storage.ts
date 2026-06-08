const STORAGE_KEY = "jobtrix_profile";

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  year: string;
}

export interface ProfileData {
  name: string;
  address: string;
  birthdate: string;
  photo: string | null;
  education: EducationEntry[];
  qualifications: string[];
  interests: string[];
}

export type ProfileErrors = Partial<Record<keyof ProfileData, string>>;

export function validateProfile(data: ProfileData): ProfileErrors {
  const errors: ProfileErrors = {};
  if (!data.name.trim()) errors.name = "Name ist erforderlich";
  if (data.education.length === 0) errors.education = "Mindestens ein Ausbildungseintrag erforderlich";
  return errors;
}

export function saveProfile(data: ProfileData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function normalizeProfile(parsed: Record<string, unknown>): ProfileData {
  const { strengths: legacyStrengths, ...rest } = parsed;
  return {
    ...rest,
    interests: Array.isArray(parsed.interests)
      ? parsed.interests
      : Array.isArray(legacyStrengths)
        ? legacyStrengths
        : [],
  } as ProfileData;
}

export function loadProfile(): ProfileData | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return normalizeProfile(parsed);
  } catch {
    return null;
  }
}
