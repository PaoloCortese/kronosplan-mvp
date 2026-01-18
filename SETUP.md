# KRONOSPLAN - Setup Supabase

## 1. Crea progetto Supabase

1. Vai su [supabase.com](https://supabase.com)
2. Crea nuovo progetto
3. Salva le credenziali:
   - `Project URL`
   - `anon public key`

## 2. Configura variabili ambiente

Crea il file `.env.local` nella root del progetto:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 3. Esegui schema database

1. Vai nel dashboard Supabase → SQL Editor
2. Copia il contenuto di `supabase/schema.sql`
3. Esegui lo script

Questo crea:
- Tabella `agencies`
- Tabella `users`
- Tabella `checkins`
- Tabella `posts`
- Row Level Security policies

## 4. Dati di test (opzionale)

Inserisci dati di test per vedere il calendario popolato:

```sql
-- Crea agenzia di test
INSERT INTO agencies (id, name, city)
VALUES ('00000000-0000-0000-0000-000000000001', 'Agenzia Test', 'Milano');

-- Crea post di test
INSERT INTO posts (agency_id, pillar, platform, copy, scheduled_date, status)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'dove_lo_facciamo', 'facebook',
   'Siamo aperti anche questo sabato mattina, dalle 9 alle 13.\n\nSe stai cercando casa in zona centro, passa a trovarci. Ti aspettiamo in Via Roma 45.',
   '2026-01-20', 'ready'),
  ('00000000-0000-0000-0000-000000000001', 'cosa_facciamo', 'instagram',
   'Nuovo appartamento disponibile in zona Sempione.\n\nTrilocale ristrutturato, secondo piano, balcone.\nChiamaci per maggiori informazioni.',
   '2026-01-22', 'ready'),
  ('00000000-0000-0000-0000-000000000001', 'chi_siamo', 'linkedin',
   'Da 15 anni al servizio delle famiglie del quartiere.\n\nOgni cliente è parte della nostra storia.',
   '2026-01-24', 'ready');
```

## 5. Avvia applicazione

```bash
npm run dev
```

Vai su http://localhost:3000

## Note

- I placeholder `agency_id` nelle pagine devono essere sostituiti con autenticazione reale
- Per ora l'app usa `'temp-agency-id'` come placeholder
- Le RLS policies sono attive ma non applicate senza autenticazione
