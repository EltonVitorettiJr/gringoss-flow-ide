import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { AppointmentsController } from "../controllers/appointmentsController.js";
import { RulesController } from "../controllers/rulesController.js";
import { ServiceController } from "../controllers/servicesController.js";
import { createAppointmentSchema, deleteAppointmentSchema, editAppointmentBodySchema, editAppointmentParamsSchema, listAppointmentsSchema } from "../schemas/appointmentsSchema.js";
import { createRuleSchema, deleteRuleSchema, editRuleBodySchema, editRuleParamsSchema } from "../schemas/rulesSchema.js";
import { createServiceSchema, editServiceBodySchema, editServiceParamsSchema } from "../schemas/servicesSchema.js";


export const appRoutes = async (fastify: FastifyInstance) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  // Instanciando os controllers
  const rulesController = new RulesController();
  const serviceController = new ServiceController();
  const appointmentsController = new AppointmentsController();

  // Rota de health check
  app.get("/", async () => "Servidor rodando!");

  // Rotas das regras
  // 1 - Listar regras
  app.get("/rules", {
    schema: {
      description: 'Lista regras de negócio',
      tags: ['Regras'],
    }
  }, rulesController.listRules);

  // 2 - Criar regra
  app.post("/rules", {
    schema: {
      description: 'Cria uma nova regra de negócio',
      tags: ['Regras'],
      body: createRuleSchema,
    }
  }, (req, reply) => rulesController.createRule(req, reply));

  // 3 - Editar regra
  app.put("/rules/:id", {
    schema: {
      description: 'Edita uma regra de negócio',
      tags: ['Regras'],
      body: editRuleBodySchema,
      params: editRuleParamsSchema,
    }
  }, (req, reply) => rulesController.updateRule(req, reply));

  // 4 - Deletar regra
  app.delete("/rules/:id", {
    schema: {
      description: 'Deleta uma regra de negócio',
      tags: ['Regras'],
      params: deleteRuleSchema,
    }
  }, (req, reply) => rulesController.deleteRule(req, reply));

  // Rotas dos serviços
  // 1 - Listar serviços
  app.get("/services", {
    schema: {
      description: 'Lista serviços',
      tags: ['Serviços'],
    }
  }, serviceController.listServices);

  // 2 - Criar serviço
  app.post('/services', {
    schema: {
      description: 'Cria um novo serviço',
      tags: ['Serviços'],
      body: createServiceSchema,
    }
  }, (req, reply) => serviceController.createService(req, reply));

  // 3 - Editar serviço
  app.put("/services/:id", {
    schema: {
      description: 'Edita um serviço',
      tags: ['Serviços'],
      body: editServiceBodySchema,
      params: editServiceParamsSchema,
    }
  }, (req, reply) => serviceController.updateService(req, reply));

  // 4 - Deletar serviço
  app.delete("/services/:id", {
    schema: {
      description: 'Deleta um serviço',
      tags: ['Serviços'],
      params: deleteRuleSchema,
    }
  }, (req, reply) => serviceController.deleteService(req, reply));

  // Rotas dos agendamentos
  // 1 - Listar agendamentos
  app.get('/appointments', {
    schema: {
      description: 'Lista agendamentos (opcional: filtra por data)',
      tags: ['Agendamentos'],
      querystring: listAppointmentsSchema,
    }
  }, (req, reply) => appointmentsController.listAppointments(req, reply));

  // 2 - Criar agendamento
  app.post("/appointments", {
    schema: {
      description: 'Cria um novo agendamento',
      tags: ['Agendamentos'],
      body: createAppointmentSchema,
    }
  }, (req, reply) => appointmentsController.createAppointment(req, reply));

  // 3 - Editar agendamento
  app.put("/appointments/:id", {
    schema: {
      description: 'Edita um agendamento',
      tags: ['Agendamentos'],
      body: editAppointmentBodySchema,
      params: editAppointmentParamsSchema,
    }
  }, (req, reply) => appointmentsController.updateAppointment(req, reply));

  // 4 - Cancelar agendamento
  app.delete('/appointments/:id', {
    schema: {
      description: 'Cancela um agendamento',
      tags: ['Agendamentos'],
      params: deleteAppointmentSchema,
    }
  }, (req, reply) => appointmentsController.deleteAppointment(req, reply));
};
