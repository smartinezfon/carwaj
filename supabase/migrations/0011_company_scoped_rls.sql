-- Scope villas, cars, bookings, payments, service_subscriptions to company
-- Previously these policies checked is_admin() globally — any admin could
-- read/write data from ALL companies. This scopes them to their own company.

-- Helper: get company_id for a community (used in villa/car/sub/booking/payment checks)
create or replace function get_community_company_id(cid uuid)
returns uuid language sql security definer stable as $$
  select company_id from communities where id = cid limit 1;
$$;

-- ── VILLAS ──────────────────────────────────────────────────────────────────
drop policy if exists "admins manage villas" on villas;
drop policy if exists "cleaners read villas in their communities" on villas;
drop policy if exists "cleaners insert villas in their communities" on villas;
drop policy if exists "cleaners update villas in their communities" on villas;

create policy "admins manage villas" on villas
  for all using (
    is_admin(auth.uid()) and
    get_community_company_id(community_id) = get_my_company_id(auth.uid())
  ) with check (
    is_admin(auth.uid()) and
    get_community_company_id(community_id) = get_my_company_id(auth.uid())
  );

create policy "cleaners read villas in their communities" on villas
  for select using (
    community_id = any (select unnest(community_ids) from employees where auth_user_id = auth.uid())
    and get_community_company_id(community_id) = get_my_company_id(auth.uid())
  );

create policy "cleaners insert villas in their communities" on villas
  for insert with check (
    community_id = any (select unnest(community_ids) from employees where auth_user_id = auth.uid())
    and get_community_company_id(community_id) = get_my_company_id(auth.uid())
  );

create policy "cleaners update villas in their communities" on villas
  for update using (
    community_id = any (select unnest(community_ids) from employees where auth_user_id = auth.uid())
    and get_community_company_id(community_id) = get_my_company_id(auth.uid())
  ) with check (
    community_id = any (select unnest(community_ids) from employees where auth_user_id = auth.uid())
    and get_community_company_id(community_id) = get_my_company_id(auth.uid())
  );

-- ── CARS ────────────────────────────────────────────────────────────────────
drop policy if exists "admins manage cars" on cars;
drop policy if exists "cleaners read cars" on cars;
drop policy if exists "cleaners insert cars" on cars;
drop policy if exists "cleaners update cars" on cars;
drop policy if exists "cleaners delete cars" on cars;

create policy "admins manage cars" on cars
  for all using (
    is_admin(auth.uid()) and
    (select get_community_company_id(v.community_id) from villas v where v.id = villa_id) = get_my_company_id(auth.uid())
  ) with check (
    is_admin(auth.uid()) and
    (select get_community_company_id(v.community_id) from villas v where v.id = villa_id) = get_my_company_id(auth.uid())
  );

create policy "cleaners read cars" on cars
  for select using (
    villa_id in (
      select v.id from villas v
      where v.community_id = any (select unnest(community_ids) from employees where auth_user_id = auth.uid())
      and get_community_company_id(v.community_id) = get_my_company_id(auth.uid())
    )
  );

create policy "cleaners insert cars" on cars
  for insert with check (
    villa_id in (
      select v.id from villas v
      where v.community_id = any (select unnest(community_ids) from employees where auth_user_id = auth.uid())
      and get_community_company_id(v.community_id) = get_my_company_id(auth.uid())
    )
  );

create policy "cleaners update cars" on cars
  for update using (
    villa_id in (
      select v.id from villas v
      where v.community_id = any (select unnest(community_ids) from employees where auth_user_id = auth.uid())
      and get_community_company_id(v.community_id) = get_my_company_id(auth.uid())
    )
  ) with check (
    villa_id in (
      select v.id from villas v
      where v.community_id = any (select unnest(community_ids) from employees where auth_user_id = auth.uid())
      and get_community_company_id(v.community_id) = get_my_company_id(auth.uid())
    )
  );

create policy "cleaners delete cars" on cars
  for delete using (
    villa_id in (
      select v.id from villas v
      where v.community_id = any (select unnest(community_ids) from employees where auth_user_id = auth.uid())
      and get_community_company_id(v.community_id) = get_my_company_id(auth.uid())
    )
  );

-- ── SERVICE SUBSCRIPTIONS ────────────────────────────────────────────────────
drop policy if exists "admins manage subscriptions" on service_subscriptions;
drop policy if exists "cleaners read subscriptions" on service_subscriptions;
drop policy if exists "cleaners insert subscriptions" on service_subscriptions;
drop policy if exists "cleaners update subscriptions" on service_subscriptions;
drop policy if exists "cleaners delete subscriptions" on service_subscriptions;

create policy "admins manage subscriptions" on service_subscriptions
  for all using (
    is_admin(auth.uid()) and
    (select get_community_company_id(v.community_id) from villas v where v.id = villa_id) = get_my_company_id(auth.uid())
  ) with check (
    is_admin(auth.uid()) and
    (select get_community_company_id(v.community_id) from villas v where v.id = villa_id) = get_my_company_id(auth.uid())
  );

