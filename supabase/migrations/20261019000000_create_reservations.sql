create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  booking_id text not null unique,
  customer_name text not null,
  customer_phone text not null,
  date date not null,
  time_slot text not null,
  pax integer not null check (pax between 1 and 30),
  package_id text not null,
  package_selections jsonb not null default '{}'::jsonb,
  table_id text not null,
  notes text not null default '',
  addons jsonb not null default '{}'::jsonb,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now(),
  subtotal integer not null check (subtotal >= 0),
  tax_amount integer not null check (tax_amount >= 0),
  total_amount integer not null check (total_amount >= 0)
);

alter table public.reservations
  add column if not exists package_selections jsonb not null default '{}'::jsonb;

update public.reservations
set package_selections = jsonb_build_object(package_id, pax)
where package_selections = '{}'::jsonb
  and package_id in ('paket-hemat', 'paket-rame-rame', 'paket-premium-sultan', 'a-la-carte');

create unique index if not exists reservations_active_table_date_key
  on public.reservations (date, table_id)
  where status in ('pending', 'confirmed');

alter table public.reservations enable row level security;
grant usage on schema public to anon, authenticated;
revoke all on table public.reservations from anon, authenticated;
grant select on table public.reservations to authenticated;

drop policy if exists "Anon can read reservations" on public.reservations;
drop policy if exists "Admin can read reservations" on public.reservations;
create policy "Admin can read reservations"
  on public.reservations for select to authenticated
  using (coalesce(auth.jwt()->'app_metadata'->>'role', '') = 'admin');

create or replace function public.create_reservation(payload jsonb)
returns public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.reservations;
  requested_date date;
  requested_pax integer;
  requested_table text;
  requested_package text;
  package_price integer;
  package_selection record;
  selected_package_count integer := 0;
  allocated_pax integer := 0;
  has_a_la_carte boolean := false;
  table_seats integer;
  smallest_suitable_seats integer;
  addons_total integer := 0;
  addon record;
  addon_price integer;
  addon_quantity integer;
  calculated_subtotal integer;
begin
  if jsonb_typeof(payload) <> 'object' then
    raise exception 'INVALID_BOOKING';
  end if;

  if length(trim(coalesce(payload->>'customerName', ''))) not between 2 and 120
    or length(regexp_replace(coalesce(payload->>'customerPhone', ''), '\D', '', 'g')) not between 8 and 15
    or length(trim(coalesce(payload->>'timeSlot', ''))) not between 1 and 60
    or length(coalesce(payload->>'notes', '')) > 1000 then
    raise exception 'INVALID_BOOKING';
  end if;

  requested_date := (payload->>'date')::date;
  requested_pax := (payload->>'pax')::integer;
  requested_table := payload->>'tableId';
  requested_package := payload->>'packageId';

  if requested_date < current_date then
    raise exception 'BOOKING_DATE_IN_PAST';
  end if;
  if requested_pax not between 2 and 30 then
    raise exception 'INVALID_GUEST_COUNT';
  end if;

  if jsonb_typeof(coalesce(payload->'packageSelections', '{}'::jsonb)) <> 'object' then
    raise exception 'INVALID_PACKAGE_SELECTIONS';
  end if;

  for package_selection in
    select key, value
    from jsonb_each_text(coalesce(payload->'packageSelections', '{}'::jsonb))
  loop
    selected_package_count := selected_package_count + 1;
    package_price := null;

    if package_selection.key = 'a-la-carte' then
      package_price := 0;
      has_a_la_carte := true;
    else
      select price into package_price
      from (values
        ('paket-hemat', 65000),
        ('paket-rame-rame', 115000),
        ('paket-premium-sultan', 185000)
      ) as packages(id, price)
      where id = package_selection.key;
    end if;

    if package_price is null
      or package_selection.value::integer not between 1 and 30 then
      raise exception 'INVALID_PACKAGE_SELECTIONS';
    end if;

    allocated_pax := allocated_pax + package_selection.value::integer;
    calculated_subtotal := coalesce(calculated_subtotal, 0)
      + package_price * package_selection.value::integer;
  end loop;

  if selected_package_count = 0 or allocated_pax <> requested_pax then
    raise exception 'PACKAGE_SELECTIONS_MUST_MATCH_GUEST_COUNT';
  end if;

  select case when count(*) = 1 then min(key) else 'mixed' end
  into requested_package
  from jsonb_each_text(coalesce(payload->'packageSelections', '{}'::jsonb));
  if requested_package is null then
    raise exception 'INVALID_PACKAGE_SELECTIONS';
  end if;

  select seats into table_seats
  from (values
    ('G-01', 4), ('G-02', 4), ('G-03', 6), ('G-04', 6),
    ('G-05', 8), ('G-06', 8), ('T-07', 6), ('M-01', 4),
    ('M-02', 4), ('M-03', 6), ('M-04', 10), ('M-05', 12), ('M-06', 4)
  ) as tables(id, seats)
  where id = requested_table;
  if table_seats is null or table_seats < requested_pax then
    raise exception 'INVALID_TABLE_CAPACITY';
  end if;

  select min(seats) into smallest_suitable_seats
  from (values
    (4), (4), (6), (6), (8), (8), (6), (4), (4), (6), (10), (12), (4)
  ) as capacities(seats)
  where seats >= requested_pax;
  if table_seats <> smallest_suitable_seats then
    raise exception 'TABLE_CAPACITY_NOT_OPTIMAL';
  end if;

  if jsonb_typeof(coalesce(payload->'addons', '{}'::jsonb)) <> 'object' then
    raise exception 'INVALID_ADDONS';
  end if;

  for addon in select key, value from jsonb_each_text(coalesce(payload->'addons', '{}'::jsonb))
  loop
    addon_quantity := addon.value::integer;
    addon_price := case addon.key
      when 'kopi-aren' then 22000
      when 'bakwan-platter' then 28000
      when 'tempe-mendoan' then 24000
      when 'es-blewah' then 18000
      when 'tahu-bakso' then 26000
      else null
    end;
    if addon_price is null or addon_quantity not between 1 and 20 then
      raise exception 'INVALID_ADDONS';
    end if;
    addons_total := addons_total + addon_price * addon_quantity;
  end loop;

  if has_a_la_carte and addons_total = 0 then
    raise exception 'A_LA_CARTE_REQUIRES_MENU';
  end if;

  calculated_subtotal := coalesce(calculated_subtotal, 0) + addons_total;

  insert into public.reservations (
    booking_id, customer_name, customer_phone, date, time_slot, pax,
    package_id, package_selections, table_id, notes, addons, subtotal, tax_amount, total_amount
  ) values (
    'BKB-' || to_char(current_date, 'YYYYMMDD') || '-' ||
      upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)),
    trim(payload->>'customerName'),
    trim(payload->>'customerPhone'),
    requested_date,
    trim(payload->>'timeSlot'),
    requested_pax,
    requested_package,
    coalesce(payload->'packageSelections', '{}'::jsonb),
    requested_table,
    trim(coalesce(payload->>'notes', '')),
    coalesce(payload->'addons', '{}'::jsonb),
    calculated_subtotal,
    round(calculated_subtotal * 0.1),
    calculated_subtotal + round(calculated_subtotal * 0.1)
  )
  returning * into result;

  return result;
