-- Add status to villas: active (default), paused, former
alter table villas
  add column if not exists status text not null default 'active'
  check (status in ('active', 'paused', 'former'));
