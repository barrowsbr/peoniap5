import { NextResponse } from "next/server";
import { runIngestion } from "@/lib/ingest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300; // job pode demorar; processa em lotes

/**
 * Endpoint de ingestão EOD. Acionado pelo Vercel Cron 1x/dia (~22h UTC, após o
 * fechamento de NY). Protegido por CRON_SECRET:
 *   Authorization: Bearer <CRON_SECRET>
 */
async function handle(req: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const result = await runIngestion();
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}

export const GET = handle;
export const POST = handle;
