-- ============================================================
-- Curly Tracker · Esquema de base de datos (Supabase / Postgres)
-- Ejecutar en Supabase → SQL Editor → New query → Run
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- user_profile ----------
create table if not exists public.user_profile (
  user_id uuid primary key references auth.users(id) on delete cascade,
  curl_pattern text not null default '3A' check (curl_pattern in ('2C', '3A', '3B', '3C', '4A')),
  porosity text not null default 'media' check (porosity in ('baja', 'media', 'alta')),
  thickness text not null default 'medio' check (thickness in ('fino', 'medio', 'grueso')),
  goal text not null default 'definicion' check (goal in ('frizz', 'definicion', 'encogimiento', 'salud')),
  reminder_enabled boolean not null default true,
  reminder_time text not null default '08:00',
  updated_at timestamptz not null default now()
);

-- ---------- identidad social (idempotente) ----------
alter table public.user_profile add column if not exists first_name text not null default '';
alter table public.user_profile add column if not exists last_name text not null default '';
alter table public.user_profile add column if not exists username text not null default '';
alter table public.user_profile add column if not exists display_name text not null default '';
alter table public.user_profile add column if not exists bio text not null default '';
alter table public.user_profile add column if not exists avatar_url text not null default '';
alter table public.user_profile add column if not exists banner_url text not null default '';

-- La app no usa teléfono ni estilos de nombre: se eliminan los campos legacy si existieran.
alter table public.user_profile drop column if exists phone;
alter table public.user_profile drop column if exists display_style;

-- El usuario se compara en minúsculas y los valores vacíos no cuentan como "ocupados".
create unique index if not exists user_profile_username_key
  on public.user_profile (lower(username)) where username <> '';

-- Disponibilidad de usuario: SECURITY DEFINER para poder consultar otras filas
-- sin exponerlas. Devuelve true si el nombre está libre.
create or replace function public.username_available(candidate text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1 from public.user_profile
    where lower(username) = lower(btrim(coalesce(candidate, '')))
  );
$$;
revoke all on function public.username_available(text) from public;
grant execute on function public.username_available(text) to anon, authenticated;

-- ---------- products ----------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  brand text not null default '',
  category text not null check (category in (
    'Shampoo',
    'Acondicionador',
    'Tratamiento / Mascarilla',
    'Crema de peinar',
    'Aceite',
    'Gel'
  )),
  status text not null default 'Lo tengo - En uso' check (status in (
    'Lo tengo - En uso',
    'Lo tengo - Por acabarse',
    'No lo tengo / Lista de compra'
  )),
  ingredients text[] not null default '{}',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- tools ----------
create table if not exists public.tools (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  owned boolean not null default false,
  preset boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

-- ---------- schedule_logs ----------
create table if not exists public.schedule_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  completed boolean not null default false,
  steps jsonb not null default '[]'::jsonb,
  products_used text[] not null default '{}',
  tools_used text[] not null default '{}',
  definition smallint check (definition between 1 and 5),
  frizz smallint check (frizz between 1 and 5),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, log_date)
);

-- ---------- índices ----------
create index if not exists products_user_id_idx on public.products (user_id);
create index if not exists products_category_idx on public.products (user_id, category);
create index if not exists tools_user_id_idx on public.tools (user_id);
create index if not exists schedule_logs_user_date_idx on public.schedule_logs (user_id, log_date desc);

-- ---------- updated_at automático ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists trg_tools_updated_at on public.tools;
create trigger trg_tools_updated_at before update on public.tools
  for each row execute function public.set_updated_at();

drop trigger if exists trg_logs_updated_at on public.schedule_logs;
create trigger trg_logs_updated_at before update on public.schedule_logs
  for each row execute function public.set_updated_at();

drop trigger if exists trg_profile_updated_at on public.user_profile;
create trigger trg_profile_updated_at before update on public.user_profile
  for each row execute function public.set_updated_at();

-- ---------- Row Level Security ----------
alter table public.user_profile enable row level security;
alter table public.products enable row level security;
alter table public.tools enable row level security;
alter table public.schedule_logs enable row level security;

-- user_profile
drop policy if exists "profile_select_own" on public.user_profile;
create policy "profile_select_own" on public.user_profile
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "profile_insert_own" on public.user_profile;
create policy "profile_insert_own" on public.user_profile
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "profile_update_own" on public.user_profile;
create policy "profile_update_own" on public.user_profile
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "profile_delete_own" on public.user_profile;
create policy "profile_delete_own" on public.user_profile
  for delete to authenticated using (auth.uid() = user_id);

-- products
drop policy if exists "products_select_own" on public.products;
create policy "products_select_own" on public.products
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "products_insert_own" on public.products;
create policy "products_insert_own" on public.products
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "products_update_own" on public.products;
create policy "products_update_own" on public.products
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "products_delete_own" on public.products;
create policy "products_delete_own" on public.products
  for delete to authenticated using (auth.uid() = user_id);

-- tools
drop policy if exists "tools_select_own" on public.tools;
create policy "tools_select_own" on public.tools
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "tools_insert_own" on public.tools;
create policy "tools_insert_own" on public.tools
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "tools_update_own" on public.tools;
create policy "tools_update_own" on public.tools
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "tools_delete_own" on public.tools;
create policy "tools_delete_own" on public.tools
  for delete to authenticated using (auth.uid() = user_id);

-- schedule_logs
drop policy if exists "logs_select_own" on public.schedule_logs;
create policy "logs_select_own" on public.schedule_logs
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "logs_insert_own" on public.schedule_logs;
create policy "logs_insert_own" on public.schedule_logs
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "logs_update_own" on public.schedule_logs;
create policy "logs_update_own" on public.schedule_logs
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "logs_delete_own" on public.schedule_logs;
create policy "logs_delete_own" on public.schedule_logs
  for delete to authenticated using (auth.uid() = user_id);

-- ---------- Realtime (sincronización entre dispositivos) ----------
-- La app se suscribe a cambios de estas tablas filtrando por auth.uid().
-- Si ya están en la publicación, no se hace nada (seguro volver a ejecutar).
do $$
declare
  t text;
begin
  foreach t in array array['user_profile', 'products', 'tools', 'schedule_logs'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

-- ---------- Storage: fotos de perfil y banner ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars', 'avatars', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own" on storage.objects
  for update to authenticated using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  ) with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_delete_own" on storage.objects
  for delete to authenticated using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Nota: la app funciona en modo local aunque estas tablas no existan todavía.
-- Cuando se crean, los datos locales se envían a la nube en la primera sincronización.
-- Las herramientas se identifican por (user_id, name) para que el mismo preset
-- sea la misma fila en todos los dispositivos.
