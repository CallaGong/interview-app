"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AssistantMessage from "@/components/case/live/AssistantMessage";
import CaseMap from "@/components/case/live/CaseMap";
import InterviewSummary from "@/components/case/live/InterviewSummary";
import TimePromiseTracker from "@/components/case/live/TimePromiseTracker";
import VoiceInput from "@/components/case/voice/VoiceInput";
import { apiUrl } from "@/lib/api";
import { getBranchingTree } from "@/lib/case/branching/case-trees";
import {
  parseNodeMarker,
  stripNodeMarkersFromStream,
} from "@/lib/case/live/parse-node";
import { parseChartsFromContent } from "@/lib/case/live/parse-chart";
import { extractTimePromise } from "@/lib/case/live/parse-time-promise";
import type { CaseLocale } from "@/types/case-locale";
import type { CaseQuestion, ChatMessage } from "@/types";

export type LiveTimeLimitMinutes = 15 | 30 | 45;

export interface LiveTimerState {
  durationSeconds: number;
  startedAt: string;
  onTimeUp: () => void;
}

export interface LiveModeChatProps {
  caseQuestion: CaseQuestion;
  locale: CaseLocale;
  timeLimitMinutes: LiveTimeLimitMinutes;
  onExit: () => void;
  onTimerStateChange?: (state: LiveTimerState | null) => void;
}

const TIME_LIMIT_SECONDS: Record<LiveTimeLimitMinutes, number> = {
  15: 15 * 60,
  30: 30 * 60,
  45: 45 * 60,
};

const TIME_UP_MESSAGE = {
  en: "Time's up — what's your answer?",
  zh: "时间到了，给我你的答案。",
} as const;

type Phase = "countdown" | "interview" | "summary";

interface TimePromiseState {
  promisedSeconds: number;
  labelMinutes: number;
  startedAt: number;
}

