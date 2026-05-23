import type { BranchingTree, BranchNode } from "@/lib/case/branching/case-trees";
import type { CaseLocale } from "@/types/case-locale";
import type { CaseQuestion } from "@/types";

export function buildLiveSystemPrompt(params: {
  caseQuestion: CaseQuestion;
  locale: CaseLocale;
  tree: BranchingTree;
  currentNodeId: string;
}): string {
  const { caseQuestion, locale, tree, currentNodeId } = params;
  const node = tree.nodes[currentNodeId];
  const languageRule =
    locale === "zh"
      ? "Conduct the entire interview in Chinese (简体中文)."
      : "Conduct the entire interview in English.";

  const branchKeys = node?.branches ? Object.keys(node.branches) : [];
  const branchTargets = node?.branches
    ? Object.entries(node.branches)
        .map(([k, v]) => `${k} → ${v}`)
        .join(", ")
    : "none";

  return `You are a senior McKinsey partner running a LIVE case interview (strict, time-pressured).

## Case
**Title**: ${caseQuestion.title}
**Description**: ${caseQuestion.description}
**Background**: ${caseQuestion.context}

## Current tree node: ${currentNodeId}
**Node type**: ${node?.type ?? "unknown"}
**Your instruction for this node**: ${node?.aiPrompt ?? "Continue the interview."}
**Expected topics here**: ${(node?.expectedTopics ?? []).join(", ") || "n/a"}
**Possible branches (pick ONE based on the candidate's latest answer)**: ${branchTargets || "n/a"}
**Branch keys**: ${branchKeys.join(", ") || "n/a"}

## Rules
1. One focused question or challenge per turn; be concise and interviewer-like.
2. Do not reveal the full answer or optimal framework upfront.
3. Push back when answers are vague; ask for quantification.
4. After each reply, decide which branch key best fits the candidate (e.g. good_framework, weak_framework).
5. End EVERY response with exactly one line: [NODE:next_node_id] where next_node_id is the target node from the branch map, or stay on current node if still gathering info (use current node id: ${currentNodeId}).
6. When the interview should end, use [NODE:end].
7. When sharing quantitative data, add a chart marker on its own line BEFORE [NODE:...]:
   [CHART:{"chartType":"line"|"bar"|"pie","title":"...","data":[{"year":2020,"revenue":100},...]}]
   Use realistic illustrative numbers. chartType must match the data shape.

${languageRule}`;
}

export function buildLiveOpeningMessage(
  caseQuestion: CaseQuestion,
  locale: CaseLocale,
  introNode: BranchNode
): string {
  const base =
    locale === "zh"
      ? `欢迎参加 Live Case Interview（实战模式）。

**题目：${caseQuestion.title}**

${caseQuestion.description}

**背景：** ${caseQuestion.context}

在我们开始之前，你有什么澄清问题吗？请提出 1–2 个关键问题。`
      : `Welcome to Live Case Interview mode.

**Case: ${caseQuestion.title}**

${caseQuestion.description}

**Background:** ${caseQuestion.context}

Before we dive in — what clarifying questions do you have? I'd like one or two key questions.`;

  void introNode;
  return base;
}
