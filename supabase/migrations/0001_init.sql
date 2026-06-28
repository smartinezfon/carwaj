-- CarClean Manager initial schema

create extension if not exists "pgcrypto";

-- communities
create table if not exists communities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location_description text,
  created_at timestamptz not null default now()
);

-- villas
create table if not exists villas (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references communities(id) on delete cascade,
  villa_number text not null,
  owner_name text not null,
  owner_whatsapp text not null, -- e.g. +971xxxxxxxx
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists villas_community_id_idx on villas(community_id);

-- cars
create table if not exists cars (
  id uuid primary key default gen_random_uuid(),
  villa_id uuid not null references villas(id) on delete cascade,
  make text not null,
  model text not null,
  color text,
  plate_number text,
  created_at timestamptz not null default now()
);
create index if not exists cars_villa_id_idx on cars(villa_id);

-- employees (linked to supabase auth users)
create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  name text not null,
  whatsapp_number text,
  role text not null check (role in ('cleaner', 'admin')),
  community_ids uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

-- service_subscriptions
create table if not exists service_subscriptions (
  id uuid primary key default gen_random_uuid(),
  villa_id uuid not null references villas(id) on delete cascade,
  frequency text not null check (frequency in ('weekly', 'biweekly', 'monthly')),
  day_of_week smallint check (day_of_week between 0 and 6),
  price_per_clean numeric(10,2) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists service_subscriptions_villa_id_idx on service_subscriptions(villa_id);

-- bookings
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references cars(id) on delete cascade,
  employee_id uuid references employees(id) on delete set null,
  scheduled_date date not null,
  scheduled_time_slot text not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'in_progress', 'completed', 'cancelled')),
  before_photo_url text,
  after_photo_url text,
  notes text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists bookings_employee_id_idx on bookings(employee_id);
create index if not exists bookings_scheduled_date_idx on bookings(scheduled_date);
create index if not exists bookings_car_id_idx on bookings(car_id);

-- payments
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  villa_id uuid not null references villas(id) on delete cascade,
  amount numeric(10,2) not null,
  due_date date not null,
  status text not null default 'pending' check (status in ('pending', 'paid')),
  payment_method text,
  created_at timestamptz not null default now()
);
create index if not exists payments_villa_id_idx on payments(villa_id);

-- Row Level Security
alter table communities enable row level security;
alter table villas enable row level security;
alter table cars enable row level security;
alter table employees enable row level security;
alter table service_subscriptions enable row level security;
alter table bookings enable row level security;
alter table payments enable row level security;

-- Helper: is the current auth user an admin?
create or replace function is_admin(uid uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from employees e where e.auth_user_id = uid and e.role = 'admin'
  );
$$;

-- Helper: employee row for current auth user
create or replace function current_employee_id(uid uuid)
returns uuid
language sql
security definer
stable
as $$
  select id from employees where auth_user_id = uid limit 1;
$$;

-- Admins: full access to everything. Cleaners: read access to their assigned communities/bookings.

create policy "admins manage communities" on communities
  for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
create policy "cleaners read their communities" on communities
  for select using (id = any (select unnest(community_ids) from employees where auth_user_id = auth.uid()));

create policy "admins manage villas" on villas
  for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
create policy "cleaners read villas in their communities" on villas
  for select using (community_id = any (select unnest(community_ids) from employees where auth_user_id = auth.uid()));

create policy "admins manage cars" on cars
  for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
create policy "cleaners read cars" on cars
  for select using (
    villa_id in (
      select v.id from villas v
      where v.community_id = any (select unnest(community_ids) from employees where auth_user_id = auth.uid())
    )
  );

create policy "admins manage employees" on employees
  for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
create policy "employees read own row" on employees
  for select using (auth_user_id = auth.uid());

create policy "admins manage subscriptions" on service_subscriptions
  for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
create policy "cleaners read subscriptions" on service_subscriptions
  for select using (
    villa_id in (
      select v.id from villas v
      where v.community_id = any (select unnest(community_ids) from employees where auth_user_id = auth.uid())
    )
  );

create policy "admins manage bookings" on bookings
  for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
create policy "cleaners read own bookings" on bookings
  for select using (employee_id = current_employee_id(auth.uid()));
create policy "cleaners update own bookings" on bookings
  for update using (employee_id = current_employee_id(auth.uid()))
  with check (employee_id = current_employee_id(auth.uid()));

create policy "admins manage payments" on payments
  for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
create policy "cleaners read payments" on payments
  for select using (
    villa_id in (
      select v.id from villas v
      where v.community_id = any (select unnest(community_ids) from employees where auth_user_id = auth.uid())
    )
  );
