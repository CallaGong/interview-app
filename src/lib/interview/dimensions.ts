import type { InterviewLocale } from "@/types/interview";

export interface BehavioralDimension {
  id: string;
  label: string;
  description: string;
  exampleAngles: string[];
}

export const BEHAVIORAL_DIMENSIONS_EN: BehavioralDimension[] = [
  {
    id: "leadership",
    label: "Leadership",
    description: "Leading teams, making decisions, influencing others",
    exampleAngles: [
      "a time you led without formal authority",
      "a difficult team decision you drove",
      "how you motivated others toward a goal",
    ],
  },
  {
    id: "problem_solving",
    label: "Problem Solving",
    description: "Analyzing complex problems, data-driven thinking, creative solutions",
    exampleAngles: [
      "breaking down an ambiguous problem",
      "using data to change a recommendation",
      "an innovative approach that worked",
    ],
  },
  {
    id: "teamwork",
    label: "Teamwork & Collaboration",
    description: "Cross-functional work, handling conflict",
    exampleAngles: [
      "partnering across teams with different priorities",
      "resolving a disagreement with a colleague",
      "contributing when you were not the lead",
    ],
  },
  {
    id: "failure_resilience",
    label: "Failure & Resilience",
    description: "Setbacks, pressure, recovery",
    exampleAngles: [
      "a meaningful failure and what you learned",
      "performing under tight deadlines or stress",
      "bouncing back after a setback",
    ],
  },
  {
    id: "ambiguity",
    label: "Ambiguity & Adaptability",
    description: "Uncertainty, incomplete information",
    exampleAngles: [
      "deciding with incomplete data",
      "adapting when plans changed mid-project",
      "navigating a poorly defined mandate",
    ],
  },
  {
    id: "impact",
    label: "Impact & Achievement",
    description: "Quantified results, value created",
    exampleAngles: [
      "your proudest measurable outcome",
      "how you defined success for a project",
      "trade-offs you made to maximize impact",
    ],
  },
  {
    id: "why_consulting",
    label: "Why Consulting",
    description: "Motivation, understanding of consulting",
    exampleAngles: [
      "why consulting now",
      "what you expect from the job vs. misconceptions",
      "how your background prepares you for consulting",
    ],
  },
  {
    id: "client_stakeholder",
    label: "Client & Stakeholder Management",
    description: "Difficult relationships, persuasion",
    exampleAngles: [
      "managing a skeptical stakeholder",
      "persuading someone who disagreed",
      "handling a demanding client or sponsor",
    ],
  },
  {
    id: "initiative",
    label: "Initiative & Ownership",
    description: "Proactive ownership, driving outcomes",
    exampleAngles: [
      "going beyond your formal role",
      "spotting a problem and fixing it before being asked",
      "driving something with no clear owner",
    ],
  },
  {
    id: "diversity_inclusion",
    label: "Diversity & Inclusion",
    description: "Diverse teams, cross-cultural collaboration",
    exampleAngles: [
      "working effectively across cultures or backgrounds",
      "fostering inclusion on a team",
      "learning from a perspective different from yours",
    ],
  },
];

