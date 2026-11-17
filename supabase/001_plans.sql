-- RP Inspection AI – הגדרה ראשונה: טבלת תוכניות ואחסון קבצי PDF
-- מריצים פעם אחת ב-Supabase: SQL Editor -> New query -> הדבקה -> Run

-- 1. טבלת התוכניות
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  discipline text not null default 'לא מסווג'
    check (discipline in ('אדריכלות', 'קונסטרוקציה', 'מערכות', 'לא מסווג')),
  storage_path text not null unique,
  size_bytes bigint not null,
  created_at timestamptz not null default now()
);

alter table public.plans enable row level security;
grant select, insert, update, delete on public.plans to anon, authenticated;

-- הרשאה זמנית לשלב הפיתוח (בלי מסך כניסה). נחליף בהרשאות לפי משתמש כשנוסיף התחברות.
drop policy if exists "dev: open access to plans" on public.plans;
create policy "dev: open access to plans" on public.plans
  for all to anon, authenticated using (true) with check (true);

-- 2. תיקיית אחסון פרטית לקבצי PDF (עד 50MB לקובץ, המקסימום בתוכנית החינמית)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('plans', 'plans', false, 52428800, array['application/pdf'])
on conflict (id) do nothing;

drop policy if exists "dev: read plan files" on storage.objects;
create policy "dev: read plan files" on storage.objects
  for select to anon, authenticated using (bucket_id = 'plans');

drop policy if exists "dev: upload plan files" on storage.objects;
create policy "dev: upload plan files" on storage.objects
  for insert to anon, authenticated with check (bucket_id = 'plans');

drop policy if exists "dev: delete plan files" on storage.objects;
create policy "dev: delete plan files" on storage.objects
  for delete to anon, authenticated using (bucket_id = 'plans');
