import type { QueryFilter, Types } from "mongoose";
import { Notification, type Notification as NotificationEntity } from "./notification.model.js";

type CreateNotificationPayload = {
  recipient: string | Types.ObjectId;
  claim: string | Types.ObjectId;
  type: "claim_created";
  title: string;
  message: string;
};

export const notificationRepository = {
  create(payload: CreateNotificationPayload) {
    return Notification.create(payload);
  },

  createMany(payloads: CreateNotificationPayload[]) {
    return Notification.create(payloads);
  },

  findMany(filter: QueryFilter<NotificationEntity> = {}) {
    return Notification.find(filter).sort({ createdAt: -1 });
  },

  countUnread(recipient: string | Types.ObjectId) {
    return Notification.countDocuments({ recipient, readAt: { $exists: false } });
  },

  markAsRead(id: string, recipient: string | Types.ObjectId, readAt = new Date()) {
    return Notification.findOneAndUpdate(
      { _id: id, recipient },
      { readAt },
      {
        new: true,
        runValidators: true,
      },
    );
  },

  markAllAsRead(recipient: string | Types.ObjectId, readAt = new Date()) {
    return Notification.updateMany(
      { recipient, readAt: { $exists: false } },
      { readAt },
      { runValidators: true },
    );
  },
};
