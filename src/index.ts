import Fastify from "fastify";
import Postgres from "./plugins/postgres.ts";
import cookie from "@fastify/cookie";

import authRoutes from "./auth/auth.route.ts";
import usersRoutes from "./users/user.route.ts";
import customerRoutes from "./customers/customer.route.ts";
import productRoutes from "./products/product.route.ts";

const fastify = Fastify();

// Register the database
fastify.register(Postgres);

// Register the cookie plugin
fastify.register(cookie);

// Register routes
fastify.register(authRoutes);
fastify.register(usersRoutes);
fastify.register(customerRoutes);
fastify.register(productRoutes);

// Run the server (script)
const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
