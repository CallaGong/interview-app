import Link from "next/link";
import Logo from "@/components/layout/Logo";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <section className="mb-16 text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-sky-400">
          Consulting interview prep
        </p>
        <h1 className="mb-6">
          <Logo size="lg" className="font-bold" />
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-400">
          Prepare for MBB and Big4 interviews with AI-powered case practice, behavioral mocks, and resume feedback.
        </p>
        <Link
          href="/case"
          className="inline-flex items-center rounded-lg bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-900/30 transition hover:bg-sky-500"
        >
          Start case practice
        </Link>
      </section>

      <section className="grid gap-6 sm:grid-cols-3">
        {[
          {
            title: "Case practice",
            desc: "AI interviewer guides you through cases with live framework tracking.",
            href: "/case",
            active: true,
          },
          {
            title: "Interview simulator",
            desc: "Behavioral interview practice with STAR follow-ups. (Coming soon)",
            href: "#",
            active: false,
          },
          {
            title: "Resume optimizer",
            desc: "Upload your resume for MBB or China consulting feedback.",
            href: "/resume",
            active: true,
          },
        ].map((card) => (
          <div
            key={card.title}
            className={`rounded-xl border p-6 ${
              card.active
                ? "border-sky-500/40 bg-sky-500/5"
                : "border-slate-800 bg-slate-900/40 opacity-70"
            }`}
          >
            <h3 className="mb-2 font-semibold text-white">{card.title}</h3>
            <p className="mb-4 text-sm text-slate-400">{card.desc}</p>
            {card.active ? (
              <Link href={card.href} className="text-sm font-medium text-sky-400 hover:text-sky-300">
                Get started →
              </Link>
            ) : (
              <span className="text-sm text-slate-500">Phase 2</span>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
