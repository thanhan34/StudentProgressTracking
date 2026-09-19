import Dashboard from "@/components/dashboard";
import { requireApprovedAccess } from "@/lib/auth";
import { StaffProvider } from "@/components/staff-provider";

export default async function Home() {
  const access = await requireApprovedAccess();
  return <StaffProvider><Dashboard key={access.userId} currentUserId={access.userId} /></StaffProvider>;
}