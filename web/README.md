# Gringoss Flow IDE — Front-end (web)

Interface React + TypeScript (Vite) para configurar as regras de agendamento da Barbearia Gringoss.
Telas: **Regras de horário**, **Serviços** (com regras gerais) e **Simulação da agenda**.

## Como rodar

```bash
cd web
npm install
cp .env.example .env   # deixe VITE_API_URL vazio para usar só dados locais
npm run dev            # http://localhost:5173
```

Sem `VITE_API_URL`, os dados ficam no `localStorage` do navegador (com os mesmos valores do protótipo).
Com a API configurada, o front lê e grava via `src/api.ts`.

## Conectar com a API (pasta `/api`)

1. Suba o banco e a API (passos do README da pasta `api`): `docker-compose up -d`, `npx prisma migrate dev`, `npm run dev`.
2. No `web/.env`: `VITE_API_URL=http://localhost:3000` e `VITE_API_KEY` igual ao `API_KEY` da API.
3. A API precisa liberar CORS para `http://localhost:5173` (plugin `@fastify/cors`, com métodos GET, POST, PUT, DELETE e o header `x-api-key`).

Como o front se encaixa no banco:

| Front | API |
|---|---|
| Dia aberto com 1 ou 2 janelas | `BusinessRule` (uma linha por dia): `openTime`, `closeTime` e, se houver 2 janelas, `breakStart`/`breakEnd` |
| Dia fechado | sem linha em `BusinessRule` (a linha é apagada) |
| Serviços | `Service` (`name`, `durationMinutes`, `price`) |
| Status ativo/inativo do serviço | **só no navegador** (a API não tem esse campo) |
| Regras gerais (intervalo, antecedência, limite, máx./dia) | **só no navegador** (a API não tem esse modelo) |
| Simulação da agenda | local, não grava agendamentos no banco |

Limite: a API guarda **uma pausa por dia**, então o front aceita até 2 janelas por dia.

## Estrutura

```
src/
  api.ts            cliente HTTP (fetch) e rotas /rules, /services, /appointments
  store.tsx         estado global + persistência
  types.ts
  lib/schedule.ts   validação de janelas, detecção de conflitos, geração de grade
  lib/mappers.ts    converte dados da API <-> front
  lib/seed.ts       dados iniciais (iguais ao protótipo)
  components/       Layout, Toggle, PageHeader
  pages/            HorariosPage, ServicosPage, SimulacaoPage
```

## Regras implementadas

- Janelas por dia: sem sobreposição e com início antes do fim.
- Conflito na simulação: serviço termina + intervalo > início do próximo, ou fora das janelas/dia fechado.
- "Gerar grade" preenche as janelas com os serviços ativos respeitando o intervalo.
