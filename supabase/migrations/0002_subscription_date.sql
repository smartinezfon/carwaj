-- Replace weekday-only scheduling with an explicit next clean date for subscriptions.
alter table service_subscriptions add column if not exists next_clean_date date;
