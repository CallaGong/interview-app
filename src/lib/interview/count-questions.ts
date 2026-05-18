import {
  INTERVIEW_COMPLETE_MARKER,
  NEW_QUESTION_MARKER,
} from "@/types/interview";
import type { ChatMessage } from "@/types";

export const MIN_MAIN_PROBES = 5;
export const MAX_MAIN_PROBES = 8;

export function countMainProbes(messages: ChatMessage[]): number {
  return messages.filter(
    (m) => m.role === "assistant" && m.content.includes(NEW_QUESTION_MARKER)
  ).length;
}

/** @deprecated Use countMainProbes */
export const countCompletedQuestions = countMainProbes;

export function isInterviewClosingComplete(messages: ChatMessage[]): boolean {
  return messages.some(
    (m) =>
      m.role === "assistant" && m.content.includes(INTERVIEW_COMPLETE_MARKER)
  );
}

export function stripInterviewMarkers(text: string): string {
  return text
    .replaceAll(NEW_QUESTION_MARKER, "")
    .replaceAll(INTERVIEW_COMPLETE_MARKER, "")
    .trim();
}

/** @deprecated Use stripInterviewMarkers */
export const stripQuestionMarkers = stripInterviewMarkers;
