-- TASK 1: RLS Status Verification
-- Verify RLS is enabled on all tables

-- Check RLS status for all 4 tables
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('agencies', 'users', 'checkins', 'posts')
ORDER BY tablename;

-- List all existing policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('agencies', 'users', 'checkins', 'posts')
ORDER BY tablename, policyname;
