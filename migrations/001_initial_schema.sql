-- Portable Supabase PostgreSQL starting point for BizLens.
-- This migration is intentionally minimal and is not run by the demo scaffold.

create table if not exists users (
  id uuid primary key,
  created_at timestamptz not null default now()
);

create table if not exists datasets (
  id uuid primary key,
  user_id uuid references users(id),
  filename text not null,
  storage_path text,
  file_type text not null,
  size_bytes bigint not null default 0,
  status text not null default 'uploaded',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists detected_schemas (
  id uuid primary key,
  dataset_id uuid not null references datasets(id) on delete cascade,
  canonical_schema jsonb not null default '{}'::jsonb,
  column_mappings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists reports (
  id uuid primary key,
  dataset_id uuid not null references datasets(id) on delete cascade,
  report jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists saved_questions (
  id uuid primary key,
  user_id uuid references users(id),
  dataset_id uuid references datasets(id) on delete set null,
  question text not null,
  analysis_result jsonb,
  created_at timestamptz not null default now()
);