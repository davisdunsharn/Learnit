-- Saved quizzes: lets a user persist a generated quiz and reopen it later.
-- Run this against the Supabase project (SQL editor or `supabase db` / apply_migration).

create table if not exists public.saved_quizzes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  subject_id  uuid references public.subjects (id) on delete cascade,
  title       text not null,
  questions   jsonb not null,        -- array of { question, options[], answer }
  created_at  timestamptz not null default now()
);

create index if not exists saved_quizzes_subject_idx on public.saved_quizzes (subject_id);
create index if not exists saved_quizzes_user_idx    on public.saved_quizzes (user_id);

alter table public.saved_quizzes enable row level security;

-- Owners can read / write / delete only their own saved quizzes.
create policy "saved_quizzes_select_own"
  on public.saved_quizzes for select
  using (auth.uid() = user_id);

create policy "saved_quizzes_insert_own"
  on public.saved_quizzes for insert
  with check (auth.uid() = user_id);

create policy "saved_quizzes_delete_own"
  on public.saved_quizzes for delete
  using (auth.uid() = user_id);
