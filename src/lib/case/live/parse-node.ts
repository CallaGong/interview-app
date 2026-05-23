const NODE_MARKER_RE = /\[NODE:([a-zA-Z0-9_-]+)\]\s*$/;

export function parseNodeMarker(text: string): {
  displayContent: string;
  nextNodeId: string | null;
} {
  const match = text.match(NODE_MARKER_RE);
  if (!match) {
    return { displayContent: text.trimEnd(), nextNodeId: null };
  }
  const displayContent = text.replace(NODE_MARKER_RE, "").trimEnd();
  return { displayContent, nextNodeId: match[1] };
}

import { stripChartMarkers } from "@/lib/case/live/parse-chart";

export function stripNodeMarkersFromStream(text: string): string {
  return stripChartMarkers(text.replace(/\[NODE:[a-zA-Z0-9_-]+\]/g, "")).trimEnd();
}
