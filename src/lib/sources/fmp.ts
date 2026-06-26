/**
 * Fundamentos via Financial Modeling Prep (free tier: 250 req/dia).
 * Usamos ratios-ttm (margens, dívida, P/E) + quote (P/E trailing de fallback).
 * Sem FMP_API_KEY, retorna null e a ingestão deixa os fundamentos vazios.
 */
export type Fundamentals = {
  peRatio: number | null;
  forwardPe: number | null;
  grossMargin: number | null;
  netMargin: number | null;
  debtToEquity: number | null;
};

const BASE = "https://financialmodelingprep.com/api/v3";

function num(v: unknown): number | null {
  const n = typeof v === "string" ? parseFloat(v) : (v as number);
  return typeof n === "number" && isFinite(n) ? n : null;
}

export async function fetchFundamentals(
  symbol: string
): Promise<Fundamentals | null> {
  const key = process.env.FMP_API_KEY;
  if (!key) return null;

  try {
    const [ratiosRes, quoteRes] = await Promise.all([
      fetch(`${BASE}/ratios-ttm/${encodeURIComponent(symbol)}?apikey=${key}`, {
        cache: "no-store",
      }),
      fetch(`${BASE}/quote/${encodeURIComponent(symbol)}?apikey=${key}`, {
        cache: "no-store",
      }),
    ]);

    const ratios: Record<string, unknown> = (await safeJson(ratiosRes))?.[0] ?? {};
    const quote: Record<string, unknown> = (await safeJson(quoteRes))?.[0] ?? {};

    return {
      peRatio: num(ratios.peRatioTTM) ?? num(quote.pe),
      forwardPe: null, // FMP free não expõe forward PE de forma estável
      grossMargin: num(ratios.grossProfitMarginTTM),
      netMargin: num(ratios.netProfitMarginTTM),
      debtToEquity: num(ratios.debtEquityRatioTTM),
    };
  } catch {
    return null;
  }
}

async function safeJson(
  res: Response
): Promise<Record<string, unknown>[] | null> {
  if (!res.ok) return null;
  try {
    const j = await res.json();
    return Array.isArray(j) ? (j as Record<string, unknown>[]) : null;
  } catch {
    return null;
  }
}
