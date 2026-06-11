import PricingCards from "@/components/PricingCards";
import { getPricingConfig } from "@/lib/pricing";

export default function PricingPage() {
  const config = getPricingConfig();

  return <PricingCards config={config} />;
}
