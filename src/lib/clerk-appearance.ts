import type { ClerkProvider } from "@clerk/nextjs";
import type { ComponentProps } from "react";

type Appearance = NonNullable<ComponentProps<typeof ClerkProvider>["appearance"]>;


/** Dark theme aligned with CaseReady (slate-950 / sky accents). */
export const clerkAppearance: Appearance = {
  variables: {
    colorBackground: "#020617",
    colorInputBackground: "#0f172a",
    colorInputText: "#f8fafc",
    colorText: "#f1f5f9",
    colorTextSecondary: "#94a3b8",
    colorPrimary: "#0284c7",
    colorDanger: "#f43f5e",
    colorSuccess: "#10b981",
    colorWarning: "#f59e0b",
    borderRadius: "0.5rem",
    fontFamily: "inherit",
    fontSize: "0.875rem",
  },
  elements: {
    rootBox: "mx-auto w-full",
    card: "bg-slate-900/95 border border-slate-700/80 shadow-xl shadow-black/40 rounded-xl",
    header: "hidden",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    socialButtonsBlockButton:
      "bg-slate-800 border-slate-600 text-white hover:bg-slate-700",
    formButtonPrimary:
      "bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-900/30",
    formFieldInput:
      "bg-slate-800/80 border-slate-700 text-white focus:border-sky-500",
    footerActionLink: "text-sky-400 hover:text-sky-300",
    identityPreviewEditButton: "text-sky-400",
    formFieldLabel: "text-slate-300",
    dividerLine: "bg-slate-700",
    dividerText: "text-slate-500",
    alertText: "text-slate-300",
    userButtonPopoverCard:
      "bg-slate-900 border border-slate-600 shadow-xl shadow-black/50",
    userButtonPopoverActionButton: "text-white hover:bg-slate-800",
    userButtonPopoverActionButtonText: "text-sm font-medium text-white",
    userButtonOuterIdentifier: "text-sm font-semibold text-white",
    userButtonPopoverFooter: "hidden",
  },
};

/** Opaque card styling for sign-in / sign-up pages (not transparent). */
export const authCardAppearance: Appearance = {
  ...clerkAppearance,
  variables: {
    ...clerkAppearance.variables,
    colorBackground: "#1a2235",
    colorText: "#ffffff",
    colorTextSecondary: "#94a3b8",
    colorInputBackground: "#0f172a",
    colorInputText: "#ffffff",
  },
  elements: {
    ...clerkAppearance.elements,
    rootBox: "mx-auto w-full",
    cardBox: "w-full shadow-none",
    card: "w-full rounded-xl border-0 bg-[#1a2235] shadow-none ring-0",
    footer: "bg-[#1a2235]",
    form: "bg-[#1a2235]",
    main: "bg-[#1a2235]",
    formFieldLabel: "text-slate-200",
    footerActionLink: "text-sky-400 hover:text-sky-300",
    socialButtonsBlockButton:
      "bg-slate-900 border-slate-600 text-white hover:bg-slate-950",
  },
};

/** Shared appearance for SignIn / SignUp (variables + card elements). */
export const clerkAuthFormAppearance: Appearance = authCardAppearance;

/** Light auth pages — readable text on white / light gray backgrounds. */
export const clerkAuthFormLightAppearance: Appearance = {
  variables: {
    colorBackground: "#ffffff",
    colorText: "#0f172a",
    colorTextSecondary: "#64748b",
    colorInputBackground: "#f8fafc",
    colorInputText: "#0f172a",
    colorPrimary: "#0284c7",
    colorDanger: "#dc2626",
    borderRadius: "0.5rem",
    fontFamily: "inherit",
    fontSize: "0.875rem",
  },
  elements: {
    rootBox: "mx-auto w-full",
    cardBox: "w-full shadow-none",
    card: "w-full rounded-xl border-0 bg-white shadow-none ring-0",
    header: "hidden",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    footer: "bg-white",
    form: "bg-white",
    main: "bg-white",
    formFieldLabel: "text-slate-700 font-medium",
    formFieldInput:
      "bg-slate-50 border-slate-300 text-slate-900 focus:border-sky-500",
    formButtonPrimary:
      "bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-900/20",
    footerActionLink: "text-sky-600 hover:text-sky-700 font-medium",
    socialButtonsBlockButton:
      "bg-white border-slate-300 text-slate-800 hover:bg-slate-50",
    dividerLine: "bg-slate-200",
    dividerText: "text-slate-500",
    identityPreviewEditButton: "text-sky-600",
    alertText: "text-slate-700",
  },
};
