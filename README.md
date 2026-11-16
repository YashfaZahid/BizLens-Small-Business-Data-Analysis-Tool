# BizLens

BizLens is the scaffold for a small-business analytics product. The owner uploads a CSV or Excel export, the app is meant to understand the columns, and questions in English are meant to become a structured analysis that Python computes. The model would explain the numbers. It would not be the calculator.

This repository is that scaffold. The preview has a realistic dashboard, file checks, dataset metadata, and a chat-shaped question flow. It does **not** yet profile columns, map a schema, run numeric analytics, authenticate users, call a model, or store uploads for real.

## Intended pipeline

```text
Uploaded file → profiler → column understanding → schema mapper → canonical business schema
```

```text
Question → intent → structured analysis request → backend computes → model explains the result
```

## What you can run today

```bash
pnpm install
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/bizlens run dev
```

The preview uses same-origin `/api`. Point a standalone UI at another host with `VITE_API_BASE_URL`.

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
cd backend
uvicorn app.main:app --reload
```

The FastAPI app exposes health, upload, datasets, reports, and questions. The dataset store is in memory.

## Layout

```text
artifacts/bizlens/       React + Vite preview
artifacts/api-server/    Placeholder API
backend/                 FastAPI app (Pandas, openpyxl)
frontend/                Portable UI contract
lib/api-spec/            OpenAPI source
lib/api-client-react/    Generated hooks
lib/api-zod/             Generated Zod schemas
migrations/              Starting Supabase schema
```

## Stack

React, TypeScript, Vite, Tailwind, Express (preview boundary), FastAPI, Pandas.

## Limits

Do not demo this as a finished analyst. The screens are a product sketch with a real API boundary underneath. The computation and the model call are the next build, not this one.
