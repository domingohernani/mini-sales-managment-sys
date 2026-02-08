import type { FastifyInstance } from "fastify";
import { getAll, getOne, create, update, remove } from "./user.controller.ts";
import { verifyJWT } from "../common/middlewares/verify-jwt.middleware.ts";

const userRoutes = async (fastify: FastifyInstance) => {
  fastify.addHook("preHandler", verifyJWT); // protect all routes
  fastify.get("/users", getAll);
  fastify.get("/users/:id", getOne);
  fastify.post("/users", create);
  fastify.patch("/users/:id", update);
  fastify.delete("/users/:id", remove);
};

export default userRoutes;
