# Vercel environment variables

Add these in **Vercel → Project → Settings → Environment Variables**. Enable **Production** (and **Preview** if you use preview deployments). Then **Redeploy** — `NEXT_PUBLIC_*` values are baked in at build time.

## Required (app will not authenticate without these)

| Variable | Where to get it |
|----------|-----------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | [Clerk Dashboard](https://dashboard.clerk.com) → API Keys → Publishable key (`pk_test_...` or `pk_live_...`) |
| `CLERK_SECRET_KEY` | Clerk Dashboard → Secret key (`sk_test_...` or `sk_live_...`) |

## Clerk URLs (recommended)

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/` |

## AI (required for chat / evaluation)

| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `CLAUDE_MODEL` | e.g. `claude-sonnet-4-6` (optional if default in code) |

## Supabase (required for Case history / Resume storage)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server only) |

## Common mistakes

- Using `CLERK_PUBLISHABLE_KEY` without the `NEXT_PUBLIC_` prefix (client cannot read it).
- Adding variables only to **Development** but not **Production**.
- Forgetting to **Redeploy** after adding or changing variables.
- Pasting keys with extra spaces or quotes.
