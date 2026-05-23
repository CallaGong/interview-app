/**
 * Branching case trees for Live Interview Mode.
 */

export type BranchNodeType =
  | "opening"
  | "framework_evaluation"
  | "drill_down"
  | "synthesis"
  | "closing"
  | "data_injection"
  | "end";

export interface BranchDataInjection {
  triggerAfterTurns: number;
  type: "chart" | "table" | "text";
  content: Record<string, unknown>;
}

export interface BranchNode {
  type: BranchNodeType;
  aiPrompt: string;
  expectedTopics?: string[];
  branches?: Record<string, string>;
  dataInjection?: BranchDataInjection;
}

export interface BranchingTree {
  rootNode: string;
  nodes: Record<string, BranchNode>;
  criticalPaths: string[][];
}

export const PROFITABILITY_TREE: BranchingTree = {
  rootNode: "intro",
  nodes: {
    intro: {
      type: "opening",
      aiPrompt:
        "Introduce the case, ask user for clarifying questions. Wait for 1-2 clarifying questions before proceeding.",
      expectedTopics: ["timeframe", "revenue", "cost", "industry"],
      branches: {
        asks_revenue: "revenue_drill",
        asks_cost: "cost_drill",
        asks_both: "framework_check",
        no_clarification: "framework_check",
      },
    },
    framework_check: {
      type: "framework_evaluation",
      aiPrompt:
        "Ask user to present their framework. Evaluate if it's MECE. Interrupt if they ramble more than 3 minutes.",
      expectedTopics: ["revenue side", "cost side", "external factors"],
      branches: {
        good_framework: "revenue_drill",
        weak_framework: "framework_pushback",
        comprehensive: "data_injection_1",
      },
    },
    framework_pushback: {
      type: "framework_evaluation",
      aiPrompt:
        "Push back on a weak framework. Ask them to reorganize into MECE buckets (revenue, cost, external).",
      expectedTopics: ["MECE", "revenue", "cost"],
      branches: {
        improved: "revenue_drill",
        still_weak: "revenue_drill",
      },
    },
    data_injection_1: {
      type: "data_injection",
      aiPrompt:
        "Acknowledge strong framework. Share high-level market context, then ask which branch to prioritize first.",
      expectedTopics: ["prioritization"],
      branches: {
        revenue: "revenue_drill",
        cost: "cost_drill",
      },
    },
    revenue_drill: {
      type: "drill_down",
      aiPrompt:
        "Drill into revenue. Ask: 'Walk me through how you'd analyze revenue specifically?' Push for quantification.",
      expectedTopics: ["revenue drivers", "same-store sales", "mix"],
      dataInjection: {
        triggerAfterTurns: 2,
        type: "chart",
        content: {
          chartType: "line",
          title: "Revenue trend 2019-2024",
          data: [
            { year: 2019, revenue: 100 },
            { year: 2020, revenue: 95 },
            { year: 2021, revenue: 92 },
            { year: 2022, revenue: 85 },
            { year: 2023, revenue: 78 },
            { year: 2024, revenue: 72 },
          ],
          insight_hidden:
            "Revenue declining 7-9% annually, accelerating in recent years",
        },
      },
      branches: {
        identifies_decline: "deep_root_cause",
        misses_trend: "redirect_to_trend",
      },
    },
    redirect_to_trend: {
      type: "drill_down",
      aiPrompt:
        "Redirect candidate to the revenue trend. Ask what pattern they see and what it implies.",
      expectedTopics: ["decline", "trend"],
      branches: {
        identifies_decline: "deep_root_cause",
        still_weak: "revenue_drill",
      },
    },
    cost_drill: {
      type: "drill_down",
      aiPrompt: "Drill into cost. Push for fixed vs variable breakdown.",
      expectedTopics: ["fixed cost", "variable cost", "labor", "rent"],
      branches: {
        good_breakdown: "data_injection_2",
        weak: "cost_pushback",
      },
    },
    cost_pushback: {
      type: "drill_down",
      aiPrompt:
        "Challenge weak cost thinking. Ask them to split fixed vs variable and name top 3 cost buckets.",
      expectedTopics: ["fixed", "variable"],
      branches: {
        improved: "data_injection_2",
      },
    },
    data_injection_2: {
      type: "data_injection",
      aiPrompt:
        "Share cost data mentally (labor +40%, rent flat). Ask which lever matters most and why.",
      dataInjection: {
        triggerAfterTurns: 1,
        type: "table",
        content: {
          title: "Cost structure (% of revenue)",
          rows: [
            { category: "COGS", pct: 42, yoy: "+2%" },
            { category: "Labor", pct: 28, yoy: "+40%" },
            { category: "Rent", pct: 12, yoy: "0%" },
            { category: "Other", pct: 8, yoy: "+5%" },
          ],
          insight_hidden: "Labor is the primary profit drag",
        },
      },
      branches: {
        labor_focus: "deep_root_cause",
        scattered: "deep_root_cause",
      },
    },
    deep_root_cause: {
      type: "synthesis",
      aiPrompt:
        "Now ask user to hypothesize root causes. Challenge each hypothesis.",
      expectedTopics: ["root cause", "hypothesis", "competition", "e-commerce"],
      branches: {
        recommendation_ready: "final_recommendation",
      },
    },
    final_recommendation: {
      type: "closing",
      aiPrompt:
        "Ask user for final recommendation. Push for: action, timeline, risks.",
      expectedTopics: ["recommendation", "timeline", "risks"],
      branches: { done: "end" },
    },
    end: {
      type: "end",
      aiPrompt: "Thank the candidate and close the interview briefly.",
      branches: {},
    },
  },
  criticalPaths: [
    [
      "intro",
      "framework_check",
      "revenue_drill",
      "deep_root_cause",
      "final_recommendation",
    ],
    ["intro", "framework_check", "cost_drill", "deep_root_cause", "final_recommendation"],
  ],
};

