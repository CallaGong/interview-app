"use client";

import { useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  ReactFlowProvider,
  type Edge,
  type Node,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  getCriticalNodeIds,
  getBranchingTree,
  getNodeLabel,
  type BranchingTree,
} from "@/lib/case/branching/case-trees";

export interface CaseMapProps {
  caseSlug: string;
  visitedNodeIds: string[];
  currentNodeId?: string | null;
  nodeTurnCounts?: Record<string, number>;
  locale: "en" | "zh";
  variant?: "sidebar" | "summary";
  className?: string;
}

function layoutNodes(
  tree: BranchingTree,
  visibleIds: Set<string>,
  variant: "sidebar" | "summary"
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const gap = variant === "summary" ? 88 : 72;
  const xSpread = variant === "summary" ? 220 : 160;

  tree.criticalPaths.forEach((path, pathIdx) => {
    path.forEach((id, i) => {
      if (!visibleIds.has(id)) return;
      if (!positions.has(id)) {
        positions.set(id, {
          x: 40 + pathIdx * xSpread,
          y: i * gap,
        });
      }
    });
  });

  let side = 0;
  for (const id of visibleIds) {
    if (positions.has(id)) continue;
    side += 1;
    positions.set(id, { x: xSpread * 2, y: side * (gap - 8) });
  }
  return positions;
}

function CaseMapFlow({
  caseSlug,
  visitedNodeIds,
  currentNodeId = null,
  nodeTurnCounts = {},
  locale,
  variant = "sidebar",
  className = "",
}: CaseMapProps) {
  const tree = getBranchingTree(caseSlug);
  const [tooltip, setTooltip] = useState<string | null>(null);

  const { nodes, edges, coveragePct } = useMemo(() => {
    if (!tree) {
      return { nodes: [] as Node[], edges: [] as Edge[], coveragePct: 0 };
    }

    const critical = getCriticalNodeIds(tree);
    const visitedSet = new Set(visitedNodeIds);
    const visibleIds = new Set<string>();

    if (variant === "summary") {
      for (const id of critical) visibleIds.add(id);
      for (const id of visitedNodeIds) visibleIds.add(id);
    } else {
      for (const id of critical) {
        if (visitedSet.has(id) || id === currentNodeId) visibleIds.add(id);
      }
      for (const id of visitedNodeIds) visibleIds.add(id);
      if (currentNodeId) visibleIds.add(currentNodeId);
    }

    const positions = layoutNodes(tree, visibleIds, variant);
    const flowNodes: Node[] = [];

    for (const id of visibleIds) {
      const pos = positions.get(id) ?? { x: 0, y: 0 };
      const isVisited = visitedSet.has(id);
      const isCurrent = id === currentNodeId;
      const isCriticalUnvisited =
        critical.has(id) && !isVisited && !isCurrent;

      const onPath = tree.criticalPaths.some(
        (path) => path.includes(id) && path.some((p) => visitedSet.has(p))
      );

      flowNodes.push({
        id,
        position: pos,
        data: {
          label: getNodeLabel(id),
          turns: nodeTurnCounts[id] ?? 0,
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
        className: [
          "rounded-lg border px-2 py-1.5 text-[10px] font-medium",
          isCurrent
            ? "!border-amber-400 !bg-amber-500/20 !text-amber-100 animate-pulse"
            : isVisited
              ? onPath || variant === "summary"
                ? "!border-sky-400 !bg-sky-500/20 !text-sky-100"
                : "!border-emerald-400/80 !bg-emerald-500/15 !text-emerald-100"
              : isCriticalUnvisited
                ? "!border-dashed !border-slate-500 !bg-slate-800/40 !text-slate-500"
                : "!border-slate-600 !bg-slate-800/60 !text-slate-400",
        ].join(" "),
      });
    }

    const flowEdges: Edge[] = [];
    for (const [fromId, node] of Object.entries(tree.nodes)) {
      if (!visibleIds.has(fromId) || !node.branches) continue;
      for (const targetId of Object.values(node.branches)) {
        if (!visibleIds.has(targetId)) continue;
        const edgeVisited =
          visitedSet.has(fromId) && visitedSet.has(targetId);
        const onCriticalPath = tree.criticalPaths.some(
          (path) =>
            path.includes(fromId) &&
            path.includes(targetId) &&
            path.indexOf(targetId) === path.indexOf(fromId) + 1
        );
        flowEdges.push({
          id: `${fromId}-${targetId}`,
          source: fromId,
          target: targetId,
          style: {
            stroke: edgeVisited
              ? "#38bdf8"
              : onCriticalPath
                ? "#64748b"
                : "#334155",
            strokeWidth: edgeVisited ? 2 : 1,
            strokeDasharray: edgeVisited ? undefined : "6 4",
          },
          animated: edgeVisited,
        });
      }
    }

    const criticalVisited = [...critical].filter((id) =>
      visitedSet.has(id)
    ).length;
    const coverage =
      critical.size > 0
        ? Math.round((criticalVisited / critical.size) * 100)
        : 0;

    return { nodes: flowNodes, edges: flowEdges, coveragePct: coverage };
  }, [tree, visitedNodeIds, currentNodeId, nodeTurnCounts, variant]);

  if (!tree) {
    return (
      <div className={className}>
        <p className="text-xs text-slate-500">
          {locale === "zh" ? "暂无 Case Map" : "No case map"}
        </p>
      </div>
    );
  }

  const isSummary = variant === "summary";

  return (
    <div
      className={`flex flex-col rounded-xl border border-slate-700/80 bg-slate-900/60 ${className}`}
    >
      <div className="border-b border-slate-700/80 px-3 py-2">
        <h4 className="text-sm font-semibold text-white">Case Map</h4>
        <p className="text-[11px] text-slate-400">
          {locale === "zh" ? "覆盖率" : "Coverage"} {coveragePct}%
        </p>
      </div>
      {tooltip && (
        <p className="border-b border-slate-700/80 px-3 py-1.5 text-[11px] text-amber-200">
          {tooltip}
        </p>
      )}
      <div className={isSummary ? "h-[520px] w-full" : "h-[400px] w-full"}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          nodesDraggable={false}
          nodesConnectable={false}
          panOnDrag={isSummary}
          zoomOnScroll={isSummary}
          preventScrolling={!isSummary}
          onNodeClick={(_, node) => {
            const turns = (node.data as { turns?: number }).turns ?? 0;
            setTooltip(
              locale === "zh"
                ? `你在这里讲了 ${turns} 轮`
                : `You spoke ${turns} turn(s) here`
            );
          }}
        >
          <Background color="#1e293b" gap={16} />
          {isSummary && (
            <Controls showInteractive={false} className="!bg-slate-800" />
          )}
        </ReactFlow>
      </div>
    </div>
  );
}

export default function CaseMap(props: CaseMapProps) {
  const inner = <CaseMapFlow {...props} />;
  if (props.variant === "summary") {
    return (
      <ReactFlowProvider>
        <div className={props.className}>{inner}</div>
      </ReactFlowProvider>
    );
  }
  return (
    <ReactFlowProvider>
      <aside className={`w-[300px] shrink-0 ${props.className ?? ""}`}>
        {inner}
      </aside>
    </ReactFlowProvider>
  );
}
