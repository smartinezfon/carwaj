-- New employees must set their own password on first login, instead of
-- continuing to use the admin-assigned temporary one indefinitely.
alter table employees add column if not exists must_change_password boolean not null default true;
