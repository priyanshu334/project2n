import { z } from "zod";

const metalSchema = z
  .object({
    metalName: z
      .string()
      .trim()
      .min(3, "metal name should be atleast 3 char long")
      .transform((val) => val.toLowerCase()),
  })
  .strict();

export default metalSchema;
