import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Cliente Postgres singleton. Quando DATABASE_URL não está setado, `db` é null e
 * a app cai no modo MOCK (ver src/db/mock.ts). Assim o painel roda e builda sem
 * banco — você liga o Postgres quando quiser dados reais.
 */

const url = process.env.DATABASE_URL;

export const hasDb = Boolean(url);

// Reaproveita a conexão entre hot-reloads do Next em dev.
const globalForDb = globalThis as unknown as {
  __vwraSql?: ReturnType<typeof postgres>;
};

function makeDb(): PostgresJsDatabase<typeof schema> | null {
  if (!url) return null;
  const sql =
    globalForDb.__vwraSql ??
    postgres(url, { max: 5, prepare: false, idle_timeout: 20 });
  if (process.env.NODE_ENV !== "production") globalForDb.__vwraSql = sql;
  return drizzle(sql, { schema });
}

export const db = makeDb();
export { schema };
