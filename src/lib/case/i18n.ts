import type { CaseLocale } from "@/types/case-locale";
import type { CaseDifficulty } from "@/types";
import type { RecommendationHint } from "@/lib/case/recommendations";

export const caseCopy = {
  en: {
    pageTitle: "Case practice",
    pageSubtitle:
      'Pick a case and practice with an AI interviewer. Type "end evaluation" when you are ready for feedback.',
    tabPractice: "Practice",
    tabLearn: "Learn",
    selectCase: "Select a case",
    loadingCases: "Loading cases…",
    filterAll: "All",
    recommended: "Recommended",
    diagnosisTitle: "Quick diagnostic",
    diagnosisSubtitle:
      "Answer a few questions so we can recommend the right difficulty for you.",
    qExperience: "Have you practiced Case Interviews before?",
    qFrameworks: "Which analysis frameworks are you familiar with? (select all that apply)",
    qMock: "Have you participated in a Mock Interview?",
    experienceNone: "Never",
    experienceFew: "A few times",
    experienceOften: "Often",
    frameworkProfit: "Profit tree analysis",
    frameworkMarket: "Market entry framework",
    frameworkMa: "M&A analysis",
    frameworkNone: "None of the above",
    mockNever: "Never",
    mockYes: "Yes, I have",
    submitDiagnosis: "See my recommendation",
    diagnosisEasyHint: "We'll guide you step by step.",
    diagnosisMediumHint: "A solid starting level for structured practice.",
    diagnosisHardHint: "You're ready for challenging cases.",
    levelBeginner: "Beginner",
    levelIntermediate: "Some experience",
    levelExperienced: "Experienced",
    recommendedDifficulty: "Recommended difficulty",
    hintUpgrade:
      "You're doing great — try a harder case next.",
    hintMaintain: "Keep practicing at your current level.",
    hintDowngrade:
      "Solidify the basics before tackling harder cases.",
    learnTitle: "Learning hub",
    learnComingSoon: "Coming soon",
    learnIntro:
      "Structured lessons and walkthroughs are on the way. Here's what we're building:",
    learnTopics: [
      "MECE thinking framework",
      "Common case frameworks (profit tree, market entry, M&A)",
      "Case walkthrough demos",
    ],
  },
  zh: {
    pageTitle: "Case 练习",
    pageSubtitle:
      "选择题目，与 AI 面试官对练。准备好后输入「结束评估」获取反馈。",
    tabPractice: "练习",
    tabLearn: "学习",
    selectCase: "选择题目",
    loadingCases: "加载题目中…",
    filterAll: "全部",
    recommended: "推荐",
    diagnosisTitle: "新手诊断",
    diagnosisSubtitle: "回答几个问题，我们会为你推荐合适的难度。",
    qExperience: "你之前做过 Case Interview 练习吗？",
    qFrameworks: "你了解以下哪些分析框架？（可多选）",
    qMock: "你有没有参加过 Mock Interview？",
    experienceNone: "没有",
    experienceFew: "做过几次",
    experienceOften: "经常练习",
    frameworkProfit: "利润树分析",
    frameworkMarket: "市场进入框架",
    frameworkMa: "并购分析",
    frameworkNone: "都不了解",
    mockNever: "没有",
    mockYes: "有过",
    submitDiagnosis: "查看推荐难度",
    diagnosisEasyHint: "我们会引导你一步步完成。",
    diagnosisMediumHint: "适合有一定基础、希望系统练习的你。",
    diagnosisHardHint: "你已准备好挑战高难度题目。",
    levelBeginner: "零基础",
    levelIntermediate: "有一定了解",
    levelExperienced: "有经验",
    recommendedDifficulty: "推荐难度",
    hintUpgrade: "你表现很好，试试更难的题目吧。",
    hintMaintain: "保持当前难度继续练习。",
    hintDowngrade: "先巩固基础再挑战更难的题目。",
    learnTitle: "学习中心",
    learnComingSoon: "即将上线",
    learnIntro: "系统化课程与示范正在筹备中，预告内容：",
    learnTopics: [
      "MECE 思维框架介绍",
      "常见 Case 框架（利润树、市场进入、并购）",
      "案例拆解示范",
    ],
  },
} as const;

export type CaseCopy = (typeof caseCopy)[CaseLocale];

export function getCaseCopy(locale: CaseLocale): CaseCopy {
  return caseCopy[locale];
}

export function difficultyLabel(
  locale: CaseLocale,
  difficulty: CaseDifficulty
): string {
  const labels = {
    en: { easy: "Easy", medium: "Medium", hard: "Hard" },
    zh: { easy: "简单", medium: "中等", hard: "困难" },
  };
  return labels[locale][difficulty];
}

export function hintMessage(
  locale: CaseLocale,
  hint: RecommendationHint
): string | null {
  const c = getCaseCopy(locale);
  if (hint === "upgrade") return c.hintUpgrade;
  if (hint === "downgrade") return c.hintDowngrade;
  if (hint === "maintain") return c.hintMaintain;
  return null;
}

export function diagnosisLevelHint(
  locale: CaseLocale,
  difficulty: CaseDifficulty
): string {
  const c = getCaseCopy(locale);
  if (difficulty === "easy") return c.diagnosisEasyHint;
  if (difficulty === "hard") return c.diagnosisHardHint;
  return c.diagnosisMediumHint;
}

export function diagnosisLevelLabel(
  locale: CaseLocale,
  level: "beginner" | "intermediate" | "experienced"
): string {
  const c = getCaseCopy(locale);
  if (level === "beginner") return c.levelBeginner;
  if (level === "experienced") return c.levelExperienced;
  return c.levelIntermediate;
}
