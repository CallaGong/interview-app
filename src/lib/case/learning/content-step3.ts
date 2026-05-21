import type { CaseLocale } from "@/types/case-locale";
import { pickLocale } from "@/lib/case/learning/content-step1";

export interface FourStepPhase {
  title: { en: string; zh: string };
  duration: { en: string; zh: string };
  summary: { en: string; zh: string };
  dos: { en: string; zh: string }[];
  donts: { en: string; zh: string }[];
}

export const UNIVERSAL_FOUR_STEPS: FourStepPhase[] = [
  {
    title: { en: "1. Restate & clarify (~1 min)", zh: "1. 复述与澄清（约1分钟）" },
    duration: { en: "~1 min", zh: "约1分钟" },
    summary: {
      en: "Confirm you understood the problem; ask 1–2 clarifying questions.",
      zh: "确认你正确理解了问题，问1-2个澄清性问题",
    },
    dos: [
      { en: '"Let me confirm — you are asking about…"', zh: "「让我确认一下，您说的是…」" },
      { en: '"What is the client\'s core business?"', zh: "「请问公司主要业务是？」" },
    ],
    donts: [
      { en: "Ask 10 questions at once", zh: "一次问10个问题" },
      { en: "Start analyzing without clarifying", zh: "不澄清就开始分析" },
    ],
  },
  {
    title: { en: "2. Build your framework (~2 min)", zh: "2. 搭建框架（约2分钟）" },
    duration: { en: "~2 min", zh: "约2分钟" },
    summary: {
      en: "Propose a MECE structure and tell the interviewer your dimensions.",
      zh: "提出MECE分析框架，告诉面试官你打算从哪几个维度切入",
    },
    dos: [
      { en: '"I will analyze A, B, and C"', zh: "「我打算从A、B、C三个维度分析」" },
      { en: "Sketch a simple issue tree", zh: "用纸笔画出框架树" },
    ],
    donts: [
      { en: "Memorize templates blindly", zh: "套用模板硬背" },
      { en: "Too many or too few buckets", zh: "框架太多或太少" },
    ],
  },
  {
    title: { en: "3. Deep dive (~10–15 min)", zh: "3. 深入分析（10-15分钟）" },
    duration: { en: "10–15 min", zh: "10-15分钟" },
    summary: {
      en: "Work through each branch, request data, calculate, test hypotheses.",
      zh: "按框架逐个分析，主动要数据，做计算，提出假设",
    },
    dos: [
      { en: '"For dimension A, do we have data on X?"', zh: "「我先看A维度，请问有关于X的数据吗？」" },
      { en: "Talk through your math aloud", zh: "计算时把过程说出来" },
    ],
    donts: [
      { en: "Ask for data without a plan", zh: "漫无目的地问数据" },
      { en: "Math errors without checking", zh: "算错数还不检查" },
    ],
  },
  {
    title: { en: "4. Recommendation (~2 min)", zh: "4. 总结建议（约2分钟）" },
    duration: { en: "~2 min", zh: "约2分钟" },
    summary: {
      en: "Give a clear conclusion with prioritized actions and impact.",
      zh: "给出明确结论和建议，按优先级排序",
    },
    dos: [
      { en: '"I recommend X first, then Y"', zh: "「基于分析，我建议优先做X，其次做Y」" },
      { en: "Quantify expected impact", zh: "量化预期影响" },
    ],
    donts: [
      { en: "Vague conclusions", zh: "模棱两可的答案" },
      { en: "Too many unprioritized ideas", zh: "建议太多没重点" },
    ],
  },
];

export interface TypeTemplate {
  id: string;
  tabLabel: { en: string; zh: string };
  steps: { en: string; zh: string }[];
  framework: { en: string; zh: string };
  example: { en: string; zh: string };
  strengths: { en: string; zh: string }[];
  traps: { en: string; zh: string }[];
}

