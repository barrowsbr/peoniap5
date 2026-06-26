/** Linha consolidada que o frontend consome (ticker + snapshot mais recente). */
export type RadarRow = {
  symbol: string;
  name: string;
  sector: string | null;
  country: string | null;
  currency: string | null;
  weightVwra: number | null;

  date: string | null;
  close: number | null; // USD
  ath: number | null; // USD
  atl52w: number | null; // USD
  fxToUsd: number | null; // USD por 1 unidade da moeda nativa
  pctFromAth: number | null; // <= 0  (0 = no ATH)
  pctFromLow: number | null; // >= 0

  peRatio: number | null;
  forwardPe: number | null;
  grossMargin: number | null;
  netMargin: number | null;
  debtToEquity: number | null;
  rsi14: number | null;

  spark: number[]; // série recente de fechamentos
};
