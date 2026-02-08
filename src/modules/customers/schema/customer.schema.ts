import { z } from "zod";

export const createCustomerSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(100),
  last_name: z.string().min(1, "Last name is required").max(100),
  email: z.email("Invalid email format"),
  phone: z.string().min(1, "Phone is required").max(20).optional(),
});

export const updateCustomerSchema = z
  .object({
    first_name: z.string().min(1, "First name is required").max(100).optional(),
    last_name: z.string().min(1, "Last name is required").max(100).optional(),
    email: z.email("Invalid email format").optional(),
    phone: z.string().max(20).optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "At least one field must be provided",
  });

export type CreateCustomer = z.infer<typeof createCustomerSchema>;
export type UpdateCustomer = z.infer<typeof updateCustomerSchema>;
