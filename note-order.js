// Este script realiza o processamento de pedidos e notas, cruzando as informações para gerar uma lista de pedidos pendentes.

import fs from 'fs';
import path from 'path';

// Função para converter valores de moeda para números
function converterParaNumero(valor) {
  return parseFloat(valor.replace(',', '.'));
}

// Função para ler e processar os arquivos de pedidos
function processarPedidos(caminhoPedidos) {
  const pedidos = {};

  // Listar todos os arquivos na pasta de pedidos
  const arquivosPedidos = fs.readdirSync(caminhoPedidos);

  // Iterar sobre cada arquivo de pedido
  for (const arquivo of arquivosPedidos) {
    const caminhoArquivo = path.join(caminhoPedidos, arquivo);
    const conteudoArquivo = fs.readFileSync(caminhoArquivo, 'utf-8').trim().split('\n');

    // Inicializar objeto de pedido para este arquivo
    pedidos[arquivo] = {};

    // Processar cada linha do arquivo de pedido
    for (const linha of conteudoArquivo) {
      try {
        const pedido = JSON.parse(linha);

        // Convertendo valor_unitário_produto para número
        pedido.valor_unitário_produto = converterParaNumero(pedido.valor_unitário_produto);

        // Validar campos obrigatórios
        if (!pedido.número_item || !pedido.código_produto || !pedido.quantidade_produto || isNaN(pedido.valor_unitário_produto)) {
          throw new Error(`Pedido inválido no arquivo ${arquivo}: campos obrigatórios ausentes ou valor_unitário_produto inválido`);
        }

        // Adicionar pedido à lista de pedidos
        pedidos[arquivo][pedido.número_item] = pedido;
      } catch (error) {
        console.error(`Erro ao processar o arquivo ${arquivo}: ${error.message}`);
      }
    }
  }

  return pedidos;
}