"use client";

import { useUser } from "@clerk/nextjs";
import { useCallback, useRef, useState } from "react";
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
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: buildCaseOpeningMessage(caseQuestion, locale) },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [evaluation, setEvaluation] = useState<CaseEvaluation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const coveredTopics = extractFrameworkTopics(messages, caseQuestion.key_issues);

  const inputPlaceholder =
    locale === "zh"
      ? "输入你的回答…（输入「结束评估」获取评分）"
      : 'Type your answer… (type "end evaluation" for feedback)';

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

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

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

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
        body: JSON.stringify({ messages: updatedMessages, caseQuestion, locale }),
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

        {evaluation && (
          <div className="min-w-0 shrink-0 overflow-x-hidden border-t border-slate-800 p-4">
            <CaseEvaluationReport evaluation={evaluation} locale={locale} />
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex gap-2 border-t border-slate-800 p-4"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder={inputPlaceholder}
            className="flex-1 rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
