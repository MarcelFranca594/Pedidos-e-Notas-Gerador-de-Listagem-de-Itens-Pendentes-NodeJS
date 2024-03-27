import * as fs from 'fs';
import * as path from 'path';


interface Pedido {
  número_item: string;
  código_produto: string;
  quantidade_produto: number;
  valor_unitário_produto: number;
}

interface ItensPendentes {
  [número_item: string]: number;
}

interface Pedidos {
  [arquivo: string]: {
    [número_item: string]: Pedido;
  };
}

function converterParaNumero(valor: string): number {
  return parseFloat(valor.replace(',', '.'));
}

export function processarPedidos(caminhoPedidos: string): Pedidos {
  const pedidos: Pedidos = {};

  const arquivosPedidos = fs.readdirSync(caminhoPedidos);

  for (const arquivo of arquivosPedidos) {
    const caminhoArquivo = path.join(caminhoPedidos, arquivo);
    const conteudoArquivo = fs.readFileSync(caminhoArquivo, 'utf-8').trim().split('\n');

    pedidos[arquivo] = {};

    for (const linha of conteudoArquivo) {
      try {
        const pedido: Pedido = JSON.parse(linha);

        pedido.valor_unitário_produto = converterParaNumero(pedido.valor_unitário_produto.toString());

        if (!pedido.número_item || !pedido.código_produto || !pedido.quantidade_produto || isNaN(pedido.valor_unitário_produto)) {
          throw new Error(`Pedido inválido no arquivo ${arquivo}: campos obrigatórios ausentes ou valor_unitário_produto inválido`);
        }

        pedidos[arquivo][pedido.número_item] = pedido;
      } catch (error) {
        console.error(`Erro ao processar o arquivo ${arquivo}: ${(error as Error).message}`);
      }
    }
  }

  return pedidos;
}

export function processarNotas(caminhoNotas: string, pedidos: Pedidos): { [arquivo: string]: ItensPendentes } {
  const itensPendentes: { [arquivo: string]: ItensPendentes } = {};

  const arquivosNotas = fs.readdirSync(caminhoNotas);

  for (const arquivo of arquivosNotas) {
    const caminhoArquivo = path.join(caminhoNotas, arquivo);
    const conteudoArquivo = fs.readFileSync(caminhoArquivo, 'utf-8').trim().split('\n');

    for (const linha of conteudoArquivo) {
      try {
        const nota = JSON.parse(linha);

        if (!nota.id_pedido || !nota.número_item || !nota.quantidade_produto) {
          throw new Error(`Nota inválida no arquivo ${arquivo}: campos obrigatórios ausentes`);
        }

        const nomeArquivoPedido = `P${nota.id_pedido}.txt`;
        if (!pedidos[nomeArquivoPedido] || !pedidos[nomeArquivoPedido][nota.número_item]) {
          throw new Error(`Nota inválida no arquivo ${arquivo}: pedido ${nota.id_pedido} ou item ${nota.número_item} não encontrado`);
        }

        if (!itensPendentes[nomeArquivoPedido]) {
          itensPendentes[nomeArquivoPedido] = {};
        }

        const pedido = pedidos[nomeArquivoPedido][nota.número_item];
        const saldoPendente = pedido.quantidade_produto - nota.quantidade_produto;
        if (saldoPendente > 0) {
          itensPendentes[nomeArquivoPedido][nota.número_item] = saldoPendente;
        }
      } catch (error) {
        console.error(`Erro ao processar o arquivo ${arquivo}: ${(error as Error).message}`);
      }
    }
  }

  return itensPendentes;
}

function gerarListagemPendentes(pedidos: Pedidos, itensPendentes: { [arquivo: string]: ItensPendentes }) {
  const listagemPendentes: any[] = [];

  for (const arquivoPedido in pedidos) {
    const pedido = pedidos[arquivoPedido];
    const itensPedido = Object.keys(pedido).length;

    if (itensPendentes[arquivoPedido]) {
      let valorTotalPedido = 0;
      let saldoValor = 0;

      for (const númeroItem in pedido) {
        const item = pedido[númeroItem];
        valorTotalPedido += item.quantidade_produto * item.valor_unitário_produto;

        const quantidadePendente = itensPendentes[arquivoPedido][númeroItem] || 0;
        saldoValor += quantidadePendente * item.valor_unitário_produto;
      }

      listagemPendentes.push({
        arquivo_pedido: arquivoPedido,
        valor_total_pedido: valorTotalPedido.toFixed(2),
        saldo_valor: (valorTotalPedido - saldoValor).toFixed(2),
        itens_pendentes: Object.entries(itensPendentes[arquivoPedido]).map(([número_item, saldo_quantidade]) => ({ número_item, saldo_quantidade }))
      });
    }
  }
  return listagemPendentes;
}

function escreverListagemPendentes(listagemPendentes: any[], caminhoArquivo: string): void {
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

// Caminhos dos diretórios de pedidos e notas
const caminhoPedidos: string = './Teste/Pedidos';
const caminhoNotas: string = './Teste/Notas';
const caminhoArquivoSaida: string = 'ListagemItensPendentes.txt';

// Processar pedidos
const pedidos: Pedidos = processarPedidos(caminhoPedidos);

// Processar notas e calcular itens pendentes
const itensPendentes: { [arquivo: string]: ItensPendentes } = processarNotas(caminhoNotas, pedidos);

// Gerar listagem de itens pendentes
const listagemPendentes: any[] = gerarListagemPendentes(pedidos, itensPendentes);

// Escrever listagem de
// Escrever listagem de itens pendentes em arquivo de texto
escreverListagemPendentes(listagemPendentes, caminhoArquivoSaida);
