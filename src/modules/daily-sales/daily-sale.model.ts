import { model, Schema, type HydratedDocument, type Types } from "mongoose";

export type DailySale = {
  dealer: Types.ObjectId;
  date: string;
  customerName: string;
  totalRevenue: number;
  grossMargin: number;
  createdAt?: Date;
  updatedAt?: Date;
};

const dailySaleSchema = new Schema<DailySale>(
  {
    dealer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
      index: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    totalRevenue: {
      type: Number,
      required: true,
      min: 0,
    },
    grossMargin: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

dailySaleSchema.index({ dealer: 1, date: -1, createdAt: -1 });
dailySaleSchema.index({ dealer: 1, customerName: 1 });

export type DailySaleDocument = HydratedDocument<DailySale> & {
  _id: Types.ObjectId;
};

export const DailySale = model<DailySale>("DailySale", dailySaleSchema);
