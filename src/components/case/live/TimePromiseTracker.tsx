"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CaseLocale } from "@/types/case-locale";

export interface TimePromiseTrackerProps {
  locale: CaseLocale;
  /** Total promised duration in seconds */
  promisedSeconds: number;
  /** Display label: promised minutes (e.g. 2 for "2 minutes") */
  labelMinutes: number;
  /** Unix ms when the promise timer started */
  startedAt: number;
  onExpired: () => void;
}

function barColor(remainingRatio: number, expired: boolean): string {
  if (expired) return "bg-rose-500";
  if (remainingRatio > 0.5) return "bg-sky-500";
  if (remainingRatio > 0.3) return "bg-amber-400";
  if (remainingRatio > 0.1) return "bg-orange-500";
  return "bg-rose-500 animate-pulse";
}

export default function TimePromiseTracker({
  locale,
  promisedSeconds,
  labelMinutes,
  startedAt,
  onExpired,
}: TimePromiseTrackerProps) {
  const [remaining, setRemaining] = useState(promisedSeconds);
  const expiredRef = useRef(false);
  const onExpiredRef = useRef(onExpired);
  onExpiredRef.current = onExpired;

  useEffect(() => {
    expiredRef.current = false;
    const tick = () => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const left = Math.max(0, promisedSeconds - elapsed);
      setRemaining(left);

      if (left === 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpiredRef.current();
      }
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [promisedSeconds, startedAt]);

  const expired = remaining === 0;
  const ratio = promisedSeconds > 0 ? remaining / promisedSeconds : 0;
  const fillPct = expired ? 100 : Math.max(0, Math.min(100, ratio * 100));

  const copy =
    locale === "zh"
      ? {
          label: `面试官给了你 ${labelMinutes} 分钟`,
          remaining: (s: number) => `还剩 ${s} 秒`,
          hint30: "还剩 30 秒",
          hint10: "只剩 10 秒，准备提交",
          timesUp: "时间到",
        }
      : {
          label: `Interviewer gave you ${labelMinutes} min`,
          remaining: (s: number) => `${s}s left`,
          hint30: "30 seconds left",
          hint10: "Only 10 seconds — get ready to answer",
          timesUp: "Time's up",
        };

  const hint = useMemo(() => {
    if (expired) return copy.timesUp;
    if (remaining <= 10) return copy.hint10;
    if (remaining <= 30) return copy.hint30;
    return null;
  }, [copy, expired, remaining]);

  const hintClass =
    remaining <= 10 && !expired
      ? "font-semibold text-rose-400"
      : remaining <= 30 && !expired
        ? "text-amber-300"
        : expired
          ? "font-semibold text-rose-400"
          : "text-slate-500";

  return (
    <div className="mb-3 space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-slate-400">
          <span aria-hidden className="mr-1">
            ⏱
          </span>
          {copy.label}
          {!expired && (
            <span className="text-slate-500">
              {" · "}
              {copy.remaining(remaining)}
            </span>
          )}
        </span>
        <span
          className={`font-mono tabular-nums ${
            expired
              ? "font-semibold text-rose-400"
              : remaining <= 10
                ? "font-semibold text-rose-400"
                : remaining <= 30
                  ? "text-amber-300"
                  : "text-sky-300"
          }`}
        >
          {expired ? "0:00" : `${Math.floor(remaining / 60)}:${(remaining % 60).toString().padStart(2, "0")}`}
        </span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full transition-[width] duration-1000 ease-linear ${barColor(ratio, expired)}`}
          style={{ width: `${fillPct}%` }}
        />
      </div>

      {hint && (
        <p className={`text-center text-xs ${hintClass} ${remaining <= 10 && !expired ? "animate-pulse" : ""}`}>
          {hint}
        </p>
      )}
    </div>
  );
}
