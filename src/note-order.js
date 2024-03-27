"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
function converterParaNumero(valor) {
    return parseFloat(valor.replace(',', '.'));
}
function processarPedidos(caminhoPedidos) {
    var pedidos = {};
    var arquivosPedidos = fs.readdirSync(caminhoPedidos);
    for (var _i = 0, arquivosPedidos_1 = arquivosPedidos; _i < arquivosPedidos_1.length; _i++) {
        var arquivo = arquivosPedidos_1[_i];
        var caminhoArquivo = path.join(caminhoPedidos, arquivo);
        var conteudoArquivo = fs.readFileSync(caminhoArquivo, 'utf-8').trim().split('\n');
        pedidos[arquivo] = {};
        for (var _a = 0, conteudoArquivo_1 = conteudoArquivo; _a < conteudoArquivo_1.length; _a++) {
            var linha = conteudoArquivo_1[_a];
            try {
                var pedido = JSON.parse(linha);
                pedido.valor_unitário_produto = converterParaNumero(pedido.valor_unitário_produto.toString());
                if (!pedido.número_item || !pedido.código_produto || !pedido.quantidade_produto || isNaN(pedido.valor_unitário_produto)) {
                    throw new Error("Pedido inv\u00E1lido no arquivo ".concat(arquivo, ": campos obrigat\u00F3rios ausentes ou valor_unit\u00E1rio_produto inv\u00E1lido"));
                }
                pedidos[arquivo][pedido.número_item] = pedido;
            }
            catch (error) {
                console.error("Erro ao processar o arquivo ".concat(arquivo, ": ").concat(error.message));
            }
        }
    }
    return pedidos;
}
function processarNotas(caminhoNotas, pedidos) {
    var itensPendentes = {};
    var arquivosNotas = fs.readdirSync(caminhoNotas);
    for (var _i = 0, arquivosNotas_1 = arquivosNotas; _i < arquivosNotas_1.length; _i++) {
        var arquivo = arquivosNotas_1[_i];
        var caminhoArquivo = path.join(caminhoNotas, arquivo);
        var conteudoArquivo = fs.readFileSync(caminhoArquivo, 'utf-8').trim().split('\n');
        for (var _a = 0, conteudoArquivo_2 = conteudoArquivo; _a < conteudoArquivo_2.length; _a++) {
            var linha = conteudoArquivo_2[_a];
            try {
                var nota = JSON.parse(linha);
                if (!nota.id_pedido || !nota.número_item || !nota.quantidade_produto) {
                    throw new Error("Nota inv\u00E1lida no arquivo ".concat(arquivo, ": campos obrigat\u00F3rios ausentes"));
                }
                var nomeArquivoPedido = "P".concat(nota.id_pedido, ".txt");
                if (!pedidos[nomeArquivoPedido] || !pedidos[nomeArquivoPedido][nota.número_item]) {
                    throw new Error("Nota inv\u00E1lida no arquivo ".concat(arquivo, ": pedido ").concat(nota.id_pedido, " ou item ").concat(nota.número_item, " n\u00E3o encontrado"));
                }
                if (!itensPendentes[nomeArquivoPedido]) {
                    itensPendentes[nomeArquivoPedido] = {};
                }
                var pedido = pedidos[nomeArquivoPedido][nota.número_item];
                var saldoPendente = pedido.quantidade_produto - nota.quantidade_produto;
                if (saldoPendente > 0) {
                    itensPendentes[nomeArquivoPedido][nota.número_item] = saldoPendente;
                }
            }
            catch (error) {
                console.error("Erro ao processar o arquivo ".concat(arquivo, ": ").concat(error.message));
            }
        }
    }
    return itensPendentes;
}
function gerarListagemPendentes(pedidos, itensPendentes) {
    var listagemPendentes = [];
    for (var arquivoPedido in pedidos) {
        var pedido = pedidos[arquivoPedido];
        var itensPedido = Object.keys(pedido).length;
        if (itensPendentes[arquivoPedido]) {
            var valorTotalPedido = 0;
            var saldoValor = 0;
            for (var númeroItem in pedido) {
                var item = pedido[númeroItem];
                valorTotalPedido += item.quantidade_produto * item.valor_unitário_produto;
                var quantidadePendente = itensPendentes[arquivoPedido][númeroItem] || 0;
                saldoValor += quantidadePendente * item.valor_unitário_produto;
            }
            listagemPendentes.push({
                arquivo_pedido: arquivoPedido,
                valor_total_pedido: valorTotalPedido.toFixed(2),
                saldo_valor: (valorTotalPedido - saldoValor).toFixed(2),
                itens_pendentes: Object.entries(itensPendentes[arquivoPedido]).map(function (_a) {
                    var número_item = _a[0], saldo_quantidade = _a[1];
                    return ({ número_item: número_item, saldo_quantidade: saldo_quantidade });
                })
            });
        }
    }
    return listagemPendentes;
}
function escreverListagemPendentes(listagemPendentes, caminhoArquivo) {
    var conteudo = '';
    for (var _i = 0, listagemPendentes_1 = listagemPendentes; _i < listagemPendentes_1.length; _i++) {
        var pedido = listagemPendentes_1[_i];
        conteudo += "Pedido: ".concat(pedido.arquivo_pedido, "\n");
        conteudo += "Valor Total do Pedido: R$ ".concat(pedido.valor_total_pedido, "\n");
        conteudo += "Saldo de Valor: R$ ".concat(pedido.saldo_valor, "\n");
        conteudo += 'Itens Pendentes:\n';
        if (pedido.itens_pendentes.length === 0) {
            conteudo += '\n';
        }
        else {
            for (var _a = 0, _b = pedido.itens_pendentes; _a < _b.length; _a++) {
                var item = _b[_a];
                conteudo += "- N\u00FAmero do Item: ".concat(item.número_item, ", Saldo de Quantidade: ").concat(item.saldo_quantidade, "\n");
            }
            conteudo += '\n';
        }
    }
    fs.writeFileSync(caminhoArquivo, conteudo, 'utf-8');
    console.log("Listagem de itens pendentes foi salva em ".concat(caminhoArquivo));
}
// Caminhos dos diretórios de pedidos e notas
var caminhoPedidos = './Teste/Pedidos';
var caminhoNotas = './Teste/Notas';
var caminhoArquivoSaida = 'ListagemItensPendentes.txt';
// Processar pedidos
var pedidos = processarPedidos(caminhoPedidos);
// Processar notas e calcular itens pendentes
var itensPendentes = processarNotas(caminhoNotas, pedidos);
// Gerar listagem de itens pendentes
var listagemPendentes = gerarListagemPendentes(pedidos, itensPendentes);
// Escrever listagem de
// Escrever listagem de itens pendentes em arquivo de texto
escreverListagemPendentes(listagemPendentes, caminhoArquivoSaida);
