import Link from "next/link";

interface ClerkSetupRequiredProps {
  locale?: "en" | "zh";
}

export default function ClerkSetupRequired({ locale = "en" }: ClerkSetupRequiredProps) {
  const copy =
    locale === "zh"
      ? {
          title: "登录功能未配置",
          body: "请在部署环境（如 Vercel）中设置 NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY 与 CLERK_SECRET_KEY，然后重新部署。",
          home: "返回首页",
        }
      : {
          title: "Sign-in is not configured",
          body: "Add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY to your deployment environment (e.g. Vercel), then redeploy.",
          home: "Back to home",
        };

  return (
    <div className="mx-auto max-w-md rounded-xl border border-amber-500/40 bg-amber-500/10 p-6 text-center">
      <h2 className="mb-2 text-lg font-semibold text-white">{copy.title}</h2>
      <p className="mb-4 text-sm leading-relaxed text-slate-300">{copy.body}</p>
      <Link
        href="/"
        className="inline-flex rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500"
      >
        {copy.home}
      </Link>
    </div>
  );
}
