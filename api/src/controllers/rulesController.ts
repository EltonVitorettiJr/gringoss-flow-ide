import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import {
  createRuleSchema,
  deleteRuleSchema,
  editRuleBodySchema,
  editRuleParamsSchema
} from '../schemas/rulesSchema.js';
import { mapTimeResponse } from '../utils/formatTime.js';

// Inferência estrita de tipos direto dos schemas do Zod
type CreateRuleBody = z.infer<typeof createRuleSchema>;
type EditRuleBody = z.infer<typeof editRuleBodySchema>;
type EditRuleParams = z.infer<typeof editRuleParamsSchema>;
type DeleteRuleParams = z.infer<typeof deleteRuleSchema>;

export class RulesController {
  public async listRules(request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> {
    try {
      const rules = await prisma.businessRule.findMany({
        orderBy: { dayOfWeek: 'asc' },
      });

      const formattedRules = rules.map(rule => mapTimeResponse(rule));

      return reply.status(200).send(formattedRules);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Erro interno ao listar as regras.' });
    }
  }

  public async createRule(
    // Injetando o tipo no Request
    request: FastifyRequest<{ Body: CreateRuleBody }>,
    reply: FastifyReply
  ): Promise<FastifyReply> {
    try {
      const data = request.body;

      const newRule = await prisma.businessRule.create({
        data: {
          dayOfWeek: data.dayOfWeek,
          openTime: data.openTime.toISOString(),
          closeTime: data.closeTime.toISOString(),
          breakStart: data.breakStart?.toISOString(),
          breakEnd: data.breakEnd?.toISOString(),
        }
      });

      return reply.status(201).send(mapTimeResponse(newRule));
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Erro interno ao criar a regra.' });
    }
  }

  public async updateRule(
    // Injetando Params e Body simultaneamente
    request: FastifyRequest<{ Params: EditRuleParams; Body: EditRuleBody }>,
    reply: FastifyReply
  ): Promise<FastifyReply> {
    try {
      const { id } = request.params;
      const data = request.body;

      const ruleExists = await prisma.businessRule.findUnique({ where: { id } });

      if (!ruleExists) {
        return reply.status(404).send({ error: 'Regra não encontrada na base de dados.' });
      }

      const updatedRule = await prisma.businessRule.update({
        where: { id },
        data: {
          dayOfWeek: data.dayOfWeek,
          openTime: data.openTime?.toISOString(),
          closeTime: data.closeTime?.toISOString(),
          breakStart: data.breakStart?.toISOString(),
          breakEnd: data.breakEnd?.toISOString(),
        },
      });

      return reply.status(200).send(mapTimeResponse(updatedRule));
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Erro interno ao atualizar a regra.' });
    }
  }

  public async deleteRule(
    request: FastifyRequest<{ Params: DeleteRuleParams }>,
    reply: FastifyReply
  ): Promise<FastifyReply> {
    try {
      const { id } = request.params;

      const ruleExists = await prisma.businessRule.findUnique({ where: { id } });

      if (!ruleExists) {
        return reply.status(404).send({ error: 'Regra não encontrada na base de dados.' });
      }

      await prisma.businessRule.delete({ where: { id } });

      return reply.status(204).send();
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Erro interno ao deletar a regra.' });
    }
  }
}