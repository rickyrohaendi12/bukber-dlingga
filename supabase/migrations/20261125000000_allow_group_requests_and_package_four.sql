begin;

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
    '(''paket-premium-sultan'', 185000)',
    '(''paket-premium-sultan'', 185000), (''paket-4'', 35000)'
  );
  if updated_definition = function_definition then
    raise exception 'Could not add paket-4 to create_reservation';
  end if;

  function_definition := updated_definition;
  updated_definition := replace(
    function_definition,
    'requested_pax not between 2 and 15',
    'requested_pax not between 2 and 30'
  );
  if updated_definition = function_definition then
    raise exception 'Could not update create_reservation guest limit';
  end if;

  function_definition := updated_definition;
  updated_definition := replace(
    function_definition,
    '(''DEFAULT-15'', 15)',
    '(''DEFAULT-15'', 30)'
  );
  if updated_definition = function_definition then
    raise exception 'Could not update create_reservation group capacity';
  end if;
  execute updated_definition;

  function_definition := pg_get_functiondef(
    'public.update_reservation_order(text, text, integer, jsonb, jsonb)'::regprocedure
  );
  updated_definition := replace(
    function_definition,
    '(''paket-premium-sultan'', 185000)',
    '(''paket-premium-sultan'', 185000), (''paket-4'', 35000)'
  );
  if updated_definition = function_definition then
    raise exception 'Could not add paket-4 to update_reservation_order';
  end if;

  function_definition := updated_definition;
  updated_definition := replace(
    function_definition,
    'p_pax not between 2 and 15',
    'p_pax not between 2 and 30'
  );
  if updated_definition = function_definition then
    raise exception 'Could not update update_reservation_order guest limit';
  end if;

  function_definition := updated_definition;
  updated_definition := replace(
    function_definition,
    '(''DEFAULT-15'', 15)',
    '(''DEFAULT-15'', 30)'
  );
  if updated_definition = function_definition then
    raise exception 'Could not update update_reservation_order group capacity';
  end if;
  execute updated_definition;
end;
$migration$;

commit;
