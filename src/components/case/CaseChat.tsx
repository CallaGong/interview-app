"use client";

import { useCallback, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { apiUrl } from "@/lib/api";
import { buildCaseOpeningMessage } from "@/lib/prompts/case";
import type { CaseEvaluation, CaseQuestion, ChatMessage } from "@/types";
import CaseEvaluationReport from "./CaseEvaluation";

interface CaseChatProps {
  caseQuestion: CaseQuestion;
  onReset: () => void;
}

function tryParseEvaluation(content: string): CaseEvaluation | null {
  const jsonMatch = content.match(/\{[\s\S]*"scores"[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    const clean = jsonMatch[0].replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(clean) as CaseEvaluation;
  } catch {
    return null;
  }
}

function extractFrameworkTopics(messages: ChatMessage[], keyIssues: string[]): string[] {
  const userText = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join(" ");

  return keyIssues.filter((issue) => {
    if (userText.includes(issue)) return true;
    const parts = issue.split(/[（(]/)[0].split(/[/、]/);
    return parts.some((part) => part.trim().length > 2 && userText.includes(part.trim()));
  });
}

export default function CaseChat({ caseQuestion, onReset }: CaseChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: buildCaseOpeningMessage(caseQuestion) },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [evaluation, setEvaluation] = useState<CaseEvaluation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const coveredTopics = extractFrameworkTopics(messages, caseQuestion.key_issues);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

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
        body: JSON.stringify({ messages: updatedMessages, caseQuestion }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "请求失败");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("无法读取响应流");

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
          try {
            const payload = JSON.parse(line.slice(6));
            if (payload.text) {
              fullContent += payload.text;
              setStreamingContent(fullContent);
            }
          } catch {
            // skip malformed SSE lines
          }
        }
      }

      setMessages([...updatedMessages, { role: "assistant", content: fullContent }]);
      setStreamingContent("");

      if (content.includes("结束评估")) {
        const parsed = tryParseEvaluation(fullContent);
        if (parsed) setEvaluation(parsed);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "发送失败，请重试");
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  const displayMessages = [...messages];
  if (streamingContent) {
    displayMessages.push({ role: "assistant", content: streamingContent });
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <aside className="shrink-0 lg:w-56">
        <div className="rounded-xl border border-slate-700/80 bg-slate-900/60 p-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            框架追踪
          </h4>
          <ul className="space-y-2">
            {caseQuestion.key_issues.map((issue) => {
              const covered = coveredTopics.includes(issue);
              return (
                <li
                  key={issue}
                  className={`rounded-md px-2 py-1.5 text-xs transition ${
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

      <div className="flex min-h-[480px] flex-1 flex-col rounded-xl border border-slate-700/80 bg-slate-900/40">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
          <h3 className="text-sm font-medium text-white">{caseQuestion.title}</h3>
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-slate-400 hover:text-white"
          >
            换题
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4" style={{ maxHeight: "52vh" }}>
          {displayMessages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-slate-700 text-white"
                    : "bg-slate-800/90 text-slate-100"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-invert prose-sm max-w-none [&_p]:my-1 [&_strong]:text-white">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </div>
          ))}
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
          <div className="border-t border-slate-800 p-4">
            <CaseEvaluationReport evaluation={evaluation} />
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex gap-2 border-t border-slate-800 p-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="输入你的回答…（输入「结束评估」获取评分）"
            className="flex-1 rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            发送
          </button>
        </form>
      </div>
    </div>
  );
}
