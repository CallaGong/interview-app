import type { CaseLocale } from "@/types/case-locale";

export interface CaseTypeCard {
  id: string;
  number: string;
  titleEn: string;
  titleZh: string;
  oneLiner: { en: string; zh: string };
  typicalAsk: { en: string; zh: string };
  focus: { en: string; zh: string };
}

export const STEP1_INTRO = {
  en: "Before you start practicing cases, learn the 7 most common case types in consulting interviews. Each type tests different skills and requires a completely different approach.",
  zh: "在你开始练习 Case 之前，先了解咨询面试中最常见的 7 种题型。每种题型考察的能力不同，解题思路也完全不同。",
};

export const CASE_TYPE_CARDS: CaseTypeCard[] = [
  {
    id: "market_sizing",
    number: "01",
    titleEn: "Market Sizing",
    titleZh: "市场估算",
    oneLiner: { en: "Estimate the size of a market or product category", zh: "估算某个市场/产品的规模大小" },
    typicalAsk: {
      en: "How many coffee shops are there in Beijing? How many phones are sold in China per year?",
      zh: "北京有多少家咖啡店？中国每年卖出多少部手机？",
    },
    focus: { en: "Structured breakdown, number sense", zh: "结构化拆分能力、数字敏感度" },
  },
  {
    id: "profitability",
    number: "02",
    titleEn: "Profitability",
    titleZh: "盈利能力分析",
    oneLiner: { en: "Diagnose why profits changed and how to improve them", zh: "诊断公司利润为什么变化，怎么改善" },
    typicalAsk: {
      en: "A restaurant chain's profit fell 20% — find the cause; how can a retailer improve margins?",
      zh: "某连锁餐厅利润下降20%，找出原因；如何提升某零售商的利润率？",
    },
    focus: { en: "MECE thinking, root-cause analysis", zh: "MECE思维、根因分析能力" },
  },
  {
    id: "market_entry",
    number: "03",
    titleEn: "Market Entry",
    titleZh: "市场进入",
    oneLiner: { en: "Assess whether a company should enter a new market", zh: "评估公司是否应该进入一个新市场" },
    typicalAsk: {
      en: "Should a U.S. coffee brand enter China?",
      zh: "某美国咖啡品牌想进入中国市场，是否可行？",
    },
    focus: { en: "Business judgment, market analysis", zh: "商业判断、市场分析能力" },
  },
  {
    id: "ma",
    number: "04",
    titleEn: "M&A / Joint Venture",
    titleZh: "并购投资",
    oneLiner: { en: "Evaluate whether an acquisition or JV is worth doing", zh: "评估收购或合资决策是否值得" },
    typicalAsk: {
      en: "Should a tech company acquire an AI startup for $5B?",
      zh: "某科技公司考虑收购AI初创企业，是否值得50亿美元？",
    },
    focus: { en: "Financial analysis, strategic thinking", zh: "财务分析、战略思维" },
  },
  {
    id: "growth",
    number: "05",
    titleEn: "Growth Strategy",
    titleZh: "增长策略",
    oneLiner: { en: "Design a plan to grow the business", zh: "制定增长方案，扩大业务规模" },
    typicalAsk: {
      en: "A streaming platform is flat at 8M users — how to double in 24 months?",
      zh: "某流媒体平台用户停滞，如何在24个月内翻倍？",
    },
    focus: { en: "Innovation, prioritization", zh: "创新思维、优先级判断" },
  },
  {
    id: "pricing",
    number: "06",
    titleEn: "Pricing Strategy",
    titleZh: "定价策略",
    oneLiner: { en: "Set the right price for a product or service", zh: "为产品或服务制定合理价格" },
    typicalAsk: {
      en: "How should a new SaaS product be priced? How to price a new drug?",
      zh: "某新SaaS产品如何定价？某药企新药如何定价？",
    },
    focus: { en: "Value analysis, pricing psychology", zh: "价值分析、定价心理学" },
  },
  {
    id: "operations",
    number: "07",
    titleEn: "Operations / Performance",
    titleZh: "运营优化",
    oneLiner: { en: "Improve processes and operational efficiency", zh: "优化流程、提升运营效率" },
    typicalAsk: {
      en: "Store efficiency is low — how to fix it? Factory capacity is insufficient?",
      zh: "某门店运营效率低下，如何改善？某工厂产能不足，怎么办？",
    },
    focus: { en: "Process analysis, bottleneck identification", zh: "流程分析、瓶颈识别" },
  },
];

export function pickLocale<T extends { en: string; zh: string }>(
  locale: CaseLocale,
  field: T
): string {
  return locale === "zh" ? field.zh : field.en;
}
