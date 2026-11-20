begin;

create table if not exists public.booking_settings (
  id text primary key check (id = 'default'),
  default_table_label text not null
    check (char_length(trim(default_table_label)) between 2 and 80),
  updated_at timestamptz not null default now()
);

insert into public.booking_settings (id, default_table_label)
values ('default', 'Meja Default')
on conflict (id) do nothing;

alter table public.booking_settings enable row level security;

grant select on table public.booking_settings to anon, authenticated;
grant update on table public.booking_settings to authenticated;

create policy "Anyone can read booking settings"
  on public.booking_settings
  for select
  using (true);

create policy "Admins can update booking settings"
  on public.booking_settings
  for update
  to authenticated
  using (coalesce(auth.jwt()->'app_metadata'->>'role', '') = 'admin')
  with check (coalesce(auth.jwt()->'app_metadata'->>'role', '') = 'admin');

do $migration$
declare
  function_definition text;
  updated_definition text;
begin
  function_definition := pg_get_functiondef(
    'public.create_reservation(jsonb)'::regprocedure
  );
  updated_definition := replace(
    function_definition,
    'requested_pax not between 2 and 30',
    'requested_pax not between 2 and 15'
  );
  if updated_definition = function_definition then
    raise exception 'Could not update create_reservation guest limit';
  end if;

  function_definition := updated_definition;
  updated_definition := replace(
    function_definition,
    '(''M-06'', 4)',
    '(''M-06'', 4), (''DEFAULT-15'', 15)'
  );
  if updated_definition = function_definition then
    raise exception 'Could not add DEFAULT-15 to create_reservation';
  end if;
  execute updated_definition;

  function_definition := pg_get_functiondef(
    'public.update_reservation_order(text, text, integer, jsonb, jsonb)'::regprocedure
  );
  updated_definition := replace(
    function_definition,
    'p_pax not between 2 and 12',
    'p_pax not between 2 and 15'
  );
  if updated_definition = function_definition then
    raise exception 'Could not update update_reservation_order guest limit';
  end if;

  function_definition := updated_definition;
  updated_definition := replace(
    function_definition,
    '(''M-06'', 4)',
    '(''M-06'', 4), (''DEFAULT-15'', 15)'
  );
  if updated_definition = function_definition then
    raise exception 'Could not add DEFAULT-15 to update_reservation_order';
  end if;
  execute updated_definition;
end;
$migration$;

commit;
