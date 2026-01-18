# KRONOSPLAN MVP

Conversational AI editorial coach for real estate agencies.

## Stack
- Next.js 15 (App Router)
- Supabase (PostgreSQL + Auth + RLS)
- Tailwind CSS v3
- TypeScript

## Setup
1. Copy `.env.local.example` to `.env.local`
2. Add Supabase credentials
3. Apply `supabase/schema.sql` on Supabase
4. (Optional) Apply `supabase/seed.sql` for test data
5. `npm install && npm run dev`

## Deploy
See `DEPLOY_NOTES.md`
