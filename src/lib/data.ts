import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { tickers, dailySnapshots } from "@/db/schema";
import { mockRows } from "@/db/mock";
import type { RadarRow } from "@/lib/types";

export type RadarData = {
  rows: RadarRow[];
  mode: "live" | "mock";
  asOf: string | null;
};

/**
 * Linhas do painel = último snapshot de cada ticker (join com tickers).
 * Sem DATABASE_URL ou banco vazio -> cai no modo MOCK.
 */
export async function getRadarData(): Promise<RadarData> {
  if (!db) return { rows: mockRows(), mode: "mock", asOf: null };

  try {
    // data mais recente presente na tabela de snapshots
    const latest = await db
      .select({ date: dailySnapshots.date })
      .from(dailySnapshots)
      .orderBy(desc(dailySnapshots.date))
      .limit(1);

    if (!latest.length) return { rows: mockRows(), mode: "mock", asOf: null };

    const asOf = latest[0].date;

    const joined = await db
      .select()
      .from(tickers)
      .leftJoin(dailySnapshots, eq(dailySnapshots.tickerId, tickers.id))
      .where(eq(dailySnapshots.date, asOf));

    const rows: RadarRow[] = joined.map(({ tickers: t, daily_snapshots: s }) => ({
      symbol: t.symbol,
      name: t.name,
      sector: t.sector,
      country: t.country,
      currency: t.currency,
      weightVwra: t.weightVwra,
      date: s?.date ?? null,
      close: s?.close ?? null,
      ath: s?.ath ?? null,
      atl52w: s?.atl52w ?? null,
      fxToUsd: s?.fxToUsd ?? null,
      pctFromAth: s?.pctFromAth ?? null,
      pctFromLow: s?.pctFromLow ?? null,
      peRatio: s?.peRatio ?? null,
      forwardPe: s?.forwardPe ?? null,
      grossMargin: s?.grossMargin ?? null,
      netMargin: s?.netMargin ?? null,
      debtToEquity: s?.debtToEquity ?? null,
      rsi14: s?.rsi14 ?? null,
      spark: parseSpark(s?.spark),
    }));

    // ordena por peso desc por padrão
    rows.sort((a, b) => (b.weightVwra ?? 0) - (a.weightVwra ?? 0));

    return { rows, mode: "live", asOf };
  } catch {
    return { rows: mockRows(), mode: "mock", asOf: null };
  }
}

function parseSpark(raw: string | null | undefined): number[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((n) => typeof n === "number") : [];
  } catch {
    return [];
  }
}
