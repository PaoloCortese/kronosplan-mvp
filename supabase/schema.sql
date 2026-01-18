-- KRONOSPLAN Database Schema
-- MINIMO NECESSARIO per MVP

-- Tabella agenzie
CREATE TABLE agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabella utenti
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  agency_id UUID REFERENCES agencies(id),
  email TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabella check-in settimanali
CREATE TABLE checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES agencies(id),
  week_start DATE NOT NULL,
  response TEXT,
  completed_at TIMESTAMP DEFAULT NOW()
);

-- Tabella post
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES agencies(id),
  pillar TEXT,
  platform TEXT,
  copy TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  status TEXT CHECK (status IN ('ready', 'copied', 'published')) DEFAULT 'ready',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their agency's data
CREATE POLICY "Users can view their agency"
  ON agencies FOR SELECT
  USING (id IN (
    SELECT agency_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can create their agency"
  ON agencies FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their agency's posts"
  ON posts FOR SELECT
  USING (agency_id IN (
    SELECT agency_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert their agency's posts"
  ON posts FOR INSERT
  WITH CHECK (agency_id IN (
    SELECT agency_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update their agency's posts"
  ON posts FOR UPDATE
  USING (agency_id IN (
    SELECT agency_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can view their agency's checkins"
  ON checkins FOR SELECT
  USING (agency_id IN (
    SELECT agency_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert their agency's checkins"
  ON checkins FOR INSERT
  WITH CHECK (agency_id IN (
    SELECT agency_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can view their own user record"
  ON users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can insert their own user record"
  ON users FOR INSERT
  WITH CHECK (id = auth.uid());
