import { z } from "zod";
import mongoObjectIdSchema from "./mongoObjectId.validate";

const priceUpdatesSchema = z
  .object({
    metalId: mongoObjectIdSchema,
    materialId: mongoObjectIdSchema,
    price: z
      .number({
        required_error: "price is required",
        invalid_type_error: "price must be a number",
      })
      .min(0, { message: "price must be a positive number" })
      .transform((val) => Math.round(val * 100) / 100),
  })
  .strict();

export default priceUpdatesSchema;
