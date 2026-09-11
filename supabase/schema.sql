-- 匿名イベントログ用テーブル。
-- Supabase の SQL Editor に貼り付けて実行する（README「Supabase設定」参照）。
--
-- 方針:
--   * 個人情報は保存しない。session_id はブラウザセッション単位のランダム値のみ。
--   * 匿名ユーザー(anon)からの INSERT だけ許可し、SELECT はサービスロール（管理側）に限定。
--   * 集計は Supabase 上で SQL を書けば取れる（下部にサンプルあり）。

create extension if not exists "pgcrypto";

create table if not exists public.diagnosis_events (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  session_id  text not null check (char_length(session_id) between 1 and 64),
  event       text not null check (char_length(event) between 1 and 40),
  tea_type    text check (tea_type is null or char_length(tea_type) <= 20),
  product_id  text check (product_id is null or char_length(product_id) <= 60),
  meta        jsonb
);

create index if not exists diagnosis_events_created_at_idx on public.diagnosis_events (created_at);
create index if not exists diagnosis_events_event_idx on public.diagnosis_events (event);
create index if not exists diagnosis_events_session_idx on public.diagnosis_events (session_id);

alter table public.diagnosis_events enable row level security;

-- 匿名キーからは INSERT のみ許可。
drop policy if exists "anon can insert events" on public.diagnosis_events;
create policy "anon can insert events"
  on public.diagnosis_events
  for insert
  to anon
  with check (true);

-- 読み取りはデフォルト拒否（service_role は RLS を迂回するため管理側からは参照可能）。

-- ------------------------------------------------------------------
-- 集計サンプル（Supabase SQL Editor で実行）
-- ------------------------------------------------------------------
-- 診断開始数・完了数・完了率（直近7日）
--   select
--     count(*) filter (where event = 'diagnosis_start')    as starts,
--     count(*) filter (where event = 'diagnosis_complete') as completes,
--     round(
--       100.0 * count(*) filter (where event = 'diagnosis_complete')
--       / nullif(count(*) filter (where event = 'diagnosis_start'), 0), 1
--     ) as completion_rate_pct
--   from public.diagnosis_events
--   where created_at > now() - interval '7 days';
--
-- タイプ別比率
--   select tea_type, count(*)
--   from public.diagnosis_events
--   where event = 'diagnosis_complete'
--   group by tea_type order by count(*) desc;
--
-- おすすめ商品別の表示数
--   select product_id, count(*)
--   from public.diagnosis_events
--   where event = 'product_detail_tap'
--   group by product_id order by count(*) desc;
--
-- スタッフに見せる率 / 共有率 / 子どもモード利用率（対 完了数）
--   with base as (
--     select count(*) filter (where event = 'diagnosis_complete') as completes,
--            count(*) filter (where event = 'staff_show_tap')      as staff_shows,
--            count(*) filter (where event in ('line_share','share_other')) as shares,
--            count(*) filter (where event = 'kids_mode_used')      as kids_uses
--     from public.diagnosis_events
--     where created_at > now() - interval '30 days'
--   )
--   select
--     round(100.0 * staff_shows / nullif(completes, 0), 1) as staff_show_rate_pct,
--     round(100.0 * shares      / nullif(completes, 0), 1) as share_rate_pct,
--     round(100.0 * kids_uses   / nullif(completes, 0), 1) as kids_mode_rate_pct
--   from base;
