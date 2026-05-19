"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function UserAccountMenu() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const displayName =
    user?.fullName?.trim() ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress ||
    "Account";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const imageUrl = user?.imageUrl;

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        close();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut({ redirectUrl: "/" });
    } finally {
      setSigningOut(false);
      close();
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2.5 rounded-lg px-1.5 py-1 transition hover:bg-slate-800/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60"
      >
        <span className="hidden max-w-[10rem] truncate text-sm font-semibold text-white sm:inline">
          {displayName}
        </span>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            width={32}
            height={32}
            unoptimized
            className="h-8 w-8 rounded-full object-cover ring-2 ring-violet-400/50"
          />
        ) : (
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-semibold text-white ring-2 ring-violet-400/50"
            aria-hidden
          >
            {getInitials(displayName)}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-slate-600 bg-[#1e293b] shadow-xl shadow-black/40"
        >
          <div className="px-4 py-3">
            <p className="truncate text-sm font-semibold text-white">
              {displayName}
            </p>
            {email ? (
              <p className="mt-0.5 truncate text-xs text-slate-300">{email}</p>
            ) : null}
          </div>

          <div className="border-t border-slate-600" />

          <button
            type="button"
            role="menuitem"
            disabled={signingOut}
            onClick={handleSignOut}
            className="w-full px-4 py-2.5 text-left text-sm font-medium text-red-400 transition hover:bg-slate-700/60 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      )}
    </div>
  );
}
