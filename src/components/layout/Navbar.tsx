import Link from "next/link";
import Logo from "./Logo";

const navLinkClass =
  "text-slate-300 no-underline transition hover:text-white";

export default function Navbar() {
  return (
    <nav className="relative z-20 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="shrink-0 no-underline outline-none ring-sky-500/50 focus-visible:rounded focus-visible:ring-2"
        >
          <Logo size="sm" />
        </Link>
        <div className="flex shrink-0 items-center gap-4 text-sm sm:gap-6">
          <Link href="/case" className={navLinkClass}>
            Case practice
          </Link>
          <Link href="/resume" className={navLinkClass}>
            Resume
          </Link>
          <Link href="/interview" className={navLinkClass}>
            Interview
          </Link>
        </div>
      </div>
    </nav>
  );
}
