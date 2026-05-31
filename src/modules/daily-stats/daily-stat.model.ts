import { model, Schema, type HydratedDocument, type Types } from "mongoose";

export type DailyStat = {
  dealer: Types.ObjectId;
  date: Date;
  customers: number;
  contractsSold: number;
  avgSaleValue: number;
  totalSales: number;
  conversionRate: number;
  createdAt?: Date;
  updatedAt?: Date;
};

const dailyStatSchema = new Schema<DailyStat>(
  {
    dealer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    customers: { type: Number, required: true, min: 0 },
    contractsSold: { type: Number, required: true, min: 0 },
    avgSaleValue: { type: Number, required: true, min: 0 },
    totalSales: { type: Number, required: true, min: 0 },
    conversionRate: { type: Number, required: true, min: 0, max: 100 },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

dailyStatSchema.index({ dealer: 1, date: 1 }, { unique: true });

export type DailyStatDocument = HydratedDocument<DailyStat> & {
  _id: Types.ObjectId;
};

export const DailyStat = model<DailyStat>("DailyStat", dailyStatSchema);
