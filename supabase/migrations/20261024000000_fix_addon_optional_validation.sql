-- Ensure A La Carte bookings do not require add-on items.
do $migration$
declare
  target_function regprocedure;
  function_definition text;
  validation_pattern constant text := $pattern$if has_a_la_carte[[:space:]]+and[[:space:]]+addons_total[[:space:]]*=[[:space:]]*0[[:space:]]+then[[:space:]]+raise[[:space:]]+exception[[:space:]]+'A_LA_CARTE_REQUIRES_MENU';[[:space:]]+end[[:space:]]+if;$pattern$;
begin
  foreach target_function in array array[
    'public.create_reservation(jsonb)'::regprocedure,
    'public.update_reservation_order(text, text, jsonb, jsonb)'::regprocedure
  ]
  loop
    function_definition := pg_get_functiondef(target_function);
    function_definition := regexp_replace(
      function_definition,
      validation_pattern,
      '',
      'gi'
    );

    if function_definition ~* validation_pattern then
      raise exception 'A La Carte validation remains in %', target_function;
    end if;

    execute function_definition;
  end loop;
end;
$migration$;
