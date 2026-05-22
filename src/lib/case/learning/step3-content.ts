import type { CaseLocale } from "@/types/case-locale";

export const MIN_DRILL_TYPES_FOR_STEP4 = 3;

export type DrillPhaseId = 1 | 2 | 3 | 4;

export interface Bilingual {
  en: string;
  zh: string;
}

export function t(locale: CaseLocale, text: Bilingual): string {
  return locale === "zh" ? text.zh : text.en;
}

export interface ClarifyOption {
  id: string;
  text: Bilingual;
  isGood: boolean;
}

export interface ChoiceOption {
  id: string;
  text: Bilingual;
  isCorrect: boolean;
  feedback: Bilingual;
}

export interface Phase1Content {
  casePrompt: Bilingual;
  instruction: Bilingual;
  clarifyPurpose: Bilingual;
  options: ClarifyOption[];
  goodSummary: Bilingual;
  badSummary: Bilingual;
  phrases: Bilingual[];
}

export interface Phase2Content {
  infoReceived: Bilingual;
  instruction: Bilingual;
  options: ChoiceOption[];
  phrases: Bilingual[];
}

export interface Phase3Content {
  infoReceived: Bilingual;
  instruction: Bilingual;
  options: ChoiceOption[];
  phrases: Bilingual[];
}

export interface Phase4Content {
  infoReceived: Bilingual;
  instruction: Bilingual;
  referenceAnswer: Bilingual;
  criteria: Bilingual[];
}

export interface CaseDrill {
  id: string;
  typeLabel: Bilingual;
  phases: {
    phase1: Phase1Content;
    phase2: Phase2Content;
    phase3: Phase3Content;
    phase4: Phase4Content;
  };
}

export const PHASE_LABELS: Record<DrillPhaseId, Bilingual> = {
  1: { en: "Read & clarify", zh: "读题 + 澄清" },
  2: { en: "Build framework", zh: "搭框架" },
  3: { en: "Deep dive", zh: "深入分析" },
  4: { en: "Recommendation", zh: "给建议" },
};

export const PHRASE_LIBRARY: { title: Bilingual; phrases: Bilingual[] }[] = [
  {
    title: { en: "Opening clarification", zh: "开场澄清" },
    phrases: [
      { en: "Let me confirm — …", zh: "让我先确认一下…" },
      { en: "When you say X, do you mean A or B?", zh: "请问您说的 X 是指 A 还是 B？" },
      { en: "Is this across all regions, or concentrated in some areas?", zh: "这个情况是在所有区域都有，还是集中在某些地区？" },
    ],
  },
  {
    title: { en: "Framework", zh: "搭框架" },
    phrases: [
      { en: "I'll analyze this from … dimensions: …", zh: "我打算从 … 个维度来分析这个问题：…" },
      { en: "Given …, I'll prioritize … first.", zh: "由于…，我会优先看…" },
      { en: "My initial hypothesis is … — does that direction sound reasonable?", zh: "我的初步假设是…，您觉得这个方向合理吗？" },
    ],
  },
  {
    title: { en: "Ask for data", zh: "要数据" },
    phrases: [
      { en: "Do we have data on …?", zh: "请问有关于 … 的数据吗？" },
      { en: "Is this vs last year or vs budget?", zh: "这个数字是和去年同期相比，还是和预算相比？" },
      { en: "How do competitors compare on this?", zh: "竞争对手在这方面的情况是怎样的？" },
    ],
  },
  {
    title: { en: "Recommendation", zh: "给建议" },
    phrases: [
      { en: "Based on my analysis, I recommend X first because …", zh: "基于我的分析，我建议优先做 X，原因是…" },
      { en: "This should improve … by about …", zh: "这个方案预计可以带来 … 的改善" },
      { en: "Short term we can …; long term …", zh: "短期内可以…，长期来看…" },
    ],
  },
];

