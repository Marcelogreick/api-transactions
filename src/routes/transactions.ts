import { FastifyInstance } from "fastify";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { knex } from "../database";

export async function transactionsRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    const transactions = await knex("transactions").select("*");

    return { transactions };
  });

  app.get("/:id", async (request, reply) => {
    const getTransactionSchema = z.object({
      id: z.string().uuid(),
    });

    const params = getTransactionSchema.parse(request.params);

    const { id } = params;

    const transaction = await knex("transactions")
      .select("*")
      .where({ id })
      .first();

    if (!transaction) {
      return reply.status(404).send(JSON.stringify({ message: "Not found" }));
    }

    return { transaction };
  });

  app.get("/summary", async () => {
    const transactions = await await knex("transactions")
      .sum("amount", {
        as: "amount",
      })
      .first();

    return { transactions };
  });

  app.post("/", async (request, reply) => {
    const createTransactionSchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(["credit", "debit"]),
    });

    const { amount, title, type } = createTransactionSchema.parse(request.body);

    let sessionId = request.cookies.sessionId;

    if (!sessionId) {
      sessionId = randomUUID();

      reply.setCookie("sessionId", sessionId, {
        path: "/",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      });
    }

    await knex("transactions").insert({
      id: randomUUID(),
      title,
      amount: type === "credit" ? amount : amount * -1,
      session_id: sessionId,
    });

    return reply
      .status(201)
      .send(JSON.stringify({ message: "Transação criada com sucesso" }));
  });
}
