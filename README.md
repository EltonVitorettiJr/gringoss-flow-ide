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
