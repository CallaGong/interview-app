"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { InterviewLocale } from "@/types/interview";

type SpeechRecognitionResultList = {
  length: number;
  [index: number]: {
    isFinal: boolean;
    [index: number]: { transcript: string };
  };
};

type SpeechRecognitionResultEvent = {
  resultIndex: number;
  results: SpeechRecognitionResultList;
};

type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function speechLang(locale: InterviewLocale): string {
  return locale === "zh" ? "zh-CN" : "en-US";
}

export function useSpeechRecognition(locale: InterviewLocale) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const committedRef = useRef("");
  const onResultRef = useRef<(text: string) => void>(() => {});

  useEffect(() => {
    setIsSupported(getSpeechRecognitionCtor() !== null);
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
  }, []);

  const start = useCallback(
    (onTranscript: (text: string) => void, committedPrefix: string) => {
      const Ctor = getSpeechRecognitionCtor();
      if (!Ctor) return false;

      recognitionRef.current?.abort();

      committedRef.current = committedPrefix.trim();
      onResultRef.current = onTranscript;

      const recognition = new Ctor();
      recognition.lang = speechLang(locale);
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        let interim = "";
        let finals = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0]?.transcript ?? "";
          if (result.isFinal) {
            finals += text;
          } else {
            interim += text;
          }
        }

        if (finals) {
          committedRef.current = [committedRef.current, finals.trim()]
            .filter(Boolean)
            .join(" ");
        }

        const combined = [committedRef.current, interim.trim()]
          .filter(Boolean)
          .join(" ");
        onResultRef.current(combined);
      };

      recognition.onerror = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };

      try {
        recognition.start();
        recognitionRef.current = recognition;
        setIsListening(true);
        return true;
      } catch {
        setIsListening(false);
        return false;
      }
    },
    [locale]
  );

  const toggle = useCallback(
    (
      onTranscript: (text: string) => void,
      committedPrefix: string
    ): boolean => {
      if (isListening) {
        stop();
        return true;
      }
      return start(onTranscript, committedPrefix);
    },
    [isListening, start, stop]
  );

  return { isListening, isSupported, start, stop, toggle };
}
