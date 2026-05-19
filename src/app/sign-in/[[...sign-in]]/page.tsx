import { SignIn } from "@clerk/nextjs";
import AuthPageLayout from "@/components/auth/AuthPageLayout";
import { clerkAuthFormLightAppearance } from "@/lib/clerk-appearance";

export const dynamic = "force-dynamic";

export default function SignInPage() {
  return (
    <AuthPageLayout>
      <SignIn
        appearance={clerkAuthFormLightAppearance}
        fallbackRedirectUrl="/"
        signUpUrl="/sign-up"
      />
    </AuthPageLayout>
  );
}
