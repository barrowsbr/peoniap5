/**
 * Holdings de config do VWRA (Vanguard FTSE All-World UCITS ETF).
 *
 * IMPORTANTE: a Vanguard publica a composição completa 1x/mês. Esta lista é uma
 * aproximação das ~50 maiores posições e DEVE ser reconciliada com o arquivo
 * oficial de holdings (último de referência: 31/mai/2026) antes de confiar nos
 * pesos. Atualizar manualmente 1x/mês é mais confiável do que scrapear o PDF.
 *
 * Campos:
 *  - symbol:    ticker para PREÇO/ATH via Yahoo (yahoo-finance2). Usa o sufixo
 *               da bolsa nativa para não-US (ex.: 2330.TW, ASML.AS, NESN.SW).
 *  - fmpSymbol: ticker para FUNDAMENTOS via FMP. Para não-US usamos a ADR/US
 *               listing quando existe (cobertura de fundamentos é melhor em US).
 *               Se omitido, usa `symbol`.
 *  - weight:    peso % aproximado no ETF (PLACEHOLDER — reconciliar com oficial).
 */

export type Holding = {
  symbol: string;
  fmpSymbol?: string;
  name: string;
  sector: string;
  country: string;
  currency: string;
  weight: number;
};

export const HOLDINGS: Holding[] = [
  { symbol: "AAPL",     name: "Apple",                 sector: "Technology",        country: "US", currency: "USD", weight: 4.30 },
  { symbol: "NVDA",     name: "NVIDIA",                sector: "Technology",        country: "US", currency: "USD", weight: 4.15 },
  { symbol: "MSFT",     name: "Microsoft",             sector: "Technology",        country: "US", currency: "USD", weight: 3.90 },
  { symbol: "AMZN",     name: "Amazon",                sector: "Consumer Disc.",    country: "US", currency: "USD", weight: 2.45 },
  { symbol: "META",     name: "Meta Platforms",        sector: "Communication",     country: "US", currency: "USD", weight: 1.70 },
  { symbol: "GOOGL",    name: "Alphabet A",            sector: "Communication",     country: "US", currency: "USD", weight: 1.30 },
  { symbol: "AVGO",     name: "Broadcom",              sector: "Technology",        country: "US", currency: "USD", weight: 1.25 },
  { symbol: "GOOG",     name: "Alphabet C",            sector: "Communication",     country: "US", currency: "USD", weight: 1.10 },
  { symbol: "TSLA",     name: "Tesla",                 sector: "Consumer Disc.",    country: "US", currency: "USD", weight: 1.05 },
  { symbol: "LLY",      name: "Eli Lilly",             sector: "Healthcare",        country: "US", currency: "USD", weight: 0.95 },
  { symbol: "2330.TW",  fmpSymbol: "TSM",  name: "TSMC",            sector: "Technology",   country: "TW", currency: "TWD", weight: 0.92 },
  { symbol: "JPM",      name: "JPMorgan Chase",        sector: "Financials",        country: "US", currency: "USD", weight: 0.90 },
  { symbol: "V",        name: "Visa",                  sector: "Financials",        country: "US", currency: "USD", weight: 0.80 },
  { symbol: "MA",       name: "Mastercard",            sector: "Financials",        country: "US", currency: "USD", weight: 0.70 },
  { symbol: "NFLX",     name: "Netflix",               sector: "Communication",     country: "US", currency: "USD", weight: 0.68 },
  { symbol: "XOM",      name: "ExxonMobil",            sector: "Energy",            country: "US", currency: "USD", weight: 0.66 },
  { symbol: "COST",     name: "Costco",                sector: "Consumer Staples",  country: "US", currency: "USD", weight: 0.64 },
  { symbol: "WMT",      name: "Walmart",               sector: "Consumer Staples",  country: "US", currency: "USD", weight: 0.62 },
  { symbol: "UNH",      name: "UnitedHealth",          sector: "Healthcare",        country: "US", currency: "USD", weight: 0.60 },
  { symbol: "PG",       name: "Procter & Gamble",      sector: "Consumer Staples",  country: "US", currency: "USD", weight: 0.58 },
  { symbol: "JNJ",      name: "Johnson & Johnson",     sector: "Healthcare",        country: "US", currency: "USD", weight: 0.56 },
  { symbol: "HD",       name: "Home Depot",            sector: "Consumer Disc.",    country: "US", currency: "USD", weight: 0.54 },
  { symbol: "ORCL",     name: "Oracle",                sector: "Technology",        country: "US", currency: "USD", weight: 0.52 },
  { symbol: "ABBV",     name: "AbbVie",                sector: "Healthcare",        country: "US", currency: "USD", weight: 0.50 },
  { symbol: "BAC",      name: "Bank of America",       sector: "Financials",        country: "US", currency: "USD", weight: 0.48 },
  { symbol: "KO",       name: "Coca-Cola",             sector: "Consumer Staples",  country: "US", currency: "USD", weight: 0.46 },
  { symbol: "ASML.AS",  fmpSymbol: "ASML", name: "ASML Holding",    sector: "Technology",   country: "NL", currency: "EUR", weight: 0.45 },
  { symbol: "CRM",      name: "Salesforce",            sector: "Technology",        country: "US", currency: "USD", weight: 0.44 },
  { symbol: "CVX",      name: "Chevron",               sector: "Energy",            country: "US", currency: "USD", weight: 0.42 },
  { symbol: "WFC",      name: "Wells Fargo",           sector: "Financials",        country: "US", currency: "USD", weight: 0.40 },
  { symbol: "NOVO-B.CO", fmpSymbol: "NVO", name: "Novo Nordisk",    sector: "Healthcare",   country: "DK", currency: "DKK", weight: 0.39 },
  { symbol: "SAP.DE",   fmpSymbol: "SAP",  name: "SAP",             sector: "Technology",   country: "DE", currency: "EUR", weight: 0.38 },
  { symbol: "NESN.SW",  fmpSymbol: "NSRGY", name: "Nestlé",         sector: "Consumer Staples", country: "CH", currency: "CHF", weight: 0.37 },
  { symbol: "PM",       name: "Philip Morris Intl.",   sector: "Consumer Staples",  country: "US", currency: "USD", weight: 0.36 },
  { symbol: "CSCO",     name: "Cisco Systems",         sector: "Technology",        country: "US", currency: "USD", weight: 0.35 },
  { symbol: "0700.HK",  fmpSymbol: "TCEHY", name: "Tencent",        sector: "Communication", country: "HK", currency: "HKD", weight: 0.34 },
  { symbol: "AZN.L",    fmpSymbol: "AZN",  name: "AstraZeneca",     sector: "Healthcare",   country: "GB", currency: "GBP", weight: 0.33 },
  { symbol: "ROG.SW",   fmpSymbol: "RHHBY", name: "Roche Holding",  sector: "Healthcare",   country: "CH", currency: "CHF", weight: 0.32 },
  { symbol: "005930.KS", fmpSymbol: "SSNLF", name: "Samsung Electronics", sector: "Technology", country: "KR", currency: "KRW", weight: 0.31 },
  { symbol: "IBM",      name: "IBM",                   sector: "Technology",        country: "US", currency: "USD", weight: 0.30 },
  { symbol: "MCD",      name: "McDonald's",            sector: "Consumer Disc.",    country: "US", currency: "USD", weight: 0.29 },
  { symbol: "GE",       name: "GE Aerospace",          sector: "Industrials",       country: "US", currency: "USD", weight: 0.28 },
  { symbol: "ABT",      name: "Abbott Laboratories",   sector: "Healthcare",        country: "US", currency: "USD", weight: 0.27 },
  { symbol: "LIN",      name: "Linde",                 sector: "Materials",         country: "US", currency: "USD", weight: 0.26 },
  { symbol: "PLTR",     name: "Palantir",              sector: "Technology",        country: "US", currency: "USD", weight: 0.25 },
  { symbol: "TMUS",     name: "T-Mobile US",           sector: "Communication",     country: "US", currency: "USD", weight: 0.24 },
  { symbol: "INTU",     name: "Intuit",                sector: "Technology",        country: "US", currency: "USD", weight: 0.23 },
  { symbol: "CAT",      name: "Caterpillar",           sector: "Industrials",       country: "US", currency: "USD", weight: 0.22 },
  { symbol: "SHEL.L",   fmpSymbol: "SHEL", name: "Shell",           sector: "Energy",       country: "GB", currency: "GBP", weight: 0.21 },
  { symbol: "DIS",      name: "Walt Disney",           sector: "Communication",     country: "US", currency: "USD", weight: 0.20 },
];

/** Símbolo a usar na FMP para fundamentos (US ADR quando disponível). */
export function fmpSymbolOf(h: Holding): string {
  return h.fmpSymbol ?? h.symbol;
}
