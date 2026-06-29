-- Cleaners now create their own clients (villas/cars) and deals (subscriptions),
-- with a weekday pattern + time window instead of a single weekday.

alter table service_subscriptions add column if not exists weekdays smallint[] not null default '{}';
alter table service_subscriptions add column if not exists time_window_start time;
alter table service_subscriptions add column if not exists time_window_end time;

alter table bookings add column if not exists subscription_id uuid references service_subscriptions(id) on delete set null;
create index if not exists bookings_subscription_id_idx on bookings(subscription_id);

-- Cleaners can now create/manage villas, cars and subscriptions within their own
-- assigned communities (previously read-only; admins still have full access via
-- the existing "admins manage X" policies).

create policy "cleaners insert villas in their communities" on villas
  for insert with check (
    community_id = any (select unnest(community_ids) from employees where auth_user_id = auth.uid())
  );
create policy "cleaners update villas in their communities" on villas
  for update using (
    community_id = any (select unnest(community_ids) from employees where auth_user_id = auth.uid())
  ) with check (
    community_id = any (select unnest(community_ids) from employees where auth_user_id = auth.uid())
  );

create policy "cleaners insert cars" on cars
  for insert with check (
    villa_id in (
      select v.id from villas v
      where v.community_id = any (select unnest(community_ids) from employees where auth_user_id = auth.uid())
    )
  );
create policy "cleaners update cars" on cars
  for update using (
    villa_id in (
      select v.id from villas v
      where v.community_id = any (select unnest(community_ids) from employees where auth_user_id = auth.uid())
    )
  ) with check (
    villa_id in (
      select v.id from villas v
      where v.community_id = any (select unnest(community_ids) from employees where auth_user_id = auth.uid())
    )
  );
create policy "cleaners delete cars" on cars
  for delete using (
    villa_id in (
      select v.id from villas v
      where v.community_id = any (select unnest(community_ids) from employees where auth_user_id = auth.uid())
    )
  );

create policy "cleaners insert subscriptions" on service_subscriptions
  for insert with check (
    villa_id in (
      select v.id from villas v
      where v.community_id = any (select unnest(community_ids) from employees where auth_user_id = auth.uid())
    )
  );
create policy "cleaners update subscriptions" on service_subscriptions
  for update using (
    villa_id in (
      select v.id from villas v
      where v.community_id = any (select unnest(community_ids) from employees where auth_user_id = auth.uid())
    )
  ) with check (
    villa_id in (
      select v.id from villas v
      where v.community_id = any (select unnest(community_ids) from employees where auth_user_id = auth.uid())
    )
  );

create policy "cleaners insert own bookings" on bookings
  for insert with check (employee_id = current_employee_id(auth.uid()));
create policy "cleaners delete own bookings" on bookings
  for delete using (employee_id = current_employee_id(auth.uid()));
