import { getRadarData } from "@/lib/data";
import { RadarTable } from "@/components/RadarTable";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { rows, mode, asOf } = await getRadarData();

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            VWRA <span className="text-emerald-400">Radar</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            As ~50 maiores do VWRA — distância do ATH/mínimas + fundamentos.
            Leitura pura, fim de dia.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          {mode === "mock" ? (
            <span className="rounded-full border border-amber-700/60 bg-amber-900/20 px-3 py-1 text-amber-300">
              modo mock · dados de exemplo
            </span>
          ) : (
            <span className="rounded-full border border-emerald-700/60 bg-emerald-900/20 px-3 py-1 text-emerald-300">
              dados ao vivo
            </span>
          )}
          <span className="text-slate-500">
            {asOf ? `EOD ${asOf}` : "sem snapshot"}
          </span>
        </div>
      </header>

      <RadarTable rows={rows} />

      <footer className="mt-8 text-xs text-slate-600">
        Preço/ATH via Yahoo Finance · fundamentos via FMP · snapshots EOD em
        Postgres. Preços internacionais exibidos na moeda nativa (normalização
        cambial: TODO).
      </footer>
    </main>
  );
}
