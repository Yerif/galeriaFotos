-- Orden de las fotos definido por el admin.
-- Correr DESPUÉS de 0001_init.sql y ANTES de desplegar la versión de la app que usa `position`.

alter table photos add column if not exists position integer;

-- Punto de partida: el orden que ya veían los invitados (más nuevas primero).
with ordered as (
  select id, row_number() over (order by created_at desc, id desc) as rn
  from photos
)
update photos p
set position = o.rn
from ordered o
where p.id = o.id and p.position is null;

alter table photos alter column position set not null;
alter table photos alter column position set default 0;

create index if not exists idx_photos_event_position on photos(event_id, position, id);

-- Reordena todas las fotos en una sola consulta: la posición es el lugar de cada id en el arreglo.
create or replace function reorder_photos(photo_ids uuid[])
returns void
language sql
security definer
set search_path = public
as $$
  update photos p
  set position = o.ord
  from unnest(photo_ids) with ordinality as o(id, ord)
  where p.id = o.id;
$$;

-- Solo la service role (el servidor de la app) puede reordenar; nunca el cliente anónimo.
revoke all on function reorder_photos(uuid[]) from public, anon, authenticated;
grant execute on function reorder_photos(uuid[]) to service_role;
