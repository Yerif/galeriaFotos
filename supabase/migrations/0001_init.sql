-- Galería de fotos Halloween — esquema inicial
-- Reemplazar 'ADMIN_EMAIL_PLACEHOLDER' por el email real del admin antes de correr esta migración.
--
-- Nota: la app NO usa Supabase Auth para el admin (login simplificado por cookie
-- propia, ver lib/adminToken.ts), así que auth.jwt()->>'email' nunca va a matchear
-- estas policies de "admin". Quedan igual como defensa en profundidad: bloquean
-- cualquier escritura desde el cliente anon. Las operaciones de admin reales pasan
-- por la service role key en el servidor, que bypassa RLS.

create extension if not exists "pgcrypto";

-- =========================================================
-- TABLA: event (una sola fila, metadata global del evento)
-- =========================================================
create table if not exists event (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Halloween 2026',
  first_photo_uploaded_at timestamptz,
  deadline_at timestamptz,
  deadline_overridden boolean not null default false,
  created_at timestamptz not null default now()
);

insert into event (name)
select 'Halloween 2026'
where not exists (select 1 from event);

-- =========================================================
-- TABLA: photos
-- =========================================================
create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references event(id) on delete cascade,
  storage_path_display text not null,
  storage_path_thumb text not null,
  original_filename text not null,
  content_type text not null,
  size_bytes bigint not null,
  width int,
  height int,
  created_at timestamptz not null default now()
);

create index if not exists idx_photos_event on photos(event_id);
create index if not exists idx_photos_created_at on photos(created_at desc);

-- =========================================================
-- TABLA: downloads
-- =========================================================
create table if not exists downloads (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid not null references photos(id) on delete cascade,
  guest_name text not null,
  downloaded_at timestamptz not null default now(),
  user_agent text
);

create index if not exists idx_downloads_photo on downloads(photo_id);

-- =========================================================
-- TRIGGER: la primera foto subida fija el deadline a +7 días
-- =========================================================
create or replace function fn_set_first_upload_deadline()
returns trigger as $$
begin
  update event
  set first_photo_uploaded_at = coalesce(first_photo_uploaded_at, now()),
      deadline_at = case
        when deadline_at is null and not deadline_overridden
          then now() + interval '7 days'
        else deadline_at
      end
  where id = new.event_id
    and first_photo_uploaded_at is null;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_set_first_upload_deadline on photos;
create trigger trg_set_first_upload_deadline
after insert on photos
for each row
execute function fn_set_first_upload_deadline();

-- =========================================================
-- RLS
-- =========================================================
alter table event enable row level security;
alter table photos enable row level security;
alter table downloads enable row level security;

-- --- event ---
drop policy if exists "event_select_public" on event;
create policy "event_select_public" on event
  for select
  using (true);

drop policy if exists "event_update_admin" on event;
create policy "event_update_admin" on event
  for update
  using (auth.jwt() ->> 'email' = 'ADMIN_EMAIL_PLACEHOLDER')
  with check (auth.jwt() ->> 'email' = 'ADMIN_EMAIL_PLACEHOLDER');

-- --- photos ---
drop policy if exists "photos_select_public_if_active" on photos;
create policy "photos_select_public_if_active" on photos
  for select
  using (
    exists (
      select 1 from event e
      where e.id = photos.event_id
        and (e.deadline_at is null or e.deadline_at > now())
    )
  );

drop policy if exists "photos_write_admin" on photos;
create policy "photos_write_admin" on photos
  for all
  using (auth.jwt() ->> 'email' = 'ADMIN_EMAIL_PLACEHOLDER')
  with check (auth.jwt() ->> 'email' = 'ADMIN_EMAIL_PLACEHOLDER');

-- --- downloads ---
drop policy if exists "downloads_insert_public" on downloads;
create policy "downloads_insert_public" on downloads
  for insert
  with check (
    exists (
      select 1 from photos p
      join event e on e.id = p.event_id
      where p.id = downloads.photo_id
        and (e.deadline_at is null or e.deadline_at > now())
    )
  );

drop policy if exists "downloads_select_admin" on downloads;
create policy "downloads_select_admin" on downloads
  for select
  using (auth.jwt() ->> 'email' = 'ADMIN_EMAIL_PLACEHOLDER');

-- =========================================================
-- STORAGE: bucket privado "photos"
-- =========================================================
insert into storage.buckets (id, name, public)
values ('photos', 'photos', false)
on conflict (id) do nothing;

drop policy if exists "storage_admin_all" on storage.objects;
create policy "storage_admin_all" on storage.objects
  for all
  using (bucket_id = 'photos' and auth.jwt() ->> 'email' = 'ADMIN_EMAIL_PLACEHOLDER')
  with check (bucket_id = 'photos' and auth.jwt() ->> 'email' = 'ADMIN_EMAIL_PLACEHOLDER');

-- Nota: el público nunca lee el bucket directamente. Las rutas de la app generan
-- signed URLs server-side con la service_role key, que bypassa RLS/policies de Storage.
