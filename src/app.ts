import fastifyCookie from '@fastify/cookie'
import fastify from 'fastify'
import { notesRoutes } from './routers/notes.routes'
import { ordersRoutes } from './routers/orders.routes'


export const app = fastify()


app.register(fastifyCookie)
app.register(notesRoutes, { prefix: 'notes' })
app.register(ordersRoutes,{ prefix: 'orders' })
