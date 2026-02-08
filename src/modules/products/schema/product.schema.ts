import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(200),
  description: z.string().max(1000).optional(),
  price: z
    .number()
    .positive("Price must be a positive number")
    .multipleOf(0.01, "Price must have at most 2 decimal places"),
  stock: z
    .number()
    .int("Stock must be an integer")
    .nonnegative("Stock cannot be negative")
    .default(0),
});

export const updateProductSchema = z
  .object({
    name: z.string().min(1, "Product name is required").max(200).optional(),
    description: z.string().max(1000).optional(),
    price: z
      .number()
      .positive("Price must be a positive number")
      .multipleOf(0.01, "Price must have at most 2 decimal places")
      .optional(),
    stock: z
      .number()
      .int("Stock must be an integer")
      .nonnegative("Stock cannot be negative")
      .optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "At least one field must be provided",
  });

export type CreateProduct = z.infer<typeof createProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;
