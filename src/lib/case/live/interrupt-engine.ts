/**
 * Live Mode interrupt logic — rule-based signals + message templates.
 */

export type InterruptLanguage = "en" | "zh";

export interface InterruptCheckInput {
  current_input: string;
  time_since_last_ai: number;
  visited_nodes: string[];
  language: InterruptLanguage;
  /** Seconds since user started typing this answer */
  typing_duration_seconds?: number;
}

export interface InterruptRuleResult {
  should_interrupt: boolean;
  forced: boolean;
  interrupt_message: string | null;
  reasons: string[];
}

const INTERRUPT_LINES_EN = [
  "Sorry, drill down on that.",
  "Hold on, what's your assumption?",
  "Can you quantify that?",
  "Let's go back to an earlier point — can you clarify?",
  "I'm not convinced — why?",
] as const;

const INTERRUPT_LINES_ZH = [
  "等一下，请再深入讲一下这一点。",
  "先停一下，你这个假设的依据是什么？",
  "能量化一下吗？",
  "我们回到前面的一个点——你能再澄清一下吗？",
  "我不太信服，为什么？",
] as const;

function roll(probability: number): boolean {
  return Math.random() < probability;
}

function hasKeyword(text: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(text));
}

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function backToPointMessage(visited: string[], lang: InterruptLanguage): string {
  const pool = visited.filter((n) => n !== "intro" && n !== "end");
  const target = pool.length > 0 ? pickRandom(pool) : "intro";
  const label = target.replace(/_/g, " ");
  if (lang === "zh") {
    return `我们回到「${label}」——你当时的主要结论是什么？`;
  }
  return `Let's go back to ${label} — what was your main conclusion there?`;
}

function buildMessage(
  reasons: string[],
  lang: InterruptLanguage,
  visited: string[]
): string {
  if (reasons.includes("assumption")) {
    return lang === "zh"
      ? "先停一下，你这个假设的依据是什么？"
      : "Hold on, what's your assumption?";
  }
  if (reasons.includes("hedging")) {
    return lang === "zh" ? "我不太信服，为什么？" : "I'm not convinced — why?";
  }
  if (reasons.includes("long_answer")) {
    return lang === "zh"
      ? "能量化一下吗？"
      : "Can you quantify that?";
  }
  if (reasons.includes("backtrack")) {
    return backToPointMessage(visited, lang);
  }
  const lines = lang === "zh" ? INTERRUPT_LINES_ZH : INTERRUPT_LINES_EN;
  return pickRandom(lines);
}

/**
 * Deterministic interrupt evaluation (probabilities + forced timeout).
 */
export function evaluateInterruptRules(
  input: InterruptCheckInput
): InterruptRuleResult {
  const text = input.current_input.trim();
  const reasons: string[] = [];
  let forced = false;

  if (input.time_since_last_ai >= 90) {
    reasons.push("timeout");
    forced = true;
  }

  if (text.length > 200 && roll(0.3)) {
    reasons.push("long_answer");
  }

  if (
    hasKeyword(text, [
      /假设/,
      /\bassume\b/i,
      /\bassumption\b/i,
      /\bassuming\b/i,
    ]) &&
    roll(0.5)
  ) {
    reasons.push("assumption");
  }

  if (
    hasKeyword(text, [
      /可能/,
      /\bmaybe\b/i,
      /\bprobably\b/i,
      /\bmight\b/i,
      /\bcould be\b/i,
    ]) &&
    roll(0.4)
  ) {
    reasons.push("hedging");
  }

  const typingSec = input.typing_duration_seconds ?? 0;
  if (typingSec >= 30 && roll(0.2)) {
    reasons.push("random");
  }

  if (reasons.includes("random") && roll(0.5)) {
    reasons.push("backtrack");
  }

  const should_interrupt = forced || reasons.length > 0;
  if (!should_interrupt) {
    return {
      should_interrupt: false,
      forced: false,
      interrupt_message: null,
      reasons: [],
    };
  }

  return {
    should_interrupt: true,
    forced,
    interrupt_message: buildMessage(reasons, input.language, input.visited_nodes),
    reasons,
  };
}

export interface InterruptCheckResult {
  should_interrupt: boolean;
  interrupt_message: string | null;
  reasons?: string[];
}

/** @deprecated Use evaluateInterruptRules + API route */
export function checkInterrupt(_input: {
  sessionId: string;
  caseSlug: string;
  locale: "en" | "zh";
  currentNodeId: string;
  userPartialText: string;
  silenceMs: number;
}): { shouldInterrupt: boolean; reason?: string; suggestedInterviewerLine?: string } {
  return { shouldInterrupt: false };
}
