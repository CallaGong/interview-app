"use client";

import { useCallback, useRef } from "react";
import html2canvas from "html2canvas";
import CaseMap from "@/components/case/live/CaseMap";
import type { LiveInterruptEvent } from "@/lib/case/live/live-types";
import {
  computeLiveSummaryScores,
  getMissedCriticalNodes,
  purposeLabel,
} from "@/lib/case/live/summary-scores";
import { getNodeLabel } from "@/lib/case/branching/case-trees";
import type { ChatMessage } from "@/types";

export interface InterviewSummaryProps {
  locale: "en" | "zh";
  caseSlug: string;
  durationSeconds: number;
  elapsedSeconds?: number;
  visitedNodeIds: string[];
  messages: ChatMessage[];
  interruptEvents: LiveInterruptEvent[];
  silenceCount: number;
  postSilenceReplyLengths?: number[];
  onClose?: () => void;
}

export default function InterviewSummary({
  locale,
  caseSlug,
  durationSeconds,
  elapsedSeconds,
  visitedNodeIds,
  messages,
  interruptEvents,
  silenceCount,
  postSilenceReplyLengths = [],
  onClose,
}: InterviewSummaryProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const userTurns = messages.filter((m) => m.role === "user").length;
  const elapsed = elapsedSeconds ?? durationSeconds;

  const scores = computeLiveSummaryScores({
    caseSlug,
    visitedNodeIds,
    messages,
    interruptCount: interruptEvents.length,
    silenceCount,
    postSilenceReplyLengths,
  });

  const missed = getMissedCriticalNodes(caseSlug, visitedNodeIds);

  const copy =
    locale === "zh"
      ? {
          title: "面试结束",
          time: "总用时",
          turns: "总轮次",
          interrupts: "被打断",
          missedTitle: "未探索的路径",
          interruptTitle: "打断回顾",
          youSaid: "你当时说",
          aiSaid: "面试官打断",
          purpose: "目的",
          scores: "综合评分",
          structure: "Structure（结构）",
          quant: "Quantification（量化）",
          comm: "Communication（表达）",
          pressure: "Pressure handling（抗压）",
          share: "分享面试 Map",
          back: "返回题目列表",
          min: "分钟",
          times: "次",
        }
      : {
          title: "Interview complete",
          time: "Total time",
          turns: "Turns",
          interrupts: "Interrupts",
          missedTitle: "Paths not explored",
          interruptTitle: "Interrupt review",
          youSaid: "You said",
          aiSaid: "Interviewer",
          purpose: "Purpose",
          scores: "Scores",
          structure: "Structure",
          quant: "Quantification",
          comm: "Communication",
          pressure: "Pressure handling",
          share: "Share interview map",
          back: "Back to cases",
          min: "min",
          times: "",
        };

  const handleShare = useCallback(async () => {
    if (!mapRef.current) return;
    try {
      const canvas = await html2canvas(mapRef.current, {
        backgroundColor: "#0f172a",
        scale: 2,
      });
      const link = document.createElement("a");
      link.download = `case-map-${caseSlug}-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      /* fallback: user can screenshot manually */
    }
  }, [caseSlug]);

  const scoreRows = [
    { label: copy.structure, value: scores.structure },
    { label: copy.quant, value: scores.quantification },
    { label: copy.comm, value: scores.communication },
    { label: copy.pressure, value: scores.pressureHandling },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-700/80 bg-slate-900/60 p-6">
        <h2 className="mb-4 text-xl font-semibold text-white">{copy.title}</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="rounded-lg bg-slate-800/60 p-3">
            <p className="text-2xl font-bold text-white">
              {Math.round(elapsed / 60)}
            </p>
            <p className="text-xs text-slate-400">{copy.time}</p>
          </div>
          <div className="rounded-lg bg-slate-800/60 p-3">
            <p className="text-2xl font-bold text-white">{userTurns}</p>
            <p className="text-xs text-slate-400">{copy.turns}</p>
          </div>
          <div className="rounded-lg bg-slate-800/60 p-3">
            <p className="text-2xl font-bold text-white">
              {interruptEvents.length}
            </p>
            <p className="text-xs text-slate-400">{copy.interrupts}</p>
          </div>
        </div>
      </div>

      <div ref={mapRef}>
        <CaseMap
          caseSlug={caseSlug}
          visitedNodeIds={visitedNodeIds}
          locale={locale}
          variant="summary"
          className="w-full"
        />
      </div>

      <button
        type="button"
        onClick={() => void handleShare()}
        className="w-full rounded-lg border border-violet-500/50 bg-violet-500/10 py-2.5 text-sm font-medium text-violet-200 hover:bg-violet-500/20"
      >
        {copy.share}
      </button>

      {missed.length > 0 && (
        <section className="rounded-xl border border-slate-700/80 bg-slate-900/60 p-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            {copy.missedTitle}
          </h3>
          <ul className="space-y-3">
            {missed.map((node) => (
              <li
                key={node.id}
                className="rounded-lg border border-dashed border-slate-600 bg-slate-800/40 px-3 py-2"
              >
                <p className="text-sm font-medium text-slate-200">
                  {getNodeLabel(node.id)}
                </p>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                  {node.hint}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {interruptEvents.length > 0 && (
        <section className="rounded-xl border border-slate-700/80 bg-slate-900/60 p-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            {copy.interruptTitle}
          </h3>
          <ul className="space-y-4">
            {interruptEvents.map((ev, i) => (
              <li
                key={i}
                className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3"
              >
                <p className="text-[10px] uppercase text-rose-300/80">
                  {copy.purpose}: {purposeLabel(ev.purpose, locale)}
                </p>
                <p className="mt-2 text-xs text-slate-500">{copy.youSaid}</p>
                <p className="text-sm text-slate-300">&ldquo;{ev.userSaid}&rdquo;</p>
                <p className="mt-2 text-xs text-slate-500">{copy.aiSaid}</p>
                <p className="text-sm text-rose-100">&ldquo;{ev.aiSaid}&rdquo;</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-xl border border-slate-700/80 bg-slate-900/60 p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
          {copy.scores}
        </h3>
        <div className="mb-2 flex items-end gap-2">
          <span className="text-4xl font-bold text-white">{scores.overall}</span>
          <span className="pb-1 text-sm text-slate-500">/ 10</span>
        </div>
        <ul className="space-y-3">
          {scoreRows.map((row) => (
            <li key={row.label}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-slate-300">{row.label}</span>
                <span className="font-medium text-white">{row.value}/10</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-500 to-violet-500"
                  style={{ width: `${row.value * 10}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-rose-500"
        >
          {copy.back}
        </button>
      )}
    </div>
  );
}
