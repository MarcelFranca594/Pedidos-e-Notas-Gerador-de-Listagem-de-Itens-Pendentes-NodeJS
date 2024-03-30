<h1 align="center" style="font-family: 'Montserrat', sans-serif; font-size: 72px; color: #3498DB;">
  Gerador de Listagem de Itens Pendentes a partir de Cruzamento de Pedidos e Notas em Node.js
</h1>

<p align="center">
  <a href="#-project-overview">Project Overview</a> •
  <a href="#-key-features">Key Features</a> •
  <a href="#-technologies-used">Technologies Used</a> •
  <a href="#-project-structure">Project Structure</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-usage">Usage</a> •
  <a href="#-testing">Testing</a>
</p>


## 📄 Project Overview

O projeto tem como objetivo desenvolver um programa em Node.js para cruzar pedidos e notas, gerando uma lista clara de itens pendentes. Os aspectos técnicos abrangem o processamento dos dados de entrada, onde as notas indicam quais itens foram comprados em relação aos pedidos.

Para assegurar a integridade dos dados, o programa fará validações, identificando erros como valores incorretos, repetições e ausências de itens. Ao analisar as notas, serão identificados os itens pendentes em cada pedido, com base na diferença entre a quantidade total e a quantidade registrada. O resultado será uma lista de pedidos pendentes, com informações como valor total, saldo e detalhes dos itens, simplificando o gerenciamento de transações comerciais.

## ✨ Key Features
- Cruzamento de Pedidos e Notas: Processa arquivos de pedidos e notas, associando itens comprados aos pedidos correspondentes.
- Validação de Dados de Entrada: Garante que todos os valores estejam no formato correto antes do cruzamento, lançando exceções para inconsistências.
- Identificação de Itens Pendentes: Percorre as notas para identificar itens pendentes em cada pedido com base na quantidade informada.
- Geração de Listagem de Itens Pendentes: Gera um arquivo de texto com detalhes dos pedidos pendentes, incluindo valor total, saldo e lista de itens pendentes.

## 🛠 Technologies Used

- JavaScript
- Typescript
- Node.js
- Fastify (Framework web leve e eficiente para construção de APIs em Node.js)

## 📁 Project Structure

- `process.routes.ts`:O arquivo process.routes.ts gerencia as rotas da API para processar pedidos e notas. Ele recebe dados de pedidos e notas do corpo da requisição, convertendo-os conforme necessário. Após gerar um ID de processamento único, o arquivo executa o processamento dos pedidos e notas. Em seguida, ele cria uma listagem de itens pendentes e a armazena em um arquivo de texto. Se ocorrer algum erro durante o processo, uma mensagem de erro é retornada com o status 500.
- `server.mjs`: Este arquivo é responsável por iniciar o servidor HTTP, utilizando o framework definido no arquivo 'app.ts'. Ele obtém a porta do ambiente e inicia o servidor na porta especificada. Quando o servidor é iniciado com sucesso, uma mensagem é exibida no console informando que o servidor está em execução.
- `note-order.ts`: 
O código define interfaces para representar pedidos, notas e itens pendentes, realizando a leitura de arquivos de pedidos e notas, validando os dados e gerando uma listagem de itens pendentes com base nas informações fornecidas. As funções processam os arquivos, identificando itens pendentes e escrevendo a listagem em um arquivo de texto.
- `note-order.js`: Este código em JavaScript foi desenvolvido para processar arquivos de pedidos e notas, permitindo o cruzamento de informações e a geração de uma lista detalhada de pedidos pendentes.
- `ListagemItensPendentes.txt`: Detalha os pedidos pendentes processados, destacando o valor total e saldo de cada pedido. Em seguida, enumera os itens pendentes para cada pedido, indicando o número do item e o saldo de quantidade restante. Essas informações permitem uma visão clara dos pedidos em aberto e dos itens que necessitam ser atendidos.

## ⚙️ Installation

1. Clone the repository: `git clone https://github.com/MarcelFranca594/Pedidos-e-Notas-Gerador-de-Listagem-de-Itens-Pendentes-NodeJS.git`
2. Navigate to the project directory: `cd pure-nodejs-api`
3. Install dependencies: `npm install`

## 🖥 Usage

1. Start the API server: `npm run dev`
2. Access the API endpoints using a REST client (e.g., Postman, cURL) on `http://localhost:3338`.

<p align="center">Made with 💜 by <a href="https://github.com/MarcelFranca594">Marcel Igor</a></p>