create policy "cleaners read subscriptions" on service_subscriptions
  for select using (
    villa_id in (
      select v.id from villas v
      where v.community_id = any (select unnest(community_ids) from employees where auth_user_id = auth.uid())
      and get_community_company_id(v.community_id) = get_my_company_id(auth.uid())
    )
  );

create policy "cleaners insert subscriptions" on service_subscriptions
  for insert with check (
    villa_id in (
      select v.id from villas v
      where v.community_id = any (select unnest(community_ids) from employees where auth_user_id = auth.uid())
      and get_community_company_id(v.community_id) = get_my_company_id(auth.uid())
    )
  );

create policy "cleaners update subscriptions" on service_subscriptions
  for update using (
    villa_id in (
      select v.id from villas v
      where v.community_id = any (select unnest(community_ids) from employees where auth_user_id = auth.uid())
      and get_community_company_id(v.community_id) = get_my_company_id(auth.uid())
    )
  ) with check (
    villa_id in (
      select v.id from villas v
      where v.community_id = any (select unnest(community_ids) from employees where auth_user_id = auth.uid())
      and get_community_company_id(v.community_id) = get_my_company_id(auth.uid())
    )
  );

create policy "cleaners delete subscriptions" on service_subscriptions
  for delete using (
    villa_id in (
      select v.id from villas v
      where v.community_id = any (select unnest(community_ids) from employees where auth_user_id = auth.uid())
      and get_community_company_id(v.community_id) = get_my_company_id(auth.uid())
    )
  );

-- ── BOOKINGS ────────────────────────────────────────────────────────────────
drop policy if exists "admins manage bookings" on bookings;
drop policy if exists "cleaners read own bookings" on bookings;
drop policy if exists "cleaners update own bookings" on bookings;
drop policy if exists "cleaners insert own bookings" on bookings;
drop policy if exists "cleaners delete own bookings" on bookings;

create policy "admins manage bookings" on bookings
  for all using (
    is_admin(auth.uid()) and
    (select get_community_company_id(v.community_id) from villas v join cars c on c.villa_id = v.id where c.id = car_id) = get_my_company_id(auth.uid())
  ) with check (
    is_admin(auth.uid()) and
    (select get_community_company_id(v.community_id) from villas v join cars c on c.villa_id = v.id where c.id = car_id) = get_my_company_id(auth.uid())
  );

create policy "cleaners read own bookings" on bookings
  for select using (
    employee_id = current_employee_id(auth.uid())
    and (select get_my_company_id(auth.uid())) = (
      select get_community_company_id(v.community_id) from villas v join cars c on c.villa_id = v.id where c.id = car_id
    )
  );

create policy "cleaners update own bookings" on bookings
  for update using (employee_id = current_employee_id(auth.uid()))
  with check (employee_id = current_employee_id(auth.uid()));

create policy "cleaners insert own bookings" on bookings
  for insert with check (employee_id = current_employee_id(auth.uid()));

create policy "cleaners delete own bookings" on bookings
  for delete using (employee_id = current_employee_id(auth.uid()));

-- ── PAYMENTS ────────────────────────────────────────────────────────────────
drop policy if exists "admins manage payments" on payments;
drop policy if exists "cleaners read payments" on payments;
drop policy if exists "cleaners insert payments" on payments;
drop policy if exists "cleaners update payments" on payments;
drop policy if exists "cleaners delete payments" on payments;

create policy "admins manage payments" on payments
  for all using (
    is_admin(auth.uid()) and
    (select get_community_company_id(v.community_id) from villas v where v.id = villa_id) = get_my_company_id(auth.uid())
  ) with check (
    is_admin(auth.uid()) and
    (select get_community_company_id(v.community_id) from villas v where v.id = villa_id) = get_my_company_id(auth.uid())
  );

create policy "cleaners read payments" on payments
  for select using (
    villa_id in (
      select v.id from villas v
      where v.community_id = any (select unnest(community_ids) from employees where auth_user_id = auth.uid())
      and get_community_company_id(v.community_id) = get_my_company_id(auth.uid())
    )
  );

create policy "cleaners insert payments" on payments
  for insert with check (
    villa_id in (
      select v.id from villas v
      where v.community_id = any (select unnest(community_ids) from employees where auth_user_id = auth.uid())
      and get_community_company_id(v.community_id) = get_my_company_id(auth.uid())
    )
  );

create policy "cleaners update payments" on payments
  for update using (
    villa_id in (
      select v.id from villas v
      where v.community_id = any (select unnest(community_ids) from employees where auth_user_id = auth.uid())
      and get_community_company_id(v.community_id) = get_my_company_id(auth.uid())
    )
  ) with check (
    villa_id in (
      select v.id from villas v
      where v.community_id = any (select unnest(community_ids) from employees where auth_user_id = auth.uid())
      and get_community_company_id(v.community_id) = get_my_company_id(auth.uid())
    )
  );

create policy "cleaners delete payments" on payments
  for delete using (
    villa_id in (
      select v.id from villas v
      where v.community_id = any (select unnest(community_ids) from employees where auth_user_id = auth.uid())
      and get_community_company_id(v.community_id) = get_my_company_id(auth.uid())
    )
  );
