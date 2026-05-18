"use client";

interface VoiceInputButtonProps {
  isListening: boolean;
  isSupported: boolean;
  disabled?: boolean;
  label: string;
  listeningLabel: string;
  unsupportedTitle: string;
  onClick: () => void;
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
      />
    </svg>
  );
}

export default function VoiceInputButton({
  isListening,
  isSupported,
  disabled,
  label,
  listeningLabel,
  unsupportedTitle,
  onClick,
}: VoiceInputButtonProps) {
  const isDisabled = disabled || !isSupported;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      title={!isSupported ? unsupportedTitle : isListening ? listeningLabel : label}
      aria-label={isListening ? listeningLabel : label}
      aria-pressed={isListening}
      className={`relative flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-40 ${
        isListening
          ? "border-rose-500/60 bg-rose-500/15 text-rose-400 ring-2 ring-rose-500/30"
          : "border-slate-600 bg-slate-800/80 text-slate-300 hover:border-slate-500 hover:bg-slate-700 hover:text-white"
      }`}
    >
      {isListening && (
        <span className="absolute inset-0 animate-ping rounded-lg bg-rose-500/20" />
      )}
      <MicIcon className="relative h-5 w-5" />
    </button>
  );
}
