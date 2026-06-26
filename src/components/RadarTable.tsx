"use client";

import { useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type FilterFn,
} from "@tanstack/react-table";
import type { RadarRow } from "@/lib/types";
import { Sparkline } from "@/components/Sparkline";
import { TickerDetail } from "@/components/TickerDetail";
import { athHeat, fmtMoney, fmtNum, fmtPct, fmtSignedPct } from "@/lib/format";

const col = createColumnHelper<RadarRow>();

const symbolNameFilter: FilterFn<RadarRow> = (row, _id, value) => {
  const q = String(value).toLowerCase();
  return (
    row.original.symbol.toLowerCase().includes(q) ||
    row.original.name.toLowerCase().includes(q)
  );
};

const numHeader = (label: string, hint?: string) => (
  <div className="text-right" title={hint}>
    {label}
  </div>
);

export function RadarTable({ rows }: { rows: RadarRow[] }) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "weightVwra", desc: true },
  ]);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<RadarRow | null>(null);

  const columns = useMemo(
    () => [
      col.accessor("symbol", {
        header: () => "Empresa",
        cell: (c) => (
          <div className="min-w-[150px]">
            <div className="font-semibold text-slate-100">{c.getValue()}</div>
            <div className="text-xs text-slate-400 truncate max-w-[180px]">
              {c.row.original.name}
              {c.row.original.country ? ` · ${c.row.original.country}` : ""}
            </div>
          </div>
        ),
      }),
      col.accessor("weightVwra", {
        header: () => numHeader("Peso", "Peso % no VWRA"),
        cell: (c) => (
          <div className="text-right tabular-nums text-slate-300">
            {c.getValue() == null ? "—" : `${c.getValue()!.toFixed(2)}%`}
          </div>
        ),
      }),
      col.accessor("close", {
        header: () => numHeader("Preço (USD)"),
        cell: (c) => (
          <div className="text-right tabular-nums text-slate-200">
            {fmtMoney(c.getValue(), "USD")}
            {c.row.original.currency && c.row.original.currency !== "USD" ? (
              <span className="ml-1 text-[10px] text-slate-500">
                {c.row.original.currency}
              </span>
            ) : null}
          </div>
        ),
      }),
      col.accessor("pctFromAth", {
        header: () => numHeader("% do ATH", "Distância do topo histórico"),
        sortingFn: "basic",
        cell: (c) => {
          const v = c.getValue();
          const { bg, fg } = athHeat(v);
          return (
            <div
              className="text-right tabular-nums font-medium rounded px-2 py-0.5"
              style={{ background: bg, color: fg }}
            >
              {fmtSignedPct(v)}
            </div>
          );
        },
      }),
      col.accessor("pctFromLow", {
        header: () => numHeader("↑ mín 52s", "Acima da mínima de 52 semanas"),
        cell: (c) => (
          <div className="text-right tabular-nums text-emerald-300/80">
            {fmtSignedPct(c.getValue())}
          </div>
        ),
      }),
      col.accessor("peRatio", {
        header: () => numHeader("P/E"),
        cell: (c) => (
          <div className="text-right tabular-nums text-slate-300">
            {fmtNum(c.getValue(), 1)}
          </div>
        ),
      }),
      col.accessor("netMargin", {
        header: () => numHeader("Margem líq."),
        cell: (c) => (
          <div className="text-right tabular-nums text-slate-300">
            {fmtPct(c.getValue())}
          </div>
        ),
      }),
      col.accessor("debtToEquity", {
        header: () => numHeader("Dív/Patr."),
        cell: (c) => (
          <div className="text-right tabular-nums text-slate-300">
            {fmtNum(c.getValue(), 2)}
          </div>
        ),
      }),
      col.accessor("rsi14", {
        header: () => numHeader("RSI"),
        cell: (c) => {
          const v = c.getValue();
          const color =
            v == null
              ? "text-slate-500"
              : v >= 70
              ? "text-red-400"
              : v <= 30
              ? "text-emerald-400"
              : "text-slate-300";
          return (
            <div className={`text-right tabular-nums ${color}`}>
              {fmtNum(v, 0)}
            </div>
          );
        },
      }),
      col.display({
        id: "spark",
        header: () => <div className="text-right">1 ano</div>,
        cell: (c) => (
          <div className="flex justify-end">
            <Sparkline data={c.row.original.spark} />
          </div>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, globalFilter: filter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setFilter,
    globalFilterFn: symbolNameFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const presetNearAth = () => setSorting([{ id: "pctFromAth", desc: true }]);
  const presetValue = () => setSorting([{ id: "pctFromAth", desc: false }]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filtrar por ticker ou nome…"
          className="bg-ink-800 border border-ink-600 rounded-md px-3 py-1.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-slate-400 w-64"
        />
        <div className="flex gap-2 ml-auto">
          <button
            onClick={presetNearAth}
            className="text-xs px-3 py-1.5 rounded-md border border-emerald-700/60 bg-emerald-900/20 text-emerald-300 hover:bg-emerald-900/40 transition"
          >
            Perto do ATH ↑
          </button>
          <button
            onClick={presetValue}
            className="text-xs px-3 py-1.5 rounded-md border border-rose-700/60 bg-rose-900/20 text-rose-300 hover:bg-rose-900/40 transition"
          >
            Longe do ATH / value ↓
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-ink-700">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-ink-800/80 sticky top-0 z-10">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    onClick={h.column.getToggleSortingHandler()}
                    className="px-3 py-2.5 text-left text-xs font-medium text-slate-400 uppercase tracking-wide cursor-pointer select-none whitespace-nowrap hover:text-slate-200"
                  >
                    <span className="inline-flex items-center gap-1">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {{ asc: "▲", desc: "▼" }[h.column.getIsSorted() as string] ?? ""}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => setSelected(row.original)}
                className="border-t border-ink-700/60 hover:bg-ink-800/40 transition-colors cursor-pointer"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2 align-middle whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-slate-500">
        {table.getRowModel().rows.length} de {rows.length} empresas · clique numa
        linha para o detalhe
      </div>

      {selected ? (
        <TickerDetail row={selected} onClose={() => setSelected(null)} />
      ) : null}
    </div>
  );
}
