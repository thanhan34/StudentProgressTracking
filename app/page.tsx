import Dashboard from "@/components/dashboard";
import { requireApprovedAccess } from "@/lib/auth";
import { StaffProvider } from "@/components/staff-provider";
import { defaultAssigneeFilter } from "@/lib/default-assignee-filter";

export default async function Home() {
  const access = await requireApprovedAccess();
  return <StaffProvider><Dashboard key={access.userId} currentUserId={access.userId} initialAssigneeFilter={defaultAssigneeFilter(access.role, access.userId)} /></StaffProvider>;
}