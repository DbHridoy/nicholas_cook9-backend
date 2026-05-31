import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { authenticate } from "../auth/auth.middleware.js";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "./notification.controller.js";

export const notificationRouter: ExpressRouter = Router();

notificationRouter.use(authenticate);

notificationRouter.get("/", listNotifications);
notificationRouter.patch("/read-all", markAllNotificationsRead);
notificationRouter.patch("/:notificationId/read", markNotificationRead);
