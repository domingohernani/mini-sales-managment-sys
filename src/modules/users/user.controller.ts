import type { FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserInput,
  type UpdateUserInput,
} from "./schema/user.schema.ts";
import { idSchema, type IdParams } from "../../common/schemas/id.schema.ts";

/**
 * Retrieves all users (excluding password field).
 * Returns basic user information: id, first_name, last_name, email.
 */
export const getAll = async (request: FastifyRequest, reply: FastifyReply) => {
  const { rows } = await request.server.pg.query(
    "SELECT id, first_name, last_name, email FROM users",
  );
  return { users: rows };
};

/**
 * Retrieves a single user by ID (excluding password field).
 * Returns 404 if user not found.
 */
export const getOne = async (
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) => {
  try {
    const { id } = idSchema.parse(request.params);

    const { rows } = await request.server.pg.query(
      "SELECT id, first_name, last_name, email FROM users WHERE id = $1",
      [id],
    );

    if (rows.length === 0) {
      return reply.status(404).send({ error: "User not found" });
    }

    return { user: rows[0] };
  } catch (error) {
    if (error instanceof ZodError) {
      return reply.status(400).send({ error: error.message });
    }
    throw error;
  }
};

/**
 * Creates a new user with validated data.
 * Returns 400 if validation fails.
 */
export const create = async (
  request: FastifyRequest<{ Body: CreateUserInput }>,
  reply: FastifyReply,
) => {
  try {
    const { first_name, last_name, email, password } = createUserSchema.parse(
      request.body,
    );

    // TODO: Hash password before storing
    const { rows } = await request.server.pg.query(
      "INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING id, first_name, last_name, email",
      [first_name, last_name, email, password], // Use hashedPassword in production
    );

    return reply.status(201).send({ user: rows[0] });
  } catch (error) {
    if (error instanceof ZodError) {
      return reply.status(400).send({ error: error.message });
    }
    throw error;
  }
};

/**
 * Updates user information with partial data.
 * At least one field must be provided.
 * Returns 404 if user not found, 400 if no fields provided or validation fails.
 */
export const update = async (
  request: FastifyRequest<{ Params: IdParams; Body: UpdateUserInput }>,
  reply: FastifyReply,
) => {
  try {
    const { id } = idSchema.parse(request.params);
    const validatedBody = updateUserSchema.parse(request.body);

    const { first_name, last_name, email, password } = validatedBody;

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

    if (password !== undefined) {
      // TODO: Hash password before storing
      // const hashedPassword = await bcrypt.hash(password, 10);
      updates.push(`password = $${paramCount++}`);
      values.push(password); // Use hashedPassword in production
    }

    if (updates.length === 0) {
      return reply.status(400).send({ error: "No fields to update" });
    }

    values.push(id);
    const query = `UPDATE users SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING id, first_name, last_name, email`;

    const { rows } = await request.server.pg.query(query, values);

    if (rows.length === 0) {
      return reply.status(404).send({ error: "User not found" });
    }

    return { user: rows[0] };
  } catch (error) {
    if (error instanceof ZodError) {
      return reply.status(400).send({ error: error.message });
    }
    throw error;
  }
};

/**
 * Deletes a user by ID.
 * Returns 404 if user not found.
 */
export const remove = async (
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) => {
  try {
    const { id } = idSchema.parse(request.params);

    const { rows } = await request.server.pg.query(
      "DELETE FROM users WHERE id = $1 RETURNING id",
      [id],
    );

    if (rows.length === 0) {
      return reply.status(404).send({ error: "User not found" });
    }

    return reply.status(200).send({ message: "User deleted successfully" });
  } catch (error) {
    if (error instanceof ZodError) {
      return reply.status(400).send({ error: error.message });
    }
    throw error;
  }
};
