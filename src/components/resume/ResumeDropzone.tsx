"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import type { ResumeUiCopy } from "@/lib/resume/i18n";

interface ResumeDropzoneProps {
  copy: ResumeUiCopy;
  fileName: string | null;
  isLoading: boolean;
  disabled?: boolean;
  onFileAccepted: (file: File) => void;
}

export default function ResumeDropzone({
  copy,
  fileName,
  isLoading,
  disabled,
  onFileAccepted,
}: ResumeDropzoneProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      const file = accepted[0];
      if (file) onFileAccepted(file);
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: { "application/pdf": [".pdf"] },
      maxFiles: 1,
      disabled: disabled || isLoading,
    });

  return (
    <div
      {...getRootProps()}
      className={`flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition ${
        isDragReject
          ? "border-rose-500/50 bg-rose-500/5"
          : isDragActive
            ? "border-sky-500/60 bg-sky-500/10"
            : "border-slate-700 bg-slate-900/60 hover:border-slate-600 hover:bg-slate-800/40"
      } ${disabled || isLoading ? "cursor-not-allowed opacity-70" : ""}`}
    >
      <input {...getInputProps()} />

      {isLoading ? (
        <>
          <div className="mb-4 flex gap-1.5">
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-sky-500 [animation-delay:-0.3s]" />
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-sky-500 [animation-delay:-0.15s]" />
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-sky-500" />
          </div>
          <p className="text-sm font-medium text-white">{copy.analyzingResume}</p>
          {fileName && (
            <p className="mt-2 max-w-full truncate text-xs text-slate-500">
              {fileName}
            </p>
          )}
        </>
      ) : (
        <>
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-2xl">
            📄
          </div>
          <p className="text-sm font-medium text-white">
            {isDragActive ? copy.dropHere : copy.dragDrop}
          </p>
          <p className="mt-2 text-xs text-slate-500">{copy.browseHint}</p>
          {fileName && !isLoading && (
            <p className="mt-4 max-w-full truncate rounded-lg bg-slate-800/80 px-3 py-1.5 text-xs text-sky-400">
              {copy.lastFile}: {fileName}
            </p>
          )}
        </>
      )}
    </div>
  );
}
