import { SignUp } from "@clerk/nextjs";
import AuthPageLayout from "@/components/auth/AuthPageLayout";
import { clerkAuthFormLightAppearance } from "@/lib/clerk-appearance";

export const dynamic = "force-dynamic";

export default function SignUpPage() {
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
