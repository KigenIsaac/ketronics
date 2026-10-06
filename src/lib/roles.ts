export const STAFF_ROLES = ["manager", "admin"] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

export function isStaffRole(role: string | null | undefined): role is StaffRole {
  return role === "manager" || role === "admin";
}
