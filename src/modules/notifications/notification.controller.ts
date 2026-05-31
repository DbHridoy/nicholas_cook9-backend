import type { RequestHandler } from "express";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import * as notificationService from "./notification.service.js";

export const listNotifications: RequestHandler = asyncHandler(async (req, res) => {
  const data = await notificationService.listNotifications(req.user!.id);

  res.status(200).json({
    success: true,
    message: "Notifications retrieved successfully",
    data,
  });
});

export const markNotificationRead: RequestHandler = asyncHandler(async (req, res) => {
  const notification = await notificationService.markNotificationRead(
    String(req.params.notificationId),
    req.user!.id,
  );

  res.status(200).json({
    success: true,
    message: "Notification marked as read",
    data: { notification },
  });
});

export const markAllNotificationsRead: RequestHandler = asyncHandler(async (req, res) => {
  const data = await notificationService.markAllNotificationsRead(req.user!.id);

  res.status(200).json({
    success: true,
    message: "Notifications marked as read",
    data,
  });
});
