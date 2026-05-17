export interface Env {
  DB: D1Database;
  CASE_CACHE: KVNamespace;
  RESUMES: R2Bucket;
  ASSETS: Fetcher;
  ANTHROPIC_API_KEY: string;
  CLERK_SECRET_KEY?: string;
  CLERK_PUBLISHABLE_KEY?: string;
  CLAUDE_MODEL: string;
}

export type SessionType = "resume" | "interview" | "case";

export interface CaseQuestionRow {
  id: string;
  title: string;
  type: string;
  difficulty: "easy" | "medium" | "hard";
  description: string;
  context: string | null;
  key_issues: string;
}

export interface CaseQuestion {
  id: string;
  title: string;
  type: string;
  difficulty: "easy" | "medium" | "hard";
  description: string;
  context: string;
  key_issues: string[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
