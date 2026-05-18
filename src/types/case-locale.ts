export type CaseLocale = "en" | "zh";

export const DEFAULT_CASE_LOCALE: CaseLocale = "en";

export function parseCaseLocale(value: string | null | undefined): CaseLocale {
  return value === "zh" ? "zh" : "en";
}
