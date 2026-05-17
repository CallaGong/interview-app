import type { CaseQuestion } from "@/types";

export const CASE_QUESTIONS: CaseQuestion[] = [
  {
    id: "retail-profit",
    title: "零售连锁利润下降",
    type: "profitability",
    difficulty: "medium",
    description:
      "某零售连锁客户过去两年利润下降了 20%，但营收基本持平。请帮助诊断问题并提出改善建议。",
    context:
      "该客户在全国有 500 家门店，主要经营快消品和生活用品，竞争对手包括大型超市和电商平台。",
    key_issues: [
      "收入结构分析",
      "成本结构分析（固定/可变）",
      "同店销售 vs 新店",
      "品类结构变化",
      "竞争格局",
    ],
  },
  {
    id: "coffee-china",
    title: "咖啡品牌进入中国市场",
    type: "market_entry",
    difficulty: "medium",
    description:
      "一家美国精品咖啡品牌想要进入中国市场，请评估市场机会并制定进入策略。",
    context:
      "该品牌在美国有 200 家门店，定位中高端，均价 50 元人民币每杯，目前无中国业务。",
    key_issues: [
      "市场规模与增速",
      "竞争格局（星巴克/瑞幸等）",
      "消费者洞察",
      "进入模式（独资/合资/加盟）",
      "城市优先级",
    ],
  },
  {
    id: "pharma-ma",
    title: "制药公司并购决策",
    type: "mergers_acquisitions",
    difficulty: "hard",
    description:
      "你的客户是一家大型制药公司，正考虑以 50 亿美元收购一家专注肿瘤领域的生物科技公司。请评估这个并购是否值得。",
    context:
      "目标公司有 3 款在研药物，其中 1 款处于三期临床，预计 2 年后上市。目前年收入 2 亿美元（主要来自授权费）。",
    key_issues: [
      "战略协同性",
      "管线价值评估",
      "估值合理性",
      "整合风险",
      "替代方案对比",
    ],
  },
];
