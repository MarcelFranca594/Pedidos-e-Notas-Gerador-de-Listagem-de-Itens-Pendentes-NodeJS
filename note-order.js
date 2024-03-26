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