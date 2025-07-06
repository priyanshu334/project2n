import { z } from "zod";

const materialSchema = z
  .object({
    materialName: z
      .string()
      .trim()
      .min(3, "material name should be atleast 3 char long")
      .transform((val) => val.toLowerCase()),
  })
  .strict();

export default materialSchema;
