/** Publishable key (available on client after build). */
export function getClerkPublishableKey(): string | undefined {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim();
  return key || undefined;
}

/** True when both Clerk keys are set (middleware + server auth). */
export function isClerkConfigured(): boolean {
  return Boolean(
    getClerkPublishableKey() && process.env.CLERK_SECRET_KEY?.trim()
  );
}
