export const ROLE_LABELS = {
  pending: "Pending Approval",
  admin: "Administrator",
  admin_assistant: "Admin Assistant",
  teaching_assistant: "Teaching Assistant",
  reserve_teaching_assistant: "Reserve Teaching Assistant",
} as const;

export type UserRole = keyof typeof ROLE_LABELS;
export const DEFAULT_ROLE: UserRole = "pending";
export const BOOTSTRAP_ADMIN_EMAIL = "dtan42@gmail.com";

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && Object.hasOwn(ROLE_LABELS, value);
}

type RoleUser = {
  primaryEmailAddressId: string | null;
  emailAddresses: { id: string; emailAddress: string; verification: { status: string } | null }[];
  publicMetadata: { role?: unknown };
};

export function isBootstrapAdmin(user: RoleUser): boolean {
  return user.emailAddresses.some((email) =>
    email.id === user.primaryEmailAddressId &&
    email.emailAddress.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL &&
    email.verification?.status === "verified",
  );
}

export function resolveRole(user: RoleUser): UserRole {
  if (isBootstrapAdmin(user)) return "admin";
  return isUserRole(user.publicMetadata.role) ? user.publicMetadata.role : DEFAULT_ROLE;
}

export function canAccessContent(role: unknown): boolean {
  return isUserRole(role) && role !== "pending";
}