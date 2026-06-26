export interface PricingConfig {
  limited: { priceEur: number; durationDays: number };
  lifetime: { priceEur: number };
  monthly: { priceEur: number };
  yearly: { priceEur: number };
}

export type PackageType = "limited" | "lifetime" | "monthly" | "yearly";

export function getPricingConfig(): PricingConfig {
  return {
    limited: {
      priceEur: Number(process.env.PRICE_LIMITED_EUR ?? "19.99"),
      durationDays: Number(process.env.PRICE_LIMITED_DURATION_DAYS ?? "30"),
    },
    lifetime: {
      priceEur: Number(process.env.PRICE_LIFETIME_EUR ?? "79.99"),
    },
    monthly: {
      priceEur: Number(process.env.PRICE_MONTHLY_EUR ?? "9.99"),
    },
    yearly: {
      priceEur: Number(process.env.PRICE_YEARLY_EUR ?? "89.99"),
    },
  };
}

export function isSubscriptionPackage(pkg: string): pkg is "monthly" | "yearly" {
  return pkg === "monthly" || pkg === "yearly";
}

export function isOneTimePackage(pkg: string): pkg is "limited" | "lifetime" {
  return pkg === "limited" || pkg === "lifetime";
}

export function isValidPackage(pkg: string): pkg is PackageType {
  return isOneTimePackage(pkg) || isSubscriptionPackage(pkg);
}
