"use client";

import {
  getLessonByCaseType,
  t,
  type FrameworkNode,
} from "@/lib/case/learning/step3-lessons";
import type { CaseLocale } from "@/types/case-locale";

interface CaseTypeLessonProps {
  caseType: string;
  locale: CaseLocale;
  onStartDrill: () => void;
  onBack: () => void;
}

const ui = {
  en: {
    back: "← Back to case types",
    formula: "Core formula",
    framework: "Standard framework",
    tips: "Key tips",
    mistakes: "Common mistakes",
    start: "Got it — start practice →",
  },
  zh: {
    back: "← 返回题型选择",
    formula: "核心公式",
    framework: "标准 Framework",
    tips: "关键诀窍",
    mistakes: "常见错误",
    start: "我学会了，开始演练 →",
  },
} as const;

export default function CaseTypeLesson({
  caseType,
  locale,
  onStartDrill,
  onBack,
}: CaseTypeLessonProps) {
  const lesson = getLessonByCaseType(caseType);
  const copy = ui[locale];

  if (!lesson) {
    return (
      <p className="text-sm text-slate-400">
        {locale === "zh" ? "暂无该类型的学习内容。" : "No lesson for this case type."}
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="shrink-0 text-sm text-slate-400 transition hover:text-white"
        >
          {copy.back}
        </button>
        <h2 className="text-right text-lg font-semibold text-white sm:text-xl">
          {t(locale, lesson.title)}
        </h2>
      </div>

      <blockquote className="border-l-4 border-sky-500/70 pl-4 text-lg leading-relaxed text-slate-100 sm:text-xl">
        {t(locale, lesson.summary)}
      </blockquote>

      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {copy.formula}
        </h3>
        <div className="rounded-xl border border-sky-500/40 bg-slate-950/80 px-4 py-5 sm:px-6">
          <p className="whitespace-pre-line font-mono text-base font-medium leading-relaxed text-sky-100 sm:text-lg">
            {t(locale, lesson.formula)}
          </p>
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {copy.framework}
        </h3>
        <div className="overflow-x-auto rounded-xl border border-slate-700/80 bg-slate-950/50 p-4 sm:p-6">
          <FrameworkTree node={lesson.frameworkRoot} locale={locale} depth={0} />
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {copy.tips}
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {lesson.tips.map((tip, i) => (
            <div
              key={i}
              className="flex gap-3 rounded-lg border border-slate-700/80 bg-slate-900/60 p-4"
            >
              <span className="text-lg" aria-hidden>
                💡
              </span>
              <p className="text-sm leading-relaxed text-slate-200">{t(locale, tip)}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {copy.mistakes}
        </h3>
        <ul className="space-y-2">
          {lesson.mistakes.map((item, i) => (
            <li
              key={i}
              className="flex gap-3 rounded-lg border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-100/90"
            >
              <span aria-hidden>❌</span>
              <span>{t(locale, item)}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex justify-center pt-2 pb-4">
        <button
          type="button"
          onClick={onStartDrill}
          className="w-full max-w-md rounded-xl bg-sky-600 px-8 py-4 text-center text-base font-semibold text-white shadow-lg shadow-sky-900/40 transition hover:bg-sky-500 sm:text-lg"
        >
          {copy.start}
        </button>
      </div>
    </div>
  );
}

function FrameworkTree({
  node,
  locale,
  depth,
}: {
  node: FrameworkNode;
  locale: CaseLocale;
  depth: number;
}) {
  const hasChildren = node.children && node.children.length > 0;
  const label = t(locale, node.label);

  if (depth === 0) {
    return (
      <div className="framework-tree">
        <div className="inline-flex rounded-lg border border-sky-500/50 bg-sky-500/15 px-4 py-2 text-sm font-semibold text-sky-100">
          {label}
        </div>
        {hasChildren && (
          <div className="mt-4 flex flex-col gap-4 pl-2 sm:pl-4">
            {node.children!.map((child, i) => (
              <FrameworkTree key={i} node={child} locale={locale} depth={1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-start gap-0">
        <div className="flex w-6 shrink-0 flex-col items-center sm:w-8">
          <div className="h-3 w-px bg-slate-600" />
          <div className="h-px w-full min-w-[1.5rem] bg-slate-600 sm:min-w-[2rem]" />
        </div>
        <div className="min-w-0 flex-1 pb-1">
          <div
            className={`inline-flex max-w-full rounded-md border px-3 py-1.5 text-sm ${
              depth === 1
                ? "border-slate-500/60 bg-slate-800/90 font-medium text-slate-100"
                : "border-slate-700 bg-slate-900/80 text-slate-300"
            }`}
          >
            {label}
          </div>
          {hasChildren && (
            <div className="mt-2 border-l border-slate-600/80 pl-4 sm:pl-6">
              {node.children!.map((child, i) => (
                <FrameworkTree key={i} node={child} locale={locale} depth={depth + 1} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
