"use client";

import { useEffect, useState } from "react";
import CaseSelector from "@/components/case/CaseSelector";
import CaseChat from "@/components/case/CaseChat";
import { apiUrl } from "@/lib/api";
import type { CaseQuestion } from "@/types";

export default function CasePage() {
  const [cases, setCases] = useState<CaseQuestion[]>([]);
  const [loadingCases, setLoadingCases] = useState(true);
  const [casesError, setCasesError] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState<CaseQuestion | null>(null);
  const [sessionKey, setSessionKey] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(apiUrl("/api/cases"));
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "加载题库失败");
        }
        const data = (await res.json()) as { cases: CaseQuestion[] };
        setCases(data.cases ?? []);
      } catch (e) {
        setCasesError(e instanceof Error ? e.message : "加载题库失败");
      } finally {
        setLoadingCases(false);
      }
    })();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Case 拆解练习</h1>
        <p className="mt-2 text-sm text-slate-400">
          选择一道 Case，与 AI 面试官对话。完成后输入「结束评估」获取评分。
        </p>
      </div>

      {!selectedCase ? (
        <section>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-slate-500">选择题目</h2>
          {loadingCases && <p className="text-sm text-slate-500">正在加载题库…</p>}
          {casesError && <p className="mb-4 text-sm text-rose-400">{casesError}</p>}
          {!loadingCases && cases.length > 0 && (
            <CaseSelector
              cases={cases}
              selected={selectedCase}
              onSelect={(c) => { setSelectedCase(c); setSessionKey((k) => k + 1); }}
            />
          )}
          {!loadingCases && !casesError && cases.length === 0 && (
            <p className="text-sm text-slate-500">
              题库为空，请在 Supabase 中运行 <code className="text-sky-400">supabase/migrations</code> 下的 SQL 迁移。
            </p>
          )}
        </section>
      ) : (
        <CaseChat
          key={`${selectedCase.id}-${sessionKey}`}
          caseQuestion={selectedCase}
          onReset={() => { setSelectedCase(null); setSessionKey((k) => k + 1); }}
        />
      )}
    </div>
  );
}
