-- Employees can update their own name/whatsapp_number, but a trigger blocks
-- them from escalating their own role or community_ids (only admins can).

create policy "employees update own profile" on employees
  for update using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

create or replace function prevent_employee_self_escalation()
returns trigger
language plpgsql
security definer
as $$
begin
  if (new.role is distinct from old.role or new.community_ids is distinct from old.community_ids)
     and not is_admin(auth.uid()) then
    raise exception 'Only admins can change role or community assignments';
  end if;
  return new;
end;
$$;

create trigger employees_prevent_self_escalation
  before update on employees
  for each row
  execute function prevent_employee_self_escalation();
