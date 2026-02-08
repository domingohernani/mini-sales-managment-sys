import type { FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";
import {
  createCustomerSchema,
  updateCustomerSchema,
  type CreateCustomer,
  type UpdateCustomer,
} from "./schema/customer.schema.ts";
import { idSchema, type IdParams } from "../../common/schemas/id.schema.ts";

/**
 * Retrieves all customers ordered by creation date (newest first).
 */
export const getAll = async (request: FastifyRequest, reply: FastifyReply) => {
  const { rows } = await request.server.pg.query(
    "SELECT * FROM customers ORDER BY created_at DESC",
  );
  return { customers: rows };
};

/**
 * Retrieves a single customer by ID.
 * Returns 404 if customer not found.
 */
export const getOne = async (
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) => {
  try {
    const { id } = idSchema.parse(request.params);

    const { rows } = await request.server.pg.query(
      "SELECT * FROM customers WHERE id = $1",
      [id],
    );

    if (rows.length === 0) {
      return reply.status(404).send({ error: "Customer not found" });
    }

    return { customer: rows[0] };
  } catch (error) {
    if (error instanceof ZodError) {
      return reply.status(400).send({ error: error.message });
    }
    throw error;
  }
};

/**
 * Creates a new customer with validated data.
 * Returns 400 if validation fails.
 */
export const create = async (
  request: FastifyRequest<{ Body: CreateCustomer }>,
  reply: FastifyReply,
) => {
  try {
    const { first_name, last_name, email, phone } = createCustomerSchema.parse(
      request.body,
    );

    const { rows } = await request.server.pg.query(
      `INSERT INTO customers (first_name, last_name, email, phone) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [first_name, last_name, email, phone],
    );

    return reply.status(201).send({ customer: rows[0] });
  } catch (error) {
    if (error instanceof ZodError) {
      return reply.status(400).send({ error: error.message });
    }
    throw error;
  }
};

/**
 * Updates customer information with partial data.
 * At least one field must be provided.
 * Returns 404 if customer not found, 400 if no fields provided or validation fails.
 */
export const update = async (
  request: FastifyRequest<{ Params: IdParams; Body: UpdateCustomer }>,
  reply: FastifyReply,
) => {
  try {
    const { id } = idSchema.parse(request.params);
    const validatedBody = updateCustomerSchema.parse(request.body);

    const { first_name, last_name, email, phone } = validatedBody;

    // Building a dynamic update query based on provided fields
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (first_name !== undefined) {
      updates.push(`first_name = $${paramCount++}`);
      values.push(first_name);
    }

    if (last_name !== undefined) {
      updates.push(`last_name = $${paramCount++}`);
      values.push(last_name);
    }

    if (email !== undefined) {
      updates.push(`email = $${paramCount++}`);
      values.push(email);
    }

    if (phone !== undefined) {
      updates.push(`phone = $${paramCount++}`);
      values.push(phone);
    }

    if (updates.length === 0) {
      return reply.status(400).send({ error: "No fields to update" });
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `UPDATE customers SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`;

    const { rows } = await request.server.pg.query(query, values);

    if (rows.length === 0) {
      return reply.status(404).send({ error: "Customer not found" });
    }

    return { customer: rows[0] };
  } catch (error) {
    if (error instanceof ZodError) {
      return reply.status(400).send({ error: error.message });
    }
    throw error;
  }
};

/**
 * Deletes a customer by ID.
 * Returns 404 if customer not found.
 */
export const remove = async (
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) => {
  try {
    const { id } = idSchema.parse(request.params);

    const { rows } = await request.server.pg.query(
      "DELETE FROM customers WHERE id = $1 RETURNING id",
      [id],
    );

    if (rows.length === 0) {
      return reply.status(404).send({ error: "Customer not found" });
    }

    return reply.status(200).send({ message: "Customer deleted successfully" });
  } catch (error) {
    if (error instanceof ZodError) {
      return reply.status(400).send({ error: error.message });
    }
    throw error;
  }
};
