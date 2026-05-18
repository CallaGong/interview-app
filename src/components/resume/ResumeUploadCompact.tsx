"use client";

import { useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import type { ResumeUiCopy } from "@/lib/resume/i18n";

interface ResumeUploadCompactProps {
  copy: ResumeUiCopy;
  fileName: string;
  isLoading?: boolean;
  onFileAccepted: (file: File) => void;
  onReupload?: () => void;
}

export default function ResumeUploadCompact({
  copy,
  fileName,
  isLoading,
  onFileAccepted,
  onReupload,
}: ResumeUploadCompactProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback(
    (accepted: File[]) => {
      const file = accepted[0];
      if (file) onFileAccepted(file);
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    disabled: isLoading,
    noClick: true,
  });

  const openPicker = () => {
    onReupload?.();
    inputRef.current?.click();
  };

  return (
    <div
      {...getRootProps()}
      className={`rounded-xl border border-slate-700/80 bg-slate-900/80 p-5 transition ${
        isDragActive ? "border-sky-500/50 bg-sky-500/5" : ""
      }`}
    >
      <input {...getInputProps()} />
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileAccepted(file);
          e.target.value = "";
        }}
      />

      <div className="flex flex-col items-center text-center">
        <div
          className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${
            isLoading ? "bg-sky-500/10" : "bg-slate-800"
          }`}
        >
          {isLoading ? (
            <div className="flex gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky-500 [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky-500 [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky-500" />
            </div>
          ) : (
            <svg
              className="h-6 w-6 text-sky-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          )}
        </div>

        <p
          className="mb-1 w-full truncate text-sm font-medium text-white"
          title={fileName}
        >
          {fileName}
        </p>
        <p className="mb-4 text-xs text-slate-500">
          {isLoading ? copy.analyzing : copy.pdfUploaded}
        </p>

        {!isLoading && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openPicker();
            }}
            className="w-full rounded-lg border border-slate-600 bg-slate-800/80 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-700 hover:text-white"
          >
            {copy.reupload}
          </button>
        )}

        {isDragActive && (
          <p className="mt-3 text-xs text-sky-400">{copy.dropReplace}</p>
        )}
      </div>
    </div>
  );
}
