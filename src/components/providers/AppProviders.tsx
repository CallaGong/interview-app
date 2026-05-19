"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { getClerkPublishableKey } from "@/lib/clerk-config";

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const publishableKey = getClerkPublishableKey();

  if (!publishableKey) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider appearance={clerkAppearance} publishableKey={publishableKey}>
      {children}
    </ClerkProvider>
  );
}