export default function LiveModeChat({
  caseQuestion,
  locale,
  timeLimitMinutes,
  onExit,
  onTimerStateChange,
}: LiveModeChatProps) {
  const durationSeconds = TIME_LIMIT_SECONDS[timeLimitMinutes];
  const tree = getBranchingTree(caseQuestion.id);

  const [phase, setPhase] = useState<Phase>("countdown");
  const [countdown, setCountdown] = useState(3);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(
    tree?.rootNode ?? null
  );
  const [visitedNodes, setVisitedNodes] = useState<string[]>(
    tree ? [tree.rootNode] : []
  );
  const [nodeTurnCounts, setNodeTurnCounts] = useState<Record<string, number>>(
    {}
  );
  const [timePromise, setTimePromise] = useState<TimePromiseState | null>(null);
  const [input, setInput] = useState("");
  const [inputMode, setInputMode] = useState<"text" | "voice">("text");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [activeChartFocus, setActiveChartFocus] = useState(false);

  const lastAiAtRef = useRef<number>(Date.now());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastUserInputRef = useRef("");
  const interviewStartedRef = useRef<number | null>(null);
  const timeUpNotifiedRef = useRef(false);

  const ui =
    locale === "zh"
      ? {
          live: "实战面试",
          back: "返回",
          send: "发送",
          placeholder: "输入回答…",
          text: "⌨️ 文字",
          voice: "🎤 语音",
          starting: "即将开始…",
        }
      : {
          live: "Live Interview",
          back: "Back",
          send: "Send",
          placeholder: "Type your answer…",
          text: "⌨️ Text",
          voice: "🎤 Voice",
          starting: "Starting soon…",
        };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown <= 0) {
      setPhase("interview");
      interviewStartedRef.current = Date.now();
      return;
    }
    const t = window.setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [phase, countdown]);

  const initLiveSession = useCallback(async () => {
    setSessionError(null);
    try {
      const res = await fetch(apiUrl("/api/case/live"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: caseQuestion.id,
          language: locale,
          durationSeconds,
        }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error || "Failed to start live session");
      }
      const data = (await res.json()) as {
        sessionId: string;
        openingMessage: string;
        currentNodeId: string;
        visitedNodes: string[];
        startedAt: string;
      };
      setSessionId(data.sessionId);
      setStartedAt(data.startedAt);
      setCurrentNodeId(data.currentNodeId);
      setVisitedNodes(data.visitedNodes);
      const opening = data.openingMessage;
      setMessages([{ role: "assistant", content: opening }]);
      lastAiAtRef.current = Date.now();
      const seconds = extractTimePromise(opening, locale);
      if (seconds != null) {
        setTimePromise({
          promisedSeconds: seconds,
          labelMinutes: Math.max(1, Math.round(seconds / 60)),
          startedAt: Date.now(),
        });
        timeUpNotifiedRef.current = false;
      } else {
        setTimePromise(null);
      }
    } catch (e) {
      setSessionError(e instanceof Error ? e.message : "Session failed");
    }
  }, [caseQuestion.id, durationSeconds, locale]);

  useEffect(() => {
    if (phase === "interview" && !sessionId && !sessionError) {
      void initLiveSession();
    }
  }, [phase, sessionId, sessionError, initLiveSession]);

  const focusInput = useCallback(() => {
    window.setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const clearTimePromise = useCallback(() => {
    setTimePromise(null);
    timeUpNotifiedRef.current = false;
  }, []);

  const beginTimePromiseFromMessage = useCallback(
    (content: string) => {
      const seconds = extractTimePromise(content, locale);
      if (seconds == null) return;
      const labelMinutes = Math.max(1, Math.round(seconds / 60));
      setTimePromise({
        promisedSeconds: seconds,
        labelMinutes,
        startedAt: Date.now(),
      });
      timeUpNotifiedRef.current = false;
    },
    [locale]
  );

  const handleTimePromiseExpired = useCallback(() => {
    if (timeUpNotifiedRef.current) return;
    timeUpNotifiedRef.current = true;
    const line = TIME_UP_MESSAGE[locale];
    setMessages((prev) => [...prev, { role: "assistant", content: line }]);
    lastAiAtRef.current = Date.now();
  }, [locale]);

  useEffect(() => {
    return () => clearTimePromise();
  }, [clearTimePromise]);

  const deliverAssistantMessage = useCallback(
    (displayContent: string) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: displayContent },
      ]);
      lastAiAtRef.current = Date.now();
      beginTimePromiseFromMessage(displayContent);
      const { charts } = parseChartsFromContent(displayContent);
      if (charts.length > 0) {
        setActiveChartFocus(true);
        focusInput();
      }
    },
    [beginTimePromiseFromMessage, focusInput]
  );

  const streamChat = async (
    userMessage: string,
    history: ChatMessage[]
  ): Promise<string> => {
    const response = await fetch(apiUrl("/api/case/live/chat"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        userMessage,
        caseId: caseQuestion.id,
        locale,
        messages: history,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(
        (err as { error?: string }).error || "Chat request failed"
      );
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No stream");

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
          if (payload.error) throw new Error(payload.error);
          if (payload.text) {
            fullContent += payload.text;
            setStreamingContent(stripNodeMarkersFromStream(fullContent));
          }
        } catch {
          /* ignore partial json */
        }
      }
    }

    return fullContent;
  };

  const sendMessage = useCallback(
    async (rawText: string) => {
      const text = rawText.trim();
      if (!text || isLoading || !sessionId || phase !== "interview") return;

      clearTimePromise();

      const nodeAtSend = currentNodeId ?? tree?.rootNode ?? "intro";
      setNodeTurnCounts((prev) => ({
        ...prev,
        [nodeAtSend]: (prev[nodeAtSend] ?? 0) + 1,
      }));

      lastUserInputRef.current = text;
      const userMessage: ChatMessage = { role: "user", content: text };
      const history = [...messages, userMessage];
      const messagesBeforeSend = messages;
      setMessages(history);
      setInput("");
      setVoiceError(null);
      setIsLoading(true);
      setStreamingContent("");
      setError(null);
      setActiveChartFocus(false);

      try {
        const fullContent = await streamChat(text, messagesBeforeSend);
        const { displayContent, nextNodeId } = parseNodeMarker(fullContent);
        const contentToShow =
          displayContent || stripNodeMarkersFromStream(fullContent);

        if (nextNodeId) {
          setCurrentNodeId(nextNodeId);
          setVisitedNodes((prev) =>
            prev.includes(nextNodeId) ? prev : [...prev, nextNodeId]
          );
          if (nextNodeId === "end") {
            setPhase("summary");
            if (sessionId) {
              void fetch(apiUrl("/api/case/session"), {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId, status: "completed" }),
              });
            }
          }
        }

        setStreamingContent("");
        deliverAssistantMessage(contentToShow);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Send failed");
        setMessages(messagesBeforeSend);
      } finally {
        setIsLoading(false);
      }
    },
    [
      clearTimePromise,
      currentNodeId,
      deliverAssistantMessage,
      isLoading,
      messages,
      phase,
      sessionId,
      streamChat,
      tree?.rootNode,
    ]
  );

  const handleSend = () => {
    void sendMessage(input);
  };

  const handleTimeUp = useCallback(() => {
    clearTimePromise();
    setPhase("summary");
    if (sessionId) {
      void fetch(apiUrl("/api/case/session"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, status: "completed" }),
      });
    }
  }, [sessionId, clearTimePromise]);

  useEffect(() => {
    if (!onTimerStateChange) return;
    if (phase === "interview" && startedAt) {
      onTimerStateChange({
        durationSeconds,
        startedAt,
        onTimeUp: handleTimeUp,
      });
    } else {
      onTimerStateChange(null);
    }
    return () => onTimerStateChange(null);
  }, [
    phase,
    startedAt,
    durationSeconds,
    handleTimeUp,
    onTimerStateChange,
  ]);

  const elapsedSeconds =
    interviewStartedRef.current != null
      ? Math.min(
          durationSeconds,
          Math.floor((Date.now() - interviewStartedRef.current) / 1000)
        )
      : durationSeconds;

  if (phase === "countdown") {
    return (
      <div className="flex min-h-[480px] flex-col items-center justify-center">
        <p className="mb-4 text-sm text-slate-400">{ui.starting}</p>
        <p className="font-mono text-8xl font-bold text-rose-400">{countdown}</p>
      </div>
    );
  }

  if (phase === "summary") {
    return (
      <InterviewSummary
        locale={locale}
        caseSlug={caseQuestion.id}
        durationSeconds={durationSeconds}
        elapsedSeconds={elapsedSeconds}
        visitedNodeIds={visitedNodes}
        messages={messages}
        interruptEvents={[]}
        silenceCount={0}
        onClose={onExit}
      />
    );
  }

  const inputPlaceholder = activeChartFocus
    ? locale === "zh"
      ? "请根据数据回答…"
      : "Answer based on the data…"
    : ui.placeholder;

  return (
    <div className="relative flex min-h-[560px] flex-col">
      <header className="mb-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onExit}
          className="text-sm text-slate-400 hover:text-white"
        >
          ← {ui.back}
        </button>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wide text-rose-400">
            {ui.live}
          </p>
          <h2 className="text-lg font-semibold text-white">
            {caseQuestion.title}
          </h2>
        </div>
      </header>

      {sessionError && (
        <p className="mb-3 text-sm text-rose-400">{sessionError}</p>
      )}
      {error && <p className="mb-3 text-sm text-rose-400">{error}</p>}

      <div className="flex min-h-0 flex-1 gap-4">
        <div className="flex min-w-0 flex-[7] flex-col rounded-xl border border-slate-700/80 bg-slate-900/40">
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "ml-8 rounded-lg bg-rose-600/20 px-4 py-2 text-sm text-rose-50"
                    : "mr-8 rounded-lg bg-slate-800/80 px-4 py-2 text-sm text-slate-200"
                }
              >
                {m.role === "assistant" ? (
                  <AssistantMessage
                    content={m.content}
                    locale={locale}
                    onChartMount={focusInput}
                  />
                ) : (
                  m.content
                )}
              </div>
            ))}
            {streamingContent && (
              <div className="mr-8 rounded-lg bg-slate-800/60 px-4 py-2 text-sm text-slate-300">
                <AssistantMessage
                  content={streamingContent}
                  locale={locale}
                  onChartMount={focusInput}
                />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-slate-700/80 p-3">
            {timePromise && (
              <TimePromiseTracker
                locale={locale}
                promisedSeconds={timePromise.promisedSeconds}
                labelMinutes={timePromise.labelMinutes}
                startedAt={timePromise.startedAt}
                onExpired={handleTimePromiseExpired}
              />
            )}
            <div className="mb-2 flex gap-2">
              <button
                type="button"
                onClick={() => setInputMode("text")}
                className={`flex-1 rounded-lg px-3 py-2 text-sm ${
                  inputMode === "text"
                    ? "bg-rose-600 text-white"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {ui.text}
              </button>
              <button
                type="button"
                onClick={() => setInputMode("voice")}
                className={`flex-1 rounded-lg px-3 py-2 text-sm ${
                  inputMode === "voice"
                    ? "bg-rose-600 text-white"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {ui.voice}
              </button>
            </div>
            {voiceError && (
              <p className="mb-2 text-sm text-rose-400">{voiceError}</p>
            )}
            {inputMode === "text" ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleSend();
                }}
                className="flex gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading || !sessionId}
                  placeholder={inputPlaceholder}
                  className={`flex-1 rounded-lg border bg-slate-800/80 px-3 py-2 text-sm text-white ${
                    activeChartFocus
                      ? "border-violet-500 ring-1 ring-violet-500/50"
                      : "border-slate-700"
                  }`}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading || !sessionId}
                  className="rounded-lg bg-rose-600 px-4 py-2 text-sm text-white disabled:opacity-50"
                >
                  {ui.send}
                </button>
              </form>
            ) : (
              <VoiceInput
                language={locale}
                disabled={isLoading || !sessionId}
                onSend={(text) => void sendMessage(text)}
                onEdit={(text) => {
                  setInput(text);
                  setInputMode("text");
                  setVoiceError(null);
                  focusInput();
                }}
                onError={setVoiceError}
              />
            )}
          </div>
        </div>

        <div className="hidden flex-[3] md:block">
          <CaseMap
            caseSlug={caseQuestion.id}
            visitedNodeIds={visitedNodes}
            currentNodeId={currentNodeId}
            nodeTurnCounts={nodeTurnCounts}
            locale={locale}
          />
        </div>
      </div>
    </div>
  );
}
