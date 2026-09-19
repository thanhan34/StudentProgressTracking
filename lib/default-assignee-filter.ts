import type { UserRole } from "./roles";

export function defaultAssigneeFilter(role: UserRole, userId: string): string {
  return role === "admin" ? "" : userId;
}