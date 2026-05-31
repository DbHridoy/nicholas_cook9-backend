import nodemailer from "nodemailer";
import { env } from "../../config/env.js";
import { logger } from "../../config/logger.js";

type EmailPayload = {
  to: string;
  subject: string;
  text: string;
};

const createTransporter = () => {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS.replace(/\s/g, ""),
    },
  });
};

export const sendEmail = async ({ to, subject, text }: EmailPayload) => {
  const transporter = createTransporter();

  if (!transporter) {
    logger.warn({ to, subject, text }, "SMTP is not configured. Email logged instead.");
    return;
  }

  await transporter.sendMail({
    from: env.EMAIL_FROM || env.SMTP_USER,
    to,
    subject,
    text,
  });
};
