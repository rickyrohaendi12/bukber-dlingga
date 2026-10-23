begin;

do $migration$
declare
  function_definition text;
  updated_definition text;
begin
  function_definition := pg_get_functiondef(
    'public.create_reservation(jsonb)'::regprocedure
  );
  updated_definition := regexp_replace(
    function_definition,
    'allocated_pax[[:space:]]*<>[[:space:]]*requested_pax',
    'allocated_pax < requested_pax',
    'gi'
  );

  if updated_definition = function_definition then
    raise exception 'Could not find package allocation check in create_reservation';
  end if;

  execute updated_definition;
end;
$migration$;

drop function if exists public.update_reservation_order(text, text, jsonb, jsonb);

create or replace function public.update_reservation_order(
  p_booking_id text,
  p_phone text,
  p_pax integer,
  p_package_selections jsonb,
  p_addons jsonb
)
returns public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.reservations;
  package_selection record;
  addon_selection record;
  requested_pax integer;
  allocated_package_count integer := 0;
  selected_package_count integer := 0;
  package_price integer;
  addon_price integer;
  addon_quantity integer;
  addons_total integer := 0;
  calculated_subtotal integer := 0;
  requested_package text;
  next_table text;
begin
  select *
  into result
  from public.reservations
  where lower(booking_id) = lower(trim(p_booking_id))
    and regexp_replace(customer_phone, '\D', '', 'g') =
      regexp_replace(coalesce(p_phone, ''), '\D', '', 'g')
  for update;

  if not found then
    raise exception 'RESERVATION_NOT_FOUND';
  end if;

  if result.status = 'cancelled' then
    raise exception 'RESERVATION_NOT_EDITABLE';
  end if;

  if result.date < (now() at time zone 'Asia/Jakarta')::date
    or (
      result.date = (now() at time zone 'Asia/Jakarta')::date
      and (now() at time zone 'Asia/Jakarta')::time >= time '12:00'
    ) then
    raise exception 'RESERVATION_EDIT_WINDOW_CLOSED';
  end if;

  if p_pax is null or p_pax not between 2 and 12 then
    raise exception 'INVALID_GUEST_COUNT';
  end if;
  requested_pax := p_pax;

  if jsonb_typeof(coalesce(p_package_selections, '{}'::jsonb)) <> 'object'
    or jsonb_typeof(coalesce(p_addons, '{}'::jsonb)) <> 'object' then
    raise exception 'INVALID_ORDER';
  end if;

  for package_selection in
    select key, value
    from jsonb_each_text(coalesce(p_package_selections, '{}'::jsonb))
  loop
    selected_package_count := selected_package_count + 1;
    package_price := null;

    if package_selection.key = 'a-la-carte' then
      package_price := 0;
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

    allocated_package_count := allocated_package_count
      + package_selection.value::integer;
    calculated_subtotal := calculated_subtotal
      + package_price * package_selection.value::integer;
  end loop;

  if selected_package_count = 0 or allocated_package_count < requested_pax then
    raise exception 'PACKAGE_SELECTIONS_MUST_AT_LEAST_MATCH_GUEST_COUNT';
  end if;

  for addon_selection in
    select key, value
    from jsonb_each_text(coalesce(p_addons, '{}'::jsonb))
  loop
    addon_quantity := addon_selection.value::integer;
    addon_price := case addon_selection.key
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

  calculated_subtotal := calculated_subtotal + addons_total;
  select case when count(*) = 1 then min(key) else 'mixed' end
  into requested_package
  from jsonb_each_text(coalesce(p_package_selections, '{}'::jsonb));

  perform pg_advisory_xact_lock(
    hashtext('reservation-order-table:' || result.date::text)
  );

  select available_tables.id
  into next_table
  from (values
    ('G-01', 4), ('G-02', 4), ('G-03', 6), ('G-04', 6),
    ('G-05', 8), ('G-06', 8), ('T-07', 6), ('M-01', 4),
    ('M-02', 4), ('M-03', 6), ('M-04', 10), ('M-05', 12), ('M-06', 4)
  ) as available_tables(id, seats)
  where available_tables.seats >= requested_pax
    and not exists (
      select 1
      from public.reservations existing
      where existing.date = result.date
        and existing.table_id = available_tables.id
        and existing.status in ('pending', 'awaiting_dp', 'dp_paid')
        and existing.booking_id <> result.booking_id
    )
  order by available_tables.seats, available_tables.id
  limit 1;

  if next_table is null then
    raise exception 'NO_AVAILABLE_TABLE_FOR_GUEST_COUNT';
  end if;

  update public.reservations
  set pax = requested_pax,
      package_id = requested_package,
      package_selections = p_package_selections,
      addons = p_addons,
      table_id = next_table,
      subtotal = calculated_subtotal,
      tax_amount = 0,
      total_amount = calculated_subtotal
  where id = result.id
  returning * into result;

  return result;
exception
  when unique_violation then
    raise exception 'NO_AVAILABLE_TABLE_FOR_GUEST_COUNT';
end;
$$;

revoke all on function public.update_reservation_order(text, text, integer, jsonb, jsonb) from public;
grant execute on function public.update_reservation_order(text, text, integer, jsonb, jsonb) to anon, authenticated;

commit;
