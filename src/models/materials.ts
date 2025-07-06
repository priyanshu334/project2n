import { Schema, Document, model, models } from "mongoose";

export interface IMaterial extends Document {
  materialName: string;
}

const materialSchema = new Schema<IMaterial>(
  {
    materialName: {
      type: String,
      required: [true, "material-name is required"],
      unique: true,
      trim: true,
      minlength: [3, "material-name should be at least 3 characters"],
      lowercase: true,
    },
  },
  { timestamps: true }
);

const Material =
  models.Material || model<IMaterial>("Material", materialSchema);

export default Material;
