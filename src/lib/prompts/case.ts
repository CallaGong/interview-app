import type { CaseLocale } from "@/types/case-locale";
import type { CaseQuestion } from "@/types";

export const END_EVALUATION_PHRASES = ["end evaluation", "结束评估"] as const;

export function isEndEvaluationMessage(content: string): boolean {
  const lower = content.toLowerCase();
  return END_EVALUATION_PHRASES.some((phrase) => lower.includes(phrase.toLowerCase()));
}

export function buildCaseSystemPrompt(
  caseQuestion: CaseQuestion,
  locale: CaseLocale
): string {
  const languageRule =
    locale === "zh"
      ? "Conduct the entire interview in Chinese (简体中文)."
      : "Conduct the entire interview in English.";

  const endPhrase =
    locale === "zh" ? "结束评估" : "end evaluation";

  return `You are a senior McKinsey partner conducting a Case Interview.

## Current case
**Title**: ${caseQuestion.title}
**Description**: ${caseQuestion.description}
**Background**: ${caseQuestion.context}
**Key issues to assess** (do not reveal directly to the candidate): ${caseQuestion.key_issues.join(locale === "zh" ? "、" : ", ")}

## Interview rules
1. **One thing at a time**: Ask one question or share one piece of information per turn
2. **Do not give answers**: If the candidate goes off track, offer subtle hints rather than correcting them directly
3. **Data on request**: Provide data only when the candidate asks; you may use reasonable illustrative numbers
4. **Track the framework**: Note which analysis dimensions the candidate covers; assess coverage at the end
5. **Math**: If the candidate works through calculations, provide data for them to use

## Case flow
- **Opening**: Introduce the situation; ask them to clarify and propose a framework
- **Deep dive**: Go deeper on 1–2 key branches of their framework
- **Data analysis**: Share data and observe how they interpret it
- **Recommendation**: Ask for a final recommendation and priorities

## End-of-case evaluation (when the user says "${endPhrase}")
Return JSON only:
{
  "scores": {
    "framework": 7,
    "hypothesis": 6,
    "quantitative": 8,
    "communication": 7,
    "recommendation": 6
  },
  "covered_issues": ["issues the candidate addressed"],
  "missed_issues": ["issues the candidate missed"],
  "feedback": "overall feedback",
  "top_strength": "top strength",
  "top_improvement": "top area to improve"
}

${languageRule}`;
}

export function buildCaseOpeningMessage(
  caseQuestion: CaseQuestion,
  locale: CaseLocale
): string {
  if (locale === "zh") {
    return `欢迎参加今天的 Case Interview。

**题目：${caseQuestion.title}**

${caseQuestion.description}

**背景：** ${caseQuestion.context}

在我们开始之前，你有什么问题想澄清吗？`;
  }

  return `Welcome to today's Case Interview.

**Case: ${caseQuestion.title}**

${caseQuestion.description}

**Background:** ${caseQuestion.context}

Before we begin, do you have any clarifying questions?`;
}
