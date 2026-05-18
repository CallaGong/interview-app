# CaseReady

> **AI-powered consulting interview prep platform for students targeting MBB and Big4.**

🌐 **Live:** [interview-app-4tpm.vercel.app](https://interview-app-4tpm.vercel.app)

---

## ✨ What is CaseReady?

CaseReady helps consulting candidates practice the full interview loop in one place — **cases**, **resumes**, and **behavioral interviews** — with AI that feels close to a real MBB / Big4 conversation. Upload your materials, get structured feedback, and improve with every session.

---

## 🧩 Features

### 📊 Case Practice

An AI interviewer walks you through **real consulting cases**, step by step. Your **framework and hypothesis** are tracked in real time as you work. When you finish, you receive a **full evaluation report** with scores and actionable feedback.

### 📄 Resume Optimizer

Upload a **Chinese or English resume PDF** and get analysis tailored to the standard you care about:

- **MBB** (McKinsey · BCG · Bain) for English resumes  
- **Top domestic consulting firms** for Chinese resumes  

You get **dimension-level scores**, insights, and **line-by-line rewrite suggestions**.

### 🎤 Interview Simulator

A **complete behavioral interview** from opening intro through closing Q&A:

- Optional **resume upload** so the AI asks about **your specific experiences**  
- **10 core consulting competency dimensions** (leadership, problem solving, teamwork, and more)  
- Natural **STAR-style follow-ups** and a **dimension-based scorecard** at the end  
- **English & Chinese** interview modes, plus **voice input** in the browser  

---

## 🛠 Tech Stack

| Layer | Technology |
|--------|------------|
| **Frontend** | Next.js 15, TypeScript, Tailwind CSS |
| **AI** | Anthropic Claude API (`claude-sonnet-4-20250514`, streaming via SSE) |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Clerk |
| **Deploy** | Vercel |

---

## 🚀 Local Development

### 1. Clone the repository

```bash
git clone https://github.com/CallaGong/interview-app.git
cd interview-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your keys (do **not** commit real secrets):

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Anthropic API key (required for AI features) |
| `CLAUDE_MODEL` | Claude model ID (optional; defaults in app config) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_API_URL` | API base URL override (optional; leave empty for local) |

For Case Practice with the question bank, run Supabase migrations under `supabase/migrations/` and create a private Storage bucket `resumes` if you use file storage features.

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

If you hit stale build errors after switching branches, try:

```bash
npm run dev:clean
```

---

## 🎨 Design Philosophy

- **Dark, professional UI** — calm and focused, like serious prep tools should feel  
- **Three-layer information hierarchy** — **Verdict → Diagnosis → Action** so you always know what matters first  
- **Streaming responses** — typewriter-style output that mirrors a live interview dialogue  

---

## 📁 Project Structure (high level)

```
src/
├── app/              # Next.js App Router pages & API routes
├── components/       # UI (case, resume, interview)
├── lib/              # Prompts, Supabase, Anthropic, utilities
└── types/            # Shared TypeScript types
```

---

## 📜 License

Private project — all rights reserved unless otherwise noted.
