export const INTERVIEW_QUESTION_BANK = [
  "Why consulting?",
  "Tell me about a time you led a team through a difficult situation.",
  "Describe a time you analyzed complex data to solve a problem.",
  "Tell me about a time you failed. What did you learn?",
  "Give me an example of when you influenced someone without authority.",
  "Tell me about your most significant achievement.",
  "Describe a time you dealt with ambiguity.",
] as const;

export function pickRandomQuestions(count: number): string[] {
  const pool = [...INTERVIEW_QUESTION_BANK];
  const picked: string[] = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked;
}
