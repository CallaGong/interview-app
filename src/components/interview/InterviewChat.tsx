"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiUrl } from "@/lib/api";
import type { BehavioralDimension } from "@/lib/interview/dimensions";
import {
  countMainProbes,
  isInterviewClosingComplete,
  MAX_MAIN_PROBES,
  MIN_MAIN_PROBES,
  stripInterviewMarkers,
} from "@/lib/interview/count-questions";
import { getInterviewUiCopy } from "@/lib/interview/i18n";
import { tryParseInterviewEvaluation } from "@/lib/interview/parse-evaluation";
import {
  getInterviewEndMessage,
  getInterviewStartMessage,
} from "@/lib/prompts/interview";
import type { InterviewEvaluation, InterviewLocale } from "@/types/interview";
import type { ChatMessage } from "@/types";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import InterviewEvaluationReport from "./InterviewEvaluation";
import VoiceInputButton from "./VoiceInputButton";

interface InterviewChatProps {
  locale: InterviewLocale;
  resumeText: string | null;
  focusDimensions: BehavioralDimension[];
  onBack: () => void;
}

async function readSseStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onText: (chunk: string) => void
): Promise<string> {
  const decoder = new TextDecoder();
  let full = "";

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
          full += payload.text;
          onText(full);
        }
      } catch (parseErr) {
        if (
          parseErr instanceof Error &&
          parseErr.message !== "Unexpected end of JSON input"
        ) {
          throw parseErr;
        }
      }
    }
  }

  return full;
}

