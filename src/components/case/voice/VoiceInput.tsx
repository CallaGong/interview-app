"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiUrl } from "@/lib/api";

const VOICE_MODE_STORAGE_KEY = "caseready_voice_record_mode";

export type VoiceInputMode = "hold" | "click";

export interface VoiceInputProps {
  language: "en" | "zh";
  mode?: VoiceInputMode;
  disabled?: boolean;
  /** Fills parent input (Case Practice). Ignored if `onSend` is set. */
  onTranscribed?: (text: string) => void;
  /** Send transcript immediately without parent input step (Live Mode). */
  onSend?: (text: string) => void;
  /** Move transcript to parent input for manual edit before send. */
  onEdit?: (text: string) => void;
  onError?: (message: string) => void;
}

type Phase = "idle" | "recording" | "transcribing" | "review";

function loadStoredMode(): VoiceInputMode {
  if (typeof window === "undefined") return "hold";
  return localStorage.getItem(VOICE_MODE_STORAGE_KEY) === "click" ? "click" : "hold";
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function pickMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
    return "audio/webm;codecs=opus";
  }
  if (MediaRecorder.isTypeSupported("audio/webm")) {
    return "audio/webm";
  }
  if (MediaRecorder.isTypeSupported("audio/mp4")) {
    return "audio/mp4";
  }
  return "";
}

