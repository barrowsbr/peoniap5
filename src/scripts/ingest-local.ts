import "./load-env";
import { runIngestion } from "@/lib/ingest";

/** Roda a ingestão EOD localmente (mesma lógica do endpoint /api/cron/ingest). */
async function main() {
  const r = await runIngestion();
  console.log(JSON.stringify(r, null, 2));
  process.exit(r.ok ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
