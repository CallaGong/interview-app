"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { apiUrl } from "@/lib/api";
import { getInterviewUiCopy } from "@/lib/interview/i18n";
import type { InterviewLocale } from "@/types/interview";

interface InterviewPrepProps {
  locale: InterviewLocale;
  onStart: (resumeText: string | null) => void;
}

export default function InterviewPrep({ locale, onStart }: InterviewPrepProps) {
  const copy = getInterviewUiCopy(locale);
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (accepted: File[]) => {
    const file = accepted[0];
    if (!file) return;

    setParsing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(apiUrl("/api/interview/parse-resume"), {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          (data as { error?: string }).error || copy.parseFailed
        );
      }

      setResumeText((data as { text: string }).text);
      setFileName((data as { fileName?: string }).fileName ?? file.name);
    } catch (e) {
      setError(e instanceof Error ? e.message : copy.parseFailed);
    } finally {
      setParsing(false);
    }
  }, [copy.parseFailed]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    disabled: parsing,
  });

  const hasResume = resumeText.trim().length > 0;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 sm:p-5">
        <p className="text-sm leading-relaxed text-sky-100/90">
          <span className="font-medium text-sky-400">{copy.tipLabel}</span>{" "}
          {copy.tipBody}
        </p>
      </div>

      <div className="mb-6">
        <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-slate-500">
          {copy.step1Title}
        </h2>
        <p className="mb-4 text-sm text-slate-400">{copy.step1Description}</p>

        <div
          {...getRootProps()}
          className={`mb-4 cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition ${
            isDragActive
              ? "border-sky-500/60 bg-sky-500/10"
              : "border-slate-700 bg-slate-900/60 hover:border-slate-600"
          } ${parsing ? "cursor-not-allowed opacity-70" : ""}`}
        >
          <input {...getInputProps()} />
          {parsing ? (
            <p className="text-sm text-slate-300">{copy.readingPdf}</p>
          ) : (
            <>
              <p className="text-sm font-medium text-white">
                {isDragActive ? copy.dropActive : copy.dropIdle}
              </p>
              <p className="mt-1 text-xs text-slate-500">{copy.dropBrowse}</p>
            </>
          )}
          {fileName && !parsing && (
            <p className="mt-3 text-xs text-sky-400">{fileName}</p>
          )}
        </div>

        <textarea
          value={resumeText}
          onChange={(e) => {
            setResumeText(e.target.value);
            if (!e.target.value.trim()) setFileName(null);
          }}
          placeholder={copy.pastePlaceholder}
          rows={8}
          className="w-full resize-y rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
      </div>

      {error && <p className="mb-4 text-sm text-rose-400">{error}</p>}

      <div className="border-t border-slate-800 pt-6">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-slate-500">
          {copy.step2Title}
        </h2>
        <button
          type="button"
          onClick={() => onStart(hasResume ? resumeText.trim() : null)}
          disabled={parsing}
          className="w-full rounded-lg bg-sky-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-900/30 transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {copy.startInterview}
        </button>
        <p className="mt-3 text-xs text-slate-500">
          {hasResume ? copy.startWithResume : copy.startWithoutResume}
        </p>
      </div>
    </div>
  );
}
