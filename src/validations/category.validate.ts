import { z } from "zod";

const categorySchema = z
  .object({
    categoryName: z
      .string()
      .trim()
      .min(3, "category name should be atleast 3 char long")
      .transform((val) => val.toLowerCase()),

    parentCategoryId: z.union([
      z.string().regex(/^[0-9a-fA-F]{24}$/, {
        message: "Invalid MongoDB ObjectId",
      }),
      z.null(),
    ]),
  })
  .strict();

export default categorySchema;
