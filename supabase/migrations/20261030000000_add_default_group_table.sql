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

drop policy if exists "Anyone can read booking settings" on public.booking_settings;

create policy "Anyone can read booking settings"
  on public.booking_settings
  for select
  using (true);

drop policy if exists "Admins can update booking settings" on public.booking_settings;

create policy "Admins can update booking settings"
  on public.booking_settings
  for update
  to authenticated
  using (coalesce(auth.jwt()->'app_metadata'->>'role', '') = 'admin')
  with check (coalesce(auth.jwt()->'app_metadata'->>'role', '') = 'admin');

do $migration$
declare
  original_definition text;
  function_definition text;
begin
  -- create_reservation
  original_definition := pg_get_functiondef(
    'public.create_reservation(jsonb)'::regprocedure
  );
  function_definition := original_definition;

  if function_definition like '%requested_pax not between 2 and 30%' then
    function_definition := replace(
      function_definition,
      'requested_pax not between 2 and 30',
      'requested_pax not between 2 and 15'
    );
  elsif function_definition not like '%requested_pax not between 2 and 15%' then
    raise exception 'Unexpected guest limit in create_reservation';
  end if;

  if function_definition not like '%''DEFAULT-15''%' then
    if function_definition not like '%(''M-06'', 4)%' then
      raise exception 'Could not add DEFAULT-15 to create_reservation';
    end if;
    function_definition := replace(
      function_definition,
      '(''M-06'', 4)',
      '(''M-06'', 4), (''DEFAULT-15'', 15)'
    );
  end if;

  if function_definition <> original_definition then
    execute function_definition;
  end if;

  -- update_reservation_order
  original_definition := pg_get_functiondef(
    'public.update_reservation_order(text, text, integer, jsonb, jsonb)'::regprocedure
  );
  function_definition := original_definition;

  if function_definition like '%p_pax not between 2 and 12%' then
    function_definition := replace(
      function_definition,
      'p_pax not between 2 and 12',
      'p_pax not between 2 and 15'
    );
  elsif function_definition not like '%p_pax not between 2 and 15%' then
    raise exception 'Unexpected guest limit in update_reservation_order';
  end if;

  if function_definition not like '%''DEFAULT-15''%' then
    if function_definition not like '%(''M-06'', 4)%' then
      raise exception 'Could not add DEFAULT-15 to update_reservation_order';
    end if;
    function_definition := replace(
      function_definition,
      '(''M-06'', 4)',
      '(''M-06'', 4), (''DEFAULT-15'', 15)'
    );
  end if;

  if function_definition <> original_definition then
    execute function_definition;
  end if;
end;
$migration$;

commit;