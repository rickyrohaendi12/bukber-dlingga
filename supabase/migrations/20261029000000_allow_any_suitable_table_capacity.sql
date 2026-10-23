begin;

do $migration$
declare
  function_definition text;
  updated_definition text;
  optimal_capacity_check constant text := $pattern$
if[[:space:]]+table_seats[[:space:]]*<>[[:space:]]*smallest_suitable_seats[[:space:]]+then[[:space:]]+raise[[:space:]]+exception[[:space:]]+'TABLE_CAPACITY_NOT_OPTIMAL';[[:space:]]+end[[:space:]]+if;
$pattern$;
begin
  function_definition := pg_get_functiondef(
    'public.create_reservation(jsonb)'::regprocedure
  );
  updated_definition := regexp_replace(
    function_definition,
    optimal_capacity_check,
    '',
    'gi'
  );

  if updated_definition = function_definition then
    if function_definition ~* 'TABLE_CAPACITY_NOT_OPTIMAL' then
      raise exception 'Could not match table capacity validation in create_reservation';
    end if;
  else
    execute updated_definition;
  end if;
end;
$migration$;

commit;
