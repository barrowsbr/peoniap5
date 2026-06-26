"use client";

import { useEffect, useRef } from "react";
import { createChart, ColorType, type IChartApi } from "lightweight-charts";

/**
 * Sparkline de preço (1 ano) com lightweight-charts. Sem eixos, sem interação —
 * leitura visual instantânea por linha. Verde se a série sobe no período, senão
 * vermelho.
 */
export function Sparkline({
  data,
  width = 120,
  height = 34,
}: {
  data: number[];
  width?: number;
  height?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || data.length < 2) return;

    const up = data[data.length - 1] >= data[0];
    const line = up ? "#4ade80" : "#f87171";
    const top = up ? "rgba(74,222,128,0.25)" : "rgba(248,113,113,0.25)";

    const chart: IChartApi = createChart(ref.current, {
      width,
      height,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "transparent",
        attributionLogo: false,
      },
      grid: { vertLines: { visible: false }, horzLines: { visible: false } },
      rightPriceScale: { visible: false },
      leftPriceScale: { visible: false },
      timeScale: { visible: false, borderVisible: false },
      crosshair: { horzLine: { visible: false }, vertLine: { visible: false } },
      handleScroll: false,
      handleScale: false,
    });

    const series = chart.addAreaSeries({
      lineColor: line,
      topColor: top,
      bottomColor: "rgba(0,0,0,0)",
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });

    series.setData(
      data.map((value, i) => ({ time: (i + 1) as never, value }))
    );
    chart.timeScale().fitContent();

    return () => chart.remove();
  }, [data, width, height]);

  if (data.length < 2) {
    return <div style={{ width, height }} className="opacity-30">—</div>;
  }
  return <div ref={ref} style={{ width, height }} />;
}
