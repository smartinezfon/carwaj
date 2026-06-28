# CarClean Manager

Multi-role car cleaning management webapp (Cleaner, Admin, Client via WhatsApp) for a residential community in Dubai.

## Stack
Next.js 14 (App Router, TypeScript) · Tailwind CSS · Supabase (Postgres + Auth + Storage) · Twilio WhatsApp.

## Setup

1. **Install dependencies** (requires Node.js 18+, not present in this environment):
   ```
   npm install
   ```

2. **Create a Supabase project**, then run the migration:
   ```
   supabase db push
   ```
   or paste `supabase/migrations/0001_init.sql` into the SQL editor.

3. **Create a storage bucket** named `booking-photos` (public read) in Supabase Storage.

4. **Create employee accounts**: sign users up via Supabase Auth, then insert a matching row in `employees` with the same `auth_user_id`, `role` (`cleaner` or `admin`), and `community_ids`.

5. **Copy `.env.example` to `.env.local`** and fill in Supabase + Twilio credentials.

6. **Run locally**:
   ```
   npm run dev
   ```

7. **Deploy to Vercel**: import the repo, set the same environment variables, deploy. `vercel.json` is already configured.

## Notes
- Clients never log in — they only receive WhatsApp messages via Twilio.
- "Day before" booking reminders and "payment due" reminders are sent by `POST /api/cron/reminders` (protected by `CRON_SECRET` bearer auth). Schedule it daily via Vercel Cron (add a `crons` entry in `vercel.json`) or an external scheduler.
- RLS policies restrict cleaners to bookings/villas within their assigned `community_ids`; admins have full access.
