import type { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../lib/prisma.js";
import type { CreateServiceBody } from "../types/servicesTypes.js";

export class ServiceController {
  // Listar serviços
  public async listServices(request: FastifyRequest, reply: FastifyReply): Promise<void> {
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

  // Criar serviço
  public async createService(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const data = request.body as CreateServiceBody;

    try {
      const newService = await prisma.service.create({ data: data });

      return reply.status(201).send(newService);
    } catch (error) {
      request.log.error(error);

      return reply.status(500).send({ error: 'Erro ao criar serviço.' });
    }
  }
}
