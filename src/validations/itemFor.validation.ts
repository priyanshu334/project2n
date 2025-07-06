import { z } from "zod";

const itemForSchema = z
  .object({
    itemForName: z
      .string()
      .trim()
      .min(3, "itemfor name should be atleast 3 char long")
      .transform((val) => val.toLowerCase()),
  })
  .strict();

export default itemForSchema;
