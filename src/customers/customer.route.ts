import type { FastifyInstance } from "fastify";
import {
  getAll,
  getOne,
  create,
  update,
  remove,
} from "./customer.controller.ts";

const customerRoutes = async (fastify: FastifyInstance) => {
  fastify.get("/customers", getAll);
  fastify.get("/customers/:id", getOne);
  fastify.post("/customers", create);
  fastify.patch("/customers/:id", update);
  fastify.delete("/customers/:id", remove);
};

export default customerRoutes;
