import { Schema, model, models, Document, Types } from "mongoose";

export interface IPriceUpdates extends Document {
  metalId: Types.ObjectId;
  materialId: Types.ObjectId;
  price: number;
}

const priceUpdatesSchema = new Schema<IPriceUpdates>(
  {
    metalId: {
      type: Schema.Types.ObjectId,
      ref: "Metal", // if you have a Metal model
      required: true,
    },
    materialId: {
      type: Schema.Types.ObjectId,
      ref: "Material", // if you have a Material model
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price must be a positive number"],
      set: (v: number) => Math.round(v * 100) / 100,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt fields
  }
);

const PriceUpdates =
  models.CurrentPrice ||
  model<IPriceUpdates>("CurrentPrice", priceUpdatesSchema);

export default PriceUpdates;
