import { FastifyInstance } from 'fastify'
import { processarPedidos, processarNotas } from '../note-order'

// Defina a função de rota para processar os pedidos e notas
export default async function processRoutes(fastify: FastifyInstance) {
  fastify.post('/processar', async (request, reply) => {
    try {
      // Caminhos dos diretórios de pedidos e notas
      const caminhoPedidos: string = './Teste/Pedidos';
      const caminhoNotas: string = './Teste/Notas';

      // Processar pedidos e notas
      const pedidos = processarPedidos(caminhoPedidos);
      const itensPendentes = processarNotas(caminhoNotas, pedidos);

      // Retornar os itens pendentes como resposta da requisição
      return itensPendentes;
    } catch (error) {
      // Em caso de erro, retornar uma mensagem de erro
      reply.status(500).send({ error: 'Erro ao processar os pedidos e notas.' });
    }
  });
}