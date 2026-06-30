-- Multi-tenancy: companies table + super_admin role
-- Each admin and their cleaners/communities belong to one company.
-- Super admins bypass all company scoping and see everything.

-- 1. Allow super_admin as a valid role
alter table employees drop constraint employees_role_check;
alter table employees add constraint employees_role_check
  check (role in ('cleaner', 'admin', 'super_admin'));

-- 2. Companies table
create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_name text,
  owner_email text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table companies enable row level security;

-- 3. Add company_id to employees and communities
alter table employees add column if not exists company_id uuid references companies(id) on delete cascade;
alter table communities add column if not exists company_id uuid references companies(id) on delete cascade;

-- 4. Seed the default company for all existing data
insert into companies (id, name, owner_name)
values ('00000000-0000-0000-0000-000000000001', 'Carwaj Dubai', 'Sergi')
on conflict (id) do nothing;

-- 5. Backfill existing rows (super_admins get no company)
update employees
  set company_id = '00000000-0000-0000-0000-000000000001'
  where company_id is null and role in ('admin', 'cleaner');

update communities
  set company_id = '00000000-0000-0000-0000-000000000001'
  where company_id is null;

-- 6. Helper functions
create or replace function is_super_admin(uid uuid)
returns boolean language sql security definer stable as $$
  select exists (select 1 from employees where auth_user_id = uid and role = 'super_admin');
$$;

create or replace function get_my_company_id(uid uuid)
returns uuid language sql security definer stable as $$
  select company_id from employees where auth_user_id = uid limit 1;
$$;

-- 7. Companies RLS
create policy "super_admin manages companies" on companies
  for all using (is_super_admin(auth.uid())) with check (is_super_admin(auth.uid()));
create policy "admins read own company" on companies
  for select using (id = get_my_company_id(auth.uid()));

-- 8. Rebuild community policies with company scoping
drop policy if exists "admins manage communities" on communities;
drop policy if exists "cleaners read their communities" on communities;

create policy "super_admin all communities" on communities
  for all using (is_super_admin(auth.uid())) with check (is_super_admin(auth.uid()));
create policy "admins manage communities" on communities
  for all using (
    is_admin(auth.uid()) and company_id = get_my_company_id(auth.uid())
  ) with check (
    is_admin(auth.uid()) and company_id = get_my_company_id(auth.uid())
  );
create policy "cleaners read their communities" on communities
  for select using (
    company_id = get_my_company_id(auth.uid()) and
    id = any (select unnest(community_ids) from employees where auth_user_id = auth.uid())
  );

-- 9. Rebuild employee policies with company scoping
drop policy if exists "admins manage employees" on employees;
drop policy if exists "employees read own row" on employees;
drop policy if exists "employees update own profile" on employees;

create policy "super_admin all employees" on employees
  for all using (is_super_admin(auth.uid())) with check (is_super_admin(auth.uid()));
create policy "admins manage employees" on employees
  for all using (
    is_admin(auth.uid()) and company_id = get_my_company_id(auth.uid())
  ) with check (
    is_admin(auth.uid()) and company_id = get_my_company_id(auth.uid())
  );
create policy "employees read own row" on employees
  for select using (auth_user_id = auth.uid());
create policy "employees update own profile" on employees
  for update using (auth_user_id = auth.uid()) with check (auth_user_id = auth.uid());

-- 10. Give super_admin full read access to villas, cars, bookings, payments, subscriptions
create policy "super_admin all villas" on villas
  for all using (is_super_admin(auth.uid())) with check (is_super_admin(auth.uid()));
create policy "super_admin all cars" on cars
  for all using (is_super_admin(auth.uid())) with check (is_super_admin(auth.uid()));
create policy "super_admin all bookings" on bookings
  for all using (is_super_admin(auth.uid())) with check (is_super_admin(auth.uid()));
create policy "super_admin all payments" on payments
  for all using (is_super_admin(auth.uid())) with check (is_super_admin(auth.uid()));
create policy "super_admin all subscriptions" on service_subscriptions
  for all using (is_super_admin(auth.uid())) with check (is_super_admin(auth.uid()));
