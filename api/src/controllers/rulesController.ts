import type { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../lib/prisma.js";
import type { CreateRuleBody } from "../types/rulesTypes.js";

export class RulesController {
  // Listar regras
  public async listRules(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const rules = await prisma.businessRule.findMany();

      return reply.status(200).send(rules);
    } catch (error) {
      request.log.error(error);

      return reply.status(500).send({ error: 'Erro ao listar regras.' });
    }

  }

  // Criar regra
  public async createRule(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const data = request.body as CreateRuleBody;

    try {
      const newRule = await prisma.businessRule.create({ data: data });

      return reply.status(201).send(newRule);
    } catch (error) {
      request.log.error(error);

      return reply.status(500).send({ error: 'Erro ao criar regra.' });
    }
  }
}
