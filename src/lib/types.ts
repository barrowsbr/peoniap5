/** Linha consolidada que o frontend consome (ticker + snapshot mais recente). */
export type RadarRow = {
  symbol: string;
  name: string;
  sector: string | null;
  country: string | null;
  currency: string | null;
  weightVwra: number | null;

  date: string | null;
  close: number | null;
  ath: number | null;
  atl52w: number | null;
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
