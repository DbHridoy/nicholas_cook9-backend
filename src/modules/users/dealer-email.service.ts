import { sendEmail } from "../../shared/services/email.service.js";
import type { ManageableUserRole } from "./user.types.js";

export const sendUserWelcomePassword = (payload: {
  email: string;
  name: string;
  role: ManageableUserRole;
  temporaryPassword: string;
}) => {
  const roleLabel = payload.role.replace("_", " ");

  return sendEmail({
    to: payload.email,
    subject: `Your Axisone ${roleLabel} account`,
    text: [
      `Hello ${payload.name},`,
      "",
      `Your ${roleLabel} account has been created.`,
      `Email: ${payload.email}`,
      `Temporary password: ${payload.temporaryPassword}`,
      "",
      "Please sign in and change this password as soon as possible.",
    ].join("\n"),
  });
};

export const sendDealerWelcomePassword = (payload: {
  email: string;
  name: string;
  temporaryPassword: string;
}) => sendUserWelcomePassword({ ...payload, role: "dealer" });