export const BEHAVIORAL_DIMENSIONS_ZH: BehavioralDimension[] = [
  {
    id: "leadership",
    label: "领导力",
    description: "带领团队、做决策、影响他人",
    exampleAngles: [
      "在没有正式职权时如何推动团队",
      "一次艰难的团队决策",
      "如何激励他人达成目标",
    ],
  },
  {
    id: "problem_solving",
    label: "问题解决",
    description: "分析复杂问题、数据驱动、创新解法",
    exampleAngles: [
      "如何拆解一个模糊问题",
      "用数据改变结论的经历",
      "一次有效的创新做法",
    ],
  },
  {
    id: "teamwork",
    label: "团队协作",
    description: "跨部门合作、处理冲突",
    exampleAngles: [
      "与优先级不同的团队合作",
      "化解与同事的分歧",
      "非负责人角色时的贡献",
    ],
  },
  {
    id: "failure_resilience",
    label: "失败与抗压",
    description: "挫折经历、压力下的表现",
    exampleAngles: [
      "一次重要失败及收获",
      "高压或紧 deadline 下的表现",
      "挫折后如何恢复",
    ],
  },
  {
    id: "ambiguity",
    label: "模糊与适应力",
    description: "不确定性、信息不完整时的决策",
    exampleAngles: [
      "信息不足时如何做决定",
      "项目中途计划大变时如何调整",
      "职责不清时如何推进",
    ],
  },
  {
    id: "impact",
    label: "影响力与成果",
    description: "量化成果、创造的价值",
    exampleAngles: [
      "最引以为豪的可量化成果",
      "如何定义项目成功",
      "为最大化影响做的取舍",
    ],
  },
  {
    id: "why_consulting",
    label: "为何选择咨询",
    description: "职业动机、对咨询的理解",
    exampleAngles: [
      "为什么此刻选择咨询",
      "对咨询工作的真实期待",
      "背景如何支撑你做咨询",
    ],
  },
  {
    id: "client_stakeholder",
    label: "客户与利益相关方",
    description: "困难关系、说服他人",
    exampleAngles: [
      "应对持怀疑态度的利益相关方",
      "说服意见相左的人",
      "处理要求很高的客户或 sponsor",
    ],
  },
  {
    id: "initiative",
    label: "主动性与主人翁意识",
    description: "主动承担、推动事情发生",
    exampleAngles: [
      "超出职责范围做事",
      "发现问题并主动解决",
      "无人负责时如何推动",
    ],
  },
  {
    id: "diversity_inclusion",
    label: "多元与包容",
    description: "多元环境、跨文化合作",
    exampleAngles: [
      "跨文化或背景差异下高效合作",
      "在团队中促进包容",
      "从不同于自己的视角中学到什么",
    ],
  },
];

/** @deprecated Use getBehavioralDimensions("en") */
export const BEHAVIORAL_DIMENSIONS = BEHAVIORAL_DIMENSIONS_EN;

export function getBehavioralDimensions(
  locale: InterviewLocale
): BehavioralDimension[] {
  return locale === "zh"
    ? BEHAVIORAL_DIMENSIONS_ZH
    : BEHAVIORAL_DIMENSIONS_EN;
}

function dimensionMap(
  dimensions: BehavioralDimension[]
): Record<string, BehavioralDimension> {
  return Object.fromEntries(dimensions.map((d) => [d.id, d]));
}

export const DIMENSION_BY_ID_EN = dimensionMap(BEHAVIORAL_DIMENSIONS_EN);
export const DIMENSION_BY_ID_ZH = dimensionMap(BEHAVIORAL_DIMENSIONS_ZH);

/** @deprecated Use getDimensionById(id, locale) */
export const DIMENSION_BY_ID = DIMENSION_BY_ID_EN;

export function getDimensionById(
  id: string,
  locale: InterviewLocale
): BehavioralDimension | undefined {
  const map = locale === "zh" ? DIMENSION_BY_ID_ZH : DIMENSION_BY_ID_EN;
  return map[id];
}

/** Pick 3–4 random behavioral dimensions for this session. */
export function pickInterviewDimensions(
  locale: InterviewLocale = "en"
): BehavioralDimension[] {
  const count = 3 + Math.floor(Math.random() * 2);
  const pool = getBehavioralDimensions(locale);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function formatDimensionsForPrompt(
  dimensions: BehavioralDimension[],
  locale: InterviewLocale
): string {
  if (locale === "zh") {
    return dimensions
      .map(
        (d) =>
          `- **${d.label}**（id: \`${d.id}\`）：${d.description}。可切入角度：${d.exampleAngles.join("；")}。`
      )
      .join("\n");
  }
  return dimensions
    .map(
      (d) =>
        `- **${d.label}** (id: \`${d.id}\`): ${d.description}. Example angles: ${d.exampleAngles.join("; ")}.`
    )
    .join("\n");
}
