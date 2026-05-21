export interface DialogueSegment {
  id: string;
  turns: DialogueTurn[];
}

export interface DialogueTurn {
  speaker: "interviewer" | "candidate";
  text: { en: string; zh: string };
  annotation?: { en: string; zh: string; tone: "good" | "tip" };
}

export interface DialogueDemo {
  id: string;
  label: { en: string; zh: string };
  segments: DialogueSegment[];
}

export const DIALOGUE_DEMOS: DialogueDemo[] = [
  {
    id: "profitability",
    label: { en: "Profitability — Fast food chain", zh: "盈利能力 — 快餐连锁" },
    segments: [
      {
        id: "s1",
        turns: [
          {
            speaker: "interviewer",
            text: {
              en: "Our client is a national fast-food chain. Net profit fell 25% over two years while revenue is flat. The CEO wants to know why and how to fix it.",
              zh: "客户是一家全国连锁快餐品牌，过去两年净利润下降25%，营收基本持平。CEO想知道问题出在哪里，应该怎么改善。",
            },
          },
          {
            speaker: "candidate",
            text: {
              en: "I'd like to confirm three things first: Was the decline gradual or sudden? Is the business mainly dine-in or delivery? How are competitors' profits trending?",
              zh: "我想先确认几个问题：下降是逐渐的还是突然的？业务主要是堂食还是外卖？竞争对手利润情况如何？",
            },
            annotation: {
              tone: "good",
              en: "Excellent — three sharp clarifying questions before analyzing.",
              zh: "优秀！没有急着分析，而是先做了三个关键澄清。",
            },
          },
          {
            speaker: "interviewer",
            text: {
              en: "Gradual decline; ~70% dine-in, 30% delivery. Competitors' profits are stable.",
              zh: "是逐渐下降的，约70%堂食、30%外卖。竞争对手利润基本稳定。",
            },
          },
        ],
      },
      {
        id: "s2",
        turns: [
          {
            speaker: "candidate",
            text: {
              en: "Since revenue is flat but profit fell, the issue is likely on the cost side. I'll split costs into fixed (rent, labor) and variable (food, marketing). Which cost block changed the most?",
              zh: "营收持平但利润下降，问题应该在成本端。我想从固定成本（租金、人工）和可变成本（食材、营销）入手。请问哪一块成本变化最明显？",
            },
            annotation: {
              tone: "good",
              en: "Quickly locked onto costs with a MECE split.",
              zh: "通过澄清快速锁定成本端，并提出了MECE拆解。",
            },
          },
          {
            speaker: "interviewer",
            text: {
              en: "Labor cost rose about 40%; other costs are roughly stable.",
              zh: "人工成本上升了约40%，其他基本稳定。",
            },
          },
        ],
      },
      {
        id: "s3",
        turns: [
          {
            speaker: "candidate",
            text: {
              en: "A 40% labor increase is significant. Labor cost = headcount × wage. Did headcount rise, wages rise, or both?",
              zh: "人工上升40%非常显著。人工成本 = 人数 × 工资。是人数增加、工资上涨，还是两者都有？",
            },
            annotation: {
              tone: "good",
              en: "Continued MECE drill-down instead of jumping to conclusions.",
              zh: "继续用MECE拆解，没有直接跳到结论。",
            },
          },
          {
            speaker: "interviewer",
            text: {
              en: "Headcount is flat; mainly wage increases. Local minimum wage rose ~50% over two years.",
              zh: "人数没变，主要是工资上涨。当地最低工资标准两年涨了约50%。",
            },
          },
        ],
      },
      {
        id: "s4",
        turns: [
          {
            speaker: "candidate",
            text: {
              en: "That's largely external. We can: (1) raise labor productivity, (2) shift mix toward delivery (higher labor efficiency), (3) pass some cost to price. What's delivery margin vs dine-in?",
              zh: "这主要是外部因素。应对可以从三方面：提升人效、提高外卖占比、部分转嫁给定价。请问外卖利润率比堂食高多少？",
            },
            annotation: {
              tone: "good",
              en: "Moved from analysis to solutions and kept testing assumptions.",
              zh: "没有停留在分析问题，主动提出方案并继续验证假设。",
            },
          },
          {
            speaker: "interviewer",
            text: {
              en: "Delivery labor efficiency is ~2× dine-in; margin is ~8 pts higher.",
              zh: "外卖单店人效约是堂食的2倍，利润率高8个百分点。",
            },
          },
        ],
      },
      {
        id: "s5",
        turns: [
          {
            speaker: "candidate",
            text: {
              en: "Recommendation: grow delivery as the core lever.\n\n1) Short term (6 mo): lift delivery share from 30% → 50% via platform promos & loyalty.\n2) Mid term (1 yr): pilot delivery-only kitchens (lower rent/headcount).\n3) Long term (2 yr): target 70% delivery with smaller dine-in footprints.\n\nThis should restore margins toward pre-decline levels.",
              zh: "建议：以发展外卖为核心策略。\n\n1）短期（6个月）：外卖占比从30%提到50%，通过平台投放和会员体系。\n2）中期（1年）：试点纯外卖厨房，租金和人工更低。\n3）长期（2年）：外卖占比目标70%，门店转型为「外卖中心+小堂食」。\n\n预计可将利润率恢复到下降前水平。",
            },
            annotation: {
              tone: "good",
              en: "Strong close — phased, quantified, actionable recommendation.",
              zh: "优秀收尾！量化、分阶段、可执行的建议，明确了预期效果。",
            },
          },
        ],
      },
    ],
  },
  {
    id: "market_sizing",
    label: { en: "Market Sizing — Coffee in Beijing", zh: "市场估算 — 北京咖啡" },
    segments: [
      {
        id: "s1",
        turns: [
          {
            speaker: "interviewer",
            text: {
              en: "Estimate how many cups of coffee are sold in Beijing per day.",
              zh: "估算北京每天卖出多少杯咖啡。",
            },
          },
          {
            speaker: "candidate",
            text: {
              en: "I'll estimate annual cups then divide by 365. Clarifying: include all coffee (chain + indie), exclude instant at home?",
              zh: "我会先估算年销量再除以365。确认一下：包括连锁和独立咖啡馆，不包括在家冲速溶？",
            },
            annotation: {
              tone: "good",
              en: "Clarifies scope before calculating.",
              zh: "计算前先澄清范围。",
            },
          },
        ],
      },
      {
        id: "s2",
        turns: [
          {
            speaker: "candidate",
            text: {
              en: "Beijing ~22M people. Assume 20% drink coffee regularly (~4.4M). Average 0.8 cups/day → 3.5M cups/day. Sanity check: ~3,500 stores × ~1,000 cups ≈ 3.5M — consistent.",
              zh: "北京约2200万人，假设20%常喝咖啡（约440万），人均0.8杯/天 → 约352万杯/天。检验：约3500家店×1000杯≈350万，数量级一致。",
            },
            annotation: {
              tone: "good",
              en: "Layered assumptions plus cross-check.",
              zh: "分层假设并做了交叉验证。",
            },
          },
        ],
      },
    ],
  },
  {
    id: "market_entry",
    label: { en: "Market Entry — Coffee brand in China", zh: "市场进入 — 咖啡品牌进中国" },
    segments: [
      {
        id: "s1",
        turns: [
          {
            speaker: "interviewer",
            text: {
              en: "A U.S. specialty coffee brand wants to enter China. Should they?",
              zh: "一家美国精品咖啡品牌想进入中国市场，是否应该进入？",
            },
          },
          {
            speaker: "candidate",
            text: {
              en: "I'll assess market attractiveness, competition, our edge, and entry mode. Target segment and timeline?",
              zh: "我会从市场吸引力、竞争、自身优势、进入方式分析。请问目标客群和时间表？",
            },
            annotation: {
              tone: "good",
              en: "Structured opening with a clarifying question.",
              zh: "结构化开场并做了澄清。",
            },
          },
        ],
      },
      {
        id: "s2",
        turns: [
          {
            speaker: "candidate",
            text: {
              en: "China coffee retail grows ~15% annually; premium segment still has white space vs Starbucks/Luckin. Recommend JV with local partner, tier-1 cities first, 18-month pilot before scale.",
              zh: "中国咖啡零售年增约15%；相对星巴克/瑞幸，精品细分仍有空间。建议与当地伙伴合资，先做一线城市，18个月试点再扩张。",
            },
            annotation: {
              tone: "good",
              en: "Clear Go recommendation with mode, timing, and risk control.",
              zh: "明确的进入建议，含模式、节奏和风险控制。",
            },
          },
        ],
      },
    ],
  },
];

export const STEP4_INTRO = {
  en: "Watch a full case dialogue unfold step by step. Annotations highlight strong moves and tips.",
  zh: "逐步展开完整 Case 对话。右侧注释标出亮点与可改进之处。",
};
