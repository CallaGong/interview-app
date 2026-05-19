"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { getClerkPublishableKey } from "@/lib/clerk-config";
import UserAccountMenu from "./UserAccountMenu";

const signInClass =
  "inline-flex items-center rounded-lg border border-white/50 bg-transparent px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:border-white hover:bg-white/10";

const signUpClass =
  "inline-flex items-center rounded-lg border border-sky-300 bg-sky-400 px-3.5 py-1.5 text-sm font-semibold text-slate-950 shadow-md shadow-sky-950/40 transition hover:bg-sky-300 hover:border-sky-200";

function SignInUpLinks() {
  return (
    <div className="flex items-center gap-2.5">
      <Link href="/sign-in" className={signInClass}>
        Sign in
      </Link>
      <Link href="/sign-up" className={signUpClass}>
        Sign up
      </Link>
    </div>
  );
}

function AuthNavWithClerk() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded || !isSignedIn) {
    return <SignInUpLinks />;
  }

  return <UserAccountMenu />;
}

export default function AuthNav() {
  if (!getClerkPublishableKey()) {
    return null;
  }

  return <AuthNavWithClerk />;
}
