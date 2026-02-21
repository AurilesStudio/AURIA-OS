-- Mission Control schema
-- Adds tables for Tasks Board, Calendar, Content Pipeline, Memory, and Team Agents.

-- ── mc_tasks ──────────────────────────────────────────────────
create table if not exists mc_tasks (
  id          text primary key,
  title       text not null,
  description text not null default '',
  status      text not null default 'backlog',
  priority    text not null default 'none',
  assignee_id text not null default '',
  labels      text[] not null default '{}',
  project_id  text not null default '',
  created_at  bigint not null default 0,
  updated_at  bigint not null default 0
);

create index if not exists idx_mc_tasks_project on mc_tasks(project_id);
create index if not exists idx_mc_tasks_status  on mc_tasks(status);

-- ── mc_calendar_events ────────────────────────────────────────
create table if not exists mc_calendar_events (
  id               text primary key,
  title            text not null,
  type             text not null default 'task',
  start_date       bigint not null default 0,
  end_date         bigint not null default 0,
  status           text not null default 'scheduled',
  execution_result text not null default '',
  project_id       text not null default '',
  created_at       bigint not null default 0
);

create index if not exists idx_mc_calendar_project on mc_calendar_events(project_id);
create index if not exists idx_mc_calendar_dates   on mc_calendar_events(start_date, end_date);

-- ── mc_content_pipeline ───────────────────────────────────────
create table if not exists mc_content_pipeline (
  id             text primary key,
  title          text not null,
  stage          text not null default 'idea',
  platform       text not null default '',
  script         text not null default '',
  media_urls     text[] not null default '{}',
  scheduled_date bigint,
  project_id     text not null default '',
  created_at     bigint not null default 0
);

create index if not exists idx_mc_content_project on mc_content_pipeline(project_id);
create index if not exists idx_mc_content_stage   on mc_content_pipeline(stage);

-- ── mc_memories ───────────────────────────────────────────────
create table if not exists mc_memories (
  id         text primary key,
  title      text not null,
  content    text not null default '',
  category   text not null default 'reference',
  source     text not null default '',
  project_id text not null default '',
  created_at bigint not null default 0
);

create index if not exists idx_mc_memories_project  on mc_memories(project_id);
create index if not exists idx_mc_memories_category on mc_memories(category);

-- Full-text search index on memories (title + content)
create index if not exists idx_mc_memories_fts
  on mc_memories using gin (to_tsvector('french', title || ' ' || content));

-- ── mc_team_agents ────────────────────────────────────────────
create table if not exists mc_team_agents (
  id               text primary key,
  name             text not null,
  role             text not null default '',
  responsibilities text not null default '',
  status           text not null default 'idle',
  avatar_url       text not null default '',
  task_history     text[] not null default '{}',
  project_id       text not null default '',
  created_at       bigint not null default 0,
  updated_at       bigint not null default 0
);

create index if not exists idx_mc_team_agents_project on mc_team_agents(project_id);
