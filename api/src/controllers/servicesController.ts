import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import {
  createServiceSchema,
  deleteServiceSchema,
  editServiceBodySchema,
  editServiceParamsSchema
} from "../schemas/servicesSchema.js";

type CreateServiceBody = z.infer<typeof createServiceSchema>;
type DeleteServiceParams = z.infer<typeof deleteServiceSchema>;
type EditServiceParams = z.infer<typeof editServiceParamsSchema>;
type EditServiceBody = z.infer<typeof editServiceBodySchema>;

export class ServiceController {
  public async listServices(request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> {
    try {
      const services = await prisma.service.findMany({
        orderBy: { id: "asc" },
      });

      return reply.status(200).send(services);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Erro ao buscar o catálogo de serviços.' });
    }
  }

  public async createService(
    request: FastifyRequest<{ Body: CreateServiceBody }>,
    reply: FastifyReply
  ): Promise<FastifyReply> {
    try {
      const data = request.body;
      const newService = await prisma.service.create({ data });

      return reply.status(201).send(newService);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Erro ao criar serviço.' });
    }
  }

  public async deleteService(
    request: FastifyRequest<{ Params: DeleteServiceParams }>,
    reply: FastifyReply
  ): Promise<FastifyReply> {
    try {
      const { id } = request.params;

      const service = await prisma.service.findUnique({
        where: { id },
      });

      if (!service) {
        return reply.status(404).send({ error: 'Serviço não encontrado na base de dados.' });
      }

      await prisma.service.delete({
        where: { id },
      });

      return reply.status(204).send();
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Erro ao cancelar serviço.' });
    }
  }

  public async updateService(
    request: FastifyRequest<{ Params: EditServiceParams; Body: EditServiceBody }>,
    reply: FastifyReply
  ): Promise<FastifyReply> {
    try {
      const { id } = request.params;
      const data = request.body;

      const service = await prisma.service.findUnique({
        where: { id },
      });

      if (!service) {
        return reply.status(404).send({ error: 'Serviço não encontrado na base de dados.' });
      }

      const updatedService = await prisma.service.update({
        where: { id },
        data,
      });

      return reply.status(200).send(updatedService);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Erro ao atualizar serviço.' });
    }
  }
}