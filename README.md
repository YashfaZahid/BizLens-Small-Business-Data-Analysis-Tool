# BizLens

BizLens is an adaptive business analytics scaffold for small business owners.
It is designed for arbitrary CSV and Excel exports, then will eventually help
an owner understand the columns, generate analytics, and ask natural-language
questions about the resulting data.

This pass is intentionally a scaffold. The preview includes realistic mock
dashboard/report content, file validation and metadata registration, and a
chat-shaped demo question flow. It does not perform profiling, schema mapping,
numeric analytics, authentication, AI calls, or persistent uploads.

## Architecture

```text
frontend/                 Portable frontend contract and continuation layout
artifacts/bizlens/        Runnable React + Vite preview
artifacts/api-server/     Runnable placeholder API boundary
backend/                  Standalone FastAPI implementation for local continuation
lib/api-spec/             OpenAPI source of truth
lib/api-client-react/     Generated React Query client
lib/api-zod/              Generated request/response validation
migrations/               Portable Supabase PostgreSQL starting migration
```

The eventual data-understanding pipeline is:

```text
Uploaded File → Data Profiler → Column Understanding → Schema Mapper → Canonical Business Schema
```

The eventual question flow is:

```text
User question → AI parses intent → structured analysis request
→ backend computes from actual data → AI explains the result
```

The LLM will not perform numeric calculation; the backend will own computed
results.

## Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, Wouter
- Preview API boundary: TypeScript, Express
- Portable backend: Python, FastAPI, Pandas, openpyxl
- Future persistence: Supabase PostgreSQL and Supabase Storage
- Future auth: Supabase Auth
- API contract: OpenAPI with generated TypeScript hooks and Zod schemas

## Run locally

### Frontend preview

From the repository root:

```bash
pnpm install
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/bizlens run dev
```

The frontend uses the same-origin `/api` contract. To point a standalone
frontend at a separate backend, set `VITE_API_BASE_URL` in `.env.local`.

### Standalone FastAPI backend

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
cd backend
uvicorn app.main:app --reload
```

The FastAPI app exposes the requested boundary under `/api`: health, upload,
datasets, reports, and questions. Its dataset store is in memory until the
Supabase persistence layer is implemented.

### API contract and generated clients

After changing `lib/api-spec/openapi.yaml`:

```bash
pnpm --filter @workspace/api-spec run codegen
```

## Environment variables

Copy `.env.example` to `.env.local` for a future portable setup:

```text
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
VITE_API_BASE_URL=
AI_PROVIDER_API_KEY=
```

No real values are committed. The service-role key must only ever be used by a
trusted backend, never by the browser.

## Supabase setup

Create a Supabase project outside this workspace, then apply
`migrations/001_initial_schema.sql` through the Supabase SQL editor or your
preferred migration runner. Configure Supabase Auth and a Storage bucket when
real auth/upload work begins. The current UI intentionally does not initialize
those services.

## Continue development outside Replit

Use the `frontend/` and `backend/` structure as the portable continuation
surface in Cursor or another local environment. Keep the OpenAPI document as
the contract source of truth, regenerate clients after changes, and implement
the deferred services behind the empty module boundaries:

- `backend/app/services/data/`
- `backend/app/services/schema/`
- `backend/app/services/analytics/`
- `backend/app/services/reports/`
- `backend/app/services/ai/`

Keep file bytes in Supabase Storage and only metadata/results in PostgreSQL.