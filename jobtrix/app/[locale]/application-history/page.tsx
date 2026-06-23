import dynamic from "next/dynamic";

// ssr: false — ApplicationHistoryList zieht ueber @/lib/download-pdf die nicht
// SSR-sichere Lib @react-pdf/renderer; ohne dies wirft der Server-Render 500.
// Gleiches Muster wie app/[locale]/generate/page.tsx.
const ApplicationHistoryList = dynamic(
  () => import("@/components/ApplicationHistoryList"),
  { ssr: false }
);

export default function ApplicationHistoryPage() {
  return <ApplicationHistoryList />;
}
