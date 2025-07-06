import { z } from "zod";

const mongoObjectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, {
  message: "Invalid MongoDB ObjectId",
});

export default mongoObjectIdSchema;
