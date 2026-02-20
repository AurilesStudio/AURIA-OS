-- AURIA-OS initial schema
-- Run this in Supabase SQL Editor to bootstrap the database.

-- ── projects ────────────────────────────────────────────────────
create table if not exists projects (
  id         text primary key,
  name       text not null,
  layout_type text,
  sort_order integer not null default 0
);

-- ── rooms ───────────────────────────────────────────────────────
create table if not exists rooms (
  id           text primary key,
  label        text not null,
  position_x   real not null default 0,
  position_y   real not null default 0,
  position_z   real not null default 0,
  border_color text not null default '#ffffff',
  skill_ids    text[] not null default '{}',
  project_id   text not null references projects(id) on delete cascade,
  floor_y      real
);

-- ── roles ───────────────────────────────────────────────────────
create table if not exists roles (
  id            text primary key,
  name          text not null,
  skill_ids     text[] not null default '{}',
  system_prompt text not null default ''
);

-- ── avatars ─────────────────────────────────────────────────────
create table if not exists avatars (
  id           text primary key,
  name         text not null,
  role_id      text not null default '',
  provider     text not null default 'claude',
  color        text not null default '#888888',
  model_url    text not null default '',
  active_clip  text not null default 'Happy Idle',
  position_x   real not null default 0,
  position_y   real not null default 0,
  position_z   real not null default 0,
  room_id      text not null default '',
  project_id   text not null default '',
  character_id text not null default '',
  level        integer not null default 0,
  availability text not null default 'available'
);

-- ── token_gauges ────────────────────────────────────────────────
create table if not exists token_gauges (
  provider     text primary key,
  label        text not null,
  used         bigint not null default 0,
  limit_tokens bigint not null default 0,
  color        text not null default '#ffffff',
  cost         real not null default 0
);

-- ── team_templates ──────────────────────────────────────────────
create table if not exists team_templates (
  id         text primary key,
  name       text not null,
  slots      jsonb not null default '[]',
  created_at bigint not null default 0,
  updated_at bigint not null default 0
);

-- ── appearances ─────────────────────────────────────────────────
create table if not exists appearances (
  id               text primary key,
  name             text not null,
  thumbnail_url    text not null default '',
  model_url        text not null default '',
  created_at       bigint not null default 0,
  original_task_id text,
  rigged           boolean not null default false,
  local_glb        boolean not null default false
);

-- ── user_settings (singleton row) ───────────────────────────────
create table if not exists user_settings (
  id                         integer primary key check (id = 1),
  llm_api_keys               jsonb not null default '{}',
  local_llm_endpoint         text not null default 'http://localhost:11434',
  local_llm_model            text not null default 'mistral',
  tripo_api_key              text not null default '',
  active_project_id          text not null default 'project-1',
  trading_kill_switch        boolean not null default false,
  opportunity_alerts_enabled boolean not null default false,
  grid_overlay_enabled       boolean not null default false
);

-- Seed the singleton settings row
insert into user_settings (id) values (1) on conflict do nothing;
