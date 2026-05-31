export const claimStatuses = ["pending", "approved", "denied"] as const;
export type ClaimStatus = (typeof claimStatuses)[number];

export const manageableClaimStatuses = ["approved", "denied"] as const;
export type ManageableClaimStatus = (typeof manageableClaimStatuses)[number];
