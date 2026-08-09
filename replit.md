# StudioFlow

StudioFlow is an AI-assisted client workspace for independent creatives: turn a brief into a proposal, plan, invoices, and a shareable client portal.

## Run & Operate

- `pnpm install` — install workspace dependencies
- `pnpm --filter @workspace/api-server run dev` — run the API server on port `5000`
- `pnpm --filter @workspace/studioflow run dev` — run the Vite client on port `5173`
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

Open `http://localhost:5173` after starting both development processes. The Vite dev server proxies `/api` requests to `http://localhost:5000`. `PORT`, `BASE_PATH`, and `API_URL` are optional local overrides.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/studioflow/src/App.tsx` — React UI, routes, and page-level interactions
- `artifacts/studioflow/src/index.css` — StudioFlow visual system
- `artifacts/api-server/src/routes/studioflow.ts` — REST handlers
- `artifacts/api-server/src/lib/studioflow-data.ts` — seeded demo data and local mock plan generator
- `lib/api-spec/openapi.yaml` — API contract; generated client and schemas live in `lib/api-client-react` and `lib/api-zod`

## Architecture decisions

- The API currently stores data in memory so the template is usable with no service configuration; restarting the API resets changes.
- The client has sample-data fallbacks so its layouts remain useful while the API is unavailable.
- API types are generated from the OpenAPI contract. Update the contract and run codegen before changing generated API files.

## Product

- Dashboard and project list with search, filtering, archiving, and revenue/status summaries.
- Brief-to-project flow that creates a mock proposal, package options, milestones, tasks, invoices, and portal link.
- Client portal actions to select a package, approve, or request proposal changes.
- Settings stored in browser local storage.

## User preferences

- Continue development locally from the existing Replit implementation.

## Gotchas

- The server process must be running for mutations to persist during a browser session.
- The previous Replit configuration required `PORT` and `BASE_PATH`; both now have local defaults.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
