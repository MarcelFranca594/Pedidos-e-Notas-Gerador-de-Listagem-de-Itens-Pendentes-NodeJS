"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
// Ler e Validar Pedidos e Notas
function lerArquivos(pasta) {
    if (!fs.existsSync(pasta)) {
        throw new Error("A pasta ".concat(pasta, " n\u00E3o existe."));
    }
    return fs.readdirSync(pasta);
}
function lerPedidos(pasta) {
    var e_1, _a, e_2, _b;
    var arquivos = lerArquivos(pasta);
    var pedidos = [];
    try {
        for (var arquivos_1 = __values(arquivos), arquivos_1_1 = arquivos_1.next(); !arquivos_1_1.done; arquivos_1_1 = arquivos_1.next()) {
            var arquivo = arquivos_1_1.value;
            var conteudo = fs.readFileSync("".concat(pasta, "/").concat(arquivo), 'utf-8').trim().split('\n');
            var items = [];
            try {
                for (var conteudo_1 = (e_2 = void 0, __values(conteudo)), conteudo_1_1 = conteudo_1.next(); !conteudo_1_1.done; conteudo_1_1 = conteudo_1.next()) {
                    var linha = conteudo_1_1.value;
                    var item = JSON.parse(linha);
                    items.push(item);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (conteudo_1_1 && !conteudo_1_1.done && (_b = conteudo_1.return)) _b.call(conteudo_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            pedidos.push({ items: items });
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (arquivos_1_1 && !arquivos_1_1.done && (_a = arquivos_1.return)) _a.call(arquivos_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return pedidos;
}
function lerNotas(pasta) {
    var e_3, _a, e_4, _b;
    var arquivos = lerArquivos(pasta);
    var notas = {};
    try {
        for (var arquivos_2 = __values(arquivos), arquivos_2_1 = arquivos_2.next(); !arquivos_2_1.done; arquivos_2_1 = arquivos_2.next()) {
            var arquivo = arquivos_2_1.value;
            var conteudo = fs.readFileSync("".concat(pasta, "/").concat(arquivo), 'utf-8').trim().split('\n');
            try {
                for (var conteudo_2 = (e_4 = void 0, __values(conteudo)), conteudo_2_1 = conteudo_2.next(); !conteudo_2_1.done; conteudo_2_1 = conteudo_2.next()) {
                    var linha = conteudo_2_1.value;
                    var item = JSON.parse(linha);
                    var id_pedido = item.id_pedido;
                    if (!notas[id_pedido]) {
                        notas[id_pedido] = [];
                    }
                    notas[id_pedido].push(item);
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (conteudo_2_1 && !conteudo_2_1.done && (_b = conteudo_2.return)) _b.call(conteudo_2);
                }
                finally { if (e_4) throw e_4.error; }
            }
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (arquivos_2_1 && !arquivos_2_1.done && (_a = arquivos_2.return)) _a.call(arquivos_2);
        }
        finally { if (e_3) throw e_3.error; }
    }
    return notas;
}
// Cruzar Pedidos e Notas
function cruzarPedidosNotas(pedidos, notas) {
    var e_5, _a;
    var pedidosPendentes = new Map();
    var _loop_1 = function (pedido) {
        var e_6, _b, e_7, _c, e_8, _d;
        var items = pedido.items;
        var id_pedido = void 0;
        try {
            for (var items_1 = (e_6 = void 0, __values(items)), items_1_1 = items_1.next(); !items_1_1.done; items_1_1 = items_1.next()) {
                var pedidoItem = items_1_1.value;
                var id_pedido_item = pedidoItem.id_pedido;
                if (id_pedido_item) {
                    id_pedido = id_pedido_item;
                    break;
                }
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (items_1_1 && !items_1_1.done && (_b = items_1.return)) _b.call(items_1);
            }
            finally { if (e_6) throw e_6.error; }
        }
        if (!id_pedido) {
            throw new Error('Não foi possível encontrar o id_pedido no pedido ou em seus itens.');
        }
        var itensPendentes = new Map();
        try {
            for (var items_2 = (e_7 = void 0, __values(items)), items_2_1 = items_2.next(); !items_2_1.done; items_2_1 = items_2.next()) {
                var pedidoItem = items_2_1.value;
                if (notas[id_pedido]) {
                    try {
                        for (var _e = (e_8 = void 0, __values(notas[id_pedido])), _f = _e.next(); !_f.done; _f = _e.next()) {
                            var notaItem = _f.value;
                            if (pedidoItem.numero_item === notaItem.numero_item) {
                                var quantidadePendente = pedidoItem.quantidade_produto - notaItem.quantidade_produto;
                                if (quantidadePendente > 0) {
                                    itensPendentes.set(notaItem.numero_item, quantidadePendente);
                                }
                            }
                        }
                    }
                    catch (e_8_1) { e_8 = { error: e_8_1 }; }
                    finally {
                        try {
                            if (_f && !_f.done && (_d = _e.return)) _d.call(_e);
                        }
                        finally { if (e_8) throw e_8.error; }
                    }
                }
                else {
                    itensPendentes.set(pedidoItem.numero_item, pedidoItem.quantidade_produto);
                }
            }
        }
        catch (e_7_1) { e_7 = { error: e_7_1 }; }
        finally {
            try {
                if (items_2_1 && !items_2_1.done && (_c = items_2.return)) _c.call(items_2);
            }
            finally { if (e_7) throw e_7.error; }
        }
        var totalPedido = items.reduce(function (acc, curr) { return acc + (curr.quantidade_produto * curr.valor_unitario_produto); }, 0);
        var saldoValor = Array.from(itensPendentes.values()).reduce(function (acc, quantidadePendente) { return acc + (quantidadePendente * items[0].valor_unitario_produto); }, 0);
        if (itensPendentes.size > 0) {
            pedidosPendentes.set(id_pedido, {
                total: totalPedido,
                saldo: saldoValor,
                itens_pendentes: itensPendentes
            });
        }
    };
    try {
        for (var pedidos_1 = __values(pedidos), pedidos_1_1 = pedidos_1.next(); !pedidos_1_1.done; pedidos_1_1 = pedidos_1.next()) {
            var pedido = pedidos_1_1.value;
            _loop_1(pedido);
        }
    }
    catch (e_5_1) { e_5 = { error: e_5_1 }; }
    finally {
        try {
            if (pedidos_1_1 && !pedidos_1_1.done && (_a = pedidos_1.return)) _a.call(pedidos_1);
        }
        finally { if (e_5) throw e_5.error; }
    }
    return pedidosPendentes;
}
// Gerar Listagem de Itens Pendentes
function gerarListagemPendentes(pedidosPendentes, caminhoArquivo) {
    var e_9, _a, e_10, _b;
    var conteudoArquivo = [];
    try {
        for (var pedidosPendentes_1 = __values(pedidosPendentes), pedidosPendentes_1_1 = pedidosPendentes_1.next(); !pedidosPendentes_1_1.done; pedidosPendentes_1_1 = pedidosPendentes_1.next()) {
            var _c = __read(pedidosPendentes_1_1.value, 2), id_pedido = _c[0], _d = _c[1], total = _d.total, saldo = _d.saldo, itens_pendentes = _d.itens_pendentes;
            conteudoArquivo.push("Pedido ".concat(id_pedido, ":"));
            conteudoArquivo.push("Total do Pedido: ".concat(total));
            conteudoArquivo.push("Saldo do Valor: ".concat(saldo));
            conteudoArquivo.push('Itens Pendentes:');
            try {
                for (var itens_pendentes_1 = (e_10 = void 0, __values(itens_pendentes)), itens_pendentes_1_1 = itens_pendentes_1.next(); !itens_pendentes_1_1.done; itens_pendentes_1_1 = itens_pendentes_1.next()) {
                    var _e = __read(itens_pendentes_1_1.value, 2), numero_item = _e[0], quantidadePendente = _e[1];
                    conteudoArquivo.push("- Item ".concat(numero_item, ": ").concat(quantidadePendente));
                }
            }
            catch (e_10_1) { e_10 = { error: e_10_1 }; }
            finally {
                try {
                    if (itens_pendentes_1_1 && !itens_pendentes_1_1.done && (_b = itens_pendentes_1.return)) _b.call(itens_pendentes_1);
                }
                finally { if (e_10) throw e_10.error; }
            }
            conteudoArquivo.push('');
        }
    }
    catch (e_9_1) { e_9 = { error: e_9_1 }; }
    finally {
        try {
            if (pedidosPendentes_1_1 && !pedidosPendentes_1_1.done && (_a = pedidosPendentes_1.return)) _a.call(pedidosPendentes_1);
        }
        finally { if (e_9) throw e_9.error; }
    }
    fs.writeFileSync(caminhoArquivo, conteudoArquivo.join('\n'));
}
// Utilização
try {
    var pedidos = lerPedidos('Teste/Pedidos/');
    var notas = lerNotas('Teste/Notas/');
    var pedidosPendentes = cruzarPedidosNotas(pedidos, notas);
    gerarListagemPendentes(pedidosPendentes, 'caminho/arquivo_pendentes.txt');
    console.log('Listagem de pedidos pendentes gerada com sucesso!');
}
catch (error) {
    if (error instanceof Error) {
        console.error('Ocorreu um erro:', error.message);
    }
    else {
        console.error('Ocorreu um erro desconhecido.');
    }
}
