"use client";

import Link from "next/link";
import { useState } from "react";
import ResumePanel from "@/components/resume/ResumePanel";
import { RESUME_PAGE_COPY } from "@/lib/resume/i18n";
import type { ResumeLocale } from "@/types/resume";
import {
  RESUME_DIMENSION_KEYS_EN,
  RESUME_DIMENSION_KEYS_ZH,
  RESUME_DIMENSION_LABELS_EN,
  RESUME_DIMENSION_LABELS_ZH,
} from "@/types/resume";

export default function ResumePage() {
  const [activeTab, setActiveTab] = useState<ResumeLocale>("en");
  const page = RESUME_PAGE_COPY[activeTab];

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
            { id: "en" as const, label: RESUME_PAGE_COPY.en.tabEn },
            { id: "zh" as const, label: RESUME_PAGE_COPY.zh.tabZh },
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
        {activeTab === "en" ? (
          <ResumePanel
            key="en"
            locale="en"
            analyzeEndpoint="/api/resume/analyze-en"
            dimensionKeys={[...RESUME_DIMENSION_KEYS_EN]}
            dimensionLabels={RESUME_DIMENSION_LABELS_EN}
            standardLabel={RESUME_PAGE_COPY.en.standardLabel}
            emptyHint={RESUME_PAGE_COPY.en.emptyHint}
          />
        ) : (
          <ResumePanel
            key="zh"
            locale="zh"
            analyzeEndpoint="/api/resume/analyze-zh"
            dimensionKeys={[...RESUME_DIMENSION_KEYS_ZH]}
            dimensionLabels={RESUME_DIMENSION_LABELS_ZH}
            standardLabel={RESUME_PAGE_COPY.zh.standardLabel}
            emptyHint={RESUME_PAGE_COPY.zh.emptyHint}
          />
        )}
      </div>
    </div>
  );
}
