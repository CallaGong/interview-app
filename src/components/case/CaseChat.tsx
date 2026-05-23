"use client";

import { useUser } from "@clerk/nextjs";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { apiUrl } from "@/lib/api";
import { computeOverallScore } from "@/lib/case/recommendations";
import {
  appendLocalPracticeHistory,
  isStorageUnavailableError,
} from "@/lib/case/local-preferences";
import { tryParseCaseEvaluation } from "@/lib/case/parse-evaluation";
import {
  buildCaseOpeningMessage,
  isEndEvaluationMessage,
} from "@/lib/prompts/case";
import type { CaseLocale } from "@/types/case-locale";
import type { CaseEvaluation, CaseQuestion, ChatMessage } from "@/types";
import CaseEvaluationReport from "./CaseEvaluation";
import VoiceInput from "@/components/case/voice/VoiceInput";

interface CaseChatProps {
  caseQuestion: CaseQuestion;
  locale: CaseLocale;
  onReset: () => void;
  onEvaluationSaved?: () => void;
}

function extractFrameworkTopics(messages: ChatMessage[], keyIssues: string[]): string[] {
  const userText = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join(" ");

  return keyIssues.filter((issue) => {
    if (userText.includes(issue)) return true;
    const parts = issue.split(/[（(]/)[0].split(/[/、,/]/);
    return parts.some((part) => part.trim().length > 2 && userText.includes(part.trim()));
  });
}

export default function CaseChat({
  caseQuestion,
  locale,
  onReset,
  onEvaluationSaved,
}: CaseChatProps) {
  const { user } = useUser();
  const openingMessage = buildCaseOpeningMessage(caseQuestion, locale);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: openingMessage },
  ]);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [resumed, setResumed] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [evaluation, setEvaluation] = useState<CaseEvaluation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<"text" | "voice">("text");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const inputDisabled = isLoading || !!evaluation || sessionLoading;

  const ui =
    locale === "zh"
      ? {
          resumeBanner: "检测到上次未完成的练习，已为你恢复 ✓",
          restart: "重新开始",
          loadingSession: "加载练习记录…",
        }
      : {
          resumeBanner: "Resumed your last in-progress practice ✓",
          restart: "Start over",
          loadingSession: "Loading practice session…",
        };

  const coveredTopics = extractFrameworkTopics(messages, caseQuestion.key_issues);

  const inputPlaceholder =
    locale === "zh"
      ? "输入你的回答…（输入「结束评估」获取评分）"
      : 'Type your answer… (type "end evaluation" for feedback)';

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const markSessionCompleted = useCallback(async (id: string) => {
    try {
      await fetch(apiUrl("/api/case/session"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: id, status: "completed" }),
      });
    } catch {
      /* non-blocking */
    }
  }, []);

  const applyRestoredEvaluation = useCallback((msgs: ChatMessage[]) => {
    const lastUser = [...msgs].reverse().find((m) => m.role === "user");
    const lastAssistant = [...msgs].reverse().find((m) => m.role === "assistant");
    if (
      lastUser &&
      isEndEvaluationMessage(lastUser.content) &&
      lastAssistant
    ) {
      const parsed = tryParseCaseEvaluation(lastAssistant.content);
      if (parsed) setEvaluation(parsed);
    }
  }, []);

  const initSession = useCallback(async () => {
    setSessionLoading(true);
    setSessionError(null);
    setResumed(false);
    setEvaluation(null);

    try {
      const getRes = await fetch(
        apiUrl(
          `/api/case/session?caseId=${encodeURIComponent(caseQuestion.id)}&locale=${locale}`
        )
      );

      if (getRes.ok) {
        const data = (await getRes.json()) as {
          session: { id: string } | null;
          messages: ChatMessage[];
          resumed?: boolean;
        };

        if (data.session && data.messages.length > 0) {
          setSessionId(data.session.id);
          setMessages(data.messages);
          setResumed(Boolean(data.resumed));
          applyRestoredEvaluation(data.messages);
          return;
        }
      } else {
        const err = (await getRes.json().catch(() => ({}))) as { error?: string };
        if (err.error) throw new Error(err.error);
      }

      const postRes = await fetch(apiUrl("/api/case/session"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: caseQuestion.id,
          locale,
          caseQuestion,
        }),
      });

      if (!postRes.ok) {
        const err = (await postRes.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error || "Failed to create session");
      }

      const created = (await postRes.json()) as {
        session: { id: string };
        messages: ChatMessage[];
      };
      setSessionId(created.session.id);
      setMessages(created.messages);
    } catch (e) {
      setSessionError(e instanceof Error ? e.message : "Session unavailable");
      setSessionId(null);
      setMessages([{ role: "assistant", content: openingMessage }]);
    } finally {
      setSessionLoading(false);
    }
  }, [applyRestoredEvaluation, caseQuestion, locale, openingMessage]);

  useEffect(() => {
    void initSession();
  }, [initSession]);

  const saveEvaluationHistory = async (parsed: CaseEvaluation) => {
    const overallScore = computeOverallScore(parsed.scores);
    try {
      const res = await fetch(apiUrl("/api/case/history"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: caseQuestion.id,
          difficulty: caseQuestion.difficulty,
          scores: parsed.scores,
        }),
      });
      if (res.ok) {
        onEvaluationSaved?.();
        return;
      }
      const err = (await res.json().catch(() => ({}))) as {
        error?: string;
        code?: string;
      };
      if (
        user?.id &&
        (err.code === "MISSING_TABLE" || isStorageUnavailableError(err.error))
      ) {
        appendLocalPracticeHistory(user.id, {
          case_id: caseQuestion.id,
          difficulty: caseQuestion.difficulty,
          overall_score: overallScore,
          completed_at: new Date().toISOString(),
          scores: parsed.scores,
        });
        onEvaluationSaved?.();
      }
    } catch {
      if (user?.id) {
        appendLocalPracticeHistory(user.id, {
          case_id: caseQuestion.id,
          difficulty: caseQuestion.difficulty,
          overall_score: overallScore,
          completed_at: new Date().toISOString(),
          scores: parsed.scores,
        });
        onEvaluationSaved?.();
      }
    }
  };

  const handleRestart = async () => {
    if (!sessionId) {
      void initSession();
      return;
    }

    setSessionLoading(true);
    setError(null);
    setEvaluation(null);
    setResumed(false);

    try {
      await fetch(apiUrl("/api/case/session"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, status: "abandoned" }),
      });

      const postRes = await fetch(apiUrl("/api/case/session"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: caseQuestion.id,
          locale,
          caseQuestion,
          abandonPrevious: true,
        }),
      });

      if (!postRes.ok) {
        const err = (await postRes.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error || "Failed to restart");
      }

      const created = (await postRes.json()) as {
        session: { id: string };
        messages: ChatMessage[];
      };
      setSessionId(created.session.id);
      setMessages(created.messages);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Restart failed");
    } finally {
      setSessionLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading || sessionLoading) return;

    const userMessage: ChatMessage = { role: "user", content: content.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);
    setStreamingContent("");
    setError(null);

    try {
      const response = await fetch(apiUrl("/api/case/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          caseQuestion,
          locale,
          sessionId: sessionId ?? undefined,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Request failed");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Could not read response stream");

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
          try {
            const payload = JSON.parse(line.slice(6)) as {
              text?: string;
              error?: string;
            };
            if (payload.error) {
              throw new Error(payload.error);
            }
            if (payload.text) {
              fullContent += payload.text;
              setStreamingContent(fullContent);
            }
          } catch (parseErr) {
            if (parseErr instanceof Error && parseErr.message !== "Unexpected end of JSON input") {
              throw parseErr;
            }
          }
        }
      }

      if (!fullContent.trim()) {
        throw new Error(
          "No response from AI. Check ANTHROPIC_API_KEY and CLAUDE_MODEL in .env.local"
        );
      }

      setMessages([...updatedMessages, { role: "assistant", content: fullContent }]);
      setStreamingContent("");

      if (isEndEvaluationMessage(content)) {
        const parsed = tryParseCaseEvaluation(fullContent);
        if (parsed) {
          setEvaluation(parsed);
          void saveEvaluationHistory(parsed);
          if (sessionId) void markSessionCompleted(sessionId);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send. Please try again.");
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  const displayMessages = [...messages];
  if (streamingContent) {
    displayMessages.push({ role: "assistant", content: streamingContent });
  }

  const evalPlaceholder =
    locale === "zh"
      ? "评估报告已生成，请查看下方。"
      : "Evaluation report is ready — see below.";

  if (sessionLoading) {
    return (
      <p className="py-16 text-center text-sm text-slate-500">{ui.loadingSession}</p>
    );
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-4 lg:flex-row">
      <aside className="min-w-0 shrink-0 lg:w-56">
        <div className="rounded-xl border border-slate-700/80 bg-slate-900/60 p-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Framework tracker
          </h4>
          <ul className="space-y-2">
            {caseQuestion.key_issues.map((issue) => {
              const covered = coveredTopics.includes(issue);
              return (
                <li
                  key={issue}
                  className={`break-words rounded-md px-2 py-1.5 text-xs transition ${
                    covered
                      ? "bg-sky-500/15 text-sky-200 ring-1 ring-sky-500/30"
                      : "text-slate-500"
                  }`}
                >
                  {issue}
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      <div className="flex min-h-[480px] min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900/40">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
          <h3 className="min-w-0 flex-1 truncate pr-2 text-sm font-medium text-white">
            {caseQuestion.title}
          </h3>
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-slate-400 hover:text-white"
          >
            Back to cases
          </button>
        </div>

        {resumed && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5">
            <p className="text-sm text-emerald-200">{ui.resumeBanner}</p>
            <button
              type="button"
              onClick={() => void handleRestart()}
              disabled={sessionLoading}
              className="rounded-md border border-emerald-500/40 px-3 py-1 text-xs font-medium text-emerald-100 hover:bg-emerald-500/20 disabled:opacity-50"
            >
              {ui.restart}
            </button>
          </div>
        )}

        {sessionError && (
          <p className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs text-amber-200">
            {sessionError}
          </p>
        )}

        <div
          className="min-w-0 flex-1 space-y-4 overflow-x-hidden overflow-y-auto p-4"
          style={{ maxHeight: "52vh" }}
        >
          {displayMessages.map((msg, i) => {
            const hideEvalJson =
              evaluation &&
              msg.role === "assistant" &&
              i === displayMessages.length - 1;

            return (
              <div
                key={i}
                className={`flex min-w-0 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`min-w-0 max-w-[85%] overflow-hidden break-words rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-slate-700 text-white"
                      : "bg-slate-800/90 text-slate-100"
                  }`}
                >
                  {hideEvalJson ? (
                    <p className="text-slate-400 italic">{evalPlaceholder}</p>
                  ) : msg.role === "assistant" ? (
                    <div className="prose prose-invert prose-sm max-w-none break-words [&_*]:max-w-full [&_code]:break-all [&_p]:my-1 [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_strong]:text-white">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  )}
                </div>
              </div>
            );
          })}
          {isLoading && !streamingContent && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-slate-800/90 px-4 py-3">
                <span className="inline-flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-500 [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-500 [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-500" />
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {error && <p className="px-4 text-sm text-rose-400">{error}</p>}
        {voiceError && <p className="px-4 text-sm text-rose-400">{voiceError}</p>}

        {evaluation && (
          <div className="min-w-0 shrink-0 overflow-x-hidden border-t border-slate-800 p-4">
            <CaseEvaluationReport evaluation={evaluation} locale={locale} />
          </div>
        )}

        <div className="border-t border-slate-800">
          <div className="flex gap-2 px-4 pt-3">
            <button
              type="button"
              disabled={inputDisabled}
              onClick={() => {
                setInputMode("text");
                setVoiceError(null);
              }}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                inputMode === "text"
                  ? "bg-sky-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {locale === "zh" ? "⌨️ 文字" : "⌨️ Text"}
            </button>
            <button
              type="button"
              disabled={inputDisabled}
              onClick={() => {
                setInputMode("voice");
                setVoiceError(null);
              }}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                inputMode === "voice"
                  ? "bg-sky-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {locale === "zh" ? "🎤 语音" : "🎤 Voice"}
            </button>
          </div>

          {inputMode === "text" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex gap-2 p-4 pt-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={inputDisabled}
                placeholder={inputPlaceholder}
                className="flex-1 rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={inputDisabled || !input.trim()}
                className="rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {locale === "zh" ? "发送" : "Send"}
              </button>
            </form>
          ) : (
            <VoiceInput
              language={locale}
              disabled={inputDisabled}
              onTranscribed={(text) => {
                setInput(text);
                setInputMode("text");
                setVoiceError(null);
              }}
              onError={(msg) => setVoiceError(msg)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
