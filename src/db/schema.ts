import {
  pgTable,
  serial,
  integer,
  text,
  date,
  real,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

/** Universo: as ~50 maiores do VWRA. Atualizado ~1x/mês (holdings da Vanguard). */
export const tickers = pgTable(
  "tickers",
  {
    id: serial("id").primaryKey(),
    symbol: text("symbol").notNull(),
    fmpSymbol: text("fmp_symbol"),
    name: text("name").notNull(),
    weightVwra: real("weight_vwra"),
    sector: text("sector"),
    country: text("country"),
    currency: text("currency"),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    symbolIdx: uniqueIndex("tickers_symbol_idx").on(t.symbol),
  })
);

/** Snapshot diário (EOD) por ticker. Métricas derivadas calculadas na ingestão. */
export const dailySnapshots = pgTable(
  "daily_snapshots",
  {
    id: serial("id").primaryKey(),
    tickerId: integer("ticker_id")
      .notNull()
      .references(() => tickers.id, { onDelete: "cascade" }),
    date: date("date").notNull(),

    close: real("close"),
    ath: real("ath"),
    atl52w: real("atl_52w"),

    // Derivados (gravados na ingestão para ordenar/indexar barato):
    pctFromAth: real("pct_from_ath"), // (close-ath)/ath  -> <= 0
    pctFromLow: real("pct_from_low"), // (close-low)/low  -> >= 0

    // Fundamentos (FMP):
    peRatio: real("pe_ratio"),
    forwardPe: real("forward_pe"),
    grossMargin: real("gross_margin"),
    netMargin: real("net_margin"),
    debtToEquity: real("debt_to_equity"),

    // Sinal técnico leve (opcional):
    rsi14: real("rsi_14"),

    // Série recente de fechamentos p/ sparkline (JSON serializado).
    spark: text("spark"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    tickerDateIdx: uniqueIndex("snap_ticker_date_idx").on(t.tickerId, t.date),
    dateIdx: index("snap_date_idx").on(t.date),
    pctAthIdx: index("snap_pct_ath_idx").on(t.pctFromAth),
  })
);

export type TickerRow = typeof tickers.$inferSelect;
export type SnapshotRow = typeof dailySnapshots.$inferSelect;
export type NewSnapshot = typeof dailySnapshots.$inferInsert;
