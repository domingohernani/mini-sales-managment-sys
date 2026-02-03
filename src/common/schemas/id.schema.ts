import { z } from "zod";

export const idSchema = z.object({
  id: z.uuid("Invalid user ID format"),
});

export type IdParams = z.infer<typeof idSchema>;
