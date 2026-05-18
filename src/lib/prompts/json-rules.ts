/** Shared rules so Claude returns parseable JSON (especially with Chinese quotes). */
export const RESUME_JSON_RULES = `
JSON output rules (strict):
- Return raw JSON only — no markdown fences, no commentary before or after.
- Escape every double quote inside string values as \\".
- Do not use literal line breaks inside strings; use spaces instead.
- Use standard ASCII double quotes for JSON keys and string delimiters (not Chinese “ ” curly quotes inside JSON).
- Keep "original" and "suggested" strings on one line each.
`;
