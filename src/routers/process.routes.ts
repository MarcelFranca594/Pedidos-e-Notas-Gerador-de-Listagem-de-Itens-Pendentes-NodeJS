// routes/processRoutes.ts
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { processarPedidos, processarNotas, Pedido, Nota, ItensPendentes, gerarListagemPendentes, escreverListagemPendentes } from '../note-order';
import { app } from '../app';
import { randomUUID } from 'node:crypto';

// Definir uma interface para os dados no corpo da requisição
interface DadosRequisicao {
  pedidos: Pedido[];
  notas: Nota[];
}


// Modificar a função da rota POST /processar para usar a interface definida
export async function processRoutes(fastify: FastifyInstance) {
  app.post('/processar', async (request: FastifyRequest<{ Body: DadosRequisicao }>, reply) => {
    try {
      // Extrair dados de entrada do corpo da requisição e fazer a conversão para o tipo esperado
      const { pedidos, notas }: DadosRequisicao = request.body;

       // Gerar um ID de processamento único
       const idProcessamento = randomUUID();

      // Processar pedidos e notas
      const pedidosProcessados = processarPedidos('./Teste/Pedidos'); // Altere o caminho conforme necessário
      const itensPendentes = processarNotas('./Teste/Notas', pedidosProcessados); // Altere o caminho conforme necessário
      let listagemPendentes = gerarListagemPendentes(pedidosProcessados, itensPendentes);

      // Escrever listagem de itens pendentes em arquivo de texto
      const caminhoArquivoSaida: string = 'ListagemItensPendentes.txt';
      escreverListagemPendentes(listagemPendentes, caminhoArquivoSaida);

      // Retornar os itens pendentes como resposta da requisição
      //reply.status(201).send(listagemPendentes);
      reply.status(201).send({ idProcessamento, listagemPendentes});
    } catch (error) {
      // Em caso de erro, retornar uma mensagem de erro
      console.error('Erro ao processar os pedidos e notas:', error);
      reply.status(500).send({ error: 'Erro ao processar os pedidos e notas.' });
    }
  });
  
}

