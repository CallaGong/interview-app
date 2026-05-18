"use client";

import Link from "next/link";
import { useState } from "react";
import InterviewPanel from "@/components/interview/InterviewPanel";
import { INTERVIEW_PAGE_COPY } from "@/lib/interview/i18n";
import type { InterviewLocale } from "@/types/interview";

export default function InterviewPage() {
  const [activeTab, setActiveTab] = useState<InterviewLocale>("en");
  const page = INTERVIEW_PAGE_COPY[activeTab];

  return (
    <div className="mx-auto min-w-0 max-w-6xl overflow-x-hidden px-4 py-8 sm:px-6">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-sm text-slate-300 transition hover:border-slate-600 hover:text-white"
        >
          <span aria-hidden>←</span>
          {page.backHome}
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{page.title}</h1>
        <p className="mt-2 text-sm text-slate-400">{page.description}</p>
      </div>

      <div
        className="mb-6 inline-flex rounded-lg border border-slate-700/80 bg-slate-900/80 p-1"
        role="tablist"
        aria-label={page.tablistLabel}
      >
        {(
          [
            { id: "en" as const, label: INTERVIEW_PAGE_COPY.en.tabEn },
            { id: "zh" as const, label: INTERVIEW_PAGE_COPY.zh.tabZh },
          ] as const
        ).map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-sky-600 text-white shadow-sm shadow-sky-900/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" className="min-w-0">
        <InterviewPanel key={activeTab} locale={activeTab} />
      </div>
    </div>
  );
}
