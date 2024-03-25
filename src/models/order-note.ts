import * as fs from 'fs';
import * as path from 'path';

interface Pedido {
  numero_item: number;
  codigo_produto: string;
  quantidade_produto: number;
  valor_unitario_produto: number;
}

interface Nota {
  id_pedido: string;
  numero_item: number;
  quantidade_produto: number;
}