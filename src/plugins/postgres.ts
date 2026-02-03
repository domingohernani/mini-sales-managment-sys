import fp from "fastify-plugin";
import { Pool } from "pg";
import type { FastifyInstance } from "fastify";

export default fp(async (fastify: FastifyInstance) => {
  // Pool creation
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URI,
  });

  // To include a pg property at server
  fastify.decorate("pg", pool);
});
