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

// Função para ler e processar os arquivos de notas
function processarNotas(caminhoNotas, pedidos) {
  const itensPendentes = {};

  // Listar todos os arquivos na pasta de notas
  const arquivosNotas = fs.readdirSync(caminhoNotas);

  // Iterar sobre cada arquivo de nota
  for (const arquivo of arquivosNotas) {
    const caminhoArquivo = path.join(caminhoNotas, arquivo);
    const conteudoArquivo = fs.readFileSync(caminhoArquivo, 'utf-8').trim().split('\n');

    // Processar cada linha do arquivo de nota
    for (const linha of conteudoArquivo) {
      try {
        const nota = JSON.parse(linha);

        // Validar campos obrigatórios
        if (!nota.id_pedido || !nota.número_item || !nota.quantidade_produto) {
          throw new Error(`Nota inválida no arquivo ${arquivo}: campos obrigatórios ausentes`);
        }

        // Verificar se o pedido referenciado pela nota existe
        const nomeArquivoPedido = `P${nota.id_pedido}.txt`;
        if (!pedidos[nomeArquivoPedido] || !pedidos[nomeArquivoPedido][nota.número_item]) {
          throw new Error(`Nota inválida no arquivo ${arquivo}: pedido ${nota.id_pedido} ou item ${nota.número_item} não encontrado`);
        }

        // Inicializar itens pendentes para este pedido
        if (!itensPendentes[nomeArquivoPedido]) {
          itensPendentes[nomeArquivoPedido] = {};
        }

        // Calcular saldo pendente para o item desta nota
        const pedido = pedidos[nomeArquivoPedido][nota.número_item];
        const saldoPendente = pedido.quantidade_produto - nota.quantidade_produto;
        // Se o saldo pendente for maior que zero, significa que o item não foi totalmente atendido
        if (saldoPendente > 0) {
          // Adicionar saldo pendente ao objeto de itens pendentes
          itensPendentes[nomeArquivoPedido][nota.número_item] = saldoPendente;
        }
      } catch (error) {
        console.error(`Erro ao processar o arquivo ${arquivo}: ${error.message}`);
      }
    }
  }

  return itensPendentes;
}