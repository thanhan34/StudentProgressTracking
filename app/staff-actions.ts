"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { requireApprovedAccess } from "@/lib/auth";
import { resolveRole } from "@/lib/roles";
import { isAssignableRole, type StaffOption } from "@/lib/staff";

export async function getAssignableStaff(): Promise<{ users: StaffOption[]; error: string }> {
  await requireApprovedAccess();
  try {
    const client = await clerkClient();
    const users = new Map<string, StaffOption>();
    let offset = 0;
    while (true) {
      const page = await client.users.getUserList({ limit: 100, offset, orderBy: "+created_at" });
      for (const user of page.data) {
        const role = resolveRole(user);
        if (!isAssignableRole(role)) continue;
        const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim()
          || user.username || user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId)?.emailAddress || user.id;
        users.set(user.id, { id: user.id, name, role });
      }
      offset += page.data.length;
      if (!page.data.length || offset >= page.totalCount) break;
    }
    return { users: [...users.values()].sort((a, b) => a.name.localeCompare(b.name, "vi")), error: "" };
  } catch {
    return { users: [], error: "Không tải được danh sách người phụ trách. Vui lòng thử lại." };
  }
}