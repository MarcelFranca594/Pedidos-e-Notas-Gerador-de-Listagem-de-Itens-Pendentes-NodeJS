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

// Função para gerar a listagem de itens pendentes
function gerarListagemPendentes(pedidos, itensPendentes) {
  const listagemPendentes = [];

  // Iterar sobre cada pedido
  for (const arquivoPedido in pedidos) {
    const pedido = pedidos[arquivoPedido];
    const itensPedido = Object.keys(pedido).length;

    // Verificar se há itens pendentes no pedido
    if (itensPendentes[arquivoPedido]) {
      let valorTotalPedido = 0;
      let saldoValor = 0; // Corrigindo o cálculo do saldo de valor

      // Iterar sobre cada item do pedido
      for (const númeroItem in pedido) {
        const item = pedido[númeroItem];
        valorTotalPedido += item.quantidade_produto * item.valor_unitário_produto;

        // Verificar se o item tem saldo pendente
        const quantidadePendente = itensPendentes[arquivoPedido][númeroItem] || 0;
        saldoValor += quantidadePendente * item.valor_unitário_produto; // Corrigindo o cálculo do saldo de valor
      }

      // Adicionar informações do pedido à listagem de itens pendentes
      listagemPendentes.push({
        arquivo_pedido: arquivoPedido,
        valor_total_pedido: valorTotalPedido.toFixed(2),
        saldo_valor: (valorTotalPedido - saldoValor).toFixed(2), // Corrigindo o cálculo do saldo de valor
        itens_pendentes: Object.entries(itensPendentes[arquivoPedido]).map(([número_item, saldo_quantidade]) => ({ número_item, saldo_quantidade }))
      });
    }
  }
  return listagemPendentes;
}

// Função para escrever a listagem de itens pendentes em um arquivo de texto
function escreverListagemPendentes(listagemPendentes, caminhoArquivo) {
  let conteudo = '';

  for (const pedido of listagemPendentes) {
    conteudo += `Pedido: ${pedido.arquivo_pedido}\n`;
    conteudo += `Valor Total do Pedido: R$ ${pedido.valor_total_pedido}\n`;
    conteudo += `Saldo de Valor: R$ ${pedido.saldo_valor}\n`;
    conteudo += 'Itens Pendentes:\n';
    if (pedido.itens_pendentes.length === 0) {
      conteudo += '\n';
    } else {
      for (const item of pedido.itens_pendentes) {
        conteudo += `- Número do Item: ${item.número_item}, Saldo de Quantidade: ${item.saldo_quantidade}\n`;
      }
      conteudo += '\n';
    }
  }

  fs.writeFileSync(caminhoArquivo, conteudo, 'utf-8');
  console.log(`Listagem de itens pendentes foi salva em ${caminhoArquivo}`);
}

