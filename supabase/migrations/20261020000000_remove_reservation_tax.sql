update public.reservations
set tax_amount = 0,
    total_amount = subtotal
where tax_amount <> 0
   or total_amount <> subtotal;

create or replace function public.normalize_reservation_total()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.tax_amount := 0;
  new.total_amount := new.subtotal;
  return new;
end;
$$;

drop trigger if exists normalize_reservation_total on public.reservations;
create trigger normalize_reservation_total
before insert or update
on public.reservations
for each row
execute function public.normalize_reservation_total();
