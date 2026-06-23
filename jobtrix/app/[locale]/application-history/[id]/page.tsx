import dynamic from "next/dynamic";

// ssr: false — ApplicationHistoryDetail zieht ueber @/lib/download-pdf die nicht
// SSR-sichere Lib @react-pdf/renderer; ohne dies wirft der Server-Render 500.
// Gleiches Muster wie app/[locale]/generate/page.tsx.
const ApplicationHistoryDetail = dynamic(
  () => import("@/components/ApplicationHistoryDetail"),
  { ssr: false }
);

export default function ApplicationHistoryDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <ApplicationHistoryDetail id={params.id} />;
}
