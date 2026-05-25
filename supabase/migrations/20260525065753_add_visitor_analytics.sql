-- ============================================================
-- ADD: visitor_leads — unified email capture from all sources
-- ============================================================
create table if not exists public.visitor_leads (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  name        text,
  company     text,
  purpose     text,                    -- 'hiring' | 'collaboration' | 'general' | 'other'
  source      text not null,           -- 'chat' | 'contact_form' | 'manual'
  session_id  text,
  message     text,                    -- first message or context
  notified    boolean default false,   -- WA/email notification sent?
  created_at  timestamptz default now()
);

alter table public.visitor_leads enable row level security;
create policy "Anon insert leads" on public.visitor_leads for insert with check (true);

-- Prevent duplicate emails per source
create unique index if not exists visitor_leads_email_source
  on public.visitor_leads (lower(email), source);

-- ============================================================
-- ALTER: chat_sessions — add visitor identity columns
-- ============================================================
alter table public.chat_sessions
  add column if not exists visitor_name  text,
  add column if not exists visitor_email text,
  add column if not exists visitor_company text,
  add column if not exists purpose       text,
  add column if not exists notified      boolean default false;

-- ============================================================
-- ALTER: page_views — add duration + is_unique flag
-- ============================================================
alter table public.page_views
  add column if not exists duration_sec int,
  add column if not exists is_new_session boolean default true;

-- ============================================================
-- VIEW: analytics_summary — pre-aggregated stats
-- ============================================================
create or replace view public.analytics_summary as
select
  count(distinct session_id)                                              as total_unique_visitors,
  count(distinct case when created_at > now() - interval '24 hours'
    then session_id end)                                                  as visitors_today,
  count(distinct case when created_at > now() - interval '7 days'
    then session_id end)                                                  as visitors_this_week,
  count(distinct case when created_at > now() - interval '30 days'
    then session_id end)                                                  as visitors_this_month,
  count(*)                                                                as total_page_views,
  count(case when created_at > now() - interval '24 hours' then 1 end)   as views_today,
  count(case when created_at > now() - interval '7 days' then 1 end)     as views_this_week,
  (select country from public.page_views
   where country is not null
   group by country order by count(*) desc limit 1)                      as top_country,
  (select referrer from public.page_views
   where referrer is not null and referrer != ''
   group by referrer order by count(*) desc limit 1)                     as top_referrer
from public.page_views;

-- ============================================================
-- VIEW: leads_summary
-- ============================================================
create or replace view public.leads_summary as
select
  count(*)                                                                    as total_leads,
  count(distinct lower(email))                                                as unique_emails,
  count(case when source = 'chat' then 1 end)                                as from_chat,
  count(case when source = 'contact_form' then 1 end)                        as from_form,
  count(case when created_at > now() - interval '7 days' then 1 end)         as new_this_week,
  count(case when notified = false then 1 end)                               as unnotified
from public.visitor_leads;

-- ============================================================
-- VIEW: daily_visitors — chart data (last 30 days)
-- ============================================================
create or replace view public.daily_visitors as
select
  date_trunc('day', created_at)::date as visit_date,
  count(distinct session_id)          as unique_visitors,
  count(*)                            as page_views
from public.page_views
where created_at > now() - interval '30 days'
group by date_trunc('day', created_at)
order by visit_date desc;
