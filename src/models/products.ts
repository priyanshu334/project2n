import { Schema, Document, model, models, Types } from "mongoose";

interface IMedia {
  images: string[];
  video: string;
  previewImages: string[];
}

interface IDetail {
  size: number;
  weight: number;
  height: number;
  stock: number;
  description: string;
}

export interface IProduct extends Document {
  productName: string;
  making: number;
  discount: number;
  itemFor: Types.ObjectId[];
  category: Types.ObjectId[];
  material: Types.ObjectId;
  metal: Types.ObjectId;
  media: IMedia;
  details: IDetail[];
  description: string;
}

const mediaSchema = new Schema<IMedia>(
  {
    images: [
      {
        type: String,
        required: [true, "Image is required"],
        trim: true,
      },
    ],
    video: {
      type: String,
      required: [true, "Video is required"],
      trim: true,
    },
    previewImages: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { _id: false }
);

const productSchema = new Schema<IProduct>(
  {
    productName: {
      type: String,
      required: [true, "Product name is required"],
      unique: true,
      trim: true,
      minlength: [3, "Product name should be at least 3 characters"],
      lowercase: true,
    },
    making: {
      type: Number,
      required: [true, "Making percentage is required"],
      min: [0, "Making percentage cannot be less than 0"],
      max: [100, "Making percentage cannot be greater than 100"],
    },
    discount: {
      type: Number,
      required: [true, "Discount percentage is required"],
      min: [0, "Discount percentage cannot be less than 0"],
      max: [100, "Discount percentage cannot be greater than 100"],
    },
    itemFor: [
      {
        type: Schema.Types.ObjectId,
        ref: "ItemFor",
        required: [true, "At least one item for is required"],
      },
    ],
    category: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: [true, "At least one category is required"],
      },
    ],
    material: {
      type: Schema.Types.ObjectId,
      ref: "Material",
      required: [true, "Material is required"],
    },
    metal: {
      type: Schema.Types.ObjectId,
      ref: "Metal",
      required: [true, "Metal is required"],
    },
    media: mediaSchema,
    details: [
      {
        size: {
          type: Number,
          required: [true, "Size is required"],
        },
        weight: {
          type: Number,
          required: [true, "Weight is required"],
        },
        height: {
          type: Number,
          required: [true, "Height is required"],
        },
        stock: {
          type: Number,
          required: [true, "Stock quantity is required"],
        },
        description: {
          type: String,
          required: [true, "Material description is required"],
          lowercase: true,
        },
      },
    ],
    description: {
      type: String,
      required: [true, "Product description is required"],
      lowercase: true,
    },
  },
  { timestamps: true }
);

productSchema.pre("save", function (next) {
  if (this.making) {
    this.making = parseFloat(this.making.toFixed(2));
  }
  if (this.discount) {
    this.discount = parseFloat(this.discount.toFixed(2));
  }
  next();
});

const Product = models.Product || model<IProduct>("Product", productSchema);
export default Product;
