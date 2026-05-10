export const userRoles = ["super_admin", "admin", "dealer"] as const;
export type UserRole = (typeof userRoles)[number];

export const manageableUserRoles = ["admin", "dealer"] as const;
export type ManageableUserRole = (typeof manageableUserRoles)[number];

export const userStatuses = ["active", "blocked"] as const;
export type UserStatus = (typeof userStatuses)[number];
