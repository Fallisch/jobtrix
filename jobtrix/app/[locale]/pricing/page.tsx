import PricingCards from "@/components/PricingCards";
import { getPricingConfig } from "@/lib/pricing";

interface PricingPageProps {
  searchParams: { status?: string };
}

export default function PricingPage({ searchParams }: PricingPageProps) {
  const config = getPricingConfig();
  const status = searchParams.status === "success" || searchParams.status === "cancelled" ? searchParams.status : null;

  return <PricingCards config={config} status={status} />;
}
