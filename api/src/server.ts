import Fastify from 'fastify'

const fastify = Fastify({
  logger: true
})

// Declarando rota
fastify.get('/', (_request, reply) => {
  reply.send({ hello: 'world' })
})

// Rodando o servidor
fastify.listen({ port: 3000 }, (err, _address) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})