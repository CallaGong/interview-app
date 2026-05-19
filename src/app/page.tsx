import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export const dynamic = "force-dynamic";
import Logo from "@/components/layout/Logo";

const FEATURES = [
  {
    title: "Case practice",
    description:
      "Practice with an AI interviewer that guides you through real consulting cases. Track your framework, hypothesis, and recommendation as you go.",
    href: "/case",
    cta: "Start practicing",
    available: true,
    icon: CaseIcon,
  },
  {
    title: "Resume optimizer",
    description:
      "Upload your PDF and get scored feedback for MBB or China consulting standards. Dimension breakdowns and line-by-line rewrite suggestions included.",
    href: "/resume",
    cta: "Analyze resume",
    available: true,
    icon: ResumeIcon,
  },
  {
    title: "Interview simulator",
    description:
      "Full behavioral flow from intro to closing Q&A — resume deep-dives, randomized competency probes, and dimension-based scoring.",
    href: "/interview",
    cta: "Start interview",
    available: true,
    icon: InterviewIcon,
  },
] as const;

const STEPS = [
  {
    step: 1,
    title: "Polish your resume",
    description:
      "Get scored feedback on structure, impact, and consulting fit — tailored for English or Chinese resumes.",
    icon: StepUploadIcon,
  },
  {
    step: 2,
    title: "Mock behavioral interview",
    description:
      "Walk through a real partner-style flow: intro, experience deep-dives, and competency probes with a closing Q&A.",
    icon: InterviewIcon,
  },
  {
    step: 3,
    title: "Practice cases",
    description:
      "Run live case interviews, sharpen your framework, and request an evaluation when you are ready.",
    icon: StepCaseIcon,
  },
] as const;

function featureHref(userId: string | null | undefined, path: string): string {
  if (userId) return path;
  return `/sign-in?redirect_url=${encodeURIComponent(path)}`;
}

export default async function HomePage() {
  const { userId } = await auth();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
      {/* Hero */}
      <section className="mb-20 text-center lg:mb-24">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-sky-400">
          Consulting interview prep
        </p>
        <h1 className="mb-6">
          <Logo size="lg" className="font-bold" />
        </h1>
        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-400">
          Prepare for MBB and Big4 interviews with AI-powered case practice,
          behavioral mocks, and resume feedback — all in one place.
        </p>
      </section>

      {/* Feature cards */}
      <section className="mb-20 lg:mb-24">
        <div className="mb-8 text-center sm:mb-10">
          <h2 className="text-xl font-semibold text-white sm:text-2xl">
            Everything you need to prep
          </h2>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Pick a module and start sharpening your candidacy today.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            const isAvailable = feature.available;
            return (
              <article
                key={feature.title}
                className={`flex flex-col rounded-2xl border p-6 sm:p-8 ${
                  isAvailable
                    ? "border-sky-500/30 bg-gradient-to-b from-sky-500/10 to-slate-900/60 shadow-lg shadow-sky-950/20"
                    : "border-slate-800/80 bg-slate-900/30 opacity-75"
                }`}
              >
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                      isAvailable
                        ? "bg-sky-500/15 text-sky-400"
                        : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                      isAvailable
                        ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30"
                        : "bg-slate-800 text-slate-500 ring-1 ring-slate-700"
                    }`}
                  >
                    {isAvailable ? "Available" : "Coming soon"}
                  </span>
                </div>
                <h3 className="mb-3 text-lg font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mb-6 flex-1 text-sm leading-relaxed text-slate-400">
                  {feature.description}
                </p>
                {isAvailable && feature.href ? (
                  <Link
                    href={featureHref(userId, feature.href)}
                    className="inline-flex items-center justify-center rounded-lg bg-sky-600/90 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-500"
                  >
                    {feature.cta}
                    <span className="ml-1.5" aria-hidden>
                      →
                    </span>
                  </Link>
                ) : (
                  <span className="inline-flex cursor-not-allowed items-center justify-center rounded-lg border border-slate-700/80 bg-slate-800/50 px-4 py-2.5 text-sm font-medium text-slate-500">
                    {feature.cta}
                  </span>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {/* Three-step flow */}
      <section className="rounded-2xl border border-slate-800/80 bg-slate-900/40 px-6 py-10 sm:px-10 sm:py-12">
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-slate-500">
            How it works
          </p>
          <h2 className="text-xl font-semibold text-white sm:text-2xl">
            Your path to the offer
          </h2>
        </div>
        <ol className="grid gap-8 sm:grid-cols-3 sm:gap-6">
          {STEPS.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.step} className="relative flex flex-col items-center text-center sm:items-start sm:text-left">
                <div className="mb-4 flex items-center gap-4 sm:flex-col sm:items-start sm:gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-500/15 text-lg font-bold text-sky-400 ring-2 ring-sky-500/25">
                    {item.step}
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-sky-400/90 sm:ml-0">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="mb-2 text-base font-semibold text-white">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  {item.description}
                </p>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}

function CaseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}

function ResumeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function InterviewIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
    </svg>
  );
}

function StepUploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  );
}

function StepCaseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}

function StepOfferIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52a6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.568.9M12 2.25v1.007" />
    </svg>
  );
}
