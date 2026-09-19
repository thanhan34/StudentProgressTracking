import type { UserRole } from "./roles";

export type AssignedUser = { id: string; name: string };
export type StaffOption = AssignedUser & { role: UserRole };

export function isAssignableRole(role: UserRole): boolean {
  return role === "teaching_assistant" || role === "reserve_teaching_assistant";
}

// Consume snapshots one at a time so duplicate names remain distinct.
export function legacyAssignmentNames(names: string[], users: AssignedUser[]): string[] {
  const remaining = [...names];
  for (const user of users) {
    const index = remaining.indexOf(user.name);
    if (index !== -1) remaining.splice(index, 1);
  }
  return remaining;
}