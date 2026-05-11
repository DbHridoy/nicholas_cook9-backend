import { sendEmail } from "../../shared/services/email.service.js";

export const sendDealerWelcomePassword = (payload: {
  email: string;
  name: string;
  temporaryPassword: string;
}) =>
  sendEmail({
    to: payload.email,
    subject: "Your Nicholas Cook9 dealer account",
    text: [
      `Hello ${payload.name},`,
      "",
      "Your dealer account has been created.",
      `Email: ${payload.email}`,
      `Temporary password: ${payload.temporaryPassword}`,
      "",
      "Please sign in and change this password as soon as possible.",
    ].join("\n"),
  });
