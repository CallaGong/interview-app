"use client";

import type { CaseLocale } from "@/types/case-locale";

interface CaseLocaleToggleProps {
  locale: CaseLocale;
  onChange: (locale: CaseLocale) => void;
  disabled?: boolean;
}

export default function CaseLocaleToggle({
  locale,
  onChange,
  disabled,
}: CaseLocaleToggleProps) {
  return (
    <div
      className="inline-flex rounded-lg border border-slate-700 bg-slate-800/60 p-0.5"
      role="group"
      aria-label="Case language"
    >
      {(
        [
          { value: "en" as const, label: "English" },
          { value: "zh" as const, label: "中文" },
        ] as const
      ).map(({ value, label }) => (
        <button
          key={value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(value)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
            locale === value
              ? "bg-sky-600 text-white"
              : "text-slate-400 hover:text-white"
          } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
