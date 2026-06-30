import type { ProfileData } from "./profile-storage";

export interface CvScoreTip {
  id: string;
  impact: number;
  context?: Record<string, unknown>;
}

export interface CvScoreResult {
  total: number;
  categories: {
    completeness: number;
    structure: number;
    clarity: number;
  };
  tips: CvScoreTip[];
}

export const CATEGORY_WEIGHT = 1 / 3;

const COMPLETENESS_CHECKS: {
  test: (p: ProfileData) => boolean;
  tipId: string;
  impact: number;
}[] = [
  { test: (p) => !!p.name.trim(), tipId: "missing-name", impact: 15 },
  { test: (p) => !!p.email.trim() || !!p.phone.trim(), tipId: "missing-contact", impact: 12 },
  { test: (p) => !!p.address.trim(), tipId: "missing-address", impact: 8 },
  { test: (p) => !!p.birthdate.trim(), tipId: "missing-birthdate", impact: 5 },
  { test: (p) => !!p.photo, tipId: "missing-photo", impact: 10 },
  { test: (p) => p.experience.length >= 1, tipId: "missing-experience", impact: 15 },
  { test: (p) => p.education.length >= 1, tipId: "missing-education", impact: 12 },
  { test: (p) => p.qualifications.length >= 1, tipId: "missing-qualifications", impact: 10 },
  {
    test: (p) => p.experience.length > 0 && p.experience.every((e) => e.tasks.trim().length > 0),
    tipId: "missing-tasks",
    impact: 8,
  },
];

function scoreCompleteness(p: ProfileData): { score: number; tips: CvScoreTip[] } {
  const tips: CvScoreTip[] = [];
  let earned = 0;
  const perCheck = 100 / COMPLETENESS_CHECKS.length;

  for (const check of COMPLETENESS_CHECKS) {
    if (check.test(p)) {
      earned += perCheck;
    } else {
      tips.push({ id: check.tipId, impact: check.impact });
    }
  }

  return { score: clamp(Math.round(earned)), tips };
}

function scoreStructure(p: ProfileData): { score: number; tips: CvScoreTip[] } {
  const tips: CvScoreTip[] = [];
  let points = 0;
  let maxPoints = 0;

  for (let i = 0; i < p.experience.length; i++) {
    const exp = p.experience[i];
    maxPoints += 2;

    if (exp.period.trim()) {
      points += 1;
    } else {
      tips.push({ id: "experience-missing-period", impact: 8, context: { index: i } });
    }

    if (exp.tasks.trim()) {
      const lines = exp.tasks.split("\n").filter((l) => l.trim());
      if (lines.length >= 2) {
        points += 1;
      } else {
        tips.push({ id: "experience-single-task", impact: 6, context: { index: i } });
      }
    } else {
      tips.push({ id: "experience-missing-tasks", impact: 8, context: { index: i } });
    }
  }

  for (let i = 0; i < p.education.length; i++) {
    maxPoints += 1;
    if (p.education[i].year.trim()) {
      points += 1;
    } else {
      tips.push({ id: "education-missing-year", impact: 6, context: { index: i } });
    }
  }

  const expCount = p.experience.length;
  maxPoints += 1;
  if (expCount >= 1 && expCount <= 8) {
    points += 1;
  } else if (expCount > 8) {
    tips.push({ id: "too-many-experiences", impact: 4 });
  }

  const score = maxPoints > 0 ? clamp(Math.round((points / maxPoints) * 100)) : 0;
  return { score, tips };
}

function scoreClarity(p: ProfileData): { score: number; tips: CvScoreTip[] } {
  const tips: CvScoreTip[] = [];
  let points = 0;
  let maxPoints = 0;

  for (let i = 0; i < p.experience.length; i++) {
    const lines = p.experience[i].tasks
      .split("\n")
      .filter((l) => l.trim());

    for (const line of lines) {
      maxPoints += 1;
      const len = line.trim().length;
      if (len >= 10 && len <= 200) {
        points += 1;
      } else if (len < 10 && len > 0) {
        tips.push({ id: "task-too-short", impact: 4, context: { index: i } });
      }
    }
  }

  for (let i = 0; i < p.qualifications.length; i++) {
    maxPoints += 1;
    if (p.qualifications[i].label.trim()) {
      points += 1;
    } else {
      tips.push({ id: "skill-empty-label", impact: 5, context: { index: i } });
    }
  }

  const score = maxPoints > 0 ? clamp(Math.round((points / maxPoints) * 100)) : 0;
  return { score, tips };
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function scoreProfile(profile: ProfileData): CvScoreResult {
  const comp = scoreCompleteness(profile);
  const struct = scoreStructure(profile);
  const clarity = scoreClarity(profile);

  const total = clamp(
    Math.round(
      comp.score * CATEGORY_WEIGHT +
        struct.score * CATEGORY_WEIGHT +
        clarity.score * CATEGORY_WEIGHT
    )
  );

  const allTips = [...comp.tips, ...struct.tips, ...clarity.tips].sort(
    (a, b) => b.impact - a.impact
  );

  return {
    total,
    categories: {
      completeness: comp.score,
      structure: struct.score,
      clarity: clarity.score,
    },
    tips: allTips,
  };
}
