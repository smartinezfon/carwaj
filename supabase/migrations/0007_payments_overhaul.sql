-- Payments now track who's responsible for collecting them, which schedule
-- generated them, and when they were actually paid (for "paid X days ago").

alter table payments add column if not exists employee_id uuid references employees(id) on delete set null;
alter table payments add column if not exists subscription_id uuid references service_subscriptions(id) on delete set null;
alter table payments add column if not exists paid_at timestamptz;

create index if not exists payments_employee_id_idx on payments(employee_id);
create index if not exists payments_subscription_id_idx on payments(subscription_id);

-- Cleaners manage payments for villas in their own communities (mirrors the
-- existing villas/cars/subscriptions policies). Admins already have full
-- access via the existing "admins manage payments" policy.

create policy "cleaners insert payments" on payments
  for insert with check (
    villa_id in (
      select v.id from villas v
      where v.community_id = any (select unnest(community_ids) from employees where auth_user_id = auth.uid())
    )
  );

create policy "cleaners update payments" on payments
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

create policy "cleaners delete payments" on payments
  for delete using (
    villa_id in (
      select v.id from villas v
      where v.community_id = any (select unnest(community_ids) from employees where auth_user_id = auth.uid())
    )
  );
