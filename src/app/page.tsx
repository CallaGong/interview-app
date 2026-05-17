import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <section className="mb-16 text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-sky-400">
          咨询求职 AI 助手
        </p>
        <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Case<span className="text-sky-400">Ready</span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-400">
          面向 MBB 与 Big4 的求职准备：Case 拆解、行为面试模拟、简历优化——用 AI 陪你练到上场不慌。
        </p>
        <Link
          href="/case"
          className="inline-flex items-center rounded-lg bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-900/30 transition hover:bg-sky-500"
        >
          开始 Case 练习
        </Link>
      </section>

      <section className="grid gap-6 sm:grid-cols-3">
        {[
          {
            title: "Case 拆解练习",
            desc: "AI 扮演面试官，一步步引导你拆解咨询 Case，实时评估框架与逻辑。",
            href: "/case",
            active: true,
          },
          {
            title: "面试模拟官",
            desc: "行为面试模拟与 STAR 追问，结束后获得结构化反馈。（即将上线）",
            href: "#",
            active: false,
          },
          {
            title: "简历优化器",
            desc: "上传 PDF 简历，获得针对咨询行业的修改建议。（即将上线）",
            href: "#",
            active: false,
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
                立即开始 →
              </Link>
            ) : (
              <span className="text-sm text-slate-500">Phase 2 上线</span>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
