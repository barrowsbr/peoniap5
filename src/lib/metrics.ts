/** Métricas derivadas calculadas no momento da ingestão. */

/** (close - ath) / ath. Retorna <= 0; 0 = exatamente no topo histórico. */
export function pctFromAth(close: number, ath: number): number | null {
  if (!isFinite(close) || !isFinite(ath) || ath <= 0) return null;
  return (close - ath) / ath;
}

/** (close - low) / low. Retorna >= 0; 0 = exatamente na mínima. */
export function pctFromLow(close: number, low: number): number | null {
  if (!isFinite(close) || !isFinite(low) || low <= 0) return null;
  return (close - low) / low;
}

/**
 * RSI de Wilder (período padrão 14) sobre uma série de fechamentos.
 * Retorna o último valor (0–100) ou null se não houver dados suficientes.
 */
export function rsi(closes: number[], period = 14): number | null {
  if (closes.length < period + 1) return null;

  let gain = 0;
  let loss = 0;
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gain += diff;
    else loss -= diff;
  }
  let avgGain = gain / period;
  let avgLoss = loss / period;

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const g = diff >= 0 ? diff : 0;
    const l = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (period - 1) + g) / period;
    avgLoss = (avgLoss * (period - 1) + l) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

/** Menor valor de uma janela (ex.: mínima de 52 semanas ≈ 252 pregões). */
export function minOf(values: number[]): number | null {
  const finite = values.filter((v) => isFinite(v));
  return finite.length ? Math.min(...finite) : null;
}

/** Maior valor de uma janela (ex.: ATH). */
export function maxOf(values: number[]): number | null {
  const finite = values.filter((v) => isFinite(v));
  return finite.length ? Math.max(...finite) : null;
}
