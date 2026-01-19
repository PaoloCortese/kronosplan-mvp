-- RLS Runtime Verification Queries
-- Eseguire su Supabase SQL Editor con utente A autenticato

-- Query 1: Verificare isolamento posts (utente A non vede posts di agency B)
-- Sostituire <agency_id_A> con l'agency_id dell'utente autenticato
SELECT id, agency_id, copy
FROM posts
WHERE agency_id != '<agency_id_A>';
-- RISULTATO ATTESO: 0 righe (RLS blocca accesso cross-agency)

-- Query 2: Verificare isolamento checkins (utente A non vede checkins di agency B)
SELECT id, agency_id, response
FROM checkins
WHERE agency_id != '<agency_id_A>';
-- RISULTATO ATTESO: 0 righe (RLS blocca accesso cross-agency)

-- Query 3: Verificare binding user→agency (no duplicazioni)
-- Sostituire <user_id> con auth.uid() dell'utente
SELECT u.id, u.agency_id, a.name
FROM users u
JOIN agencies a ON u.agency_id = a.id
WHERE u.id = '<user_id>';
-- RISULTATO ATTESO: 1 riga (binding univoco)

-- Query 4: Contare users per agency (verificare no duplicazioni agency)
SELECT agency_id, COUNT(*) as user_count
FROM users
GROUP BY agency_id
HAVING COUNT(*) > 1;
-- RISULTATO ATTESO: righe multiple se più utenti nella stessa agency (OK)
-- RISULTATO ATTESO: 0 righe se ogni user ha agency separata (scenario attuale)
