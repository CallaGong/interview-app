import type { CaseLocale } from "@/types/case-locale";

export const STEP2_INTRO = {
  en: "After the interviewer presents the case, your first job is not to analyze — it's to identify the case type. Different types need completely different frameworks. Here are 3 techniques:",
  zh: "面试官说完题目后，第一件事不是开始分析，而是先判断这是哪一类 Case。因为不同类型用完全不同的框架。教你 3 个识别技巧：",
};

export const STEP2_TECHNIQUES = [
  {
    title: { en: "Technique 1: Keyword triggers", zh: "技巧 1：抓关键词" },
    rows: [
      { keywords: { en: "estimate / how many / size", zh: "估算 / 多少 / 规模" }, type: { en: "Market Sizing", zh: "市场估算" } },
      { keywords: { en: "profit / cost / loss / decline", zh: "利润 / 成本 / 亏损 / 下降" }, type: { en: "Profitability", zh: "盈利能力" } },
      { keywords: { en: "enter / expand / new market", zh: "进入 / 拓展 / 新市场" }, type: { en: "Market Entry", zh: "市场进入" } },
      { keywords: { en: "acquire / merge / invest / M&A", zh: "收购 / 合并 / 投资 / 并购" }, type: { en: "M&A", zh: "并购" } },
      { keywords: { en: "grow / double / scale", zh: "增长 / 扩大 / 翻倍" }, type: { en: "Growth Strategy", zh: "增长策略" } },
      { keywords: { en: "price / pricing / charge", zh: "定价 / 价格 / 收费" }, type: { en: "Pricing Strategy", zh: "定价策略" } },
      { keywords: { en: "efficiency / capacity / bottleneck", zh: "效率 / 产能 / 瓶颈" }, type: { en: "Operations", zh: "运营优化" } },
    ],
  },
  {
    title: { en: "Technique 2: Core verb", zh: "技巧 2：看核心动词" },
    rows: [
      { keywords: { en: '"How many / how much"', zh: "「是多少」" }, type: { en: "Market Sizing", zh: "市场估算" } },
      { keywords: { en: '"Why"', zh: "「为什么」" }, type: { en: "Profitability", zh: "盈利能力" } },
      { keywords: { en: '"Should we do it"', zh: "「要不要做」" }, type: { en: "Market Entry / M&A", zh: "市场进入 / 并购" } },
      { keywords: { en: '"How to do it"', zh: "「怎么做」" }, type: { en: "Growth / Operations", zh: "增长 / 运营" } },
      { keywords: { en: '"What price"', zh: "「卖多少钱」" }, type: { en: "Pricing", zh: "定价" } },
    ],
  },
  {
    title: { en: "Technique 3: Combo cases", zh: "技巧 3：复合型题目要拆" },
    rows: [
      {
        keywords: {
          en: 'e.g. "Acquire a competitor to enter a new market"',
          zh: "如「收购竞争对手以进入新市场」",
        },
        type: { en: "M&A + Market Entry — find primary vs secondary issues", zh: "并购 + 市场进入 — 分清主次问题" },
      },
    ],
  },
];

export type QuizCaseType =
  | "market_sizing"
  | "profitability"
  | "pricing"
  | "ma"
  | "market_entry"
  | "growth"
  | "operations";

export interface QuizQuestion {
  id: string;
  prompt: { en: string; zh: string };
  options: { id: QuizCaseType; label: { en: string; zh: string } }[];
  correct: QuizCaseType;
  explanation: { en: string; zh: string };
}

export const STEP2_QUIZ: QuizQuestion[] = [
  {
    id: "q1",
    prompt: {
      en: "An airline's net profit has declined for 3 years. Find the root cause.",
      zh: "某航空公司过去3年净利润持续下滑，请帮助找出原因。",
    },
    options: [
      { id: "profitability", label: { en: "Profitability", zh: "盈利能力" } },
      { id: "market_sizing", label: { en: "Market Sizing", zh: "市场估算" } },
      { id: "market_entry", label: { en: "Market Entry", zh: "市场进入" } },
      { id: "growth", label: { en: "Growth Strategy", zh: "增长策略" } },
    ],
    correct: "profitability",
    explanation: {
      en: 'Keywords "net profit decline" — classic profitability case.',
      zh: "关键词「净利润下滑」，这是典型的盈利能力分析题。",
    },
  },
  {
    id: "q2",
    prompt: {
      en: "Estimate total daily ridership on the Shanghai metro.",
      zh: "估算上海地铁每天的总客流量。",
    },
    options: [
      { id: "market_sizing", label: { en: "Market Sizing", zh: "市场估算" } },
      { id: "profitability", label: { en: "Profitability", zh: "盈利能力" } },
      { id: "operations", label: { en: "Operations", zh: "运营优化" } },
      { id: "pricing", label: { en: "Pricing", zh: "定价策略" } },
    ],
    correct: "market_sizing",
    explanation: {
      en: 'Keywords "estimate" + "ridership" — market sizing.',
      zh: "关键词「估算」+「客流量」，是市场规模估算题。",
    },
  },
  {
    id: "q3",
    prompt: {
      en: "Starbucks launches cold brew at ¥35–50. Is the price reasonable?",
      zh: "星巴克想推出冷萃咖啡产品线，定价35-50元之间，是否合理？",
    },
    options: [
      { id: "pricing", label: { en: "Pricing Strategy", zh: "定价策略" } },
      { id: "growth", label: { en: "Growth Strategy", zh: "增长策略" } },
      { id: "market_entry", label: { en: "Market Entry", zh: "市场进入" } },
      { id: "profitability", label: { en: "Profitability", zh: "盈利能力" } },
    ],
    correct: "pricing",
    explanation: {
      en: "Core question is pricing, even with product strategy elements.",
      zh: "核心问题是定价，虽然涉及产品策略，但定价是主问题。",
    },
  },
  {
    id: "q4",
    prompt: {
      en: "A pharma company considers a $1B acquisition of an oncology biotech. Worth it?",
      zh: "某药企考虑斥资10亿美元收购一家肿瘤药公司，是否值得？",
    },
    options: [
      { id: "ma", label: { en: "M&A", zh: "并购" } },
      { id: "market_entry", label: { en: "Market Entry", zh: "市场进入" } },
      { id: "profitability", label: { en: "Profitability", zh: "盈利能力" } },
      { id: "growth", label: { en: "Growth Strategy", zh: "增长策略" } },
    ],
    correct: "ma",
    explanation: {
      en: 'Keywords "acquisition" + "worth it" — M&A evaluation.',
      zh: "关键词「收购」+「是否值得」，是并购评估题。",
    },
  },
  {
    id: "q5",
    prompt: {
      en: "A bubble tea chain expands from tier-1 cities to tier-3/4. What strategy?",
      zh: "某连锁奶茶品牌想从一线城市拓展到三四线城市，应该如何制定策略？",
    },
    options: [
      { id: "market_entry", label: { en: "Market Entry", zh: "市场进入" } },
      { id: "growth", label: { en: "Growth Strategy", zh: "增长策略" } },
      { id: "operations", label: { en: "Operations", zh: "运营优化" } },
      { id: "market_sizing", label: { en: "Market Sizing", zh: "市场估算" } },
    ],
    correct: "market_entry",
    explanation: {
      en: 'Keywords "expand to new markets" — market entry (new region counts).',
      zh: "关键词「拓展到新市场」，是市场进入题。即使是同一个国家，进入新区域也属于 Market Entry。",
    },
  },
];

export const STEP2_PASS_THRESHOLD = 4;
