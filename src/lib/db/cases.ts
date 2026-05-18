import { getCaseQuestions } from "@/lib/cases/catalog";
import type { CaseLocale } from "@/types/case-locale";
import type { CaseQuestion } from "@/types";

/** Case bank is served from the bilingual catalog (en / zh). */
export async function listCaseQuestions(locale: CaseLocale): Promise<CaseQuestion[]> {
  return getCaseQuestions(locale);
}
