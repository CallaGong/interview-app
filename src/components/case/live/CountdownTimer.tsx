"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export interface CountdownTimerProps {
  durationSeconds: number;
  startedAt: Date | string | null;
  onTimeUp?: () => void;
  locale?: "en" | "zh";
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function remainingSeconds(
  durationSeconds: number,
  startedAt: Date | string | null
): number {
  if (!startedAt) return durationSeconds;
  const start =
    typeof startedAt === "string" ? new Date(startedAt).getTime() : startedAt.getTime();
  const elapsed = Math.floor((Date.now() - start) / 1000);
  return Math.max(0, durationSeconds - elapsed);
}

export default function CountdownTimer({
  durationSeconds,
  startedAt,
  onTimeUp,
  locale = "en",
}: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(() =>
    remainingSeconds(durationSeconds, startedAt)
  );
  const firedRef = useRef(false);
  const tickAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setRemaining(remainingSeconds(durationSeconds, startedAt));
    firedRef.current = false;
  }, [durationSeconds, startedAt]);

  useEffect(() => {
    if (!startedAt) return;
    const id = window.setInterval(() => {
      setRemaining(remainingSeconds(durationSeconds, startedAt));
    }, 1000);
    return () => window.clearInterval(id);
  }, [durationSeconds, startedAt]);

  useEffect(() => {
    if (remaining > 0 || firedRef.current) return;
    firedRef.current = true;
    onTimeUp?.();
  }, [remaining, onTimeUp]);

  useEffect(() => {
    if (remaining > 120 || remaining <= 0) return;
    try {
      if (!tickAudioRef.current) {
        tickAudioRef.current = new Audio(
          "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWi77eefTRAMUKfj8LZjHAY4kdfyzHksBSR3x/DdkEAKFF606euoVRQKRp/g8r5sIQUrgc7y2Yk2CBlou+3nn00QDFCn4/C2YxwGOJHX8sx5LAUkd8fw3ZBAC"
        );
        tickAudioRef.current.volume = 0.15;
      }
      void tickAudioRef.current.play().catch(() => {});
    } catch {
      /* optional audio */
    }
  }, [remaining]);

  const zone = useMemo(() => {
    if (remaining > 300) return "green";
    if (remaining > 120) return "yellow";
    return "red";
  }, [remaining]);

  const zoneClass =
    zone === "green"
      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-100"
      : zone === "yellow"
        ? "border-amber-500/50 bg-amber-500/10 text-amber-100 animate-pulse"
        : "border-rose-500/60 bg-rose-500/15 text-rose-100 animate-pulse";

  const pulseClass = zone === "red" ? "animate-pulse" : "";

  return (
    <div
      className={`shrink-0 rounded-lg border px-3 py-1.5 text-center ${zoneClass} ${pulseClass}`}
      role="timer"
      aria-live="polite"
    >
      <p className="text-[10px] uppercase tracking-wide opacity-80">
        {locale === "zh" ? "剩余时间" : "Time left"}
      </p>
      <p className="font-mono text-xl font-semibold tabular-nums leading-tight">
        {formatTime(remaining)}
      </p>
    </div>
  );
}
