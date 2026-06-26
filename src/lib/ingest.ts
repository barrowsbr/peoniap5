import { db } from "@/db";
import { tickers, dailySnapshots, type NewSnapshot } from "@/db/schema";
import { fetchPrice } from "@/lib/sources/yahoo";
import { fetchFundamentals } from "@/lib/sources/fmp";
import { fetchFxRates, rateFor } from "@/lib/sources/fx";
import { pctFromAth, pctFromLow, rsi } from "@/lib/metrics";

export type IngestResult = {
  ok: boolean;
  date: string | null;
  processed: number;
  priceOk: number;
  fundamentalsOk: number;
  errors: string[];
};

const BATCH = 5; // lotes pequenos: gentil com Yahoo/FMP e evita timeout

/**
 * Pipeline ETL diário (EOD): para cada ticker do banco, busca preço/ATH (Yahoo)
 * e fundamentos (FMP), calcula derivados e faz upsert do snapshot do dia.
 */
export async function runIngestion(): Promise<IngestResult> {
  const errors: string[] = [];
  if (!db) {
    return { ok: false, date: null, processed: 0, priceOk: 0, fundamentalsOk: 0, errors: ["DATABASE_URL ausente"] };
  }

  const universe = await db.select().from(tickers);
  if (!universe.length) {
    return { ok: false, date: null, processed: 0, priceOk: 0, fundamentalsOk: 0, errors: ["tabela tickers vazia — rode db:seed"] };
  }

  // Câmbio para USD (1 fetch por moeda distinta).
  const fx = await fetchFxRates(universe.map((t) => t.currency));

  let priceOk = 0;
  let fundamentalsOk = 0;
  let snapshotDate: string | null = null;

  for (let i = 0; i < universe.length; i += BATCH) {
    const slice = universe.slice(i, i + BATCH);
    await Promise.all(
      slice.map(async (t) => {
        try {
          const price = await fetchPrice(t.symbol);
          const fund = await fetchFundamentals(t.fmpSymbol ?? t.symbol);

          if (!price) {
            errors.push(`preço indisponível: ${t.symbol}`);
            return;
          }
          priceOk++;
          if (fund) fundamentalsOk++;

          const date = price.asOf;
          if (!snapshotDate) snapshotDate = date;

          // Normaliza preço/ATH/mínima/sparkline para USD.
          const rate = rateFor(fx, t.currency);
          const closeUsd = price.close * rate;
          const athUsd = price.ath * rate;
          const atlUsd = price.atl52w * rate;
          const sparkUsd = price.spark.map((v) => +(v * rate).toFixed(4));

          const snap: NewSnapshot = {
            tickerId: t.id,
            date,
            close: closeUsd,
            ath: athUsd,
            atl52w: atlUsd,
            fxToUsd: rate,
            pctFromAth: pctFromAth(price.close, price.ath),
            pctFromLow: pctFromLow(price.close, price.atl52w),
            peRatio: fund?.peRatio ?? null,
            forwardPe: fund?.forwardPe ?? null,
            grossMargin: fund?.grossMargin ?? null,
            netMargin: fund?.netMargin ?? null,
            debtToEquity: fund?.debtToEquity ?? null,
            rsi14: rsi(price.spark),
            spark: JSON.stringify(sparkUsd.slice(-180)),
          };

          await db!
            .insert(dailySnapshots)
            .values(snap)
            .onConflictDoUpdate({
              target: [dailySnapshots.tickerId, dailySnapshots.date],
              set: {
                close: snap.close,
                ath: snap.ath,
                atl52w: snap.atl52w,
                fxToUsd: snap.fxToUsd,
                pctFromAth: snap.pctFromAth,
                pctFromLow: snap.pctFromLow,
                peRatio: snap.peRatio,
                forwardPe: snap.forwardPe,
                grossMargin: snap.grossMargin,
                netMargin: snap.netMargin,
                debtToEquity: snap.debtToEquity,
                rsi14: snap.rsi14,
                spark: snap.spark,
              },
            });
        } catch (e) {
          errors.push(`${t.symbol}: ${(e as Error).message}`);
        }
      })
    );
  }

  return {
    ok: priceOk > 0,
    date: snapshotDate,
    processed: universe.length,
    priceOk,
    fundamentalsOk,
    errors,
  };
}
