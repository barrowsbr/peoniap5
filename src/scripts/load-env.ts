/**
 * Carrega .env para process.env (sem dependência externa). Importado no topo dos
 * scripts (seed / ingest-local) para rodarem fora do Next.
 */
import { readFileSync } from "node:fs";

try {
  const txt = readFileSync(".env", "utf8");
  for (const line of txt.split("\n")) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let v = m[2].trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!(m[1] in process.env)) process.env[m[1]] = v;
  }
} catch {
  // sem .env: usa o que já estiver no ambiente
}
