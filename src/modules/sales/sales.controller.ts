import type { FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";
import {
  getAllSalesQuerySchema,
  monthQuerySchema,
  type GetAllSalesQuery,
  type MonthQuery,
} from "./schema/sales.schema.ts";

// Get all sales (with optional filters)
export const getAll = async (
  request: FastifyRequest<{ Querystring: GetAllSalesQuery }>,
  reply: FastifyReply,
) => {
  try {
    const filters = getAllSalesQuerySchema.parse(request.query);

    let query = `
      SELECT 
        s.id as sale_id,
        s.sale_date,
        s.quantity,
        s.total_price,
        s.created_at,
        c.id as customer_id,
        c.first_name || ' ' || c.last_name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        p.id as product_id,
        p.name as product_name,
        p.description as product_description,
        p.price as unit_price
      FROM sales s
      JOIN customers c ON s.customer_id = c.id
      JOIN products p ON s.product_id = p.id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // Filter by customer
    if (filters.customerId) {
      query += ` AND c.id = $${paramIndex}`;
      params.push(filters.customerId);
      paramIndex++;
    }

    // Filter by product
    if (filters.productId) {
      query += ` AND p.id = $${paramIndex}`;
      params.push(filters.productId);
      paramIndex++;
    }

    // Filter by date range
    if (filters.startDate && filters.endDate) {
      query += ` AND DATE(s.sale_date) >= $${paramIndex} AND DATE(s.sale_date) <= $${paramIndex + 1}`;
      params.push(filters.startDate, filters.endDate);
      paramIndex += 2;
    }

    query += ` ORDER BY s.sale_date DESC`;

    const { rows } = await request.server.pg.query(query, params);

    return reply.send({
      sales: rows,
      total: rows.length,
      filters: filters,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return reply.status(400).send({ error: error.message });
    }
    throw error;
  }
};

// Get which customer bought which products during a particular month
export const getByMonth = async (
  request: FastifyRequest<{ Querystring: MonthQuery }>,
  reply: FastifyReply,
) => {
  try {
    const { month } = monthQuerySchema.parse(request.query);

    const startDate = `${month}-01`;
    const year = parseInt(month.split("-")[0]);
    const monthNum = parseInt(month.split("-")[1]);
    const endDate = new Date(year, monthNum, 0).toISOString().split("T")[0];

    const query = `
      SELECT 
        c.id as customer_id,
        c.first_name || ' ' || c.last_name as customer_name,
        c.email as customer_email,
        p.id as product_id,
        p.name as product_name,
        s.quantity,
        s.total_price,
        s.sale_date
      FROM sales s
      JOIN customers c ON s.customer_id = c.id
      JOIN products p ON s.product_id = p.id
      WHERE DATE(s.sale_date) >= $1 AND DATE(s.sale_date) <= $2
      ORDER BY c.first_name, s.sale_date DESC
    `;

    const { rows } = await request.server.pg.query(query, [startDate, endDate]);

    return reply.send({
      sales: {
        month,
        purchases: rows,
        total: rows.length,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: "Validation error",
        details: error.message,
      });
    }
    request.log.error(error);
    return reply.status(500).send({ error: "Internal server error" });
  }
};
