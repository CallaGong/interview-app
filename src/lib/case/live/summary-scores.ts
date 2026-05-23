import {
  getBranchingTree,
  getCriticalNodeIds,
} from "@/lib/case/branching/case-trees";
import type { LiveInterruptEvent } from "@/lib/case/live/live-types";
import type { ChatMessage } from "@/types";

export interface LiveSummaryScores {
  structure: number;
  quantification: number;
  communication: number;
  pressureHandling: number;
  overall: number;
}

function clamp(n: number, min = 0, max = 10): number {
  return Math.min(max, Math.max(min, Math.round(n)));
}

function countNumbers(text: string): number {
  return (text.match(/\d+(\.\d+)?%?/g) ?? []).length;
}

export function computeCoveragePercent(
  caseSlug: string,
  visitedNodeIds: string[]
): number {
  const tree = getBranchingTree(caseSlug);
  if (!tree) return 0;
  const critical = getCriticalNodeIds(tree);
  const visited = new Set(visitedNodeIds);
  const hit = [...critical].filter((id) => visited.has(id)).length;
  return critical.size > 0 ? Math.round((hit / critical.size) * 100) : 0;
}

export function getMissedCriticalNodes(
  caseSlug: string,
  visitedNodeIds: string[]
): Array<{ id: string; hint: string }> {
  const tree = getBranchingTree(caseSlug);
  if (!tree) return [];
  const critical = getCriticalNodeIds(tree);
  const visited = new Set(visitedNodeIds);
  return [...critical]
    .filter((id) => !visited.has(id) && id !== "end")
    .map((id) => ({
      id,
      hint: tree.nodes[id]?.aiPrompt ?? tree.nodes[id]?.expectedTopics?.join(", ") ?? "",
    }));
}

export function computeLiveSummaryScores(params: {
  caseSlug: string;
  visitedNodeIds: string[];
  messages: ChatMessage[];
  interruptCount: number;
  silenceCount: number;
  postSilenceReplyLengths: number[];
}): LiveSummaryScores {
  const coverage = computeCoveragePercent(params.caseSlug, params.visitedNodeIds);
  const structure = clamp(coverage / 10);

  const userMessages = params.messages.filter((m) => m.role === "user");
  const userText = userMessages.map((m) => m.content).join(" ");
  const numCount = countNumbers(userText);
  const quantification = clamp(
    userMessages.length === 0 ? 3 : Math.min(10, 3 + numCount * 1.2)
  );

  const avgLen =
    userMessages.length === 0
      ? 0
      : userMessages.reduce((s, m) => s + m.content.length, 0) /
        userMessages.length;
  const interruptPenalty = Math.min(4, params.interruptCount * 0.8);
  const lengthPenalty = avgLen > 400 ? 1.5 : avgLen < 30 ? 1 : 0;
  const communication = clamp(8 - interruptPenalty - lengthPenalty);

  let pressureHandling = 7;
  if (params.silenceCount > 0 && params.postSilenceReplyLengths.length > 0) {
    const avgPost =
      params.postSilenceReplyLengths.reduce((a, b) => a + b, 0) /
      params.postSilenceReplyLengths.length;
    pressureHandling = clamp(5 + avgPost / 40);
  } else if (params.silenceCount > 0) {
    pressureHandling = 5;
  }

  const overall = clamp(
    (structure + quantification + communication + pressureHandling) / 4
  );

  return {
    structure,
    quantification,
    communication,
    pressureHandling,
    overall,
  };
}

export function classifyInterruptPurpose(
  aiLine: string,
  reasons?: string[],
  locale: "en" | "zh" = "zh"
): string {
  const en = locale === "en";
  if (reasons?.includes("assumption")) {
    return en ? "Test assumption basis" : "测试假设依据";
  }
  if (reasons?.includes("hedging")) {
    return en ? "Challenge vague language" : "挑战模糊表述";
  }
  if (reasons?.includes("timeout") || reasons?.includes("long_answer")) {
    return en ? "Stay on track / quantify" : "防止跑题 / 要求量化";
  }
  if (reasons?.includes("backtrack")) {
    return en ? "Return to earlier point" : "拉回先前论点";
  }
  const lower = aiLine.toLowerCase();
  if (/assumption|假设/.test(lower)) {
    return en ? "Test assumption basis" : "测试假设依据";
  }
  if (/quantif|量化/.test(lower)) {
    return en ? "Require quantification" : "要求量化";
  }
  if (/back|回到/.test(lower)) {
    return en ? "Return to earlier point" : "拉回先前论点";
  }
  return en ? "Pressure / drill down" : "施压 / 深度追问";
}

export function purposeLabel(purpose: string, _locale: "en" | "zh"): string {
  return purpose;
}
