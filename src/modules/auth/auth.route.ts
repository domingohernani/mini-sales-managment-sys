import type { FastifyInstance } from "fastify";
import { authenticate, refresh } from "./auth.controller.ts";

const authRoutes = async (fastify: FastifyInstance) => {
  fastify.post("/authenticate", authenticate);
  fastify.post("/refresh", refresh);
};

export default authRoutes;
