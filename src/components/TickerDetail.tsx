"use client";

import { useEffect, useMemo, useState } from "react";
import type { RadarRow } from "@/lib/types";
import { CandleChart, type Candle } from "@/components/CandleChart";
import { Sparkline } from "@/components/Sparkline";
import {
  athHeat,
  fmtMoney,
  fmtNum,
  fmtPct,
  fmtSignedPct,
} from "@/lib/format";

type HistoryPoint = {
  date: string;
  close: number | null;
  pctFromAth: number | null;
  peRatio: number | null;
  netMargin: number | null;
  debtToEquity: number | null;
  rsi14: number | null;
};

/** OHLC sintético a partir da série de fechamentos (fallback offline). */
function synthCandles(spark: number[]): Candle[] {
  if (spark.length < 2) return [];
  const dayMs = 86400;
  const startT = Math.floor(Date.now() / 1000) - spark.length * dayMs;
  return spark.map((close, i) => {
    const open = i === 0 ? close : spark[i - 1];
    const hi = Math.max(open, close) * 1.004;
    const lo = Math.min(open, close) * 0.996;
    return { time: startT + i * dayMs, open, high: hi, low: lo, close };
  });
}

export function TickerDetail({
  row,
  onClose,
}: {
  row: RadarRow;
  onClose: () => void;
}) {
  const [candles, setCandles] = useState<Candle[] | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    let alive = true;
    const sym = encodeURIComponent(row.symbol);
    const rate = row.fxToUsd ?? 1;

    fetch(`/api/ticker/${sym}/candles`)
      .then((r) => r.json())
      .then((d: { candles: Candle[] }) => {
        if (!alive) return;
        if (d.candles?.length >= 2) {
          // API vem em moeda nativa -> converte para USD
          setCandles(
            d.candles.map((c) => ({
              time: c.time,
              open: c.open * rate,
              high: c.high * rate,
              low: c.low * rate,
              close: c.close * rate,
            }))
          );
        } else {
          setCandles(synthCandles(row.spark)); // spark já está em USD
        }
      })
      .catch(() => alive && setCandles(synthCandles(row.spark)));

    fetch(`/api/ticker/${sym}/history`)
      .then((r) => r.json())
      .then((d: { history: HistoryPoint[] }) => alive && setHistory(d.history ?? []))
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, [row]);

  const heat = athHeat(row.pctFromAth);

  const peSeries = useMemo(
    () => history.map((h) => h.peRatio).filter((v): v is number => v != null),
    [history]
  );
  const marginSeries = useMemo(
    () => history.map((h) => h.netMargin).filter((v): v is number => v != null),
    [history]
  );
  const debtSeries = useMemo(
    () => history.map((h) => h.debtToEquity).filter((v): v is number => v != null),
    [history]
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="my-8 w-full max-w-4xl rounded-xl border border-ink-600 bg-ink-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-start justify-between gap-4 border-b border-ink-700 p-5">
          <div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-xl font-bold text-slate-100">{row.symbol}</h2>
              <span className="text-sm text-slate-400">{row.name}</span>
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {row.sector ?? "—"}
              {row.country ? ` · ${row.country}` : ""}
              {row.currency ? ` · ${row.currency}` : ""}
              {row.weightVwra != null ? ` · peso ${row.weightVwra.toFixed(2)}%` : ""}
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold tabular-nums text-slate-100">
              {fmtMoney(row.close, "USD")}
            </div>
            <div
              className="mt-1 inline-block rounded px-2 py-0.5 text-sm font-medium tabular-nums"
              style={{ background: heat.bg, color: heat.fg }}
            >
              {fmtSignedPct(row.pctFromAth)} do ATH
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-2 rounded-md border border-ink-600 px-2 py-1 text-xs text-slate-400 hover:text-slate-100"
          >
            Esc ✕
          </button>
        </div>

        {/* candle */}
        <div className="p-5">
          <div className="mb-2 text-xs uppercase tracking-wide text-slate-500">
            Preço · 1 ano (USD)
          </div>
          {candles == null ? (
            <div className="flex h-[320px] items-center justify-center text-sm text-slate-500">
              carregando…
            </div>
          ) : (
            <CandleChart candles={candles} />
          )}
        </div>

        {/* stat cards */}
        <div className="grid grid-cols-2 gap-3 px-5 pb-2 sm:grid-cols-4">
          <Stat label="P/E" value={fmtNum(row.peRatio, 1)} />
          <Stat label="Fwd P/E" value={fmtNum(row.forwardPe, 1)} />
          <Stat label="Margem bruta" value={fmtPct(row.grossMargin)} />
          <Stat label="Margem líq." value={fmtPct(row.netMargin)} />
          <Stat label="Dív/Patr." value={fmtNum(row.debtToEquity, 2)} />
          <Stat label="RSI 14" value={fmtNum(row.rsi14, 0)} />
          <Stat label="ATH (USD)" value={fmtMoney(row.ath, "USD")} />
          <Stat label="↑ mín 52s" value={fmtSignedPct(row.pctFromLow)} />
        </div>

        {/* fundamentals history */}
        <div className="border-t border-ink-700 p-5">
          <div className="mb-3 text-xs uppercase tracking-wide text-slate-500">
            Histórico de fundamentos
            {history.length < 2 ? " (acumula a cada ingestão diária)" : ""}
          </div>
          {history.length < 2 ? (
            <p className="text-sm text-slate-500">
              Ainda não há histórico suficiente — cada rodada de ingestão adiciona
              um ponto. Volte depois de alguns dias de coleta.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <MiniHistory label="P/E" series={peSeries} />
              <MiniHistory
                label="Margem líq."
                series={marginSeries.map((v) => v * 100)}
              />
              <MiniHistory label="Dív/Patr." series={debtSeries} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-ink-700 bg-ink-800/40 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-0.5 tabular-nums text-slate-200">{value}</div>
    </div>
  );
}

function MiniHistory({ label, series }: { label: string; series: number[] }) {
  const last = series.length ? series[series.length - 1] : null;
  return (
    <div className="rounded-lg border border-ink-700 bg-ink-800/40 p-3">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wide text-slate-500">
          {label}
        </span>
        <span className="tabular-nums text-xs text-slate-300">
          {last == null ? "—" : last.toFixed(1)}
        </span>
      </div>
      <Sparkline data={series} width={180} height={40} />
    </div>
  );
}
