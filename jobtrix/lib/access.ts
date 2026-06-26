export type AccessPackage = "none" | "limited" | "lifetime" | "monthly" | "yearly";

export interface AccessState {
  freeGenerationUsed: boolean;
  package: AccessPackage;
  validUntil: Date | null;
  subscriptionStatus?: string | null;
}

export type AccessDecision =
  | { allowed: true; markFreeGenerationUsed: boolean }
  | { allowed: false; reason: "access_required" };

export function checkAccess(access: AccessState | null, now: Date = new Date()): AccessDecision {
  if (!access || !access.freeGenerationUsed) {
    return { allowed: true, markFreeGenerationUsed: true };
  }

  if (access.package === "lifetime") {
    return { allowed: true, markFreeGenerationUsed: false };
  }

  if (access.package === "limited" && access.validUntil && access.validUntil > now) {
    return { allowed: true, markFreeGenerationUsed: false };
  }

  if (
    (access.package === "monthly" || access.package === "yearly") &&
    access.subscriptionStatus === "active"
  ) {
    return { allowed: true, markFreeGenerationUsed: false };
  }

  return { allowed: false, reason: "access_required" };
}
