"use client";

import { useCallback, useState } from "react";
import { apiUrl } from "@/lib/api";
import { getResumeUiCopy } from "@/lib/resume/i18n";
import type { ResumeAnalysisResult, ResumeLocale } from "@/types/resume";
import ResumeDropzone from "./ResumeDropzone";
import ResumeResults from "./ResumeResults";
import ResumeUploadCompact from "./ResumeUploadCompact";

interface ResumePanelProps {
  locale: ResumeLocale;
  analyzeEndpoint: string;
  dimensionKeys: string[];
  dimensionLabels: Record<string, string>;
  standardLabel: string;
  emptyHint: string;
}

export default function ResumePanel({
  locale,
  analyzeEndpoint,
  dimensionKeys,
  dimensionLabels,
  standardLabel,
  emptyHint,
}: ResumePanelProps) {
  const copy = getResumeUiCopy(locale);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResumeAnalysisResult | null>(null);

  const handleReupload = useCallback(() => {
    setResult(null);
    setError(null);
    setFileName(null);
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      setFileName(file.name);
      setIsLoading(true);
      setError(null);
      setResult(null);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(apiUrl(analyzeEndpoint), {
          method: "POST",
          body: formData,
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(
            (data as { error?: string }).error || copy.analysisFailed
          );
        }

        setResult((data as { feedback: ResumeAnalysisResult }).feedback);
        if ((data as { fileName?: string }).fileName) {
          setFileName((data as { fileName: string }).fileName);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : copy.analysisFailed);
      } finally {
        setIsLoading(false);
      }
    },
    [analyzeEndpoint, copy.analysisFailed]
  );

  const isCompactLayout = isLoading || !!result;

  return (
    <div
      className={
        isCompactLayout
          ? "flex min-w-0 flex-col gap-6 lg:flex-row lg:gap-8"
          : "grid min-w-0 gap-6 lg:grid-cols-2 lg:gap-8"
      }
    >
      <section
        className={
          isCompactLayout ? "w-full shrink-0 lg:w-[30%]" : "min-w-0"
        }
      >
        {!isCompactLayout && (
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-500">
            {copy.upload}
          </h2>
        )}
        {isCompactLayout && fileName ? (
          <ResumeUploadCompact
            copy={copy}
            fileName={fileName}
            isLoading={isLoading}
            onFileAccepted={handleFile}
            onReupload={handleReupload}
          />
        ) : (
          <ResumeDropzone
            copy={copy}
            fileName={fileName}
            isLoading={isLoading}
            onFileAccepted={handleFile}
          />
        )}
        {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}
      </section>

      <section
        className={
          isCompactLayout ? "min-w-0 flex-1 lg:w-[70%]" : "min-w-0"
        }
      >
        {!isCompactLayout && (
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-500">
            {copy.results}
          </h2>
        )}
        {result && !isLoading ? (
          <ResumeResults
            copy={copy}
            result={result}
            dimensionKeys={dimensionKeys}
            dimensionLabels={dimensionLabels}
            standardLabel={standardLabel}
          />
        ) : (
          <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center">
            <p className="text-sm text-slate-500">
              {isLoading ? copy.loadingResults : emptyHint}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
