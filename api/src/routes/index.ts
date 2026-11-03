import type { FastifyInstance } from "fastify";
import { AppointmentsController } from "../controllers/appointmentsController.js";
import { RulesController } from "../controllers/rulesController.js";
import { ServiceController } from "../controllers/serviceController.js";


export const appRoutes = async (app: FastifyInstance) => {
  // Instanciando os controllers
  const rulesController = new RulesController();
  const serviceController = new ServiceController();
  const appointmentsController = new AppointmentsController();

  // Rota de health check
  app.get("/", async () => "OK");

  // Rotas das regras
  app.get("/rules", rulesController.listRules);
  app.post("/rules", rulesController.createRule);

  // Rotas dos serviços
  app.get("/services", serviceController.listServices);
  app.post("/services", serviceController.createService);

  // Rotas dos agendamentos
  app.get("/appointments", appointmentsController.listAppointments);
  app.post("/appointments", appointmentsController.createAppointment);
};
