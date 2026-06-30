-- Replace boolean active with a 3-state status column
alter table companies
  add column if not exists status text not null default 'pending'
  check (status in ('pending', 'active', 'suspended'));

-- Backfill from the old active boolean
update companies set status = 'active' where active = true;
update companies set status = 'suspended' where active = false;
