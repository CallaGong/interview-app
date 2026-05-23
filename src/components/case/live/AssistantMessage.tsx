"use client";

import ReactMarkdown from "react-markdown";
import DataInjectionCard from "@/components/case/live/DataInjectionCard";
import { parseChartsFromContent } from "@/lib/case/live/parse-chart";

export interface AssistantMessageProps {
  content: string;
  locale: "en" | "zh";
  onChartMount?: () => void;
}

export default function AssistantMessage({
  content,
  locale,
  onChartMount,
}: AssistantMessageProps) {
  const { text, charts } = parseChartsFromContent(content);

  return (
    <div>
      {text && (
        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown>{text}</ReactMarkdown>
        </div>
      )}
      {charts.map((chart, i) => (
        <DataInjectionCard
          key={`${chart.title}-${i}`}
          chart={chart}
          locale={locale}
          onMount={i === 0 ? onChartMount : undefined}
        />
      ))}
    </div>
  );
}
