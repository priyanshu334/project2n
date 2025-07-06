import mongoose, { Schema, Document, model, models } from "mongoose";

export interface ICategory extends Document {
  categoryName: string;
  parentCategoryId?: mongoose.Types.ObjectId | null;
  image: string;
}

const categorySchema = new Schema<ICategory>(
  {
    categoryName: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
      minlength: [3, "Category name should be at least 3 characters"],
      lowercase: true,
    },
    parentCategoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Category =
  models.Category || model<ICategory>("Category", categorySchema);
export default Category;
