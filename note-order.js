// Este script realiza o processamento de pedidos e notas, cruzando as informações para gerar uma lista de pedidos pendentes.
import fs from 'fs';
import path from 'path';

// Função para ler um arquivo e retornar seu conteúdo como objeto JSON
function lerArquivo(caminhoArquivo) {
  const conteudo = fs.readFileSync(caminhoArquivo, 'utf-8');
  return conteudo.trim().split('\n').map(line => {
    try {
      return JSON.parse(line);
    } catch (error) {
      throw new Error(`Erro ao analisar JSON no arquivo ${caminhoArquivo}: ${error.message}`);
    }
  });
}

// Função para validar se um número é inteiro e positivo
function validarNumeroPositivo(numero) {
  return Number.isInteger(numero) && numero > 0;
}

// Função para validar se um valor é numérico e positivo
function validarValorPositivo(valor) {
  return typeof valor === 'number' && valor > 0;
}

// Função para verificar se um objeto tem as propriedades necessárias
function verificarPropriedades(objeto, propriedades) {
  return propriedades.every(propriedade => objeto.hasOwnProperty(propriedade));
}

// Função para lançar exceção caso haja algum problema na leitura dos arquivos
function lancarExcecaoProblemaLeitura(arquivo, mensagem) {
  throw new Error(`Problema na leitura do arquivo ${arquivo}: ${mensagem}`);
}

// Função para cruzar pedidos e notas
function cruzarPedidosNotas(caminhoPedidos, caminhoNotas) {
  const pedidos = fs.readdirSync(caminhoPedidos);
  const notas = fs.readdirSync(caminhoNotas);
  const pedidosPendentes = {};

  // Processamento dos Pedidos
  pedidos.forEach(pedido => {
    const caminhoPedido = path.join(caminhoPedidos, pedido);
    const numeroPedido = parseInt(pedido.split('.')[0]);
    const itens = lerArquivo(caminhoPedido);

    // Validações dos Pedidos
    const numerosItensEsperados = new Set(Array.from({ length: itens.length }, (_, i) => i + 1));
    const numerosItensRecebidos = new Set();
    let valorTotalPedido = 0;

    itens.forEach(item => {
      if (!verificarPropriedades(item, ['número_item', 'código_produto', 'quantidade_produto', 'valor_unitário_produto'])) {
        lancarExcecaoProblemaLeitura(pedido, 'Item com propriedades inválidas');
      }
      if (!validarNumeroPositivo(item.número_item)) {
        lancarExcecaoProblemaLeitura(pedido, 'Número de item inválido');
      }
      if (numerosItensRecebidos.has(item.número_item)) {
        lancarExcecaoProblemaLeitura(pedido, `Número de item duplicado: ${item.número_item}`);
      }
      numerosItensRecebidos.add(item.número_item);
      valorTotalPedido += parseFloat(item.valor_unitário_produto.replace(',', '.')) * item.quantidade_produto;
    });

    if (![...numerosItensEsperados].every(item => numerosItensRecebidos.has(item))) {
      lancarExcecaoProblemaLeitura(pedido, 'Faltam números de itens');
    }

    // Adiciona o pedido aos pedidos pendentes
    pedidosPendentes[numeroPedido] = {
      valorTotal: valorTotalPedido,
      saldoValor: valorTotalPedido,
      itensPendentes: {}
    };
  });

  // Processamento das Notas
  notas.forEach(nota => {
    const caminhoNota = path.join(caminhoNotas, nota);
    const itensNota = lerArquivo(caminhoNota);

    // Extrair o ID do pedido do primeiro item da nota
    const idPedido = itensNota[0].id_pedido;

    // Validações das Notas
    itensNota.forEach(item => {
      if (!verificarPropriedades(item, ['id_pedido', 'número_item', 'quantidade_produto'])) {
        lancarExcecaoProblemaLeitura(nota, 'Item com propriedades inválidas');
      }
      if (!validarNumeroPositivo(item.número_item)) {
        lancarExcecaoProblemaLeitura(nota, 'Número de item inválido');
      }
      if (!validarNumeroPositivo(item.quantidade_produto)) {
        lancarExcecaoProblemaLeitura(nota, 'Quantidade de produto inválida');
      }
    });

    // Atualiza os pedidos pendentes com base nas notas
    itensNota.forEach(item => {
      let pedido = pedidosPendentes[idPedido];
      if (!pedido) {
        pedidosPendentes[idPedido] = {
          valorTotal: 0,
          saldoValor: 0,
          itensPendentes: {}
        };
        pedido = pedidosPendentes[idPedido];
      }
      if (pedido.itensPendentes[item.número_item] === undefined) {
        pedido.itensPendentes[item.número_item] = item.quantidade_produto;
      } else {
        pedido.itensPendentes[item.número_item] += item.quantidade_produto;
      }
      pedido.saldoValor -= item.quantidade_produto * pedido.itensPendentes[item.número_item];
    });
  });

  // Escreve o arquivo de listagem de pedidos pendentes
  const arquivoSaida = 'pedidos_pendentes.txt';
  const conteudoArquivoSaida = [];

  for (const [numeroPedido, pedido] of Object.entries(pedidosPendentes)) {
    const itensPendentes = [];
    for (const [numeroItem, saldoQuantidade] of Object.entries(pedido.itensPendentes)) {
      itensPendentes.push({ númeroItem: numeroItem, saldoQuantidade: saldoQuantidade });
    }
    conteudoArquivoSaida.push(`Pedido ${numeroPedido}: Valor total: R$ ${pedido.valorTotal.toFixed(2)} | Saldo Valor: R$ ${pedido.saldoValor.toFixed(2)} | Itens pendentes: ${JSON.stringify(itensPendentes)}`);
  }

  fs.writeFileSync(arquivoSaida, conteudoArquivoSaida.join('\n'));
}

// Execução do programa
const caminhoPedidos = './Teste/Pedidos';
const caminhoNotas = './Teste/Notas';
cruzarPedidosNotas(caminhoPedidos, caminhoNotas);

