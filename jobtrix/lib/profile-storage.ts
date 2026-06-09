const STORAGE_KEY = "jobtrix_profile";

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  year: string;
}

export interface SkillItem {
  label: string;
  value: number;
}

export interface ProfileData {
  name: string;
  address: string;
  email: string;
  phone: string;
  birthdate: string;
  photo: string | null;
  education: EducationEntry[];
  qualifications: SkillItem[];
  interests: SkillItem[];
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

function toSkillItems(raw: unknown): SkillItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) =>
    typeof item === "string"
      ? { label: item, value: 60 }
      : (item as SkillItem)
  );
}

function normalizeProfile(parsed: Record<string, unknown>): ProfileData {
  const { strengths: legacyStrengths, ...rest } = parsed;
  const rawInterests = Array.isArray(parsed.interests) ? parsed.interests : legacyStrengths;
  return {
    email: "",
    phone: "",
    ...rest,
    qualifications: toSkillItems(parsed.qualifications),
    interests: toSkillItems(rawInterests),
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
