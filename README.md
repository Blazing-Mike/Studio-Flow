# StudioFlow

A calmer way to run creative work. StudioFlow is an AI-assisted client workspace for independent freelancers and small studios: turn a brief into a proposal, packages, milestones, tasks, and invoices — and land new work with an AI job-proposal writer.

Built for the **Replit × Contra** hackathon.

## ✨ Features

- **Dashboard** — live revenue, active projects, outstanding invoices, upcoming milestones, and a cash-flow chart with real, computed metrics.
- **Projects workspace** — full editing for projects, proposals, milestones (timeline), tasks, and invoices. Search, filter, and sort.
- **AI project planning** — paste a client brief and generate a polished proposal, packages, milestones, and tasks (Gemini-powered, with a local fallback).
- **Job proposal writer** — paste a Contra/Upwork job link (or the posting), pick a tone + length, add portfolio context, and get a tailored proposal ready to copy. Saved draft history included.
- **Client portal** — share a link; clients can pick a package, approve, or request changes.
- **Settings** — freelancer profile, brand appearance (working themes), and payment defaults.

## 🧱 Stack

- **Monorepo:** pnpm workspaces, TypeScript 5.9
- **API:** Express 5, Zod v4, Drizzle ORM (PostgreSQL), esbuild
- **Client:** React + Vite, TanStack Query, Wouter, shadcn-style UI
- **Codegen:** OpenAPI → Orval (React Query hooks + Zod schemas)
- **AI:** OpenAI-compatible chat client (Gemini by default; swap to DeepSeek/OpenAI via env)

## 📁 Layout

```
lib/
  api-spec/          OpenAPI contract (edit → run codegen)
  api-client-react/  Generated React Query hooks + types
  api-zod/           Generated Zod schemas
  db/                Drizzle schema + Postgres client (persistence in progress)
artifacts/
  api-server/        Express API (routes, AI, job-proposal writer)
  studioflow/        React client
```

## 🚀 Run locally

```bash
pnpm install
# terminal 1 — API (port 5000)
pnpm --filter @workspace/api-server run dev
# terminal 2 — client (port 5173)
pnpm --filter @workspace/studioflow run dev
```

Open `http://localhost:5173`. The client proxies `/api` to `http://localhost:5000`.

> **Demo workspace:** the app runs on seeded sample data, so it's instantly explorable.

## 🤖 AI setup (optional but recommended)

Create `artifacts/api-server/.env` (a template lives at `.env.example`):

```
GEMINI_API_KEY=your_key_from_https://aistudio.google.com/apikey
```

The client is OpenAI-compatible — swap providers by changing the base URL + model:

```
# DeepSeek
GEMINI_BASE_URL=https://api.deepseek.com/v1
GEMINI_MODEL=deepseek-chat
```

With no key set, the app falls back to a local mock generator (everything still works).

## 🗄️ Persistence

Schema and a Drizzle client are scaffolded in `lib/db`. Provision Postgres, set
`DATABASE_URL`, and apply the schema with `pnpm --filter db push`.

## 🔧 Common commands

```bash
pnpm run typecheck        # typecheck all packages
pnpm run build            # typecheck + build all packages
pnpm --filter @workspace/api-spec run codegen   # regenerate client + zod from OpenAPI
pnpm --filter db push     # push DB schema (dev)
```

## 🔒 Notes

- Secrets (`.env`) are gitignored; keep your API keys out of the repo.
- The job-link fetcher guards against SSRF and the AI prompts treat user content as untrusted data (prompt-injection hardened).
