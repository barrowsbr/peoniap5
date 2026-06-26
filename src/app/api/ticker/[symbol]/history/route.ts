import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { tickers, dailySnapshots } from "@/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type HistoryPoint = {
  date: string;
  close: number | null;
  pctFromAth: number | null;
  peRatio: number | null;
  netMargin: number | null;
  debtToEquity: number | null;
  rsi14: number | null;
};

/**
 * Histórico de fundamentos/preço (do banco) para o drill-down. A série cresce a
 * cada ingestão diária — no começo tem poucos pontos. Sem banco, retorna vazio e
 * o cliente cai num fallback de 1 ponto.
 */
export async function GET(
  _req: Request,
  { params }: { params: { symbol: string } }
): Promise<Response> {
  const symbol = decodeURIComponent(params.symbol);
  if (!db) return NextResponse.json({ history: [] as HistoryPoint[] });

  try {
    const t = await db
      .select({ id: tickers.id })
      .from(tickers)
      .where(eq(tickers.symbol, symbol))
      .limit(1);
    if (!t.length) return NextResponse.json({ history: [] as HistoryPoint[] });

    const rows = await db
      .select({
        date: dailySnapshots.date,
        close: dailySnapshots.close,
        pctFromAth: dailySnapshots.pctFromAth,
        peRatio: dailySnapshots.peRatio,
        netMargin: dailySnapshots.netMargin,
        debtToEquity: dailySnapshots.debtToEquity,
        rsi14: dailySnapshots.rsi14,
      })
      .from(dailySnapshots)
      .where(and(eq(dailySnapshots.tickerId, t[0].id)))
      .orderBy(asc(dailySnapshots.date))
      .limit(400);

    return NextResponse.json({ history: rows as HistoryPoint[] });
  } catch {
    return NextResponse.json({ history: [] as HistoryPoint[] });
  }
}
