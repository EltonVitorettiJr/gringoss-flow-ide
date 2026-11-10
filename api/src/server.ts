import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import Fastify from 'fastify';
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { appRoutes } from './routes/index.js';

const app = Fastify({ logger: true });

// 1. Adiciona os compiladores do Zod ANTES de qualquer rota ou plugin
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// 2. Configura a documentação do Swagger
app.register(swagger, {
  openapi: {
    info: {
      title: 'API Barbearia Gringoss',
      description: 'Documentação do MVP da barbearia para o Front-end.',
      version: '1.0.0',
    },
  },
  transform: jsonSchemaTransform, // ESSA LINHA é a ponte crítica para o Zod
});

// 3. Configura a página web da documentação
app.register(swaggerUi, {
  routePrefix: '/docs',
});

// 4. Middlewares de infraestrutura
app.register(cors, { origin: true });
app.register(rateLimit, { max: 100, timeWindow: '1 minute' });

// 5. REGISTRA AS ROTAS POR ÚLTIMO
app.register(appRoutes, { prefix: '/api/v1' });

const start = async () => {
  try {
    await app.listen({ port: 3000 });
    console.log('🚀 Servidor rodando na porta 3000!');
    console.log('📚 Documentação disponível em: http://localhost:3000/docs');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();