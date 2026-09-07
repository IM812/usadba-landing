alter table public.seasonal_prices
  add column if not exists minimum_nights integer;

update public.seasonal_prices
set minimum_nights = coalesce(
  (select greatest(1, minimum_nights) from public.settings where id = 1),
  1
)
where minimum_nights is null;

alter table public.seasonal_prices
  alter column minimum_nights set default 1,
  alter column minimum_nights set not null;

alter table public.seasonal_prices
  drop constraint if exists seasonal_prices_minimum_nights_check;

alter table public.seasonal_prices
  add constraint seasonal_prices_minimum_nights_check
  check (minimum_nights between 1 and 365);

alter table public.settings
  add column if not exists season_overlap_rule text not null default 'strictest';

alter table public.settings
  drop constraint if exists settings_season_overlap_rule_check;

alter table public.settings
  add constraint settings_season_overlap_rule_check
  check (season_overlap_rule in ('check_in', 'strictest'));
