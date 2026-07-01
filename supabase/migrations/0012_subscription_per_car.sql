-- Make service_subscriptions per-car instead of per-villa
alter table service_subscriptions
  add column if not exists car_id uuid references cars(id) on delete cascade;

create index if not exists service_subscriptions_car_id_idx on service_subscriptions(car_id);
