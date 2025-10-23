-- Supabase schema for voice-tutor

create table if not exists users (
  id text primary key,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone
);

create table if not exists progress (
  id bigserial primary key,
  user_id text references users(id) on delete cascade,
  lesson_id text,
  step_index integer default 0,
  score integer default 0,
  updated_at timestamp with time zone
);

create unique index if not exists progress_user_lesson on progress(user_id, lesson_id);
