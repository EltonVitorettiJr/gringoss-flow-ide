<h1 align="center">API Barbearia Gringoss</h1>

<h3 align="center">Back-end MVP para Gestão de Agendamentos e Serviços</h3>

<br>

<p align="center">
  <a href="#art-sobre-o-projeto">Sobre o Projeto</a> | 
  <a href="#computer-tecnologias-usadas">Tecnologias Usadas</a> | 
  <a href="#package-como-rodar-o-projeto-localmente">Como Rodar</a> | 
  <a href="#books-documentação-swagger">Documentação</a>
</p>

<br>

# :art: Sobre o Projeto

Este é um projeto de Back-end robusto desenvolvido como MVP (Produto Mínimo Viável) para gerenciar as operações digitais de uma barbearia. O sistema orquestra a criação de serviços, horários de expediente (regras de negócio) e o fluxo completo de agendamentos de clientes.

O projeto foi arquitetado com padrões de mercado de nível Sênior, focando em alta performance, tipagem estrita de ponta a ponta e delegação de fuso horário, operando de forma global e segura para integração fluida com o Front-end.

<br>

## ✨ Features Principais

- **Motor de Agendamentos Inteligente:** Validação automática de choques de horário e sobreposições, operando 100% em UTC absoluto.
- **Validação End-to-End Segura:** Integração nativa do Zod nas rotas (`fastify-type-provider-zod`), barrando dados inválidos antes mesmo de atingirem os controladores.
- **Documentação Viva (Swagger):** Interface gráfica interativa (OpenAPI) gerada automaticamente a partir dos contratos do Zod para fornecer o manual da API em tempo real.
- **Segurança de Infraestrutura:** Proteção contra ataques de força bruta e requisições em massa implementada via Rate Limiter.
- **Precisão Financeira:** Valores monetários geridos via `Decimal.js` no banco de dados para evitar bugs de ponto flutuante.

# :computer: Tecnologias Usadas

A API foi desenvolvida utilizando as ferramentas mais modernas do ecossistema Node.js para garantir escalabilidade e código limpo:

### Back-end & Infraestrutura
- **Node.js + TypeScript** (Tipagem estática rigorosa)
- **Fastify** (Framework web de altíssima performance)
- **Prisma ORM** (Mapeamento objeto-relacional seguro)
- **PostgreSQL** (Banco de dados relacional)
- **Zod** (Declaração de schemas Single Source of Truth)
- **Swagger / OpenAPI** (Documentação UI)

# :package: Como Rodar o Projeto Localmente

Siga os passos abaixo para rodar a API em sua máquina local.

1.  **Clone o repositório:**
    ```sh
    git clone [https://github.com/EltonVitorettiJr/api-barbearia-gringoss.git](https://github.com/EltonVitorettiJr/api-barbearia-gringoss.git)
    cd api-barbearia-gringoss
    ```

2.  **Instale as dependências:**
    ```sh
    npm install
    ```

3.  **Configuração de Variáveis (.env):**
    Crie um arquivo `.env` na raiz do projeto com as suas credenciais do PostgreSQL. Se estiver usando o Docker padrão do projeto, a URL será algo como:
    ```env
    DATABASE_URL="postgresql://docker:docker@localhost:5432/gringoss?schema=public"
    ```

4.  **Suba o Banco de Dados com Docker:**
    Inicie o container do PostgreSQL em segundo plano. Certifique-se de que o Docker Desktop (ou daemon) esteja rodando.
    ```sh
    docker-compose up -d
    ```

5.  **Rode as Migrações:**
    Com o banco rodando, crie as tabelas de `Appointments`, `Services` e `BusinessRules`.
    ```sh
    npx prisma migrate dev
    ```

6.  **Inicie a API:**
    ```sh
    npm run dev
    ```
    O servidor iniciará na porta `3000`.

# :books: Documentação Swagger
Com o servidor em execução, você não precisa de ferramentas externas (como Postman ou HTTPie) para testar a API. Acesse a interface interativa do Swagger gerada pelo próprio projeto:

👉 http://localhost:3000/docs

# :bug: Problemas
Sinta-se à vontade para registrar problemas (Issues) caso encontre bugs ou tenha sugestões de melhoria arquitetural!
