import { z } from "zod";

export const monthQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, {
    message: "Month must be in YYYY-MM format (e.g., 2024-01)",
  }),
});

export const getAllSalesQuerySchema = z.object({
  customerId: z.uuid().optional(),
  productId: z.uuid().optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export type MonthQuery = z.infer<typeof monthQuerySchema>;
export type GetAllSalesQuery = z.infer<typeof getAllSalesQuerySchema>;
