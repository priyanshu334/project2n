import { Document, model, models, Schema } from "mongoose";

export interface IItemFor extends Document {
  itemForName: string;
}

const itemForSchema = new Schema<IItemFor>(
  {
    itemForName: {
      type: String,
      required: [true, `item-for-name is required`],
      unique: true,
      trim: true,
      minlength: [3, `item-for-name should be at least 3 characters`],
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

const ItemFor = models.ItemFor || model<IItemFor>("ItemFor", itemForSchema);

export default ItemFor;
