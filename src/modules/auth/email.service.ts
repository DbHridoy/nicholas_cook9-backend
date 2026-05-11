import { env } from "../../config/env.js";
import { sendEmail } from "../../shared/services/email.service.js";

export const sendPasswordResetOtp = (email: string, otp: string) =>
  sendEmail({
    to: email,
    subject: "Your password reset code",
    text: `Your password reset code is ${otp}. It expires in ${env.PASSWORD_RESET_OTP_EXPIRES_IN_MINUTES} minutes.`,
  });