const profitability: CaseDrill = {
  id: "profitability",
  typeLabel: { en: "Profitability", zh: "盈利能力" },
  phases: {
    phase1: {
      casePrompt: {
        en: "Our client is a national fast-food chain. Net profit fell 25% over two years while revenue is roughly flat.",
        zh: "我们的客户是一家全国连锁的快餐品牌，过去两年净利润下降了25%，但营收基本持平。",
      },
      instruction: {
        en: "Select the clarifying questions you would ask at the start (choose all that apply).",
        zh: "勾选你会在开场问的澄清问题（可多选）。",
      },
      clarifyPurpose: {
        en: "At the opening, clarify problem scope and key constraints — not every detail.",
        zh: "Case 开场澄清的目的是确认问题范围和关键约束，而不是收集所有信息。",
      },
      options: [
        { id: "p1", text: { en: "Was the decline gradual or sudden?", zh: "利润下降是逐渐的还是某个时间点突然发生的？" }, isGood: true },
        { id: "p2", text: { en: "Mainly dine-in or delivery?", zh: "客户主要是堂食还是外卖？" }, isGood: true },
        { id: "p3", text: { en: "How are competitors' profits trending?", zh: "竞争对手的利润情况怎样？" }, isGood: true },
        { id: "p4", text: { en: "What is the client's target stock price?", zh: "客户的目标股价是多少？" }, isGood: false },
        { id: "p5", text: { en: "What are the CEO's KPIs this year?", zh: "CEO 今年的 KPI 是什么？" }, isGood: false },
        { id: "p6", text: { en: "How many employees does the company have?", zh: "公司有多少员工？" }, isGood: false },
      ],
      goodSummary: {
        en: "The first three help define scope and where to look first.",
        zh: "前三个是好问题，帮助定位问题范围。",
      },
      badSummary: {
        en: "The last three are too detailed or irrelevant for an opening.",
        zh: "后三个不适合在 Case 开场问，太细节或不相关。",
      },
      phrases: [
        { en: "Let me confirm — is the decline net profit or gross profit?", zh: "让我先确认一下，您说的利润下降是净利润还是毛利润？" },
        { en: "Is this decline across all stores, or only certain regions?", zh: "请问这个下降是在所有门店都有，还是集中在某些区域？" },
        { en: "Are competitors seeing a similar pattern?", zh: "竞争对手是否有类似的情况？" },
      ],
    },
    phase2: {
      infoReceived: {
        en: "Interviewer says: decline was gradual; mostly dine-in; competitors' profits are stable.",
        zh: "面试官说：利润逐渐下降，堂食为主，竞争对手利润稳定。",
      },
      instruction: {
        en: "Which framework fits best as your main structure?",
        zh: "哪个框架最适合作为主结构？",
      },
      options: [
        {
          id: "a",
          text: { en: "A: By region (North / South / East / West)", zh: "框架A：从地区维度分析（北区/南区/东区/西区）" },
          isCorrect: false,
          feedback: {
            en: "Too granular before you know the big driver.",
            zh: "太细节，应该先定位大方向再深入。",
          },
        },
        {
          id: "b",
          text: { en: "B: Profit tree (revenue vs cost)", zh: "框架B：从利润树分析（收入端 vs 成本端）" },
          isCorrect: true,
          feedback: {
            en: "Correct — flat revenue points to the cost side; profit tree is direct.",
            zh: "框架B是正确的，因为营收持平说明问题在成本端，利润树最直接。",
          },
        },
        {
          id: "c",
          text: { en: "C: By quarter (Q1–Q4)", zh: "框架C：从时间维度分析（Q1/Q2/Q3/Q4）" },
          isCorrect: false,
          feedback: {
            en: "Useful later, but not as the primary framework.",
            zh: "可以辅助用，但不应该作为主框架。",
          },
        },
      ],
      phrases: [
        {
          en: "I'll use two buckets: revenue and cost. Since revenue is flat, I'll focus on cost first.",
          zh: "我打算从两个维度分析：收入端和成本端。由于营收持平，我会先重点看成本端。",
        },
        {
          en: "My framework is … — does this direction work for you?",
          zh: "我的框架是这样的…您觉得这个方向合理吗？",
        },
      ],
    },
    phase3: {
      infoReceived: {
        en: "Interviewer says: labor cost rose ~40%; other costs are stable.",
        zh: "面试官告诉你：人工成本上升了40%，其他成本基本稳定。",
      },
      instruction: {
        en: "What should you do next?",
        zh: "下一步该做什么？",
      },
      options: [
        {
          id: "a",
          text: { en: "Immediately recommend cutting labor cost", zh: "立刻建议客户降低人工成本" },
          isCorrect: false,
          feedback: { en: "Too fast — root cause not confirmed.", zh: "太仓促，还没找到根因就给建议。" },
        },
        {
          id: "b",
          text: { en: "Ask: headcount up or wage per person up?", zh: "问：人工成本上升是因为人数增加还是单人工资上涨？" },
          isCorrect: true,
          feedback: { en: "Correct — labor = headcount × wage; keep drilling.", zh: "正确：人工成本=人数×单价，要继续拆解找根因。" },
        },
        {
          id: "c",
          text: { en: "Ask: how many stores?", zh: "问：公司有多少个门店？" },
          isCorrect: false,
          feedback: { en: "Not the priority now.", zh: "现在不是关键问题。" },
        },
        {
          id: "d",
          text: { en: "Start calculating total cost dollars", zh: "开始计算总成本金额" },
          isCorrect: false,
          feedback: { en: "Too early for full math.", zh: "现在计算太早。" },
        },
      ],
      phrases: [
        {
          en: "Labor cost = headcount × wage. Which driver changed more?",
          zh: "人工成本可以拆解为：人数 × 单人成本。请问是哪个方向变化更明显？",
        },
        {
          en: "Is this nationwide or only in some regions?",
          zh: "我想进一步确认，这个上涨是全国所有门店都有，还是集中在某些地区？",
        },
      ],
    },
    phase4: {
      infoReceived: {
        en: "Interviewer says: headcount flat; local minimum wage rose ~50%.",
        zh: "面试官告诉你：人数没变，是当地最低工资标准上涨了50%导致的。",
      },
      instruction: {
        en: "Write your recommendation in 1–3 sentences (your own words), then compare with the sample.",
        zh: "用你自己的话写出 1–3 句建议，然后对照参考答案。",
      },
      referenceAnswer: {
        en: "Wage inflation is largely external. I'd tackle three levers: (1) raise labor productivity, (2) grow delivery share (higher labor efficiency), (3) modest price increases. I'd prioritize delivery first for speed and impact.",
        zh: "由于工资上涨是外部因素，难以直接控制，我建议从三个方向应对：第一，提升单人产出；第二，增加外卖比例（人效更高）；第三，适度调价。我优先建议从外卖入手，因为影响最大且可快速执行。",
      },
      criteria: [
        { en: "Clear recommendation (not vague)", zh: "有没有给出明确的建议（不要模棱两可）" },
        { en: "Priorities ranked", zh: "有没有优先级排序" },
        { en: "Reasons or quantified impact", zh: "有没有量化或说明理由" },
      ],
    },
  },
};

