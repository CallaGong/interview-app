import type { CaseLocale } from "@/types/case-locale";
import { t, type Bilingual } from "./step3-content";

export interface FrameworkNode {
  label: Bilingual;
  children?: FrameworkNode[];
}

export interface CaseTypeLessonContent {
  caseType: string;
  title: Bilingual;
  summary: Bilingual;
  formula: Bilingual;
  frameworkRoot: FrameworkNode;
  tips: Bilingual[];
  mistakes: Bilingual[];
}

export const CASE_TYPE_LESSONS: CaseTypeLessonContent[] = [
  {
    caseType: "profitability",
    title: { en: "Profitability", zh: "盈利能力分析" },
    summary: {
      en: "The client is making less money — figure out whether revenue fell or costs rose.",
      zh: "客户赚钱出问题了，找出是收入下滑还是成本上升导致的。",
    },
    formula: {
      en: "Profit = Revenue − Cost = (Price × Volume) − (Fixed cost + Variable cost)",
      zh: "利润 = 收入 - 成本 = (价格 × 销量) - (固定成本 + 变动成本)",
    },
    frameworkRoot: {
      label: { en: "Profit problem", zh: "利润问题" },
      children: [
        {
          label: { en: "Revenue", zh: "收入端" },
          children: [
            { label: { en: "Price (unit price, mix)", zh: "价格（单价变化、产品组合）" } },
            { label: { en: "Volume (market size, share)", zh: "销量（市场规模、市场份额）" } },
          ],
        },
        {
          label: { en: "Cost", zh: "成本端" },
          children: [
            { label: { en: "Fixed (rent, equipment, base labor)", zh: "固定成本（租金、设备、人工底薪）" } },
            { label: { en: "Variable (materials, commission, logistics)", zh: "变动成本（原材料、销售提成、物流）" } },
          ],
        },
      ],
    },
    tips: [
      { en: "Start with a 5-year trend — is revenue down or costs up?", zh: "先做 5 年趋势分析，定位是收入跌还是成本涨" },
      { en: "Split by product line, region, or segment to find the bleed", zh: "拆分产品线/区域/客户群，找出「出血点」" },
      { en: "Compare peers — industry issue vs company-specific", zh: "区分行业问题 vs 公司特有问题（对比同行）" },
    ],
    mistakes: [
      { en: "Guessing causes before you have data", zh: "一上来就猜原因，没有数据支撑" },
      { en: "Using only one year — trends stay hidden", zh: "只看一年数据，看不出趋势" },
      { en: "Analyzing revenue and cost in parallel with no priority", zh: "收入和成本同时分析，没有优先级" },
    ],
  },
  {
    caseType: "market_sizing",
    title: { en: "Market Sizing", zh: "市场规模估算" },
    summary: {
      en: "Estimate how big a market is — interviewers care about your logic, not the exact number.",
      zh: "估算某个市场的潜在规模，考察的是逻辑过程，不是答案准不准。",
    },
    formula: {
      en: "Top-down: Market = Population × Penetration × Frequency × Price\nBottom-up: Market = Unit output × Number of units",
      zh: "Top-down：市场规模 = 总人群 × 渗透率 × 频次 × 客单价\nBottom-up：市场规模 = 单个单元产出 × 单元总数",
    },
    frameworkRoot: {
      label: { en: "Market sizing", zh: "市场规模估算" },
      children: [
        {
          label: { en: "Top-down", zh: "Top-down（自上而下）" },
          children: [
            { label: { en: "Total population / market", zh: "总人口/总市场" } },
            { label: { en: "Target segment (age, income, geo)", zh: "目标人群筛选（年龄、收入、地域）" } },
            { label: { en: "Penetration rate", zh: "渗透率（实际使用比例）" } },
            { label: { en: "Behavior (frequency × price)", zh: "消费行为（频次 × 客单价）" } },
          ],
        },
        {
          label: { en: "Bottom-up", zh: "Bottom-up（自下而上）" },
          children: [
            { label: { en: "Unit output (one store / customer / year)", zh: "单个单元产出（一家店/一个客户的年营收）" } },
            { label: { en: "Number of units (stores / customers)", zh: "单元总数（全国门店数/客户数）" } },
          ],
        },
        {
          label: { en: "Cross-check", zh: "交叉验证" },
          children: [
            { label: { en: "Compare both methods — <30% gap is reasonable", zh: "两种方法结果对比，差异 <30% 算合理" } },
          ],
        },
      ],
    },
    tips: [
      { en: "Ask which approach they prefer, or say top-down then bottom-up to validate", zh: "优先问面试官倾向哪种方法，或主动说「我用 top-down，最后用 bottom-up 验证」" },
      { en: "Top-down fits consumer / internet (familiar population stats)", zh: "Top-down 适合消费品/互联网（人口数据熟悉）" },
      { en: "Bottom-up fits retail / B2B (clear unit counts)", zh: "Bottom-up 适合实体店/B2B（单元数据清晰）" },
      { en: "State assumptions each step; use round numbers for mental math", zh: "每一步报出假设，让面试官跟得上；用整数估算方便心算" },
    ],
    mistakes: [
      { en: "Only one method, no cross-check", zh: "只用一种方法，没有交叉验证" },
      { en: "Unrealistic assumptions (e.g. everyone buys)", zh: "假设不合理（如假设所有人都消费）" },
      { en: "Giving the answer without showing the process", zh: "不报过程直接报答案" },
      { en: "Arithmetic errors — practice 1.4B × 20% × 500 style math", zh: "数学算错（提前练习心算 14 亿 × 20% × 500 这类）" },
    ],
  },
  {
    caseType: "market_entry",
    title: { en: "Market Entry", zh: "市场进入" },
    summary: {
      en: "Should the client enter a new market, country, or category? Judge attractiveness and their ability to win.",
      zh: "客户要不要进入一个新市场/新国家/新品类，从市场吸引力 + 客户能力两方面判断。",
    },
    formula: {
      en: "Enter? = Market attractiveness × Client competitiveness × Feasibility of entry",
      zh: "进入决策 = 市场吸引力 × 客户竞争力 × 进入可行性",
    },
    frameworkRoot: {
      label: { en: "Enter new market?", zh: "是否进入新市场" },
      children: [
        {
          label: { en: "Market attractiveness", zh: "市场吸引力" },
          children: [
            { label: { en: "Size & growth", zh: "市场规模 & 增长率" } },
            { label: { en: "Profitability (margin)", zh: "盈利能力（毛利、净利）" } },
            { label: { en: "Competition (players, concentration)", zh: "竞争格局（玩家数量、集中度）" } },
          ],
        },
        {
          label: { en: "Client competitiveness", zh: "客户竞争力" },
          children: [
            { label: { en: "Transferable capabilities", zh: "核心能力是否可迁移" } },
            { label: { en: "Brand / channel / asset edge", zh: "品牌/渠道/资源优势" } },
          ],
        },
        {
          label: { en: "Entry mode", zh: "进入方式" },
          children: [
            { label: { en: "Build / acquire / JV", zh: "自建 / 收购 / 合资" } },
            { label: { en: "Risk vs return", zh: "风险与回报" } },
          ],
        },
      ],
    },
    tips: [
      { en: "Cover all three dimensions — size alone is not enough", zh: "三个维度都要覆盖，不能只看市场有多大" },
      { en: "Define what failure / exit looks like upfront", zh: "主动提出退出/失败的判断标准" },
      { en: "Compare 2–3 entry modes", zh: "考虑 2-3 种进入方式并比较" },
    ],
    mistakes: [
      { en: "Only market sizing, ignoring client capabilities", zh: "只评估市场，忽略客户自身能力" },
      { en: "Not discussing what happens if they do not enter", zh: "不讨论「如果不进入会怎样」" },
      { en: "No quantification (payback, ROI timeline)", zh: "没有量化（如几年回本）" },
    ],
  },
  {
    caseType: "ma",
    title: { en: "M&A", zh: "并购" },
    summary: {
      en: "Should the client buy or sell a company? Focus on strategic fit, financial return, and integration risk.",
      zh: "客户要不要买/卖一家公司，关键看战略契合 + 财务回报 + 整合风险。",
    },
    formula: {
      en: "Deal value = Synergies − Integration cost − Premium paid",
      zh: "并购价值 = 协同效应 - 整合成本 - 溢价",
    },
    frameworkRoot: {
      label: { en: "M&A decision", zh: "M&A 决策" },
      children: [
        {
          label: { en: "Strategic fit", zh: "战略契合" },
          children: [
            { label: { en: "Complement vs overlap", zh: "业务互补 vs 重叠" } },
            { label: { en: "Long-term direction", zh: "是否符合长期方向" } },
          ],
        },
        {
          label: { en: "Financial assessment", zh: "财务评估" },
          children: [
            { label: { en: "Target valuation", zh: "目标公司估值" } },
            { label: { en: "Synergies (revenue & cost)", zh: "协同效应（成本/收入）" } },
            { label: { en: "IRR / payback", zh: "投资回报率（IRR、回本期）" } },
          ],
        },
        {
          label: { en: "Integration risk", zh: "整合风险" },
          children: [
            { label: { en: "Culture", zh: "文化整合" } },
            { label: { en: "Systems & processes", zh: "系统/流程整合" } },
            { label: { en: "Talent retention", zh: "人才流失" } },
          ],
        },
        {
          label: { en: "Alternatives", zh: "替代方案" },
          children: [{ label: { en: "Build vs partner vs buy", zh: "自建 vs 合作" } }],
        },
      ],
    },
    tips: [
      { en: "Ask why this target, not another", zh: "必问「为什么是这家公司，而不是别家」" },
      { en: "Split synergies into revenue and cost", zh: "协同效应要拆成收入协同和成本协同" },
      { en: "Integration fails often — discuss risks explicitly", zh: "整合失败案例极多，必须讨论风险" },
    ],
    mistakes: [
      { en: "Finance only, no strategy", zh: "只看财务不看战略" },
      { en: "Ignoring integration risk", zh: "忽略整合风险" },
      { en: "No compare to not acquiring", zh: "没有比较「不收购的替代方案」" },
    ],
  },
  {
    caseType: "growth",
    title: { en: "Growth Strategy", zh: "增长战略" },
    summary: {
      en: "The client wants to grow — find levers in the current business and in new bets.",
      zh: "客户要增长，从现有业务和新业务两条路径找机会。",
    },
    formula: {
      en: "Growth = Deepen current business + Expand new business (Ansoff Matrix)",
      zh: "增长 = 现有业务深耕 + 新业务扩张（Ansoff Matrix）",
    },
    frameworkRoot: {
      label: { en: "Growth paths", zh: "增长路径" },
      children: [
        {
          label: { en: "Current business", zh: "现有业务" },
          children: [
            { label: { en: "Existing customers (price, repeat, cross-sell)", zh: "现有客户（提价、复购、交叉销售）" } },
            { label: { en: "New customers (penetration)", zh: "新客户（市场渗透）" } },
          ],
        },
        {
          label: { en: "New business", zh: "新业务" },
          children: [
            { label: { en: "New products", zh: "新产品（产品创新）" } },
            { label: { en: "New markets (geography)", zh: "新市场（地域扩张）" } },
            { label: { en: "New business models", zh: "新业务模式（多元化）" } },
          ],
        },
      ],
    },
    tips: [
      { en: "Use Ansoff (product × market) to structure ideas", zh: "用 Ansoff Matrix（产品 × 市场）思考" },
      { en: "Mine current business first — lower cost and risk", zh: "先深挖现有业务（成本低、风险小）再考虑新业务" },
      { en: "Prioritize with a clear short / mid / long timeline", zh: "给出明确的优先级和时间表（短/中/长期）" },
    ],
    mistakes: [
      { en: "Only new bets, ignoring current growth", zh: "只想新业务，忽略现有业务的增长空间" },
      { en: "Not ranking risk across growth levers", zh: "不区分增长方式的风险等级" },
      { en: "No actionable priority order", zh: "没有给出可执行的优先级" },
    ],
  },
  {
    caseType: "pricing",
    title: { en: "Pricing Strategy", zh: "定价策略" },
    summary: {
      en: "How to price a product or service — balance cost floor, competition, and customer value.",
      zh: "怎么给一个产品/服务定价，从成本、竞争、客户价值三方面综合判断。",
    },
    formula: {
      en: "Price = max(Cost floor, Competitor reference, Willingness to pay)",
      zh: "价格 = max(成本底线, 竞争参考价, 客户支付意愿)",
    },
    frameworkRoot: {
      label: { en: "Pricing decision", zh: "定价决策" },
      children: [
        {
          label: { en: "Cost-plus", zh: "成本导向（Cost-plus）" },
          children: [{ label: { en: "Cost + target margin", zh: "成本 + 目标毛利" } }],
        },
        {
          label: { en: "Competitor-based", zh: "竞争导向（Competitor-based）" },
          children: [
            { label: { en: "Direct competitor prices", zh: "直接竞品价格" } },
            { label: { en: "Substitute prices", zh: "替代品价格" } },
          ],
        },
        {
          label: { en: "Value-based", zh: "价值导向（Value-based）" },
          children: [
            { label: { en: "Perceived value", zh: "客户感知价值" } },
            { label: { en: "Willingness to pay (WTP)", zh: "支付意愿（WTP）" } },
          ],
        },
      ],
    },
    tips: [
      { en: "Mention all three lenses; emphasize value-based", zh: "三种方法都要提，重点用 value-based" },
      { en: "Think price elasticity (price up 10% → volume down how much?)", zh: "考虑价格弹性（提价 10% 销量会跌多少）" },
      { en: "Separate new-product pricing vs repricing existing SKUs", zh: "区分新品定价 vs 现有产品调价" },
    ],
    mistakes: [
      { en: "Cost-plus only, ignoring customer value", zh: "只用成本加成法，忽略客户价值" },
      { en: "Ignoring competitor reaction", zh: "不考虑竞品反应" },
      { en: "No price tiers or packaging discussion", zh: "没有讨论价格区间和分级定价" },
    ],
  },
  {
    caseType: "operations",
    title: { en: "Operations", zh: "运营改善" },
    summary: {
      en: "Operations are broken (slow, costly, low quality) — find bottlenecks in the process.",
      zh: "客户的运营出了问题（效率低/成本高/质量差），从流程上找瓶颈。",
    },
    formula: {
      en: "Improvement = More output − Less input − Eliminate waste",
      zh: "运营改善 = 提升产出 - 减少投入 - 消除浪费",
    },
    frameworkRoot: {
      label: { en: "Operations problem", zh: "运营问题" },
      children: [
        {
          label: { en: "Process analysis", zh: "流程分析" },
          children: [
            { label: { en: "End-to-end process map", zh: "端到端流程图" } },
            { label: { en: "Bottleneck identification", zh: "瓶颈环节识别" } },
          ],
        },
        {
          label: { en: "Inputs", zh: "资源投入" },
          children: [
            { label: { en: "People (productivity, training)", zh: "人（人效、培训）" } },
            { label: { en: "Materials & equipment", zh: "物（设备、原材料）" } },
            { label: { en: "Information (systems, data)", zh: "信息（系统、数据）" } },
          ],
        },
        {
          label: { en: "Outputs", zh: "产出衡量" },
          children: [
            { label: { en: "Efficiency (units / time)", zh: "效率（产量/单位时间）" } },
            { label: { en: "Quality (defect rate)", zh: "质量（次品率）" } },
            { label: { en: "Unit cost", zh: "成本（单位成本）" } },
          ],
        },
      ],
    },
    tips: [
      { en: "Map the process first — find the constraint", zh: "先画流程图，找瓶颈（理论 of constraints）" },
      { en: "Systemic issue vs local fix", zh: "区分系统性问题 vs 局部问题" },
      { en: "Set measurable targets (e.g. +20% throughput)", zh: "提出可量化的改善目标（如效率提升 20%）" },
    ],
    mistakes: [
      { en: "Solutions before process analysis", zh: "上来就提解决方案，没分析流程" },
      { en: "Optimizing one step, not the full flow", zh: "只看一个环节，没看全流程" },
      { en: "Vague improvement goals", zh: "改善目标不可衡量" },
    ],
  },
];

export function getLessonByCaseType(caseType: string): CaseTypeLessonContent | undefined {
  return CASE_TYPE_LESSONS.find((l) => l.caseType === caseType);
}

export { t };
