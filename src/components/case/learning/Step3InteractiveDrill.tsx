"use client";

import { useCallback, useMemo, useState } from "react";
import CaseTypeLesson from "@/components/case/learning/CaseTypeLesson";
import {
  CASE_DRILLS,
  MIN_DRILL_TYPES_FOR_STEP4,
  PHASE_LABELS,
  PHRASE_LIBRARY,
  type CaseDrill,
  type DrillPhaseId,
  t,
} from "@/lib/case/learning/step3-content";
import type { CaseLocale } from "@/types/case-locale";

type Step3Screen = "select" | "lesson" | "drill";

interface Step3InteractiveDrillProps {
  locale: CaseLocale;
  onComplete: () => void;
  onSkipToNext: () => void;
}

type TypeSession = {
  currentPhase: DrillPhaseId;
  phasesDone: Record<DrillPhaseId, boolean>;
};

function emptySession(): TypeSession {
  return {
    currentPhase: 1,
    phasesDone: { 1: false, 2: false, 3: false, 4: false },
  };
}

export default function Step3InteractiveDrill({
  locale,
  onComplete,
  onSkipToNext,
}: Step3InteractiveDrillProps) {
  const step3Ui =
    locale === "zh"
      ? {
          intro:
            "选一种题型，按四个阶段模拟真实面试对话。边练边学，右侧可随时查看句型模板。",
          practicing: "正在练习",
          typeDone: "这种类型练完了！可以切换其他类型继续练。",
          progress: (n: number, total: number) => `已完成 ${n} / ${total} 种类型演练`,
          needMore: (left: number) => `建议再练 ${left} 种（可随时进入 Step 4）`,
          skipPhase: "跳过本阶段",
          submit: "提交",
          nextPhase: "下一阶段",
          retry: "重新本阶段",
          yourAnswer: "你的建议",
          reference: "参考答案",
          usablePhrases: "可以直接用的句型",
          criteriaTitle: "好建议的标准",
          phraseTitle: "句型模板库",
          continueStep4: "进入 Step 4",
          selectOne: "请选择一个选项",
          selectSome: "请至少勾选一个选项",
          pickType: "选择要练习的题型",
        }
      : {
          intro:
            "Pick a case type and walk through four interview phases. Practice what to say — phrase bank on the right.",
          practicing: "Practicing",
          typeDone: "This type is complete! Switch to another type to keep practicing.",
          progress: (n: number, total: number) => `${n} / ${total} case types practiced`,
          needMore: (left: number) => `${left} more type(s) recommended (Step 4 is always available)`,
          skipPhase: "Skip this phase",
          submit: "Submit",
          nextPhase: "Next phase",
          retry: "Retry this phase",
          yourAnswer: "Your recommendation",
          reference: "Sample answer",
          usablePhrases: "Phrases you can use",
          criteriaTitle: "What makes a strong recommendation",
          phraseTitle: "Phrase bank",
          continueStep4: "Continue to Step 4",
          selectOne: "Select one option",
          selectSome: "Select at least one option",
          pickType: "Choose a case type to practice",
        };

  const [screen, setScreen] = useState<Step3Screen>("select");
  const [activeTypeId, setActiveTypeId] = useState<string | null>(null);
  const [lessonViewed, setLessonViewed] = useState<Set<string>>(new Set());
  const [sessions, setSessions] = useState<Record<string, TypeSession>>({});
  const [finishedTypes, setFinishedTypes] = useState<Set<string>>(new Set());

  const [p1Selected, setP1Selected] = useState<Set<string>>(new Set());
  const [p2Selected, setP2Selected] = useState<string | null>(null);
  const [p3Selected, setP3Selected] = useState<string | null>(null);
  const [p4Text, setP4Text] = useState("");
  const [phaseSubmitted, setPhaseSubmitted] = useState(false);

  const drill = useMemo(
    () =>
      activeTypeId
        ? CASE_DRILLS.find((d) => d.id === activeTypeId) ?? CASE_DRILLS[0]
        : CASE_DRILLS[0],
    [activeTypeId]
  );

  const session = activeTypeId ? sessions[activeTypeId] ?? emptySession() : emptySession();
  const currentPhase = session.currentPhase;

  const resetPhaseInputs = useCallback(() => {
    setP1Selected(new Set());
    setP2Selected(null);
    setP3Selected(null);
    setP4Text("");
    setPhaseSubmitted(false);
  }, []);

  const selectType = (id: string) => {
    if (screen === "drill" && activeTypeId === id) return;
    setActiveTypeId(id);
    resetPhaseInputs();
    setLessonViewed((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setScreen("lesson");
  };

  const startDrill = () => {
    if (!activeTypeId) return;
    setLessonViewed((prev) => new Set(prev).add(activeTypeId));
    setScreen("drill");
  };

  const backToSelect = () => {
    setScreen("select");
    setActiveTypeId(null);
    resetPhaseInputs();
  };

  const updateSession = (typeId: string, patch: Partial<TypeSession>) => {
    setSessions((prev) => ({
      ...prev,
      [typeId]: { ...(prev[typeId] ?? emptySession()), ...patch },
    }));
  };

  const completePhase = (phase: DrillPhaseId) => {
    if (!activeTypeId) return;
    const s = sessions[activeTypeId] ?? emptySession();
    const phasesDone = { ...s.phasesDone, [phase]: true };
    const allDone = ([1, 2, 3, 4] as DrillPhaseId[]).every((p) => phasesDone[p]);

    if (allDone) {
      setFinishedTypes((prev) => new Set(prev).add(activeTypeId));
    }

    const nextPhase = Math.min(4, phase + 1) as DrillPhaseId;
    updateSession(activeTypeId, {
      phasesDone,
      currentPhase: allDone ? 4 : phase < 4 ? nextPhase : 4,
    });
    resetPhaseInputs();
  };

  const handleSubmitPhase = () => {
    if (!activeTypeId) return;
    if (currentPhase === 1) {
      if (p1Selected.size === 0) return;
      setPhaseSubmitted(true);
      return;
    }
    if (currentPhase === 2) {
      if (!p2Selected) return;
      setPhaseSubmitted(true);
      return;
    }
    if (currentPhase === 3) {
      if (!p3Selected) return;
      setPhaseSubmitted(true);
      return;
    }
    if (currentPhase === 4) {
      if (!p4Text.trim()) return;
      setPhaseSubmitted(true);
    }
  };

  const renderPhaseFeedback = (d: CaseDrill) => {
    if (currentPhase === 1) {
      return (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-slate-400">{t(locale, d.phases.phase1.clarifyPurpose)}</p>
          {d.phases.phase1.options.map((opt) => {
            const picked = p1Selected.has(opt.id);
            const show = phaseSubmitted;
            let ring = "border-slate-700";
            if (show && picked && opt.isGood) ring = "border-emerald-500/60 bg-emerald-500/10";
            if (show && picked && !opt.isGood) ring = "border-rose-500/60 bg-rose-500/10";
            if (show && !picked && opt.isGood) ring = "border-emerald-500/30";
            return (
              <div key={opt.id} className={`rounded-lg border px-3 py-2 text-sm ${ring}`}>
                <span className="mr-2">{show ? (opt.isGood ? "✓" : picked ? "✗" : "○") : ""}</span>
                {t(locale, opt.text)}
              </div>
            );
          })}
          {phaseSubmitted && (
            <>
              <p className="text-sm text-emerald-400">✓ {t(locale, d.phases.phase1.goodSummary)}</p>
              <p className="text-sm text-rose-400">✗ {t(locale, d.phases.phase1.badSummary)}</p>
              <PhraseList phrases={d.phases.phase1.phrases} locale={locale} label={step3Ui.usablePhrases} />
            </>
          )}
        </div>
      );
    }

    if (currentPhase === 2) {
      const opt = d.phases.phase2.options.find((o) => o.id === p2Selected);
      return (
        <div className="mt-4 space-y-3">
          {phaseSubmitted &&
            d.phases.phase2.options.map((o) => (
              <div
                key={o.id}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  o.isCorrect
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-100"
                    : o.id === p2Selected
                      ? "border-rose-500/50 bg-rose-500/10 text-rose-100"
                      : "border-slate-700 text-slate-500"
                }`}
              >
                <span className="mr-2">{o.isCorrect ? "✓" : o.id === p2Selected ? "✗" : ""}</span>
                {t(locale, o.text)}
                {o.id === p2Selected && (
                  <p className="mt-1 text-xs opacity-90">{t(locale, o.feedback)}</p>
                )}
              </div>
            ))}
          {phaseSubmitted && (
            <PhraseList phrases={d.phases.phase2.phrases} locale={locale} label={step3Ui.usablePhrases} />
          )}
        </div>
      );
    }

    if (currentPhase === 3) {
      return (
        <div className="mt-4 space-y-3">
          {phaseSubmitted &&
            d.phases.phase3.options.map((o) => (
              <div
                key={o.id}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  o.isCorrect
                    ? "border-emerald-500/50 bg-emerald-500/10"
                    : o.id === p3Selected
                      ? "border-rose-500/50 bg-rose-500/10"
                      : "border-slate-700 text-slate-500"
                }`}
              >
                <span className="mr-2">{o.isCorrect ? "✓" : o.id === p3Selected ? "✗" : ""}</span>
                {t(locale, o.text)}
                {o.id === p3Selected && (
                  <p className="mt-1 text-xs">{t(locale, o.feedback)}</p>
                )}
              </div>
            ))}
          {phaseSubmitted && (
            <PhraseList phrases={d.phases.phase3.phrases} locale={locale} label={step3Ui.usablePhrases} />
          )}
        </div>
      );
    }

    if (currentPhase === 4 && phaseSubmitted) {
      return (
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-slate-700 bg-slate-950/50 p-3">
            <p className="mb-1 text-xs font-medium text-slate-500">{step3Ui.yourAnswer}</p>
            <p className="text-sm text-slate-200 whitespace-pre-wrap">{p4Text}</p>
          </div>
          <div className="rounded-lg border border-sky-500/40 bg-sky-500/10 p-3">
            <p className="mb-1 text-xs font-medium text-sky-400">{step3Ui.reference}</p>
            <p className="text-sm text-slate-200">{t(locale, d.phases.phase4.referenceAnswer)}</p>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-slate-500">{step3Ui.criteriaTitle}</p>
            <ul className="space-y-1">
              {d.phases.phase4.criteria.map((c, i) => (
                <li key={i} className="text-sm text-emerald-400/90">
                  ✓ {t(locale, c)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    }

    return null;
  };

  const finishedCount = finishedTypes.size;
  const recommendedRemaining = Math.max(0, MIN_DRILL_TYPES_FOR_STEP4 - finishedCount);

  const skipCurrentPhase = () => {
    if (!activeTypeId || finishedTypes.has(activeTypeId) && session.phasesDone[4]) return;
    completePhase(currentPhase);
  };

  return (
    <div className="space-y-6">
      <p className="text-base leading-relaxed text-slate-300">{step3Ui.intro}</p>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-sky-300">
          {step3Ui.progress(finishedCount, CASE_DRILLS.length)}
          {recommendedRemaining > 0 && (
            <span className="ml-2 text-slate-500">
              — {step3Ui.needMore(recommendedRemaining)}
            </span>
          )}
        </p>
        <button
          type="button"
          onClick={onSkipToNext}
          className="shrink-0 rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
        >
          {locale === "zh" ? "跳过，进入 Step 4 →" : "Skip to Step 4 →"}
        </button>
      </div>

      {screen === "select" && (
        <div className="rounded-xl border border-slate-700/80 bg-slate-900/50 p-4 sm:p-6">
          <p className="mb-4 text-sm font-medium text-slate-400">{step3Ui.pickType}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {CASE_DRILLS.map((d) => {
              const done = finishedTypes.has(d.id);
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => selectType(d.id)}
                  className={`rounded-xl border px-4 py-4 text-left transition ${
                    done
                      ? "border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/15"
                      : "border-slate-700 bg-slate-950/40 hover:border-sky-500/50 hover:bg-slate-900"
                  }`}
                >
                  <span className="text-base font-semibold text-white">
                    {t(locale, d.typeLabel)}
                    {done ? " ✓" : ""}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {screen === "lesson" && activeTypeId && (
        <div className="rounded-xl border border-slate-700/80 bg-slate-900/50 p-4 sm:p-8">
          <CaseTypeLesson
            caseType={activeTypeId}
            locale={locale}
            onStartDrill={startDrill}
            onBack={backToSelect}
          />
        </div>
      )}

      {screen === "drill" && activeTypeId && (
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="min-w-0 flex-1 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={backToSelect}
              className="text-xs text-slate-500 hover:text-white"
            >
              {locale === "zh" ? "← 换题型" : "← Change type"}
            </button>
            <div className="flex flex-wrap gap-1.5">
              {CASE_DRILLS.map((d) => {
                const done = finishedTypes.has(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => selectType(d.id)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                      activeTypeId === d.id
                        ? "bg-sky-600 text-white"
                        : done
                          ? "border border-emerald-500/40 bg-emerald-500/15 text-emerald-200"
                          : "border border-slate-700 text-slate-400 hover:text-white"
                    }`}
                  >
                    {t(locale, d.typeLabel)}
                    {done ? " ✓" : ""}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-slate-700/80 bg-slate-900/50 p-4 sm:p-6">
            <p className="mb-1 text-xs uppercase tracking-wide text-slate-500">
              {step3Ui.practicing}: {t(locale, drill.typeLabel)}
            </p>

            <div className="mb-6 grid grid-cols-4 gap-2">
              {([1, 2, 3, 4] as DrillPhaseId[]).map((p) => {
                const done = session.phasesDone[p];
                const active = currentPhase === p;
                return (
                  <div
                    key={p}
                    className={`rounded-lg px-2 py-2 text-center text-xs font-medium ${
                      active
                        ? "bg-sky-600 text-white"
                        : done
                          ? "bg-emerald-500/20 text-emerald-200"
                          : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    {t(locale, PHASE_LABELS[p])}
                  </div>
                );
              })}
            </div>

            {finishedTypes.has(activeTypeId) && session.phasesDone[4] ? (
              <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4 text-center text-sm text-emerald-200">
                {step3Ui.typeDone}
              </div>
            ) : (
              <>
                {currentPhase === 1 && (
                  <section>
                    <div className="mb-4 rounded-lg border border-slate-700 bg-slate-950/60 p-4">
                      <p className="text-sm leading-relaxed text-white">
                        {t(locale, drill.phases.phase1.casePrompt)}
                      </p>
                    </div>
                    <p className="mb-3 text-sm text-slate-400">
                      {t(locale, drill.phases.phase1.instruction)}
                    </p>
                    <div className="space-y-2">
                      {drill.phases.phase1.options.map((opt) => (
                        <label
                          key={opt.id}
                          className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-sm transition ${
                            p1Selected.has(opt.id)
                              ? "border-sky-500/50 bg-sky-500/10"
                              : "border-slate-700 hover:border-slate-600"
                          } ${phaseSubmitted ? "pointer-events-none opacity-80" : ""}`}
                        >
                          <input
                            type="checkbox"
                            className="mt-0.5 accent-sky-500"
                            checked={p1Selected.has(opt.id)}
                            disabled={phaseSubmitted}
                            onChange={() => {
                              setP1Selected((prev) => {
                                const next = new Set(prev);
                                if (next.has(opt.id)) next.delete(opt.id);
                                else next.add(opt.id);
                                return next;
                              });
                            }}
                          />
                          <span className="text-slate-200">{t(locale, opt.text)}</span>
                        </label>
                      ))}
                    </div>
                  </section>
                )}

                {currentPhase === 2 && (
                  <section>
                    <p className="mb-3 rounded-lg border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-300">
                      {t(locale, drill.phases.phase2.infoReceived)}
                    </p>
                    <p className="mb-3 text-sm text-slate-400">
                      {t(locale, drill.phases.phase2.instruction)}
                    </p>
                    <div className="space-y-2">
                      {drill.phases.phase2.options.map((opt) => (
                        <label
                          key={opt.id}
                          className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-sm ${
                            p2Selected === opt.id
                              ? "border-sky-500/50 bg-sky-500/10"
                              : "border-slate-700"
                          } ${phaseSubmitted ? "pointer-events-none" : ""}`}
                        >
                          <input
                            type="radio"
                            name="framework"
                            className="mt-0.5 accent-sky-500"
                            checked={p2Selected === opt.id}
                            disabled={phaseSubmitted}
                            onChange={() => setP2Selected(opt.id)}
                          />
                          <span>{t(locale, opt.text)}</span>
                        </label>
                      ))}
                    </div>
                  </section>
                )}

                {currentPhase === 3 && (
                  <section>
                    <p className="mb-3 rounded-lg border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-300">
                      {t(locale, drill.phases.phase3.infoReceived)}
                    </p>
                    <p className="mb-3 text-sm text-slate-400">
                      {t(locale, drill.phases.phase3.instruction)}
                    </p>
                    <div className="space-y-2">
                      {drill.phases.phase3.options.map((opt) => (
                        <label
                          key={opt.id}
                          className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-sm ${
                            p3Selected === opt.id
                              ? "border-sky-500/50 bg-sky-500/10"
                              : "border-slate-700"
                          } ${phaseSubmitted ? "pointer-events-none" : ""}`}
                        >
                          <input
                            type="radio"
                            name="deepdive"
                            className="mt-0.5 accent-sky-500"
                            checked={p3Selected === opt.id}
                            disabled={phaseSubmitted}
                            onChange={() => setP3Selected(opt.id)}
                          />
                          <span>{t(locale, opt.text)}</span>
                        </label>
                      ))}
                    </div>
                  </section>
                )}

                {currentPhase === 4 && (
                  <section>
                    <p className="mb-3 rounded-lg border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-300">
                      {t(locale, drill.phases.phase4.infoReceived)}
                    </p>
                    <p className="mb-3 text-sm text-slate-400">
                      {t(locale, drill.phases.phase4.instruction)}
                    </p>
                    <textarea
                      value={p4Text}
                      disabled={phaseSubmitted}
                      onChange={(e) => setP4Text(e.target.value)}
                      rows={4}
                      placeholder={step3Ui.yourAnswer}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-70"
                    />
                  </section>
                )}

                {renderPhaseFeedback(drill)}

                <div className="mt-6 flex flex-wrap gap-3">
                  {phaseSubmitted ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          resetPhaseInputs();
                        }}
                        className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                      >
                        {step3Ui.retry}
                      </button>
                      <button
                        type="button"
                        onClick={() => completePhase(currentPhase)}
                        className="rounded-lg bg-sky-600 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-500"
                      >
                        {currentPhase < 4 ? step3Ui.nextPhase : step3Ui.typeDone}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleSubmitPhase}
                        className="rounded-lg bg-sky-600 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-500"
                      >
                        {step3Ui.submit}
                      </button>
                      <button
                        type="button"
                        onClick={skipCurrentPhase}
                        className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                      >
                        {step3Ui.skipPhase}
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={onComplete}
              className="rounded-lg bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-sky-500"
            >
              {step3Ui.continueStep4}
            </button>
          </div>
        </div>

        <aside className="w-full shrink-0 lg:w-72">
          <div className="sticky top-4 rounded-xl border border-slate-700/80 bg-slate-900/60 p-4">
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {step3Ui.phraseTitle}
            </h4>
            <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1 text-xs text-slate-400">
              {PHRASE_LIBRARY.map((group) => (
                <div key={t(locale, group.title)}>
                  <p className="mb-1.5 font-semibold text-sky-400/90">
                    {t(locale, group.title)}
                  </p>
                  <ul className="space-y-1.5">
                    {group.phrases.map((p, i) => (
                      <li key={i} className="leading-relaxed text-slate-300">
                        {t(locale, p)}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
      )}

      {screen !== "drill" && (
        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onSkipToNext}
            className="rounded-lg border border-slate-600 px-5 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
          >
            {locale === "zh" ? "跳过，进入 Step 4 →" : "Skip to Step 4 →"}
          </button>
          <button
            type="button"
            onClick={onComplete}
            className="rounded-lg bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-sky-500"
          >
            {step3Ui.continueStep4}
          </button>
        </div>
      )}
    </div>
  );
}

function PhraseList({
  phrases,
  locale,
  label,
}: {
  phrases: { en: string; zh: string }[];
  locale: CaseLocale;
  label: string;
}) {
  return (
    <div className="rounded-lg border border-sky-500/30 bg-sky-500/5 p-3">
      <p className="mb-2 text-xs font-medium text-sky-400">{label}</p>
      <ul className="space-y-1.5 text-sm text-slate-300">
        {phrases.map((p, i) => (
          <li key={i}>「{t(locale, p)}」</li>
        ))}
      </ul>
    </div>
  );
}
