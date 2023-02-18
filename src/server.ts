import fastify from "fastify";
import { env } from "./env";

const app = fastify();

app.get("/", () => {
  return "Hello World";
});

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log("HTTP Server Running");
  });
