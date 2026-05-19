"use client";

import { getCaseCopy } from "@/lib/case/i18n";
import type { CaseLocale } from "@/types/case-locale";

export type CasePageTab = "practice" | "learn";

interface CasePageTabsProps {
  locale: CaseLocale;
  active: CasePageTab;
  onChange: (tab: CasePageTab) => void;
}

export default function CasePageTabs({
  locale,
  active,
  onChange,
}: CasePageTabsProps) {
  const c = getCaseCopy(locale);
  const tabs: { id: CasePageTab; label: string }[] = [
    { id: "practice", label: c.tabPractice },
    { id: "learn", label: c.tabLearn },
  ];

  return (
    <div className="mb-8 flex gap-1 rounded-xl border border-slate-700/80 bg-slate-900/50 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
            active === tab.id
              ? "bg-sky-600 text-white shadow-md shadow-sky-950/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
