import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import AdminDashboard from "@/components/AdminDashboard";

export default async function AdminPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/");

  return <AdminDashboard />;
}
