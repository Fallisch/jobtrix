import ResetPasswordForm from "@/components/ResetPasswordForm";

interface ResetPasswordPageProps {
  searchParams: { token?: string };
}

export default function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  return <ResetPasswordForm token={searchParams.token ?? ""} />;
}