export const MARKET_ENTRY_TREE: BranchingTree = {
  rootNode: "intro",
  nodes: {
    intro: {
      type: "opening",
      aiPrompt:
        "Introduce the China market entry case. Encourage 1-2 clarifying questions (scope, timeline, capital).",
      expectedTopics: ["geography", "timeline", "investment", "positioning"],
      branches: {
        asks_market: "market_sizing",
        asks_competition: "competition_drill",
        asks_both: "framework_check",
        no_clarification: "framework_check",
      },
    },
    framework_check: {
      type: "framework_evaluation",
      aiPrompt:
        "Ask for entry framework (market attractiveness, competition, capabilities, entry mode, rollout). Check MECE.",
      expectedTopics: [
        "market size",
        "competition",
        "consumer",
        "entry mode",
        "cities",
      ],
      branches: {
        good_framework: "market_sizing",
        weak_framework: "framework_pushback",
        comprehensive: "market_data_drop",
      },
    },
    framework_pushback: {
      type: "framework_evaluation",
      aiPrompt:
        "Push back on incomplete framework. Require market, competition, consumer, mode, and sequencing.",
      expectedTopics: ["MECE", "entry mode"],
      branches: {
        improved: "market_sizing",
      },
    },
    market_data_drop: {
      type: "data_injection",
      aiPrompt:
        "Acknowledge structure. Offer to start with market sizing or competition — let candidate choose.",
      branches: {
        market: "market_sizing",
        competition: "competition_drill",
      },
    },
    market_sizing: {
      type: "drill_down",
      aiPrompt:
        "Drill market sizing. Push for TAM/SAM/SOM logic and assumptions. Challenge numbers.",
      expectedTopics: ["TAM", "growth", "premium segment"],
      dataInjection: {
        triggerAfterTurns: 2,
        type: "chart",
        content: {
          chartType: "bar",
          title: "China specialty coffee market ($B)",
          data: [
            { year: 2020, value: 4.2 },
            { year: 2021, value: 5.1 },
            { year: 2022, value: 6.0 },
            { year: 2023, value: 7.2 },
            { year: 2024, value: 8.5 },
          ],
          insight_hidden: "~15% CAGR; premium segment ~25% of market",
        },
      },
      branches: {
        solid_sizing: "competition_drill",
        weak_sizing: "sizing_pushback",
      },
    },
    sizing_pushback: {
      type: "drill_down",
      aiPrompt:
        "Challenge weak sizing. Ask them to bound population, penetration, and spend per capita.",
      branches: {
        improved: "competition_drill",
      },
    },
    competition_drill: {
      type: "drill_down",
      aiPrompt:
        "Drill competition (Starbucks, Luckin, local brands). Ask for differentiation and white space.",
      expectedTopics: ["Starbucks", "Luckin", "differentiation", "price"],
      branches: {
        clear_view: "entry_mode",
        vague: "competition_pushback",
      },
    },
    competition_pushback: {
      type: "drill_down",
      aiPrompt:
        "Push for a 2x2 or structured competitor comparison. Where can a $7 premium brand win?",
      branches: {
        improved: "entry_mode",
      },
    },
    entry_mode: {
      type: "drill_down",
      aiPrompt:
        "Discuss entry mode: WFOE vs JV vs franchise. Probe control, speed, and capital needs.",
      expectedTopics: ["WFOE", "JV", "franchise", "control"],
      branches: {
        reasoned_choice: "city_prioritization",
        weak: "entry_pushback",
      },
    },
    entry_pushback: {
      type: "drill_down",
      aiPrompt:
        "Challenge entry mode without tradeoffs. Ask for risks of their preferred mode.",
      branches: {
        improved: "city_prioritization",
      },
    },
    city_prioritization: {
      type: "drill_down",
      aiPrompt:
        "Ask which cities to enter first and why. Push for sequencing and unit economics.",
      expectedTopics: ["tier-1", "tier-2", "pilot", "sequencing"],
      branches: {
        clear_plan: "synthesis",
        weak: "city_pushback",
      },
    },
    city_pushback: {
      type: "drill_down",
      aiPrompt:
        "Ask for a phased rollout: pilot city, success metrics, then scale.",
      branches: {
        improved: "synthesis",
      },
    },
    synthesis: {
      type: "synthesis",
      aiPrompt:
        "Synthesize: Is China attractive? Biggest risks? What would make you walk away?",
      expectedTopics: ["risks", "attractiveness", "mitigation"],
      branches: {
        recommendation_ready: "final_recommendation",
      },
    },
    final_recommendation: {
      type: "closing",
      aiPrompt:
        "Ask for final go/no-go and 3-year plan. Push for milestones, investment, and risks.",
      expectedTopics: ["go/no-go", "timeline", "investment", "risks"],
      branches: { done: "end" },
    },
    end: {
      type: "end",
      aiPrompt: "Close the interview professionally.",
      branches: {},
    },
  },
  criticalPaths: [
    [
      "intro",
      "framework_check",
      "market_sizing",
      "competition_drill",
      "entry_mode",
      "city_prioritization",
      "synthesis",
      "final_recommendation",
    ],
  ],
};

export const CASE_BRANCHING_TREES: Record<string, BranchingTree> = {
  "retail-profit": PROFITABILITY_TREE,
  "coffee-china": MARKET_ENTRY_TREE,
};

export const LIVE_MODE_CASE_SLUGS = new Set(Object.keys(CASE_BRANCHING_TREES));

export function getBranchingTree(caseSlug: string): BranchingTree | undefined {
  return CASE_BRANCHING_TREES[caseSlug];
}

export function supportsLiveMode(caseSlug: string): boolean {
  return LIVE_MODE_CASE_SLUGS.has(caseSlug);
}

/** All node ids on any critical path (deduped). */
export function getCriticalNodeIds(tree: BranchingTree): Set<string> {
  const ids = new Set<string>();
  for (const path of tree.criticalPaths) {
    for (const id of path) ids.add(id);
  }
  return ids;
}

export function getNodeLabel(nodeId: string): string {
  return nodeId.replace(/_/g, " ");
}
