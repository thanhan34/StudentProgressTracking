import Dashboard from "@/components/dashboard";
import { requireApprovedAccess } from "@/lib/auth";

export default async function Home() {
  await requireApprovedAccess();
  return <Dashboard />;
}