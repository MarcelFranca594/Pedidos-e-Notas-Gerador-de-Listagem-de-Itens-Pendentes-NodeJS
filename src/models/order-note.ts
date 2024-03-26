import * as fs from 'fs';

interface Pedido {
  items: PedidoItem[];
}

interface PedidoItem {
  id_pedido?: string;
  numero_item: number;
  codigo_produto: string;
  quantidade_produto: number;
  valor_unitario_produto: number;
}

interface NotaItem {
  id_pedido: string;
  numero_item: number;
  quantidade_produto: number;
}

interface Nota {
  [id_pedido: string]: NotaItem[];
}

// Ler e Validar Pedidos e Notas
function lerArquivos(pasta: string): string[] {
  if (!fs.existsSync(pasta)) {
    throw new Error(`A pasta ${pasta} não existe.`);
  }
  return fs.readdirSync(pasta);
}

function lerPedidos(pasta: string): Pedido[] {
  const arquivos = lerArquivos(pasta);
  const pedidos: Pedido[] = [];

  for (const arquivo of arquivos) {
    const conteudo = fs.readFileSync(`${pasta}/${arquivo}`, 'utf-8').trim().split('\n');
    const items: PedidoItem[] = [];
    for (const linha of conteudo) {
      const item: PedidoItem = JSON.parse(linha);
      items.push(item);
    }
    pedidos.push({ items });
  }

  return pedidos;
}

function lerNotas(pasta: string): Nota {
  const arquivos = lerArquivos(pasta);
  const notas: Nota = {};

  for (const arquivo of arquivos) {
    const conteudo = fs.readFileSync(`${pasta}/${arquivo}`, 'utf-8').trim().split('\n');
    for (const linha of conteudo) {
      const item: NotaItem = JSON.parse(linha);
      const id_pedido = item.id_pedido;
      if (!notas[id_pedido]) {
        notas[id_pedido] = [];
      }
      notas[id_pedido].push(item);
    }
  }

  return notas;
}

// Cruzar Pedidos e Notas
function cruzarPedidosNotas(pedidos: Pedido[], notas: Nota): Map<string, { total: number, saldo: number, itens_pendentes: Map<number, number> }> {
  const pedidosPendentes = new Map<string, { total: number, saldo: number, itens_pendentes: Map<number, number> }>();

  for (const pedido of pedidos) {
    const items = pedido.items;
    let id_pedido: string | undefined;

    for (const pedidoItem of items) {
      const id_pedido_item = pedidoItem.id_pedido;
      if (id_pedido_item) {
        id_pedido = id_pedido_item;
        break;
      }
    }

    if (!id_pedido) {
      throw new Error('Não foi possível encontrar o id_pedido no pedido ou em seus itens.');
    }

    const itensPendentes = new Map<number, number>();

    for (const pedidoItem of items) {
      if (notas[id_pedido]) {
        for (const notaItem of notas[id_pedido]) {
          if (pedidoItem.numero_item === notaItem.numero_item) {
            const quantidadePendente = pedidoItem.quantidade_produto - notaItem.quantidade_produto;
            if (quantidadePendente > 0) {
              itensPendentes.set(notaItem.numero_item, quantidadePendente);
            }
          }
        }
      } else {
        itensPendentes.set(pedidoItem.numero_item, pedidoItem.quantidade_produto);
      }
    }

    const totalPedido = items.reduce((acc, curr) => acc + (curr.quantidade_produto * curr.valor_unitario_produto), 0);
    const saldoValor = Array.from(itensPendentes.values()).reduce((acc, quantidadePendente) => acc + (quantidadePendente * items[0].valor_unitario_produto), 0);

    if (itensPendentes.size > 0) {
      pedidosPendentes.set(id_pedido, {
        total: totalPedido,
        saldo: saldoValor,
        itens_pendentes: itensPendentes
      });
    }
  }

  return pedidosPendentes;
}

// Gerar Listagem de Itens Pendentes
function gerarListagemPendentes(pedidosPendentes: Map<string, { total: number, saldo: number, itens_pendentes: Map<number, number> }>, caminhoArquivo: string) {
  const conteudoArquivo: string[] = [];

  for (const [id_pedido, { total, saldo, itens_pendentes }] of pedidosPendentes) {
    conteudoArquivo.push(`Pedido ${id_pedido}:`);
    conteudoArquivo.push(`Total do Pedido: ${total}`);
    conteudoArquivo.push(`Saldo do Valor: ${saldo}`);
    conteudoArquivo.push('Itens Pendentes:');
    for (const [numero_item, quantidadePendente] of itens_pendentes) {
      conteudoArquivo.push(`- Item ${numero_item}: ${quantidadePendente}`);
    }
    conteudoArquivo.push('');
  }

  fs.writeFileSync(caminhoArquivo, conteudoArquivo.join('\n'));
}

// Utilização
try {
  const pedidos = lerPedidos('../Teste/Pedidos/');
  const notas = lerNotas('../Teste/Notas/');
  const pedidosPendentes = cruzarPedidosNotas(pedidos, notas);
  gerarListagemPendentes(pedidosPendentes, 'caminho/arquivo_pendentes.txt');
  console.log('Listagem de pedidos pendentes gerada com sucesso!');
} catch (error) {
  if (error instanceof Error) {
    console.error('Ocorreu um erro:', error.message);
  } else {
    console.error('Ocorreu um erro desconhecido.');
  }
}
