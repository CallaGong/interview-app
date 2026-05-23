"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartPayload } from "@/lib/case/live/parse-chart";

const ANALYSIS_SECONDS = 60;
const PIE_COLORS = ["#8b5cf6", "#06b6d4", "#f59e0b", "#10b981", "#f43f5e"];

export interface DataInjectionCardProps {
  chart: ChartPayload;
  locale: "en" | "zh";
  onAnalysisComplete?: () => void;
  onMount?: () => void;
}

function chartKeys(data: Array<Record<string, unknown>>) {
  const keys = Object.keys(data[0] ?? {});
  const xKey =
    keys.find((k) => k === "year" || k === "name" || k === "category") ??
    keys.find((k) => typeof data[0]?.[k] === "string") ??
    keys[0] ??
    "x";
  const yKey =
    keys.find((k) => typeof data[0]?.[k] === "number" && k !== xKey) ??
    keys.find((k) => k !== xKey) ??
    "value";
  return { xKey, yKey };
}

function LiveChart({ chart }: { chart: ChartPayload }) {
  const { xKey, yKey } = useMemo(() => chartKeys(chart.data), [chart.data]);

  if (chart.chartType === "pie") {
    const nameKey = chart.data[0]?.name != null ? "name" : xKey;
    const valueKey = chart.data[0]?.value != null ? "value" : yKey;
    return (
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chart.data}
            dataKey={valueKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {chart.data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#1e293b",
              border: "1px solid #475569",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  const ChartComponent = chart.chartType === "bar" ? BarChart : LineChart;
  const Series = chart.chartType === "bar" ? Bar : Line;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <ChartComponent data={chart.data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey={xKey} tick={{ fill: "#94a3b8", fontSize: 11 }} />
        <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
        <Tooltip
          contentStyle={{
            background: "#1e293b",
            border: "1px solid #475569",
          }}
        />
        <Series
          type="monotone"
          dataKey={yKey}
          stroke="#a78bfa"
          fill="#8b5cf6"
          strokeWidth={2}
        />
      </ChartComponent>
    </ResponsiveContainer>
  );
}

export default function DataInjectionCard({
  chart,
  locale,
  onAnalysisComplete,
  onMount,
}: DataInjectionCardProps) {
  const [secondsLeft, setSecondsLeft] = useState(ANALYSIS_SECONDS);
  const expired = secondsLeft <= 0;

  useEffect(() => {
    onMount?.();
  }, [onMount]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onAnalysisComplete?.();
      return;
    }
    const t = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [secondsLeft, onAnalysisComplete]);

  const hint =
    locale === "zh"
      ? "请用 60 秒分析以下数据"
      : "Take 60 seconds to analyze this data";

  return (
    <div
      className={`my-3 rounded-xl border-2 p-4 transition ${
        expired
          ? "border-slate-600/60 bg-slate-800/30 opacity-75 grayscale"
          : "border-violet-400 bg-violet-500/10 shadow-lg shadow-violet-500/10"
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="rounded-md bg-violet-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
          Data
        </span>
        <span
          className={`font-mono text-sm font-semibold tabular-nums ${
            expired ? "text-slate-500" : "text-violet-200"
          }`}
        >
          {expired ? "0:00" : `${Math.floor(secondsLeft / 60)}:${(secondsLeft % 60).toString().padStart(2, "0")}`}
        </span>
      </div>

      <h4 className="mb-1 text-base font-semibold text-white">{chart.title}</h4>
      <p className={`mb-3 text-sm ${expired ? "text-slate-500" : "text-violet-200/90"}`}>
        {hint}
      </p>

      <div className="rounded-lg bg-slate-900/50 p-2">
        <LiveChart chart={chart} />
      </div>
    </div>
  );
}
