# CaseReady

**AI-powered consulting interview prep platform for students targeting MBB and Big4.**

🌐 **Live app:** [https://interview-app-4tpm.vercel.app](https://interview-app-4tpm.vercel.app)

---

## 1. Introduction

**CaseReady** is an all-in-one prep platform for consulting interviews. Practice live cases, polish your resume against firm-specific standards, and run full behavioral mocks — powered by Claude with streaming, conversational feedback.

---

## 2. Features

### 📊 Case Practice

An AI interviewer guides you through **real consulting cases**. It tracks your **framework and analytical structure** in real time and delivers a **complete evaluation report** when you finish.

### 📄 Resume Optimizer

Upload a **Chinese or English resume PDF** and receive tailored feedback:

| Mode | Standard |
|------|----------|
| English resume | **MBB** (McKinsey · BCG · Bain) |
| Chinese resume | **Top China consulting firms** |

Get **dimension scores**, diagnostic insights, and **specific line-by-line rewrite suggestions**.

### 🎤 Interview Simulator

Simulates a **full behavioral interview** — from self-introduction through closing Q&A:

- Upload your resume so the AI probes **your actual experiences**
- Covers **10 core consulting competency dimensions** (leadership, problem solving, teamwork, resilience, and more)
- Natural **STAR-style follow-ups** and a **dimension-based scorecard**
- **English & Chinese** modes, plus **browser voice input**

---

## 3. Tech Stack

| Layer | Stack |
|-------|--------|
| **Frontend** | Next.js 15, TypeScript, Tailwind CSS |
| **AI** | Anthropic Claude API (`claude-sonnet-4-20250514`), Server-Sent Events streaming |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | Clerk |
| **Deployment** | Vercel |

---

## 4. Run Locally

```bash
# Clone the repo
git clone https://github.com/CallaGong/interview-app.git
cd interview-app

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local — see table below (never commit real secrets)

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Environment variables** (names only — use your own values in `.env.local`):

| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_API_KEY` | Anthropic API key (required) |
| `CLAUDE_MODEL` | Claude model ID (optional) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_API_URL` | API base URL override (optional) |

> **Note:** For the case question bank, apply migrations in `supabase/migrations/` and create a private `resumes` Storage bucket if needed.

**Troubleshooting:** If the dev server serves stale or broken assets, run `npm run dev:clean`.

---

## 5. Design Philosophy

- 🌙 **Dark, professional theme** — focused and distraction-free  
- 📐 **Three-layer information flow** — **Verdict → Diagnosis → Action**  
- ⌨️ **Streaming typewriter UI** — responses feel like a live interview conversation  

---

## Project layout

```
src/
├── app/           # Pages & API routes (App Router)
├── components/    # Case, resume, interview UI
├── lib/           # Prompts, Supabase, Anthropic helpers
└── types/         # Shared TypeScript types
```

---

## License

Private project — all rights reserved.
