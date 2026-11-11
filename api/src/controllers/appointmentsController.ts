import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { Prisma } from '../prisma/index.js';
import {
  createAppointmentSchema,
  deleteAppointmentSchema,
  editAppointmentBodySchema,
  editAppointmentParamsSchema,
  listAppointmentsSchema
} from '../schemas/appointmentsSchema.js';

type ListAppointmentsQuery = z.infer<typeof listAppointmentsSchema>;
type CreateAppointmentBody = z.infer<typeof createAppointmentSchema>;
type DeleteAppointmentParams = z.infer<typeof deleteAppointmentSchema>;
type EditAppointmentParams = z.infer<typeof editAppointmentParamsSchema>;
type EditAppointmentBody = z.infer<typeof editAppointmentBodySchema>;

export class AppointmentsController {
  public async listAppointments(
    request: FastifyRequest<{ Querystring: ListAppointmentsQuery }>,
    reply: FastifyReply
  ): Promise<FastifyReply> {
    try {
      const { date } = request.query;
      const whereClause: Prisma.AppointmentWhereInput = {};

      if (date) {
        const startOfDay = new Date(`${date}T00:00:00.000Z`);
        const endOfDay = new Date(`${date}T23:59:59.999Z`);
        whereClause.startTime = { gte: startOfDay, lte: endOfDay };
      }

      const appointments = await prisma.appointment.findMany({
        where: whereClause,
        include: { service: true },
        orderBy: { startTime: 'asc' },
      });

      return reply.status(200).send(appointments);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Erro interno ao buscar os agendamentos.' });
    }
  }

  public async createAppointment(
    request: FastifyRequest<{ Body: CreateAppointmentBody }>,
    reply: FastifyReply
  ): Promise<FastifyReply> {
    try {
      const data = request.body;

      const service = await prisma.service.findUnique({
        where: { id: data.serviceId },
      });

      if (!service) {
        return reply.status(404).send({ error: 'Serviço não encontrado na base de dados.' });
      }

      const startDateTime = data.startTime;
      const endDateTime = new Date(startDateTime.getTime() + service.durationMinutes * 60000);

      const newAppointment = await prisma.$transaction(async (tx) => {
        // 1. Checa a disponibilidade já dentro do contexto da transação
        const conflictingAppointment = await tx.appointment.findFirst({
          where: {
            OR: [
              {
                startTime: { lt: endDateTime },
                endTime: { gt: startDateTime },
              },
            ],
          },
        });

        // 2. Se encontrar conflito, disparamos um erro para forçar o ROLLBACK do banco
        if (conflictingAppointment) {
          throw new Error('CONFLICT');
        }

        // 3. Se estiver livre, cria o agendamento de forma segura
        return await tx.appointment.create({
          data: {
            customerName: data.customerName,
            customerPhone: data.customerPhone,
            startTime: startDateTime,
            endTime: endDateTime,
            serviceId: data.serviceId,
          },
          include: { service: true },
        });
      }, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });

      return reply.status(201).send(newAppointment);

    } catch (error: any) {
      // Intercepta o rollback do prisma
      if (error.message === 'CONFLICT') {
        return reply.status(409).send({ error: 'Horário indisponível. Já existe um agendamento neste período.' });
      }

      request.log.error(error);
      return reply.status(500).send({ error: 'Erro interno ao processar o agendamento.' });
    }
  }

  public async deleteAppointment(
    request: FastifyRequest<{ Params: DeleteAppointmentParams }>,
    reply: FastifyReply
  ): Promise<FastifyReply> {
    try {
      const { id } = request.params;

      const appointment = await prisma.appointment.findUnique({
        where: { id },
      });

      if (!appointment) {
        return reply.status(404).send({ error: 'Agendamento não encontrado na base de dados.' });
      }

      await prisma.appointment.delete({
        where: { id },
      });

      return reply.status(204).send();
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Erro interno ao cancelar o agendamento.' });
    }
  }

  public async updateAppointment(
    request: FastifyRequest<{ Params: EditAppointmentParams; Body: EditAppointmentBody }>,
    reply: FastifyReply
  ): Promise<FastifyReply> {
    try {
      const { id } = request.params;
      const data = request.body;

      if (!data || Object.keys(data).length === 0) {
        return reply.status(400).send({ error: 'Nenhum dado fornecido para atualização.' });
      }

      const appointment = await prisma.appointment.findUnique({
        where: { id },
      });

      if (!appointment) {
        return reply.status(404).send({ error: 'Agendamento não encontrado na base de dados.' });
      }

      let newEndTime = appointment.endTime;

      if (data.startTime || data.serviceId) {
        const targetServiceId = data.serviceId || appointment.serviceId;
        const targetStartTime = data.startTime || appointment.startTime;

        const service = await prisma.service.findUnique({
          where: { id: targetServiceId },
        });

        if (!service) {
          return reply.status(404).send({ error: 'Serviço não encontrado na base de dados.' });
        }

        newEndTime = new Date(targetStartTime.getTime() + service.durationMinutes * 60000);

        const conflictingAppointment = await prisma.appointment.findFirst({
          where: {
            id: { not: id },
            OR: [
              { startTime: { lt: newEndTime }, endTime: { gt: targetStartTime } },
            ],
          },
        });

        if (conflictingAppointment) {
          return reply.status(409).send({ error: 'Horário indisponível. Já existe um agendamento neste período.' });
        }
      }

      const editedAppointment = await prisma.appointment.update({
        where: { id },
        data: {
          ...data,
          endTime: newEndTime,
        },
        include: { service: true },
      });

      return reply.status(200).send(editedAppointment);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Erro interno ao buscar o agendamento.' });
    }
  }
}