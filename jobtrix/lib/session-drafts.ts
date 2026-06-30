const SESSION_DRAFT_KEYS = [
  "profile-draft",
  "jt_jobPosting",
  "jt_result",
  "jt_coverLetter",
  "jt_cv",
];

export function clearSessionDrafts(): void {
  for (const key of SESSION_DRAFT_KEYS) {
    sessionStorage.removeItem(key);
  }
}
