import type { CaseLocale } from "@/types/case-locale";

const WORD_MINUTES_EN: Record<string, number> = {
  one: 1,
  a: 1,
  an: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
};

const WORD_MINUTES_ZH: Record<string, number> = {
  一: 1,
  二: 2,
  两: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
  十: 10,
};

function parseMinuteToken(token: string, language: CaseLocale): number | null {
  const t = token.trim().toLowerCase();
  if (/^\d+$/.test(t)) {
    const n = Number.parseInt(t, 10);
    if (n >= 1 && n <= 30) return n;
    return null;
  }
  if (language === "zh") {
    if (t === "半") return null;
    return WORD_MINUTES_ZH[token.trim()] ?? null;
  }
  if (t === "couple") return 2;
  return WORD_MINUTES_EN[t] ?? null;
}

/** Avoid matching 两个月 / 三个月 (months, not minutes). */
function isMonthFalsePositive(text: string, matchIndex: number): boolean {
  const window = text.slice(matchIndex, matchIndex + 12);
  return /个月/.test(window);
}

type Pattern = { re: RegExp; group: number };

const EN_PATTERNS: Pattern[] = [
  { re: /\btake\s+(\d+|one|two|a)\s+minutes?\b/gi, group: 1 },
  { re: /\bgive\s+you\s+(\d+|one|two|a)\s+minutes?\b/gi, group: 1 },
  { re: /\byou\s+have\s+(\d+|one|two|a)\s+minutes?\b/gi, group: 1 },
  { re: /\b(\d+|one|two)\s+minutes?\s+to\s+think\b/gi, group: 1 },
  { re: /\bspend\s+(\d+|one|two|a)\s+minutes?\b/gi, group: 1 },
  { re: /\ba\s+couple\s+of\s+minutes\b/gi, group: 0 },
];

const ZH_PATTERNS: Pattern[] = [
  { re: /给你\s*([一二两三四五六七八九十\d]+)\s*分钟/g, group: 1 },
  { re: /([一二两三四五六七八九十\d]+)\s*分钟(?:时间|想一下|思考|考虑|整理)?/g, group: 1 },
  { re: /用\s*([一二两三四五六七八九十\d]+)\s*分钟/g, group: 1 },
  { re: /花\s*([一二两三四五六七八九十\d]+)\s*分钟/g, group: 1 },
];

function matchPatterns(
  text: string,
  patterns: Pattern[],
  language: CaseLocale
): number | null {
  for (const { re, group } of patterns) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      if (isMonthFalsePositive(text, m.index)) continue;

      let minutes: number | null = null;
      if (group === 0 && /couple/i.test(m[0])) {
        minutes = 2;
      } else {
        minutes = parseMinuteToken(m[group] ?? "", language);
      }
      if (minutes != null) return minutes * 60;
    }
  }
  return null;
}

/**
 * Extract promised thinking time in seconds from interviewer message.
 * Returns null if no short minute-level promise detected.
 */
export function extractTimePromise(
  message: string,
  language: CaseLocale
): number | null {
  const text = message
    .replace(/\[NODE:[^\]]+\]/g, "")
    .replace(/\[CHART:\{[\s\S]*?\}\]/g, "")
    .trim();

  if (!text) return null;

  if (language === "zh") {
    const zh = matchPatterns(text, ZH_PATTERNS, language);
    if (zh != null) return zh;
  }

  return matchPatterns(text, EN_PATTERNS, language);
}
