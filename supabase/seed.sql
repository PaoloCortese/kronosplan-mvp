-- KRONOSPLAN - Dati di test
-- Esegui dopo aver creato lo schema

-- Agenzia di test
INSERT INTO agencies (id, name, city)
VALUES ('00000000-0000-0000-0000-000000000001', 'Agenzia Immobiliare Centro', 'Milano')
ON CONFLICT (id) DO NOTHING;

-- Post di test per la settimana corrente
INSERT INTO posts (agency_id, pillar, platform, copy, scheduled_date, status)
VALUES
  -- Lunedì
  ('00000000-0000-0000-0000-000000000001',
   'dove_lo_facciamo',
   'facebook',
   'Siamo aperti anche questo sabato mattina, dalle 9 alle 13.

Se stai cercando casa in zona centro, passa a trovarci. Ti aspettiamo in Via Roma 45.',
   '2026-01-20',
   'ready'),

  -- Mercoledì
  ('00000000-0000-0000-0000-000000000001',
   'cosa_facciamo',
   'instagram',
   'Nuovo appartamento disponibile in zona Sempione.

Trilocale ristrutturato, secondo piano, balcone.
Chiamaci per maggiori informazioni.',
   '2026-01-22',
   'ready'),

  -- Venerdì
  ('00000000-0000-0000-0000-000000000001',
   'chi_siamo',
   'linkedin',
   'Da 15 anni al servizio delle famiglie del quartiere.

Ogni cliente è parte della nostra storia. Vieni a conoscerci.',
   '2026-01-24',
   'ready')
ON CONFLICT DO NOTHING;
