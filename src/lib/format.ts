/** Helpers de formatação para o painel. */

const DASH = "—";

export function fmtPct(v: number | null | undefined, digits = 1): string {
  if (v == null || !isFinite(v)) return DASH;
  return `${(v * 100).toFixed(digits)}%`;
}

export function fmtSignedPct(v: number | null | undefined, digits = 1): string {
  if (v == null || !isFinite(v)) return DASH;
  const s = (v * 100).toFixed(digits);
  return v > 0 ? `+${s}%` : `${s}%`;
}

export function fmtNum(v: number | null | undefined, digits = 2): string {
  if (v == null || !isFinite(v)) return DASH;
  return v.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function fmtMoney(v: number | null | undefined, currency = "USD"): string {
  if (v == null || !isFinite(v)) return DASH;
  try {
    return v.toLocaleString("en-US", { style: "currency", currency });
  } catch {
    return fmtNum(v);
  }
}

/**
 * Cor de heatmap para "distância do ATH" (pctFromAth, <= 0).
 *  0      -> verde  (no topo)
 *  -0.5+  -> vermelho (longe do topo)
 * Retorna { bg, fg } em CSS.
 */
export function athHeat(pct: number | null | undefined): {
  bg: string;
  fg: string;
} {
  if (pct == null || !isFinite(pct)) return { bg: "transparent", fg: "#9aa4b2" };
  const d = Math.min(0.5, Math.max(0, -pct)) / 0.5; // 0 (topo) .. 1 (longe)
  const hue = 140 - d * 140; // 140 verde -> 0 vermelho
  const bg = `hsl(${hue.toFixed(0)} 70% 42% / 0.22)`;
  const fg = `hsl(${hue.toFixed(0)} 80% 72%)`;
  return { bg, fg };
}
