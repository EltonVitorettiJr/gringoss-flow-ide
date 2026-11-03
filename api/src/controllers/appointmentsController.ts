import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../lib/prisma.js";
import { CreateAppointmentBody } from "../types/appointmentsTypes.js";

export class AppointmentsController {
  public async listAppointments(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const appointments = await prisma.appointment.findMany({
        include: { service: true },
        orderBy: { id: "asc" },
      });

      return reply.status(200).send(appointments);
    } catch (error) {
      request.log.error(error);

      return reply.status(500).send({ error: 'Erro ao buscar os agendamentos.' });
    }
  }

  public async createAppointment(request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> {
    const data = request.body as CreateAppointmentBody;

    if (!data.customerName || !data.startTime || !data.serviceId) {
      return reply.status(400).send({ error: 'Dados obrigatórios ausentes: customerName, startTime ou serviceId.' });
    }

    try {
      const service = await prisma.service.findUnique({
        where: { id: data.serviceId },
      });

      if (!service) {
        return reply.status(404).send({ error: 'Serviço não encontrado na base de dados.' });
      }

      const startDateTime = new Date(data.startTime);
      const endDateTime = new Date(startDateTime.getTime() + service.durationMinutes * 60000);

      const conflictingAppointment = await prisma.appointment.findFirst({
        where: {
          OR: [
            {
              startTime: { lt: endDateTime },
              endTime: { gt: startDateTime },
            },
          ],
        },
      });

      if (conflictingAppointment) {
        return reply.status(409).send({ error: 'Horário indisponível. Já existe um agendamento neste período.' });
      }

      const newAppointment = await prisma.appointment.create({
        data: {
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          startTime: startDateTime,
          endTime: endDateTime,
          serviceId: data.serviceId,
        },
        include: {
          service: true,
        },
      });

      return reply.status(201).send(newAppointment);
    } catch (error) {
      request.log.error(error);

      return reply.status(500).send({ error: 'Erro interno ao processar o agendamento.' });
    }
  }
}