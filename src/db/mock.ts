import { HOLDINGS } from "@/config/holdings";
import type { RadarRow } from "@/lib/types";
import { pctFromAth, pctFromLow, rsi } from "@/lib/metrics";

/**
 * Dados de exemplo determinísticos (mesma semente -> mesmo resultado), gerados a
 * partir dos holdings. Servem para o painel renderizar e ser desenvolvido SEM
 * banco nem API key. Não são dados reais.
 */

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildSpark(r: () => number, end: number, n: number): number[] {
  // random walk que termina perto de `end`
  const out: number[] = [];
  let v = end * (0.8 + r() * 0.4);
  for (let i = 0; i < n; i++) {
    v *= 1 + (r() - 0.5) * 0.03;
    out.push(v);
  }
  // reescala para o último ponto bater com `end`
  const k = end / out[out.length - 1];
  return out.map((x) => +(x * k).toFixed(2));
}

export function mockRows(): RadarRow[] {
  const today = new Date().toISOString().slice(0, 10);

  return HOLDINGS.map((h) => {
    const r = mulberry32(hashStr(h.symbol));
    const ath = +(40 + r() * 920).toFixed(2);
    const drop = Math.pow(r(), 1.5) * 0.6; // 0 .. 0.6 abaixo do ATH
    const close = +(ath * (1 - drop)).toFixed(2);
    const atl52w = +(close * (0.62 + r() * 0.25)).toFixed(2);
    const spark = buildSpark(r, close, 180);

    return {
      symbol: h.symbol,
      name: h.name,
      sector: h.sector,
      country: h.country,
      currency: h.currency,
      weightVwra: h.weight,
      date: today,
      close,
      ath,
      atl52w,
      fxToUsd: 1, // mock já está "em USD"
      pctFromAth: pctFromAth(close, ath),
      pctFromLow: pctFromLow(close, atl52w),
      peRatio: +(8 + r() * 45).toFixed(1),
      forwardPe: +(7 + r() * 38).toFixed(1),
      grossMargin: +(0.2 + r() * 0.6).toFixed(3),
      netMargin: +(0.03 + r() * 0.35).toFixed(3),
      debtToEquity: +(r() * 2.2).toFixed(2),
      rsi14: rsi(spark) ?? +(30 + r() * 45).toFixed(1),
      spark,
    } satisfies RadarRow;
  });
}
