// Este script realiza o processamento de pedidos e notas, cruzando as informações para gerar uma lista de pedidos pendentes.

import fs from 'fs';
import path from 'path';

// Função para converter valores de moeda para números
function converterParaNumero(valor) {
  return parseFloat(valor.replace(',', '.'));
}