import "server-only";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { cache } from "react";
import { canAccessContent, isBootstrapAdmin, resolveRole } from "@/lib/roles";

export const getCurrentAccess = cache(async () => {
  const { userId } = await auth();
  if (!userId) return null;

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const role = resolveRole(user);

  // Missing metadata resolves to pending without a write that could race with approval.
  if (isBootstrapAdmin(user) && user.publicMetadata.role !== role) {
    await client.users.updateUserMetadata(userId, { publicMetadata: { role } });
  }

  return { userId, role };
});

export async function requireApprovedAccess() {
  const access = await getCurrentAccess();
  if (!access) redirect("/sign-in");
  if (!canAccessContent(access.role)) redirect("/pending-approval");
  return access;
}