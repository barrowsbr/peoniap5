import yahooFinance from "yahoo-finance2";
import { maxOf, minOf } from "@/lib/metrics";

/**
 * Preço, ATH e mínima 52s via yahoo-finance2 (cobertura internacional, sem chave).
 * Tudo em base de fechamento AJUSTADO (lida com splits/dividendos), o que torna a
 * "distância do ATH" comparável ao longo do tempo.
 */
export type PriceData = {
  close: number;
  ath: number;
  atl52w: number;
  spark: number[];
  asOf: string; // YYYY-MM-DD do último pregão
};

const HISTORY_START = new Date("1980-01-01");

export async function fetchPrice(symbol: string): Promise<PriceData | null> {
  try {
    const oneYearAgo = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000);

    // Diário (1 ano): close atual, mínima 52s e série da sparkline.
    const daily = await yahooFinance.chart(symbol, {
      period1: oneYearAgo,
      interval: "1d",
    });
    const dq = (daily.quotes ?? []).filter(
      (q) => q.adjclose != null && isFinite(q.adjclose as number)
    );
    if (!dq.length) return null;

    const closes = dq.map((q) => q.adjclose as number);
    const close = closes[closes.length - 1];
    const atl52w = minOf(closes) ?? close;
    const spark = closes.slice(-180);
    const last = dq[dq.length - 1].date as Date;
    const asOf = last.toISOString().slice(0, 10);

    // Histórico completo (mensal): ATH.
    let ath = close;
    try {
      const hist = await yahooFinance.chart(symbol, {
        period1: HISTORY_START,
        interval: "1mo",
      });
      const hcloses = (hist.quotes ?? [])
        .map((q) => q.adjclose)
        .filter((v): v is number => v != null && isFinite(v));
      ath = maxOf([close, ...hcloses]) ?? close;
    } catch {
      // sem histórico longo: usa o pico do último ano como fallback
      ath = maxOf([close, ...closes]) ?? close;
    }

    return { close, ath, atl52w, spark, asOf };
  } catch {
    return null;
  }
}
