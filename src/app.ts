import fastifyCookie from '@fastify/cookie'
import fastify from 'fastify'
import processRoutes  from './routers/process.routes' // Importando processRoutes como padrão


export const app = fastify()

app.register(fastifyCookie)
app.register(processRoutes, { prefix: 'process' }) // Usando processRoutes diretamente sem desestruturar