export default function VoiceInput({
  language,
  mode: modeProp,
  disabled = false,
  onTranscribed,
  onSend,
  onEdit,
  onError,
}: VoiceInputProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [recordMode, setRecordMode] = useState<VoiceInputMode>(modeProp ?? "hold");
  const [durationSec, setDurationSec] = useState(0);
  const [waveLevels, setWaveLevels] = useState<number[]>([0.2, 0.2, 0.2, 0.2, 0.2]);
  const [transcript, setTranscript] = useState("");
  const [editing, setEditing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const durationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingStartRef = useRef<number>(0);
  const isRecordingRef = useRef(false);
  const activeMimeTypeRef = useRef<string>("audio/webm");
  const stopRecordingRef = useRef<() => void>(() => {});

  const copy =
    language === "zh"
      ? {
          holdHint: "按住说话",
          clickHint: "点击开始 / 再点结束",
          transcribing: "转写中…",
          redo: "重新录",
          edit: "编辑",
          send: "发送",
          holdMode: "按住说话",
          clickMode: "点击切换",
          micDenied: "无法访问麦克风，请检查浏览器权限",
          noMic: "当前浏览器不支持录音",
          transcribeFailed: "转写失败，请重试",
        }
      : {
          holdHint: "Hold to speak",
          clickHint: "Tap to start / tap to stop",
          transcribing: "Transcribing…",
          redo: "Re-record",
          edit: "Edit",
          send: "Send",
          holdMode: "Hold",
          clickMode: "Tap toggle",
          micDenied: "Microphone access denied. Check browser permissions.",
          noMic: "Recording is not supported in this browser.",
          transcribeFailed: "Transcription failed",
        };

  useEffect(() => {
    if (modeProp) setRecordMode(modeProp);
    else setRecordMode(loadStoredMode());
  }, [modeProp]);

  const cleanupMedia = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        /* ignore */
      }
    }
    mediaRecorderRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    void audioContextRef.current?.close().catch(() => {});
    audioContextRef.current = null;
    analyserRef.current = null;
    isRecordingRef.current = false;
  }, []);

  useEffect(() => () => cleanupMedia(), [cleanupMedia]);

  const uploadAndTranscribe = useCallback(
    async (blob: Blob, mimeType: string) => {
      setPhase("transcribing");
      console.log("Uploading to Whisper...", {
        blobSize: blob.size,
        mimeType,
      });

      try {
        const formData = new FormData();
        formData.append("audio", blob, `recording.${mimeType.includes("mp4") ? "mp4" : "webm"}`);
        formData.append("mimeType", mimeType);
        formData.append("language", language);

        const res = await fetch(apiUrl("/api/voice/transcribe"), {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = (await res.json().catch(() => ({}))) as { error?: string };
          console.error("Whisper upload failed:", res.status, err);
          throw new Error(err.error || copy.transcribeFailed);
        }

        const data = (await res.json()) as { text?: string };
        const text = (data.text ?? "").trim();
        console.log("Transcription result:", text);
        setTranscript(text);
        setPhase("review");
        setEditing(false);
      } catch (e) {
        console.error("Transcription error:", e);
        onError?.(e instanceof Error ? e.message : copy.transcribeFailed);
        setPhase("idle");
      }
    },
    [copy.transcribeFailed, language, onError]
  );

  const stopRecording = useCallback(() => {
    if (!isRecordingRef.current) return;
    isRecordingRef.current = false;

    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      cleanupMedia();
      setPhase("idle");
      return;
    }

    const mimeType = activeMimeTypeRef.current;

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, {
        type: mimeType || "audio/webm",
      });
      chunksRef.current = [];
      cleanupMedia();

      console.log("Recording stopped, blob size:", blob.size, "mimeType:", mimeType);

      if (blob.size < 100) {
        console.warn("Recording too short, discarding");
        setPhase("idle");
        return;
      }

      void uploadAndTranscribe(blob, mimeType);
    };

    try {
      recorder.stop();
    } catch (e) {
      console.error("MediaRecorder.stop failed:", e);
      cleanupMedia();
      setPhase("idle");
    }
  }, [cleanupMedia, uploadAndTranscribe]);

  stopRecordingRef.current = stopRecording;

  const monitorAudio = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser || !isRecordingRef.current) return;

    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    const levels = Array.from({ length: 5 }, (_, i) => {
      const slice = data[Math.floor((i / 5) * data.length)] ?? 0;
      return Math.max(0.15, slice / 255);
    });
    setWaveLevels(levels);

    const elapsed = Math.floor((Date.now() - recordingStartRef.current) / 1000);
    setDurationSec(elapsed);

    rafRef.current = requestAnimationFrame(monitorAudio);
  }, []);

  const startRecording = useCallback(async () => {
    if (disabled || isRecordingRef.current) return;

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      console.error("getUserMedia not available");
      onError?.(copy.noMic);
      return;
    }

    if (typeof MediaRecorder === "undefined") {
      console.error("MediaRecorder not available");
      onError?.(copy.noMic);
      return;
    }

    try {
      console.log("Requesting microphone...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = pickMimeType();
      activeMimeTypeRef.current = mimeType || "audio/webm";

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      activeMimeTypeRef.current = recorder.mimeType || mimeType || "audio/webm";

      console.log(
        "MediaRecorder created with mimeType:",
        activeMimeTypeRef.current
      );

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onerror = (e) => {
        console.error("MediaRecorder error:", e);
      };

      recorder.start(200);
      console.log("Recording started");

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      isRecordingRef.current = true;
      recordingStartRef.current = Date.now();
      setDurationSec(0);
      setPhase("recording");

      durationTimerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - recordingStartRef.current) / 1000);
        setDurationSec(elapsed);
      }, 500);

      rafRef.current = requestAnimationFrame(monitorAudio);
    } catch (e) {
      console.error("Microphone request failed:", e);
      onError?.(copy.micDenied);
      cleanupMedia();
      setPhase("idle");
    }
  }, [cleanupMedia, copy.micDenied, copy.noMic, disabled, monitorAudio, onError]);

  const toggleRecordMode = () => {
    const next = recordMode === "hold" ? "click" : "hold";
    setRecordMode(next);
    localStorage.setItem(VOICE_MODE_STORAGE_KEY, next);
  };

  const handleMicPointerDown = (e: React.PointerEvent) => {
    if (recordMode !== "hold" || disabled || phase !== "idle") return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    void startRecording();
  };

  const handleMicPointerUp = (e: React.PointerEvent) => {
    if (recordMode !== "hold") return;
    if ((e.target as HTMLElement).hasPointerCapture(e.pointerId)) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
    stopRecording();
  };

  const handleMicClick = () => {
    if (recordMode !== "click" || disabled) return;
    if (phase === "recording") stopRecording();
    else if (phase === "idle") void startRecording();
  };

  const resetReview = () => {
    setTranscript("");
    setPhase("idle");
    setEditing(false);
  };

  const handleConfirmSend = () => {
    const text = transcript.trim();
    if (!text) return;
    if (onSend) {
      onSend(text);
    } else if (onTranscribed) {
      onTranscribed(text);
    }
    resetReview();
  };

  const handleEditClick = () => {
    const text = transcript.trim();
    if (onEdit) {
      if (text) onEdit(text);
      resetReview();
      return;
    }
    setEditing((v) => !v);
  };

  if (phase === "review" || phase === "transcribing") {
    return (
      <div className="border-t border-slate-800 p-4">
        {phase === "transcribing" ? (
          <p className="py-8 text-center text-sm text-slate-400">{copy.transcribing}</p>
        ) : (
          <div className="space-y-4">
            {editing ? (
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            ) : (
              <p className="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-3 text-sm text-slate-200">
                {transcript}
              </p>
            )}
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setPhase("idle");
                  setTranscript("");
                  setEditing(false);
                }}
                className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
              >
                {copy.redo}
              </button>
              <button
                type="button"
                onClick={handleEditClick}
                className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
              >
                {copy.edit}
              </button>
              <button
                type="button"
                onClick={handleConfirmSend}
                disabled={!transcript.trim()}
                className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50"
              >
                {copy.send}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="border-t border-slate-800 p-4">
      <div className="relative flex flex-col items-center gap-4">
        <span className="absolute right-0 top-0 text-xs text-slate-500">
          {recordMode === "hold" ? copy.holdMode : copy.clickMode}
          {" · "}
          <button
            type="button"
            onClick={toggleRecordMode}
            className="text-sky-400 hover:text-sky-300"
            disabled={disabled}
          >
            {language === "zh" ? "切换" : "Switch"}
          </button>
        </span>

        <div className="relative">
          {phase === "recording" && (
            <span className="absolute -right-2 -top-2 rounded-md bg-rose-500/90 px-2 py-0.5 font-mono text-xs text-white">
              {formatDuration(durationSec)}
            </span>
          )}

          <button
            type="button"
            disabled={disabled}
            onPointerDown={handleMicPointerDown}
            onPointerUp={handleMicPointerUp}
            onPointerCancel={handleMicPointerUp}
            onClick={() => {
              if (recordMode === "click") handleMicClick();
            }}
            className={`relative flex h-24 w-24 items-center justify-center rounded-full transition shadow-lg ${
              phase === "recording"
                ? "bg-rose-600 hover:bg-rose-500 ring-4 ring-rose-500/40"
                : "bg-sky-600 hover:bg-sky-500 ring-4 ring-sky-500/30"
            } disabled:cursor-not-allowed disabled:opacity-50`}
            aria-label={recordMode === "hold" ? copy.holdHint : copy.clickHint}
          >
            {phase === "recording" ? (
              <div className="flex h-10 items-end justify-center gap-1">
                {waveLevels.map((level, i) => (
                  <span
                    key={i}
                    className="w-1.5 rounded-full bg-white/90 transition-[height] duration-75"
                    style={{ height: `${8 + level * 28}px` }}
                  />
                ))}
              </div>
            ) : (
              <span className="text-3xl" aria-hidden>
                🎤
              </span>
            )}
          </button>
        </div>

        <p className="text-center text-xs text-slate-500">
          {recordMode === "hold" ? copy.holdHint : copy.clickHint}
          {language === "zh" ? " · 松开结束" : " · Release to finish"}
        </p>
      </div>
    </div>
  );
}
