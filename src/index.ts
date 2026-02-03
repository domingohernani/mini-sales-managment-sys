import Fastify from "fastify";
import Postgres from "./plugins/postgres.ts";

import customerRoutes from "./customers/customer.route.ts";

const fastify = Fastify();

// Register the database
fastify.register(Postgres);

// REgister routes
fastify.register(customerRoutes);

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