/** Build other drills with the same 4-phase pattern */
function mkDrill(
  id: string,
  typeLabel: Bilingual,
  casePrompt: Bilingual,
  p1Good: ClarifyOption[],
  p1Bad: ClarifyOption[],
  p2Info: Bilingual,
  p2CorrectId: string,
  p2Opts: ChoiceOption[],
  p3Info: Bilingual,
  p3CorrectId: string,
  p3Opts: ChoiceOption[],
  p4Info: Bilingual,
  p4Ref: Bilingual
): CaseDrill {
  return {
    id,
    typeLabel,
    phases: {
      phase1: {
        casePrompt,
        instruction: {
          en: "Select clarifying questions you would ask at the start.",
          zh: "勾选你会在开场问的澄清问题。",
        },
        clarifyPurpose: {
          en: "Confirm scope, definition, and constraints — not deep operational trivia.",
          zh: "确认范围、定义和约束，而不是过细的内部信息。",
        },
        options: [...p1Good, ...p1Bad],
        goodSummary: { en: "Good questions define what you are estimating or deciding.", zh: "好问题能界定你要估算或决策的范围。" },
        badSummary: { en: "Avoid off-topic or premature detail.", zh: "避免无关或过早的细节问题。" },
        phrases: [
          { en: "Let me confirm the scope — …", zh: "让我先确认一下范围 — …" },
          { en: "Should we include/exclude …?", zh: "我们需要包括/排除 … 吗？" },
        ],
      },
      phase2: {
        infoReceived: p2Info,
        instruction: { en: "Pick the best primary framework.", zh: "选择最合适的主框架。" },
        options: p2Opts,
        phrases: [
          { en: "I'll structure this as …", zh: "我打算这样搭建框架：…" },
          { en: "Given …, I'll start with …", zh: "鉴于…，我会先从…入手。" },
        ],
      },
      phase3: {
        infoReceived: p3Info,
        instruction: { en: "What is the best next move?", zh: "下一步最好做什么？" },
        options: p3Opts,
        phrases: [
          { en: "Could we get data on …?", zh: "请问有关于 … 的数据吗？" },
          { en: "I'd like to split this into …", zh: "我想把这个问题拆成 …" },
        ],
      },
      phase4: {
        infoReceived: p4Info,
        instruction: {
          en: "Write 1–3 sentences of recommendation, then review the sample.",
          zh: "写 1–3 句建议，再对照参考答案。",
        },
        referenceAnswer: p4Ref,
        criteria: [
          { en: "Clear recommendation", zh: "明确建议" },
          { en: "Priorities", zh: "有优先级" },
          { en: "Rationale", zh: "有理由" },
        ],
      },
    },
  };
}

