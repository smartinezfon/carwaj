create policy "cleaners delete subscriptions" on service_subscriptions
  for delete using (
    villa_id in (
      select v.id from villas v
      where v.community_id = any (select unnest(community_ids) from employees where auth_user_id = auth.uid())
    )
  );
