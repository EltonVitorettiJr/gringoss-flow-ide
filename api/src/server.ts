import Fastify from 'fastify';
import { appRoutes } from './routes/index.js';

const app = Fastify({ logger: { level: "info" } });

// Registrando as rotas no Fastify com um prefixo global
app.register(appRoutes, { prefix: '/api/v1' });

const start = async () => {
  try {
    await app.listen({ port: 3000 });

    console.log('🚀 Servidor rodando na porta 3000!');
  } catch (err) {
    app.log.error(err);

    process.exit(1);
  }
};

start();