export const CASE_DRILLS: CaseDrill[] = [
  profitability,
  mkDrill(
    "market_sizing",
    { en: "Market Sizing", zh: "市场估算" },
    {
      en: "Estimate how many cups of coffee are sold in Beijing per day.",
      zh: "估算北京每天卖出多少杯咖啡。",
    },
    [
      { id: "g1", text: { en: "Daily or annual cups?", zh: "估算每天还是每年？" }, isGood: true },
      { id: "g2", text: { en: "Include chains + independents?", zh: "包括连锁和独立店吗？" }, isGood: true },
      { id: "g3", text: { en: "Include home consumption?", zh: "包括在家喝的咖啡吗？" }, isGood: true },
    ],
    [
      { id: "b1", text: { en: "CEO's five-year vision?", zh: "CEO 五年愿景？" }, isGood: false },
      { id: "b2", text: { en: "Starbucks stock price?", zh: "星巴克股价？" }, isGood: false },
    ],
    { en: "Scope is daily cups in Beijing; exclude instant at home unless stated.", zh: "范围是北京每日杯数；除非说明，不含在家速溶。" },
    "b",
    [
      { id: "a", text: { en: "Top-down from population", zh: "从人口自上而下" }, isCorrect: true, feedback: { en: "Standard approach.", zh: "标准做法。" } },
      { id: "b", text: { en: "Only count Starbucks stores", zh: "只数星巴克门店" }, isCorrect: false, feedback: { en: "Too narrow.", zh: "范围太窄。" } },
      { id: "c", text: { en: "Start with national GDP", zh: "从全国 GDP 开始" }, isCorrect: false, feedback: { en: "Too broad.", zh: "范围太大。" } },
    ],
    { en: "You have population ~22M; assume % coffee drinkers and cups/day.", zh: "人口约2200万；假设喝咖啡比例和每日杯数。" },
    "b",
    [
      { id: "a", text: { en: "Jump to final number without assumptions", zh: "不做假设直接报数" }, isCorrect: false, feedback: { en: "State assumptions.", zh: "要说明假设。" } },
      { id: "b", text: { en: "Sanity-check vs number of stores", zh: "用门店数量做交叉验证" }, isCorrect: true, feedback: { en: "Good sense-check.", zh: "很好的合理性检验。" } },
      { id: "c", text: { en: "Ask competitor marketing budget", zh: "问竞品营销预算" }, isCorrect: false, feedback: { en: "Irrelevant.", zh: "不相关。" } },
    ],
    { en: "You have a reasoned estimate; interviewer nods.", zh: "你给出有依据的估算，面试官表示认可。" },
    {
      en: "I'd estimate ~3–4M cups/day using population × penetration × cups per drinker, with a store-based sanity check.",
      zh: "我会用人口×渗透率×人均杯数估算约300-400万杯/天，并用门店数做交叉验证。",
    }
  ),
  mkDrill(
    "market_entry",
    { en: "Market Entry", zh: "市场进入" },
    {
      en: "A U.S. specialty coffee brand wants to enter China. Should they?",
      zh: "某美国精品咖啡品牌想进入中国市场，是否应该进入？",
    },
    [
      { id: "g1", text: { en: "Target cities or nationwide?", zh: "目标城市还是全国？" }, isGood: true },
      { id: "g2", text: { en: "Timeline and investment budget?", zh: "时间表和投资预算？" }, isGood: true },
      { id: "g3", text: { en: "Success definition (share / profit)?", zh: "成功的定义（份额/利润）？" }, isGood: true },
    ],
    [{ id: "b1", text: { en: "Founder's favorite city?", zh: "创始人最喜欢的城市？" }, isGood: false }],
    { en: "Premium segment still growing; Starbucks/Luckin dominate mass market.", zh: "精品细分仍在增长；星巴克/瑞幸主导大众市场。" },
    "b",
    [
      { id: "a", text: { en: "3C: Customer, Competitor, Company", zh: "3C：客户、竞争、公司" }, isCorrect: true, feedback: { en: "Classic market entry.", zh: "经典市场进入框架。" } },
      { id: "b", text: { en: "Only pricing analysis", zh: "只做定价分析" }, isCorrect: false, feedback: { en: "Too narrow.", zh: "太窄。" } },
      { id: "c", text: { en: "Only store layout", zh: "只分析门店装修" }, isCorrect: false, feedback: { en: "Irrelevant.", zh: "不相关。" } },
    ],
    { en: "Strong brand fit for tier-1 premium; JV lowers risk.", zh: "品牌适合一线精品；合资可降低风险。" },
    "b",
    [
      { id: "a", text: { en: "Say yes without risks", zh: "不谈风险直接说进入" }, isCorrect: false, feedback: { en: "Need risks.", zh: "要谈风险。" } },
      { id: "b", text: { en: "Quantify addressable market × share", zh: "量化可获得市场×份额" }, isCorrect: true, feedback: { en: "Good.", zh: "很好。" } },
      { id: "c", text: { en: "Ask U.S. store count only", zh: "只问美国门店数" }, isCorrect: false, feedback: { en: "Off scope.", zh: "偏离主题。" } },
    ],
    { en: "Regulation and localization are key constraints.", zh: "监管和本土化是关键约束。" },
    {
      en: "Recommend phased entry: JV in tier-1, 18-month pilot, Go if unit economics work.",
      zh: "建议分阶段进入：一线城市合资、18个月试点，单元经济可行则推进。",
    }
  ),
  mkDrill(
    "ma",
    { en: "M&A", zh: "并购" },
    {
      en: "A pharma company considers acquiring an oncology biotech for $1B. Worth it?",
      zh: "某药企考虑10亿美元收购一家肿瘤药公司，是否值得？",
    },
    [
      { id: "g1", text: { en: "Strategic rationale for deal?", zh: "并购的战略目的？" }, isGood: true },
      { id: "g2", text: { en: "Pipeline stage and timing?", zh: "管线阶段和时间表？" }, isGood: true },
    ],
    [{ id: "b1", text: { en: "CEO's age?", zh: "CEO 年龄？" }, isGood: false }],
    { en: "Target has 3 assets; one in Phase III.", zh: "目标有3款在研药，1款三期。" },
    "b",
    [
      { id: "a", text: { en: "Strategic + financial + integration", zh: "战略+财务+整合" }, isCorrect: true, feedback: { en: "Standard M&A.", zh: "标准并购框架。" } },
      { id: "b", text: { en: "Only logo redesign", zh: "只谈 Logo 更换" }, isCorrect: false, feedback: { en: "No.", zh: "不对。" } },
      { id: "c", text: { en: "Only HR policies", zh: "只谈 HR 政策" }, isCorrect: false, feedback: { en: "No.", zh: "不对。" } },
    ],
    { en: "Valuation range $800M–1.2B; integration risk on R&D talent.", zh: "估值区间合理；研发人才整合是风险。" },
    "b",
    [
      { id: "a", text: { en: "Recommend acquire without valuation", zh: "不做估值就建议收购" }, isCorrect: false, feedback: { en: "Need valuation.", zh: "需要估值。" } },
      { id: "b", text: { en: "Compare build vs buy", zh: "对比自建 vs 收购" }, isCorrect: true, feedback: { en: "Good.", zh: "很好。" } },
      { id: "c", text: { en: "Ask office location", zh: "问办公室地址" }, isCorrect: false, feedback: { en: "Irrelevant.", zh: "不相关。" } },
    ],
    { en: "Retention plan for key scientists is critical.", zh: "关键科学家留任计划很重要。" },
    {
      en: "Proceed if price within NPV range; add earn-outs and retention packages.",
      zh: "若价格在 NPV 区间内可推进；建议对赌与留任激励。",
    }
  ),
  mkDrill(
    "growth",
    { en: "Growth Strategy", zh: "增长策略" },
    {
      en: "A streaming platform is stuck at 8M subscribers; goal 15M in 24 months.",
      zh: "某流媒体平台用户停留在800万，目标24个月内增至1500万。",
    },
    [
      { id: "g1", text: { en: "8M paid or total accounts?", zh: "800万是付费还是总账户？" }, isGood: true },
      { id: "g2", text: { en: "Revenue vs user growth priority?", zh: "优先用户还是收入？" }, isGood: true },
    ],
    [{ id: "b1", text: { en: "Office rent?", zh: "办公室租金？" }, isGood: false }],
    { en: "Churn high in mass market; content is differentiator.", zh: "大众市场流失高；内容是差异化。" },
    "b",
    [
      { id: "a", text: { en: "Ansoff growth levers", zh: "Ansoff 增长路径" }, isCorrect: true, feedback: { en: "Good.", zh: "合适。" } },
      { id: "b", text: { en: "Only cut costs", zh: "只砍成本" }, isCorrect: false, feedback: { en: "Wrong type.", zh: "题型不对。" } },
      { id: "c", text: { en: "Only legal structure", zh: "只谈法律架构" }, isCorrect: false, feedback: { en: "No.", zh: "不对。" } },
    ],
    { en: "CAC rising; retention is cheapest growth.", zh: "获客成本上升；留存是最便宜的增长。" },
    "b",
    [
      { id: "a", text: { en: "Only buy ads", zh: "只买广告" }, isCorrect: false, feedback: { en: "One lever only.", zh: "只有一招。" } },
      { id: "b", text: { en: "Size impact of retention vs acquisition", zh: "量化留存 vs 获客贡献" }, isCorrect: true, feedback: { en: "Good.", zh: "很好。" } },
      { id: "c", text: { en: "Rename the app", zh: "给 App 改名" }, isCorrect: false, feedback: { en: "No.", zh: "不对。" } },
    ],
    { en: "Budget limits paid media.", zh: "预算限制付费投放。" },
    {
      en: "Prioritize retention + content, then paid growth, then tier-2 expansion.",
      zh: "优先留存与内容，再加大投放，再下沉市场。",
    }
  ),
  mkDrill(
    "pricing",
    { en: "Pricing Strategy", zh: "定价策略" },
    {
      en: "How should a new B2B SaaS product be priced?",
      zh: "某新 B2B SaaS 产品应该如何定价？",
    },
    [
      { id: "g1", text: { en: "Target customer segment?", zh: "目标客户是谁？" }, isGood: true },
      { id: "g2", text: { en: "Competitor price range?", zh: "竞品价格区间？" }, isGood: true },
    ],
    [{ id: "b1", text: { en: "Founder's hobby?", zh: "创始人爱好？" }, isGood: false }],
    { en: "SMB segment; saves ~$200/mo labor; competitors $99–149.", zh: "中小企业客户；每月省约200美元人工；竞品99-149。" },
    "b",
    [
      { id: "a", text: { en: "Cost + competition + value", zh: "成本+竞争+价值" }, isCorrect: true, feedback: { en: "Standard.", zh: "标准。" } },
      { id: "b", text: { en: "Only logo color", zh: "只谈 Logo 颜色" }, isCorrect: false, feedback: { en: "No.", zh: "不对。" } },
      { id: "c", text: { en: "Random price", zh: "随便定价" }, isCorrect: false, feedback: { en: "No.", zh: "不对。" } },
    ],
    { en: "Willingness-to-pay survey shows $120 value.", zh: "支付意愿调研显示价值约120。" },
    "b",
    [
      { id: "a", text: { en: "Copy cheapest competitor", zh: "抄最低价竞品" }, isCorrect: false, feedback: { en: "Too simple.", zh: "太简单。" } },
      { id: "b", text: { en: "Tiered basic vs pro", zh: "基础版+专业版分层" }, isCorrect: true, feedback: { en: "Good.", zh: "很好。" } },
      { id: "c", text: { en: "Free forever", zh: "永远免费" }, isCorrect: false, feedback: { en: "No business model.", zh: "没有商业模式。" } },
    ],
    { en: "Margin target 60%.", zh: "毛利目标60%。" },
    {
      en: "Launch at $79 basic / $199 pro to penetrate, anchored on $200 value.",
      zh: "推出79基础版/199专业版渗透定价，锚定200价值。",
    }
  ),
  mkDrill(
    "operations",
    { en: "Operations", zh: "运营优化" },
    {
      en: "Chain stores have 30-minute peak waits. How to improve?",
      zh: "某连锁门店高峰期排队30分钟，如何优化？",
    },
    [
      { id: "g1", text: { en: "Peak hours definition?", zh: "高峰时段定义？" }, isGood: true },
      { id: "g2", text: { en: "Which step is slowest?", zh: "哪个环节最慢？" }, isGood: true },
    ],
    [{ id: "b1", text: { en: "Uniform color?", zh: "制服颜色？" }, isGood: false }],
    { en: "Order 5m → make 15m → pickup 10m; kitchen is bottleneck.", zh: "点单5分→制作15分→取餐10分；厨房是瓶颈。" },
    "b",
    [
      { id: "a", text: { en: "Process map + bottleneck", zh: "流程图+瓶颈" }, isCorrect: true, feedback: { en: "Correct.", zh: "正确。" } },
      { id: "b", text: { en: "Only marketing", zh: "只做营销" }, isCorrect: false, feedback: { en: "Wrong.", zh: "不对。" } },
      { id: "c", text: { en: "Only finance", zh: "只做财务" }, isCorrect: false, feedback: { en: "Wrong.", zh: "不对。" } },
    ],
    { en: "Kitchen understaffed at peak; SOP inconsistent.", zh: "高峰厨房人手不足；SOP不统一。" },
    "b",
    [
      { id: "a", text: { en: "Close stores earlier", zh: "提早关店" }, isCorrect: false, feedback: { en: "Avoid demand.", zh: "回避需求。" } },
      { id: "b", text: { en: "Peak staffing + prep + SOP", zh: "高峰加人+备餐+SOP" }, isCorrect: true, feedback: { en: "Executable.", zh: "可执行。" } },
      { id: "c", text: { en: "Rebuild brand", zh: "重塑品牌" }, isCorrect: false, feedback: { en: "Off topic.", zh: "跑题。" } },
    ],
    { en: "Wait time hurts NPS.", zh: "等待影响满意度。" },
    {
      en: "Add peak labor, standardize prep, mobile order — target 15 min wait.",
      zh: "高峰增员、标准化备餐、推进移动点单——目标等待15分钟。",
    }
  ),
];

export function getDrillById(id: string): CaseDrill | undefined {
  return CASE_DRILLS.find((d) => d.id === id);
}
