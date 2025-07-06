import { Schema, Document, model, models } from "mongoose";

export interface IMetal extends Document {
  metalName: string;
}

const metalSchema = new Schema<IMetal>(
  {
    metalName: {
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

const Metal = models.Metal || model<IMetal>("Metal", metalSchema);

export default Metal;