export default function InterviewChat({
  locale,
  resumeText,
  focusDimensions,
  onBack,
}: InterviewChatProps) {
  const copy = getInterviewUiCopy(locale);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isListening, isSupported, toggle, stop: stopVoice } =
    useSpeechRecognition(locale);

  useEffect(() => {
    if (isLoading || evaluation) stopVoice();
  }, [isLoading, evaluation, stopVoice]);

  const mainProbes = countMainProbes(messages);
  const closingComplete = isInterviewClosingComplete(messages);
  const canSuggestEnd =
    mainProbes >= MIN_MAIN_PROBES || closingComplete;
  const atProbeCap = mainProbes >= MAX_MAIN_PROBES;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const postChat = useCallback(
    async (
      msgs: ChatMessage[],
      opts: { endInterview?: boolean; onStream?: (t: string) => void }
    ) => {
      const response = await fetch(apiUrl("/api/interview/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: msgs,
          resumeText,
          locale,
          focusDimensionIds: focusDimensions.map((d) => d.id),
          endInterview: opts.endInterview ?? false,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(
          (err as { error?: string }).error || copy.requestFailed
        );
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Could not read response stream");

      return readSseStream(reader, opts.onStream ?? (() => {}));
    },
    [resumeText, focusDimensions, locale, copy.requestFailed]
  );

  const startInterview = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setStreamingContent("");

    const bootstrap: ChatMessage[] = [
      { role: "user", content: getInterviewStartMessage(locale) },
    ];

    try {
      const full = await postChat(bootstrap, {
        onStream: setStreamingContent,
      });
      if (!full.trim()) throw new Error(copy.noResponse);
      setMessages([...bootstrap, { role: "assistant", content: full }]);
      setStreamingContent("");
      setStarted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : copy.failedStart);
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  }, [postChat, scrollToBottom, locale, copy.failedStart, copy.noResponse]);

  useEffect(() => {
    if (!started && !isLoading && messages.length === 0) {
      startInterview();
    }
  }, [started, isLoading, messages.length, startInterview]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading || evaluation) return;

    stopVoice();
    const userMessage: ChatMessage = { role: "user", content: content.trim() };
    const updated = [...messages, userMessage];
    setMessages(updated);
    setInput("");
    setIsLoading(true);
    setStreamingContent("");
    setError(null);

    try {
      const full = await postChat(updated, { onStream: setStreamingContent });
      if (!full.trim()) throw new Error(copy.noResponse);
      setMessages([...updated, { role: "assistant", content: full }]);
      setStreamingContent("");
    } catch (e) {
      setError(e instanceof Error ? e.message : copy.failedSend);
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  const endInterview = async () => {
    if (isLoading || evaluation) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: getInterviewEndMessage(locale),
    };
    const updated = [...messages, userMessage];
    setMessages(updated);
    setIsLoading(true);
    setStreamingContent("");
    setError(null);

    try {
      const full = await postChat(updated, {
        endInterview: true,
        onStream: setStreamingContent,
      });
      const parsed = tryParseInterviewEvaluation(full);
      if (!parsed) {
        throw new Error(copy.parseEvalFailed);
      }
      setEvaluation(parsed);
      setMessages([...updated, { role: "assistant", content: full }]);
      setStreamingContent("");
    } catch (e) {
      setError(e instanceof Error ? e.message : copy.failedEnd);
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  const displayMessages = [...messages];
  if (streamingContent) {
    displayMessages.push({ role: "assistant", content: streamingContent });
  }

  const homeStretch = copy.homeStretchBanner
    .replace("{current}", String(mainProbes))
    .replace("{min}", String(MIN_MAIN_PROBES))
    .replace("{max}", String(MAX_MAIN_PROBES));

  return (
    <div className="flex min-h-[560px] min-w-0 flex-col overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900/40">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {copy.interviewerLabel}
          </p>
          <p className="text-sm font-medium text-white">
            {copy.interviewerTitle}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {copy.todayDimensions}:{" "}
            {focusDimensions.map((d) => d.label).join(" · ")}
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-slate-400">
            {copy.mainProbes}:{" "}
            <span className="font-semibold text-sky-400">
              {mainProbes}
            </span>
            <span className="text-slate-600"> / {MAX_MAIN_PROBES}</span>
          </span>
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-slate-500 hover:text-white"
          >
            {copy.exit}
          </button>
        </div>
      </div>

      {closingComplete && !evaluation && (
        <div className="border-b border-sky-500/20 bg-sky-500/10 px-4 py-2.5 text-center text-sm text-sky-100/90">
          {copy.interviewCompleteBanner}{" "}
          <strong className="font-semibold">{copy.getMyReportBold}</strong>
          {copy.interviewCompleteSuffix}
        </div>
      )}

      {canSuggestEnd && !closingComplete && !evaluation && !atProbeCap && (
        <div className="border-b border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-center text-sm text-emerald-200/90">
          {homeStretch}
        </div>
      )}

      <div
        className="min-w-0 flex-1 space-y-4 overflow-x-hidden overflow-y-auto p-4"
        style={{ maxHeight: evaluation ? "40vh" : "52vh" }}
      >
        {displayMessages.map((msg, i) => {
          const hideEvalJson =
            evaluation &&
            msg.role === "assistant" &&
            i === displayMessages.length - 1 &&
            tryParseInterviewEvaluation(msg.content) !== null;

          const displayContent =
            msg.role === "assistant"
              ? stripInterviewMarkers(msg.content)
              : msg.content;

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
                  <p className="italic text-slate-400">{copy.evalPlaceholder}</p>
                ) : (
                  <p className="whitespace-pre-wrap break-words">
                    {displayContent}
                  </p>
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
        <div className="min-w-0 shrink-0 overflow-x-hidden border-t border-slate-800 p-4 sm:p-6">
          <InterviewEvaluationReport copy={copy} evaluation={evaluation} />
        </div>
      )}

      {!evaluation && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex flex-wrap items-center gap-2 border-t border-slate-800 p-4"
        >
          <VoiceInputButton
            isListening={isListening}
            isSupported={isSupported}
            disabled={isLoading || !started}
            label={copy.voiceInput}
            listeningLabel={copy.voiceListening}
            unsupportedTitle={copy.voiceUnsupported}
            onClick={() => {
              toggle((text) => setInput(text), input);
            }}
          />
          <input
            type="text"
            value={input}
            onChange={(e) => {
              if (isListening) stopVoice();
              setInput(e.target.value);
            }}
            disabled={isLoading || !started}
            placeholder={
              closingComplete
                ? copy.inputClosingPlaceholder
                : copy.inputPlaceholder
            }
            className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || !started}
            className="rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {copy.send}
          </button>
          <button
            type="button"
            onClick={endInterview}
            disabled={isLoading || !started || messages.length < 2}
            className={`rounded-lg px-4 py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 ${
              closingComplete || canSuggestEnd
                ? "bg-emerald-600 text-white hover:bg-emerald-500"
                : "border border-slate-600 bg-slate-800/80 text-slate-200 hover:border-slate-500 hover:bg-slate-700"
            }`}
          >
            {closingComplete || canSuggestEnd
              ? copy.getMyReport
              : copy.endInterview}
          </button>
        </form>
      )}
    </div>
  );
}