export const TYPE_TEMPLATES: TypeTemplate[] = [
  {
    id: "market_sizing",
    tabLabel: { en: "01 Market Sizing", zh: "01 市场估算" },
    steps: [
      { en: "Clarify what you estimate (year/month, geography, inclusions)", zh: "澄清估算对象（年/月？地区？包括什么不包括什么？）" },
      { en: "Choose demand-side or supply-side angle", zh: "选择需求端 or 供给端切入" },
      { en: "Break into estimable sub-units", zh: "拆分到可估算的小单元" },
      { en: "Estimate layer by layer with stated assumptions", zh: "一层层估算，每层说明假设" },
      { en: "Sum up and sanity-check", zh: "加总并做合理性检验" },
    ],
    framework: {
      en: "Top-down (population → filter) vs bottom-up (unit → scale up)",
      zh: "自上而下（总人口出发逐层缩小）vs 自下而上（单用户/单店出发逐层放大）",
    },
    example: {
      en: "Beijing coffee cups/day: ~22M population → 20% drink coffee → 0.8 cups/day → ~3.5M cups/day. Cross-check vs store count.",
      zh: "北京每天咖啡杯数：约2200万人口 → 20%喝咖啡 → 人均0.8杯/天 → 约352万杯/天。可用门店数做交叉验证。",
    },
    strengths: [
      { en: "State assumptions at each step", zh: "明确说出每一步的假设" },
      { en: "Sanity-check against benchmarks", zh: "给出合理性检验" },
      { en: "Discuss sensitivity", zh: "主动讨论敏感度分析" },
    ],
    traps: [
      { en: "Start calculating without clarifying", zh: "不澄清就开始算" },
      { en: "Forget units at the end", zh: "算到最后忘记单位" },
      { en: "No math check", zh: "数字算错不检查" },
    ],
  },
  {
    id: "profitability",
    tabLabel: { en: "02 Profitability", zh: "02 盈利能力" },
    steps: [
      { en: "Clarify profit definition (gross/net, period)", zh: "澄清利润定义（毛利？净利？时间段？）" },
      { en: "Profit tree: Profit = Revenue − Cost", zh: "搭建利润树：利润 = 收入 - 成本" },
      { en: "Revenue = Volume × Price; split cost fixed vs variable", zh: "收入=量×价；成本拆固定+可变" },
      { en: "Find the biggest driver of change", zh: "找出主要变化点" },
      { en: "Root-cause drill-down", zh: "深入分析根因" },
      { en: "Targeted improvement ideas", zh: "提出针对性改善方案" },
    ],
    framework: {
      en: "Profit tree — revenue (volume, price, mix) & cost (fixed, variable)",
      zh: "利润树 — 收入端（销量、价格、组合）& 成本端（固定、可变）",
    },
    example: {
      en: "Retail profit −20%, revenue flat → cost issue. Labor +40%; wage floor +50%. Actions: scheduling, automation, shift mix to delivery.",
      zh: "零售利润-20%、营收持平→成本问题。人工+40%；最低工资+50%。对策：排班优化、自动化、提高外卖占比。",
    },
    strengths: [
      { en: "Hypothesis-driven", zh: "假设驱动思维" },
      { en: "Focus on key drivers", zh: "快速定位关键问题" },
      { en: "Quantified recommendations", zh: "建议可量化" },
    ],
    traps: [
      { en: "Ask for all data upfront", zh: "上来就要一堆数据" },
      { en: "Equal effort everywhere", zh: "不分主次平均用力" },
      { en: 'Vague advice like "improve efficiency"', zh: "建议太泛" },
    ],
  },
  {
    id: "market_entry",
    tabLabel: { en: "03 Market Entry", zh: "03 市场进入" },
    steps: [
      { en: "Clarify entry goal, timeline, budget", zh: "澄清进入目标、时间、预算" },
      { en: "Market attractiveness (size, growth, margin)", zh: "市场吸引力" },
      { en: "Company capabilities", zh: "自身能力评估" },
      { en: "Competitive landscape", zh: "竞争格局" },
      { en: "Entry mode (WFOE/JV/acquisition/franchise)", zh: "进入方式" },
      { en: "Go / No-Go with timing", zh: "明确建议" },
    ],
    framework: {
      en: "3C — Customer, Competitor, Company (+ 4P for execution)",
      zh: "3C — 客户、竞争对手、公司（执行可加4P）",
    },
    example: {
      en: "US specialty coffee → China: market +15% CAGR; Starbucks/Luckin strong but premium niche open; JV + tier-1 first.",
      zh: "美国精品咖啡进中国：市场年增15%+；星巴克/瑞幸强势但精品仍有空间；建议合资+先做一线城市。",
    },
    strengths: [
      { en: "Quantify opportunity", zh: "量化市场机会" },
      { en: "Clear Go/No-Go criteria", zh: "明确决策标准" },
      { en: "Timing & exit path", zh: "考虑时机和退出" },
    ],
    traps: [
      { en: "Opportunity only, no risk", zh: "只讲机会不讲风险" },
      { en: "No clear recommendation", zh: "不给明确建议" },
      { en: "Ignore localization", zh: "忽略本土化" },
    ],
  },
  {
    id: "ma",
    tabLabel: { en: "04 M&A", zh: "04 并购" },
    steps: [
      { en: "Clarify deal rationale", zh: "澄清并购目的" },
      { en: "Strategic fit", zh: "战略协同" },
      { en: "Financials & valuation", zh: "财务与估值" },
      { en: "Integration risk", zh: "整合风险" },
      { en: "Alternatives (build/partner)", zh: "替代方案" },
      { en: "Go / No-Go", zh: "给出建议" },
    ],
    framework: {
      en: "Strategic fit + financial reasonableness + execution risk",
      zh: "战略契合 + 财务合理性 + 执行风险",
    },
    example: {
      en: "$1B oncology biotech: pipeline value ~$8–12B; retention plan for R&D; acquire with earn-outs.",
      zh: "10亿肿瘤生物科技公司：管线NPV约80-120亿；需留任激励；可考虑收购+对赌。",
    },
    strengths: [
      { en: "Quantify synergies", zh: "量化协同效应" },
      { en: "Opportunity cost", zh: "考虑机会成本" },
      { en: "Risk mitigation", zh: "风险缓解方案" },
    ],
    traps: [
      { en: "Finance-only view", zh: "只算财务不看战略" },
      { en: "Ignore integration", zh: "忽略整合风险" },
      { en: "No alternatives", zh: "不考虑替代方案" },
    ],
  },
  {
    id: "growth",
    tabLabel: { en: "05 Growth", zh: "05 增长策略" },
    steps: [
      { en: "Clarify growth target & metric", zh: "澄清增长目标" },
      { en: "Assess current state", zh: "评估现状" },
      { en: "Map growth levers", zh: "列出增长路径" },
      { en: "ROI per lever", zh: "评估可行性与ROI" },
      { en: "Prioritize", zh: "排出优先级" },
      { en: "Execution plan", zh: "执行计划" },
    ],
    framework: {
      en: "Ansoff matrix — penetration, development, product, diversification",
      zh: "Ansoff矩阵 — 渗透、开发、产品、多元化",
    },
    example: {
      en: "8M → 15M users: retention first, then paid acquisition, then lower-tier cities.",
      zh: "800万→1500万：先留存、再投放获客、再下沉市场。",
    },
    strengths: [
      { en: "Quantify each lever", zh: "量化每条路径贡献" },
      { en: "Short/mid/long term", zh: "区分短中长期" },
      { en: "Sustainable growth", zh: "考虑可持续性" },
    ],
    traps: [
      { en: "Only new users", zh: "只想着获新客" },
      { en: "No priorities", zh: "没有优先级" },
      { en: "Ignore ROI", zh: "不考虑成本ROI" },
    ],
  },
  {
    id: "pricing",
    tabLabel: { en: "06 Pricing", zh: "06 定价" },
    steps: [
      { en: "Clarify positioning & segment", zh: "澄清产品定位" },
      { en: "Cost-, competition-, value-based views", zh: "成本/竞争/价值三法" },
      { en: "Pick primary method", zh: "选择主方法" },
      { en: "Price elasticity", zh: "测算价格弹性" },
      { en: "Psychological pricing", zh: "心理定价" },
      { en: "Recommend price band", zh: "给出价格区间" },
    ],
    framework: {
      en: "Price–value matrix (premium, penetration, economy)",
      zh: "价格-价值矩阵",
    },
    example: {
      en: "SaaS for SMB: competitors ¥99–149; value saves ¥200 labor; suggest ¥79 basic / ¥199 pro.",
      zh: "中小企业SaaS：竞品99-149元；价值省200元人工；建议基础版79/专业版199。",
    },
    strengths: [
      { en: "Blend three methods", zh: "三种方法综合考虑" },
      { en: "Tiered pricing", zh: "价格分层" },
      { en: "Long-term price path", zh: "长期价格策略" },
    ],
    traps: [
      { en: "Cost-only", zh: "只看成本" },
      { en: "Copy competitors", zh: "简单跟随竞品" },
      { en: "One price for all", zh: "一个价格打天下" },
    ],
  },
  {
    id: "operations",
    tabLabel: { en: "07 Operations", zh: "07 运营优化" },
    steps: [
      { en: "Clarify pain point", zh: "澄清运营痛点" },
      { en: "Map current process", zh: "画出当前流程" },
      { en: "Find bottleneck", zh: "找出瓶颈" },
      { en: "Root cause", zh: "分析根因" },
      { en: "Improvement plan", zh: "改善方案" },
      { en: "Expected impact", zh: "预期效果" },
    ],
    framework: {
      en: "Process map + benchmark vs best practice",
      zh: "流程图 + 标杆对比",
    },
    example: {
      en: "Peak wait 30 min: order 5m → make 15m → pickup 10m; bottleneck kitchen; add staff + prep + SOP.",
      zh: "高峰等30分钟：点单5分→制作15分→取餐10分；瓶颈在厨房；加人手+备餐+SOP。",
    },
    strengths: [
      { en: "Use time/capacity data", zh: "用数据说话" },
      { en: "True bottleneck focus", zh: "找真正瓶颈" },
      { en: "Executable actions", zh: "方案可执行" },
    ],
    traps: [
      { en: "No process view", zh: "不看流程就建议" },
      { en: "Everything is bottleneck", zh: "把所有问题当瓶颈" },
      { en: "Too theoretical", zh: "方案太理论" },
    ],
  },
];

export const STEP3_INTRO = {
  en: "First master the universal 4-step flow, then open each case-type tab for its template.",
  zh: "先掌握通用四步法，再切换下方 Tab 查看各类型的专属模板。",
};

export function templateLabel(t: TypeTemplate, locale: CaseLocale) {
  return pickLocale(locale, t.tabLabel);
}
