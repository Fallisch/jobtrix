import ApplicationHistoryDetail from "@/components/ApplicationHistoryDetail";

export default function ApplicationHistoryDetailPage({ params }: { params: { id: string } }) {
  return <ApplicationHistoryDetail id={params.id} />;
}
