-- Keep booking totals tax-free and validate current package prices.
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
    0,
    calculated_subtotal
  )
  returning * into result;

  return result;
exception
  when unique_violation then
    raise exception 'TABLE_ALREADY_BOOKED';
end;
$$;
