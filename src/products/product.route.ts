import type { FastifyInstance } from "fastify";
import {
  getAll,
  getOne,
  create,
  update,
  remove,
} from "./product.controller.ts";

const productRoutes = async (fastify: FastifyInstance) => {
  fastify.get("/products", getAll);
  fastify.get("/products/:id", getOne);
  fastify.post("/products", create);
  fastify.patch("/products/:id", update);
  fastify.delete("/products/:id", remove);
};

export default productRoutes;
