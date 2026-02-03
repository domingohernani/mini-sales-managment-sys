import Fastify from "fastify";
import Postgres from "./plugins/postgres.ts";

const fastify = Fastify();

// Register the database
fastify.register(Postgres);

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
