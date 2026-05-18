import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-white">
          Case<span className="text-sky-400">Ready</span>
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link
            href="/case"
            className="text-slate-300 transition hover:text-white"
          >
            Case practice
          </Link>
        </div>
      </div>
    </nav>
  );
}
