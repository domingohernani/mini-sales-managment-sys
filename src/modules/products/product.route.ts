import type { FastifyInstance } from "fastify";
import {
  getAll,
  getOne,
  create,
  update,
  remove,
} from "./product.controller.ts";
import { verifyJWT } from "../../common/middlewares/verify-jwt.middleware.ts";

const productRoutes = async (fastify: FastifyInstance) => {
  fastify.addHook("preHandler", verifyJWT); // protect all routes
  fastify.get("/products", getAll);
  fastify.get("/products/:id", getOne);
  fastify.post("/products", create);
  fastify.patch("/products/:id", update);
  fastify.delete("/products/:id", remove);
};

export default productRoutes;
