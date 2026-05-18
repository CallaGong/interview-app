# CaseReady

咨询求职 AI 助手 — Phase 1：Case 拆解练习

## 技术栈

- **前端 / API**：Next.js 15（Vercel 部署）
- **数据库 / 存储**：Supabase（PostgreSQL + Storage）
- **AI**：Anthropic Claude API
- **认证**：Clerk（Phase 2）

## 快速开始

1. 安装依赖：

```bash
npm install
```

2. 复制环境变量并填写：

```bash
cp .env.local.example .env.local
```

3. 在 [Supabase](https://supabase.com) 创建项目，在 SQL Editor 中依次运行 `supabase/migrations/` 下的迁移文件，并创建 Storage bucket `resumes`（私有）。

4. 启动开发服务器：

```bash
npm run dev
```

5. 打开 [http://localhost:3000](http://localhost:3000)，点击「开始 Case 练习」。

## 环境变量

| 变量 | 说明 |
|------|------|
| `ANTHROPIC_API_KEY` | [Anthropic Console](https://console.anthropic.com) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key（仅服务端） |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk 公钥（可选） |
| `CLERK_SECRET_KEY` | Clerk 密钥（可选） |

## 部署（Vercel）

1. 将仓库导入 Vercel
2. 在 Vercel 项目设置中配置上述环境变量
3. 推送代码后自动部署

## 功能

- **Case 练习** (`/case`)：从 Supabase 加载题库，流式 AI 对话，框架追踪，输入「结束评估」获取 JSON 评分报告。
