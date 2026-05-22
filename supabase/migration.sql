-- ============================================================
-- SCHEMA: faris_portfolio
-- ============================================================

-- EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ============================================================
-- TABLE: certificates
-- ============================================================
create table if not exists public.certificates (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  issuer      text not null,
  issued_date date,
  category    text check (category in ('AI/ML','Security','Engineering','Data','Leadership','Other')),
  image_url   text,
  verify_url  text,
  featured    boolean default false,
  sort_order  int default 0,
  created_at  timestamptz default now()
);

-- ============================================================
-- TABLE: projects
-- ============================================================
create table if not exists public.projects (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  tagline       text,
  description   text,
  stack         text[],
  category      text check (category in ('LLM/AI','Data Engineering','Security','Full Stack','Analytics','Other')),
  repo_url      text,
  demo_url      text,
  image_url     text,
  featured      boolean default false,
  sort_order    int default 0,
  year          int,
  created_at    timestamptz default now()
);

-- ============================================================
-- TABLE: blog_posts
-- ============================================================
create table if not exists public.blog_posts (
  id            uuid primary key default uuid_generate_v4(),
  slug          text unique not null,
  title         text not null,
  excerpt       text,
  content       text,
  tags          text[],
  published     boolean default false,
  published_at  timestamptz,
  read_time_min int default 5,
  cover_url     text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ============================================================
-- TABLE: contact_messages
-- ============================================================
create table if not exists public.contact_messages (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  email         text not null,
  subject       text,
  message       text not null,
  source        text default 'contact_form',
  status        text default 'new' check (status in ('new','read','replied')),
  wa_sent       boolean default false,
  email_sent    boolean default false,
  created_at    timestamptz default now()
);

-- ============================================================
-- TABLE: chat_sessions
-- ============================================================
create table if not exists public.chat_sessions (
  id            uuid primary key default uuid_generate_v4(),
  session_id    text unique not null,
  visitor_ip    text,
  messages      jsonb default '[]',
  escalated     boolean default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ============================================================
-- TABLE: page_views  (visitor analytics)
-- ============================================================
create table if not exists public.page_views (
  id            bigserial primary key,
  path          text not null,
  referrer      text,
  user_agent    text,
  country       text,
  city          text,
  session_id    text,
  created_at    timestamptz default now()
);

-- ============================================================
-- RLS POLICIES
-- ============================================================
alter table public.certificates      enable row level security;
alter table public.projects          enable row level security;
alter table public.blog_posts        enable row level security;
alter table public.contact_messages  enable row level security;
alter table public.chat_sessions     enable row level security;
alter table public.page_views        enable row level security;

-- Public read for portfolio data
create policy "Public read certificates"
  on public.certificates for select using (true);

create policy "Public read projects"
  on public.projects for select using (true);

create policy "Public read published posts"
  on public.blog_posts for select using (published = true);

-- Anonymous insert for contact + chat + analytics
create policy "Anon insert contact"
  on public.contact_messages for insert with check (true);

create policy "Anon insert chat"
  on public.chat_sessions for insert with check (true);

create policy "Anon update chat"
  on public.chat_sessions for update using (true);

create policy "Anon insert pageview"
  on public.page_views for insert with check (true);
