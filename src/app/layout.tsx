import type { Metadata } from "next";
import AppProviders from "@/components/providers/AppProviders";
import Navbar from "@/components/layout/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "CaseReady — Consulting interview prep",
  description: "MBB & Big4 prep: case practice, mock interviews, resume feedback",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <AppProviders>
          <div className="relative min-h-screen bg-slate-950">
            <div
              className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/20 via-slate-950 to-slate-950"
              aria-hidden
            />
            <Navbar />
            <main className="relative z-10 min-w-0 overflow-x-hidden">
              {children}
            </main>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
