import type { FastifyInstance } from "fastify";
import { getAll, getByMonth } from "./sales.controller.ts";
import { verifyJWT } from "../../common/middlewares/verify-jwt.middleware.ts";

const salesRoutes = async (fastify: FastifyInstance) => {
  fastify.addHook("preHandler", verifyJWT);
  fastify.get("/sales", getAll);
  fastify.get("/sales/monthly-purchases", getByMonth);
};

export default salesRoutes;
