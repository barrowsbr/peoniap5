import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type Candle = {
  time: number; // UTC timestamp (segundos)
  open: number;
  high: number;
  low: number;
  close: number;
};

/**
 * OHLC diário (1 ano) sob demanda para o drill-down. Valores na MOEDA NATIVA do
 * papel — o cliente multiplica por fxToUsd para exibir em USD. Não persistimos
 * OHLC (mantém o banco leve); buscamos só quando o detalhe abre.
 */
export async function GET(
  _req: Request,
  { params }: { params: { symbol: string } }
): Promise<Response> {
  const symbol = decodeURIComponent(params.symbol);
  try {
    const oneYearAgo = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000);
    const res = await yahooFinance.chart(symbol, {
      period1: oneYearAgo,
      interval: "1d",
    });
    const candles: Candle[] = (res.quotes ?? [])
      .filter(
        (q) =>
          q.open != null &&
          q.high != null &&
          q.low != null &&
          q.close != null &&
          q.date != null
      )
      .map((q) => ({
        time: Math.floor((q.date as Date).getTime() / 1000),
        open: q.open as number,
        high: q.high as number,
        low: q.low as number,
        close: q.close as number,
      }));
    return NextResponse.json({ candles });
  } catch {
    return NextResponse.json({ candles: [] });
  }
}
