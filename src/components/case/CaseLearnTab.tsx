"use client";

import { getCaseCopy } from "@/lib/case/i18n";
import type { CaseLocale } from "@/types/case-locale";

interface CaseLearnTabProps {
  locale: CaseLocale;
}

export default function CaseLearnTab({ locale }: CaseLearnTabProps) {
  const c = getCaseCopy(locale);

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-slate-700/80 bg-slate-900/60 p-8 text-center sm:p-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">
        {c.learnComingSoon}
      </p>
      <h2 className="mt-3 text-2xl font-bold text-white">{c.learnTitle}</h2>
      <p className="mt-4 text-sm leading-relaxed text-slate-400">{c.learnIntro}</p>
      <ul className="mt-8 space-y-3 text-left">
        {c.learnTopics.map((topic) => (
          <li
            key={topic}
            className="flex items-start gap-3 rounded-lg border border-slate-700/60 bg-slate-800/40 px-4 py-3 text-sm text-slate-200"
          >
            <span className="mt-0.5 shrink-0 text-sky-400" aria-hidden>
              ◆
            </span>
            {topic}
          </li>
        ))}
      </ul>
    </div>
  );
}
