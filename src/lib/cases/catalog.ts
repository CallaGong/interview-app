import { supportsLiveMode } from "@/lib/case/branching/case-trees";
import type { CaseLocale } from "@/types/case-locale";
import type { CaseDifficulty, CaseQuestion } from "@/types";

interface CaseContent {
  title: string;
  description: string;
  context: string;
  key_issues: string[];
}

interface BilingualCaseEntry {
  id: string;
  type: string;
  difficulty: CaseDifficulty;
  en: CaseContent;
  zh: CaseContent;
}

const CATALOG: BilingualCaseEntry[] = [
  {
    id: "retail-profit",
    type: "profitability",
    difficulty: "easy",
    en: {
      title: "Retail chain profit decline",
      description:
        "A retail chain client's profits have fallen 20% over the past two years while revenue is roughly flat. Diagnose the problem and recommend improvements.",
      context:
        "The client operates 500 stores nationwide, mainly FMCG and household goods. Competitors include large supermarkets and e-commerce platforms.",
      key_issues: [
        "Revenue mix analysis",
        "Cost structure (fixed vs. variable)",
        "Same-store sales vs. new stores",
        "Category mix shifts",
        "Competitive landscape",
      ],
    },
    zh: {
      title: "零售连锁利润下降",
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
  },
  {
    id: "logistics-cost",
    type: "cost_optimization",
    difficulty: "easy",
    en: {
      title: "Logistics cost optimization",
      description:
        "A regional logistics company's operating margin fell from 12% to 6% over three years. Find cost drivers and recommend optimizations.",
      context:
        "The client runs 40 distribution centers serving B2B retailers. Fuel, labor, and fleet lease are the largest cost buckets.",
      key_issues: [
        "Cost waterfall",
        "Fixed vs variable costs",
        "Route and fleet utilization",
        "Warehouse productivity",
        "Quick wins vs structural fixes",
      ],
    },
    zh: {
      title: "物流成本优化",
      description:
        "一家区域物流公司三年间营业利润率从 12% 降至 6%。请找出成本驱动因素并提出优化建议。",
      context:
        "客户运营 40 个配送中心，服务 B2B 零售商。燃油、人工和车队租赁是最大成本项。",
      key_issues: [
        "成本瀑布分析",
        "固定成本 vs 可变成本",
        "线路与车队利用率",
        "仓储效率",
        "短期举措 vs 结构性改善",
      ],
    },
  },
  {
    id: "coffee-china",
    type: "market_entry",
    difficulty: "medium",
    en: {
      title: "Coffee brand China market entry",
      description:
        "A U.S. specialty coffee brand wants to enter China. Assess the market opportunity and outline an entry strategy.",
      context:
        "The brand has 200 U.S. stores, premium positioning, ~$7 USD per cup, and no China operations today.",
      key_issues: [
        "Market size and growth",
        "Competition (Starbucks, Luckin, etc.)",
        "Consumer insights",
        "Entry mode (WFOE / JV / franchise)",
        "City prioritization",
      ],
    },
    zh: {
      title: "咖啡品牌进入中国市场",
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
  },
  {
    id: "streaming-growth",
    type: "growth_strategy",
    difficulty: "medium",
    en: {
      title: "Streaming platform growth strategy",
      description:
        "A mid-size streaming service has plateaued at 8M subscribers. Recommend a growth strategy to reach 15M in 24 months.",
      context:
        "Competes with two global giants; strong catalog in documentaries and regional content; ARPU $9/month.",
      key_issues: [
        "Growth drivers (acquisition, retention, ARPU)",
        "Customer segmentation",
        "Content investment tradeoffs",
        "Partnership and distribution",
        "Prioritized roadmap",
      ],
    },
    zh: {
      title: "流媒体平台增长策略",
      description:
        "一家中型流媒体平台订阅用户停留在 800 万。请制定 24 个月内增至 1500 万的增长策略。",
      context:
        "与两家全球巨头竞争；纪录片与本土内容库较强；ARPU 约 9 美元/月。",
      key_issues: [
        "增长驱动（获客、留存、ARPU）",
        "用户细分",
        "内容投资权衡",
        "合作与分发渠道",
        "优先级路线图",
      ],
    },
  },
  {
    id: "pharma-ma",
    type: "mergers_acquisitions",
    difficulty: "hard",
    en: {
      title: "Pharma M&A decision",
      description:
        "Your client, a large pharmaceutical company, is considering acquiring an oncology-focused biotech for $5B. Evaluate whether the deal is worth doing.",
      context:
        "The target has 3 pipeline drugs; 1 is in Phase III with expected launch in ~2 years. Current revenue is ~$200M (mostly licensing).",
      key_issues: [
        "Strategic fit",
        "Pipeline valuation",
        "Deal valuation",
        "Integration risk",
        "Alternatives",
      ],
    },
    zh: {
      title: "制药公司并购决策",
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
  },
  {
    id: "ev-market",
    type: "market_analysis",
    difficulty: "hard",
    en: {
      title: "EV market complex analysis",
      description:
        "An auto OEM must allocate $2B across EV platforms for three regions with different regulation, subsidies, and competition.",
      context:
        "Europe mandates tighten in 2027; China has price wars; North America IRA credits shift quarterly.",
      key_issues: [
        "Market sizing by region",
        "Regulatory and subsidy scenarios",
        "Competitive dynamics",
        "Capability gaps",
        "Portfolio recommendation",
      ],
    },
    zh: {
      title: "电动车市场复杂分析",
      description:
        "一家车企需在三大区域分配 20 亿美元电动车平台预算，各区域监管、补贴与竞争格局差异显著。",
      context:
        "欧洲 2027 年起法规趋严；中国价格战激烈；北美 IRA 补贴按季度调整。",
      key_issues: [
        "分区域市场规模",
        "监管与补贴情景",
        "竞争格局",
        "能力缺口",
        "投资组合建议",
      ],
    },
  },
];

export function getCaseQuestions(locale: CaseLocale): CaseQuestion[] {
  return CATALOG.map((entry) => {
    const content = locale === "zh" ? entry.zh : entry.en;
    return {
      id: entry.id,
      type: entry.type,
      difficulty: entry.difficulty,
      supports_live_mode: supportsLiveMode(entry.id),
      ...content,
    };
  });
}

export function getCaseById(id: string, locale: CaseLocale): CaseQuestion | undefined {
  return getCaseQuestions(locale).find((c) => c.id === id);
}
