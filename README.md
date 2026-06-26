# VWRA Radar

Painel **EOD** (fim de dia) para monitorar as ~50 maiores empresas do **VWRA**
(Vanguard FTSE All-World), com foco em **distância do ATH / mínimas** e
**fundamentos** (P/E, margens, dívida). Leitura pura — sem ordens, sem alertas de
execução.

> Arquitetura central: um **pipeline ETL diário** (extrai da API → calcula
> métricas derivadas → grava no Postgres) + um **frontend read-only** que só lê do
> banco. Ingestão e visualização são separadas de propósito.

As animações antigas deste repositório foram preservadas em [`legacy/`](./legacy).

---

## Stack

| Camada | Escolha |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Banco | Postgres (Neon ou Supabase, free tier) |
| ORM | Drizzle |
| Preço / ATH / mínimas | `yahoo-finance2` (cobertura internacional, sem chave) |
| Fundamentos | Financial Modeling Prep — FMP (free tier 250 req/dia) |
| Ingestão EOD | Route Handler + Vercel Cron (`/api/cron/ingest`) |
| Tabela | TanStack Table + Tailwind |
| Gráficos | lightweight-charts (sparklines) |

---

## Rodar sem banco (modo mock)

O painel funciona **sem nenhuma configuração**: se `DATABASE_URL` não estiver
setado, ele usa dados de exemplo determinísticos (`src/db/mock.ts`).

```bash
npm install
npm run dev      # http://localhost:3000  → badge "modo mock"
```

## Rodar com dados reais

1. **Banco** — crie um Postgres grátis (Neon/Supabase) e copie a connection string.
2. **Env**:
   ```bash
   cp .env.example .env
   # preencha DATABASE_URL, FMP_API_KEY (opcional), CRON_SECRET
   ```
3. **Schema + seed**:
   ```bash
   npm run db:push     # cria as tabelas (tickers, daily_snapshots)
   npm run db:seed     # popula os ~50 tickers do VWRA
   ```
4. **Ingestão** (busca preço/ATH + fundamentos e grava o snapshot do dia):
   ```bash
   npm run ingest      # roda a mesma lógica do endpoint, localmente
   ```
5. `npm run dev` → agora com badge "dados ao vivo".

---

## Ingestão automática (Vercel Cron)

`vercel.json` já agenda `/api/cron/ingest` para **22:00 UTC, seg–sex** (após o
fechamento de NY). O endpoint é protegido por `CRON_SECRET` (o Vercel Cron manda
`Authorization: Bearer <CRON_SECRET>`). Chamada manual:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://SEU-APP/api/cron/ingest
```

Se a ingestão crescer (mais tickers, backfill de histórico) e o cron da Vercel
ficar apertado no timeout, dá para mover `runIngestion()` para um script Python/
cron num VPS gravando no **mesmo Postgres** — o frontend não muda, porque só lê.

---

## Modelo de dados

```
tickers           — universo (atualizado ~1x/mês a partir dos holdings)
  symbol, fmp_symbol, name, weight_vwra, sector, country, currency

daily_snapshots   — 1 linha por ticker por dia (EOD)
  close, ath, atl_52w
  pct_from_ath  (derivado, indexado)  ← coração do painel
  pct_from_low
  pe_ratio, forward_pe, gross_margin, net_margin, debt_to_equity
  rsi_14, spark (série p/ sparkline)
  UNIQUE(ticker_id, date)
```

`pct_from_ath` é calculado e **indexado** na ingestão, então ordenar o painel
inteiro por "quão longe do topo" é instantâneo. Os dois presets da UI ("Perto do
ATH" e "Longe do ATH / value") são exatamente os dois modos de swing.

---

## Fontes de dados (estratégia híbrida)

- **Preço, ATH, mínima 52s** → `yahoo-finance2`. Cobertura internacional imbatível
  (sufixos `.TW`, `.AS`, `.SW`, `.HK`, `.KS`…), sem chave. Base de fechamento
  **ajustado** (lida com splits/dividendos).
- **Fundamentos** → FMP, usando a **listagem US/ADR** quando o papel é estrangeiro
  (campo `fmpSymbol` no config) porque a cobertura de fundamentos é melhor em US.

Se o Yahoo (não-oficial) quebrar um dia, troca-se só a camada de preço sem mexer
nos fundamentos.

---

## Decisões adotadas (seção 8 do plano)

- **ATH** = máxima histórica real, em base de fechamento ajustado.
- **Holdings** = atualização **manual mensal** (`src/config/holdings.ts`). Mais
  confiável que scrapear o PDF da Vanguard.
- **Moeda**: o snapshot guarda o preço como vem do Yahoo (nativo p/ intl). A UI
  exibe na moeda nativa do papel — **normalização cambial para USD é um TODO**
  (precisa de uma fonte de FX no pipeline).

> ⚠️ A lista em `src/config/holdings.ts` é uma **aproximação** das 50 maiores e
> traz pesos PLACEHOLDER. Reconcilie com o arquivo oficial de holdings da Vanguard
> (referência: 31/mai/2026) antes de confiar nos pesos.

---

## Estrutura

```
src/
  app/
    page.tsx                  painel (RSC, lê do banco ou mock)
    api/cron/ingest/route.ts  endpoint de ingestão EOD
  components/
    RadarTable.tsx            tabela mestra (TanStack) + presets + heatmap
    Sparkline.tsx             sparkline (lightweight-charts)
  config/holdings.ts          os ~50 tickers do VWRA
  db/
    schema.ts                 schema Drizzle
    index.ts                  cliente Postgres (null = modo mock)
    mock.ts                   dados de exemplo
  lib/
    ingest.ts                 runIngestion() — o ETL
    data.ts                   getRadarData() — banco ou mock
    metrics.ts                pct_from_ath, pct_from_low, RSI
    sources/yahoo.ts          preço/ATH
    sources/fmp.ts            fundamentos
    format.ts                 formatação + heatmap
  scripts/
    seed.ts                   npm run db:seed
    ingest-local.ts           npm run ingest
```

## Roadmap restante

- **Drill-down** ao clicar numa linha (candle maior + histórico de fundamentos).
- Normalização cambial para USD.
- Backfill de histórico para gráficos mais longos.
