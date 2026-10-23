begin;

drop index if exists public.reservations_active_table_date_key;

alter table public.reservations
  drop constraint if exists reservations_status_check;

update public.reservations
set status = 'awaiting_dp'
where status = 'confirmed';

alter table public.reservations
  add constraint reservations_status_check
  check (status in ('pending', 'awaiting_dp', 'dp_paid', 'cancelled'));

create unique index reservations_active_table_date_key
  on public.reservations (date, table_id)
  where status in ('pending', 'awaiting_dp', 'dp_paid');

create or replace function public.get_booked_tables(p_date date)
returns table(table_id text)
language sql
security definer
set search_path = public
as $$
  select r.table_id
  from public.reservations r
  where r.date = p_date
    and r.status in ('pending', 'awaiting_dp', 'dp_paid');
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

  if p_status not in ('pending', 'awaiting_dp', 'dp_paid', 'cancelled') then
    raise exception 'INVALID_RESERVATION_STATUS';
  end if;

  select *
  into result
  from public.reservations
  where booking_id = p_booking_id
  for update;

  if not found then
    raise exception 'RESERVATION_NOT_FOUND';
  end if;

  if result.status <> p_status and not (
    (result.status = 'pending' and p_status in ('awaiting_dp', 'cancelled'))
    or (result.status = 'awaiting_dp' and p_status in ('dp_paid', 'cancelled'))
    or (result.status = 'dp_paid' and p_status = 'cancelled')
  ) then
    raise exception 'INVALID_RESERVATION_STATUS_TRANSITION';
  end if;

  update public.reservations
  set status = p_status
  where id = result.id
  returning * into result;

  return result;
exception
  when unique_violation then
    raise exception 'TABLE_ALREADY_BOOKED';
end;
$$;

do $migration$
declare
  function_definition text;
  updated_definition text;
begin
  function_definition := pg_get_functiondef(
    'public.update_reservation_order(text, text, jsonb, jsonb)'::regprocedure
  );
  updated_definition := regexp_replace(
    function_definition,
    $pattern$existing\.status[[:space:]]+in[[:space:]]*\([[:space:]]*'pending'[[:space:]]*,[[:space:]]*'confirmed'[[:space:]]*\)$pattern$,
    $replacement$existing.status in ('pending', 'awaiting_dp', 'dp_paid')$replacement$,
    'gi'
  );

  if updated_definition = function_definition then
    raise exception 'Could not find active booking status check in update_reservation_order';
  end if;

  execute updated_definition;
end;
$migration$;

revoke all on function public.get_booked_tables(date) from public;
revoke all on function public.set_reservation_status(text, text) from public;
grant execute on function public.get_booked_tables(date) to anon, authenticated;
grant execute on function public.set_reservation_status(text, text) to authenticated;

commit;
