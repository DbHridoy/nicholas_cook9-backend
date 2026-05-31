import { model, Schema, type HydratedDocument, type Types } from "mongoose";

export type NotificationType = "claim_created";

export type Notification = {
  recipient: Types.ObjectId;
  claim: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  readAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

const notificationSchema = new Schema<Notification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    claim: {
      type: Schema.Types.ObjectId,
      ref: "Claim",
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    readAt: {
      type: Date,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export type NotificationDocument = HydratedDocument<Notification> & {
  _id: Types.ObjectId;
};

export const Notification = model<Notification>("Notification", notificationSchema);
