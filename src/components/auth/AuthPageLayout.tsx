import Logo from "@/components/layout/Logo";

interface AuthPageLayoutProps {
  children: React.ReactNode;
}

export default function AuthPageLayout({ children }: AuthPageLayoutProps) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] w-full items-center justify-center bg-slate-100 px-6 py-12 sm:px-8 sm:py-16">
      <div className="flex w-full max-w-[440px] flex-col items-center gap-8 sm:gap-10">
        <header className="flex flex-col items-center text-center">
          <Logo size="lg" variant="light" className="font-bold" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600">
            Consulting interview prep for MBB &amp; Big4
          </p>
        </header>

        <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-300/50 ring-1 ring-slate-200/80">
          <div className="px-4 py-5 sm:px-6 sm:py-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
