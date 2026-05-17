import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "CaseReady — 咨询求职 AI 助手",
  description: "MBB 与 Big4 咨询求职准备：Case 练习、面试模拟、简历优化",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased">
        <div className="relative min-h-screen bg-slate-950">
          <div
            className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/20 via-slate-950 to-slate-950"
            aria-hidden
          />
          <Navbar />
          <main className="relative">{children}</main>
        </div>
      </body>
    </html>
  );
}
