-- Reject same-day reservations in the database using Jakarta local time.
do $migration$
declare
  function_definition text;
  updated_definition text;
  date_check_pattern constant text := $pattern$if requested_date[[:space:]]*<[[:space:]]*current_date then[[:space:]]+raise exception 'BOOKING_DATE_IN_PAST';[[:space:]]+end[[:space:]]+if;$pattern$;
  replacement text := $replacement$if requested_date <= (now() at time zone 'Asia/Jakarta')::date then
    raise exception 'BOOKING_DATE_MUST_BE_AT_LEAST_ONE_DAY_AHEAD';
  end if;$replacement$;
begin
  function_definition := pg_get_functiondef(
    'public.create_reservation(jsonb)'::regprocedure
  );
  updated_definition := regexp_replace(
    function_definition,
    date_check_pattern,
    replacement,
    'gi'
  );

  if updated_definition = function_definition then
    raise exception 'Could not find the date validation in create_reservation';
  end if;

  execute updated_definition;
end;
$migration$;
