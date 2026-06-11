export interface PricingConfig {
  limited: { priceEur: number; durationDays: number };
  lifetime: { priceEur: number };
}

export function getPricingConfig(): PricingConfig {
  return {
    limited: {
      priceEur: Number(process.env.PRICE_LIMITED_EUR ?? "9.99"),
      durationDays: Number(process.env.PRICE_LIMITED_DURATION_DAYS ?? "30"),
    },
    lifetime: {
      priceEur: Number(process.env.PRICE_LIFETIME_EUR ?? "29.99"),
    },
  };
}
