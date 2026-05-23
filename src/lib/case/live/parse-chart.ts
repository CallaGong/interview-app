export type ChartType = "line" | "bar" | "pie";

export interface ChartPayload {
  chartType: ChartType;
  title: string;
  data: Array<Record<string, unknown>>;
  insight_hidden?: string;
}

const CHART_PREFIX = "[CHART:";

export function parseChartMarker(raw: string): ChartPayload | null {
  try {
    const parsed = JSON.parse(raw) as ChartPayload;
    if (!parsed.title || !Array.isArray(parsed.data)) return null;
    const chartType = (parsed.chartType ?? "line") as ChartType;
    if (!["line", "bar", "pie"].includes(chartType)) return null;
    return { ...parsed, chartType };
  } catch {
    return null;
  }
}

function extractChartMarkers(content: string): Array<{
  full: string;
  json: string;
  start: number;
  end: number;
}> {
  const results: Array<{ full: string; json: string; start: number; end: number }> = [];
  let searchFrom = 0;

  while (searchFrom < content.length) {
    const start = content.indexOf(CHART_PREFIX, searchFrom);
    if (start === -1) break;

    const jsonStart = start + CHART_PREFIX.length;
    if (content[jsonStart] !== "{") {
      searchFrom = start + 1;
      continue;
    }

    let depth = 0;
    let jsonEnd = -1;
    for (let i = jsonStart; i < content.length; i++) {
      const ch = content[i];
      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) {
          jsonEnd = i;
          break;
        }
      }
    }

    if (jsonEnd === -1) break;
    const closeBracket = content.indexOf("]", jsonEnd);
    if (closeBracket === -1) break;

    results.push({
      full: content.slice(start, closeBracket + 1),
      json: content.slice(jsonStart, jsonEnd + 1),
      start,
      end: closeBracket + 1,
    });
    searchFrom = closeBracket + 1;
  }

  return results;
}

export function parseChartsFromContent(content: string): {
  text: string;
  charts: ChartPayload[];
} {
  const charts: ChartPayload[] = [];
  const markers = extractChartMarkers(content);
  let text = content;

  for (let i = markers.length - 1; i >= 0; i--) {
    const m = markers[i]!;
    const chart = parseChartMarker(m.json);
    if (chart) charts.unshift(chart);
    text = text.slice(0, m.start) + text.slice(m.end);
  }

  return { text: text.replace(/\n{3,}/g, "\n\n").trim(), charts };
}

export function stripChartMarkers(text: string): string {
  const markers = extractChartMarkers(text);
  let out = text;
  for (let i = markers.length - 1; i >= 0; i--) {
    const m = markers[i]!;
    out = out.slice(0, m.start) + out.slice(m.end);
  }
  return out.replace(/\n{3,}/g, "\n\n").trim();
}