exception
  when unique_violation then
    raise exception 'TABLE_ALREADY_BOOKED';
end;
$$;

create or replace function public.lookup_reservation(p_booking_id text, p_phone text)
returns setof public.reservations
language sql
security definer
set search_path = public
as $$
  select r.*
  from public.reservations r
  where lower(r.booking_id) = lower(trim(p_booking_id))
    and regexp_replace(r.customer_phone, '\D', '', 'g') =
      regexp_replace(coalesce(p_phone, ''), '\D', '', 'g')
  limit 1;
$$;

create or replace function public.list_reservations()
returns setof public.reservations
language sql
security definer
set search_path = public
as $$
  select r.*
  from public.reservations r
  where coalesce(auth.jwt()->'app_metadata'->>'role', '') = 'admin'
  order by r.created_at desc;
$$;

create or replace function public.get_booked_tables(p_date date)
returns table(table_id text)
language sql
security definer
set search_path = public
as $$
  select r.table_id
  from public.reservations r
  where r.date = p_date
    and r.status in ('pending', 'confirmed');
$$;

create or replace function public.set_reservation_status(p_booking_id text, p_status text)
returns public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.reservations;
begin
  if coalesce(auth.jwt()->'app_metadata'->>'role', '') <> 'admin' then
    raise exception 'ADMIN_ACCESS_REQUIRED';
  end if;

  if p_status not in ('pending', 'confirmed', 'cancelled') then
    raise exception 'INVALID_RESERVATION_STATUS';
  end if;

  update public.reservations
  set status = p_status
  where booking_id = p_booking_id
  returning * into result;

  if not found then
    raise exception 'RESERVATION_NOT_FOUND';
  end if;

  return result;
exception
  when unique_violation then
    raise exception 'TABLE_ALREADY_BOOKED';
end;
$$;

revoke all on function public.create_reservation(jsonb) from public;
revoke all on function public.lookup_reservation(text, text) from public;
revoke all on function public.list_reservations() from public;
revoke all on function public.get_booked_tables(date) from public;
revoke all on function public.set_reservation_status(text, text) from public;
grant execute on function public.create_reservation(jsonb) to anon, authenticated;
grant execute on function public.lookup_reservation(text, text) to anon, authenticated;
grant execute on function public.get_booked_tables(date) to anon, authenticated;
grant execute on function public.list_reservations() to authenticated;
grant execute on function public.set_reservation_status(text, text) to authenticated;
