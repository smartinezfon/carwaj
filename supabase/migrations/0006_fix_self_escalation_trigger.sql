-- The previous trigger blocked even service-role/SQL-editor updates, since
-- auth.uid() is null outside of an end-user session. Only block the change
-- when there IS an authenticated end-user making it and they aren't an admin.

create or replace function prevent_employee_self_escalation()
returns trigger
language plpgsql
security definer
as $$
begin
  if auth.uid() is not null
     and (new.role is distinct from old.role or new.community_ids is distinct from old.community_ids)
     and not is_admin(auth.uid()) then
    raise exception 'Only admins can change role or community assignments';
  end if;
  return new;
end;
$$;
