import yahooFinance from "yahoo-finance2";

/**
 * Taxas de câmbio para USD via Yahoo (par `<CUR>USD=X` = USD por 1 unidade da
 * moeda). Usado para normalizar preços internacionais a USD (moeda do VWRA).
 *
 * Observação: usamos a taxa ATUAL para todos os pontos históricos (sparkline/ATH).
 * Como a "distância do ATH" é uma razão na mesma moeda, ela não muda; a aproximação
 * afeta só o valor absoluto em USD do ATH/série — aceitável para leitura.
 */
export async function fetchFxRates(
  currencies: (string | null | undefined)[]
): Promise<Record<string, number>> {
  const map: Record<string, number> = { USD: 1 };
  const need = Array.from(
    new Set(
      currencies
        .map((c) => (c ?? "USD").toUpperCase())
        .filter((c) => c && c !== "USD")
    )
  );

  await Promise.all(
    need.map(async (c) => {
      try {
        const q = await yahooFinance.quote(`${c}USD=X`);
        const r = q?.regularMarketPrice;
        map[c] = typeof r === "number" && isFinite(r) && r > 0 ? r : 1;
      } catch {
        map[c] = 1;
      }
    })
  );

  return map;
}

export function rateFor(
  fx: Record<string, number>,
  currency: string | null | undefined
): number {
  return fx[(currency ?? "USD").toUpperCase()] ?? 1;
}
