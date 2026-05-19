import { SignUp } from "@clerk/nextjs";
import AuthPageLayout from "@/components/auth/AuthPageLayout";
import ClerkSetupRequired from "@/components/auth/ClerkSetupRequired";
import { clerkAuthFormLightAppearance } from "@/lib/clerk-appearance";
import { isClerkConfigured } from "@/lib/clerk-config";

export const dynamic = "force-dynamic";

export default function SignUpPage() {
  if (!isClerkConfigured()) {
    return (
      <AuthPageLayout>
        <ClerkSetupRequired />
      </AuthPageLayout>
    );
  }

  return (
    <AuthPageLayout>
      <SignUp
        appearance={clerkAuthFormLightAppearance}
        fallbackRedirectUrl="/"
        signInUrl="/sign-in"
      />
    </AuthPageLayout>
  );
}
