import { AppError } from "../../shared/errors/app-error.js";
import { notificationRepository } from "./notification.repository.js";

const toNotificationDto = (notification: Awaited<ReturnType<typeof notificationRepository.findMany>>[number]) => ({
  _id: notification._id.toString(),
  recipient: notification.recipient.toString(),
  claim: notification.claim.toString(),
  type: notification.type,
  title: notification.title,
  message: notification.message,
  readAt: notification.readAt,
  createdAt: notification.createdAt,
  updatedAt: notification.updatedAt,
});

export const listNotifications = async (recipient: string) => {
  const [notifications, unreadCount] = await Promise.all([
    notificationRepository.findMany({ recipient }),
    notificationRepository.countUnread(recipient),
  ]);

  return {
    notifications: notifications.map(toNotificationDto),
    unreadCount,
  };
};

export const markNotificationRead = async (notificationId: string, recipient: string) => {
  const notification = await notificationRepository.markAsRead(notificationId, recipient);

  if (!notification) {
    throw new AppError(404, "Notification not found");
  }

  return toNotificationDto(notification);
};

export const markAllNotificationsRead = async (recipient: string) => {
  const result = await notificationRepository.markAllAsRead(recipient);

  return {
    modifiedCount: result.modifiedCount,
  };
};
