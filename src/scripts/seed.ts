import "./load-env";
import { db } from "@/db";
import { tickers } from "@/db/schema";
import { HOLDINGS } from "@/config/holdings";

/** Semeia/atualiza a tabela `tickers` a partir do config de holdings do VWRA. */
async function main() {
  if (!db) {
    console.log("DATABASE_URL ausente — nada a semear. Configure .env primeiro.");
    process.exit(0);
  }

  let n = 0;
  for (const h of HOLDINGS) {
    await db
      .insert(tickers)
      .values({
        symbol: h.symbol,
        fmpSymbol: h.fmpSymbol ?? null,
        name: h.name,
        weightVwra: h.weight,
        sector: h.sector,
        country: h.country,
        currency: h.currency,
      })
      .onConflictDoUpdate({
        target: tickers.symbol,
        set: {
          fmpSymbol: h.fmpSymbol ?? null,
          name: h.name,
          weightVwra: h.weight,
          sector: h.sector,
          country: h.country,
          currency: h.currency,
          updatedAt: new Date(),
        },
      });
    n++;
  }

  console.log(`✓ ${n} tickers semeados/atualizados.`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
