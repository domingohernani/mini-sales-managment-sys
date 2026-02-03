import type { FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";
import {
  createProductSchema,
  updateProductSchema,
  type CreateProduct,
  type UpdateProduct,
} from "./schema/product.schema.ts";
import { idSchema, type IdParams } from "../common/schemas/id.schema.ts";

/**
 * Retrieves all products ordered by creation date (newest first).
 */
export const getAll = async (request: FastifyRequest, reply: FastifyReply) => {
  const { rows } = await request.server.pg.query(
    "SELECT * FROM products ORDER BY created_at DESC",
  );
  return { products: rows };
};

/**
 * Retrieves a single product by ID.
 * Returns 404 if product not found.
 */
export const getOne = async (
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) => {
  try {
    const { id } = idSchema.parse(request.params);

    const { rows } = await request.server.pg.query(
      "SELECT * FROM products WHERE id = $1",
      [id],
    );

    if (rows.length === 0) {
      return reply.status(404).send({ error: "Product not found" });
    }

    return { product: rows[0] };
  } catch (error) {
    if (error instanceof ZodError) {
      return reply.status(400).send({ error: error.message });
    }
    throw error;
  }
};

/**
 * Creates a new product with validated data.
 * Returns 400 if validation fails.
 */
export const create = async (
  request: FastifyRequest<{ Body: CreateProduct }>,
  reply: FastifyReply,
) => {
  try {
    const { name, description, price, stock } = createProductSchema.parse(
      request.body,
    );

    const { rows } = await request.server.pg.query(
      `INSERT INTO products (name, description, price, stock) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [name, description, price, stock],
    );

    return reply.status(201).send({ product: rows[0] });
  } catch (error) {
    if (error instanceof ZodError) {
      return reply.status(400).send({ error: error.message });
    }
    throw error;
  }
};

/**
 * Updates product information with partial data.
 * At least one field must be provided.
 * Returns 404 if product not found, 400 if no fields provided or validation fails.
 */
export const update = async (
  request: FastifyRequest<{ Params: IdParams; Body: UpdateProduct }>,
  reply: FastifyReply,
) => {
  try {
    const { id } = idSchema.parse(request.params);
    const validatedBody = updateProductSchema.parse(request.body);

    const { name, description, price, stock } = validatedBody;

    // Building a dynamic update query based on provided fields
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }

    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }

    if (price !== undefined) {
      updates.push(`price = $${paramCount++}`);
      values.push(price);
    }

    if (stock !== undefined) {
      updates.push(`stock = $${paramCount++}`);
      values.push(stock);
    }

    if (updates.length === 0) {
      return reply.status(400).send({ error: "No fields to update" });
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `UPDATE products SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`;

    const { rows } = await request.server.pg.query(query, values);

    if (rows.length === 0) {
      return reply.status(404).send({ error: "Product not found" });
    }

    return { product: rows[0] };
  } catch (error) {
    if (error instanceof ZodError) {
      return reply.status(400).send({ error: error.message });
    }
    throw error;
  }
};

/**
 * Deletes a product by ID.
 * Returns 404 if product not found.
 */
export const remove = async (
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) => {
  try {
    const { id } = idSchema.parse(request.params);

    const { rows } = await request.server.pg.query(
      "DELETE FROM products WHERE id = $1 RETURNING id",
      [id],
    );

    if (rows.length === 0) {
      return reply.status(404).send({ error: "Product not found" });
    }

    return reply.status(200).send({ message: "Product deleted successfully" });
  } catch (error) {
    if (error instanceof ZodError) {
      return reply.status(400).send({ error: error.message });
    }
    throw error;
  }
};
