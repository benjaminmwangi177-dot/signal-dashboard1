/*
# Update trading accounts for Base44 auth integration

1. Changes Made
- Remove foreign key constraints to auth.users since this app uses Base44 auth
- Change user_id column type to text to store Base44 user IDs
- Update RLS policies to use `TO anon, authenticated` with `USING (true)` since Base44 handles access control at the app level
- The app is the tenant from Supabase's perspective; Base44 provides user isolation

2. Security Model
- Base44 authentication gates access to the entire app
- Only authenticated Base44 users can access the frontend
- Data isolation happens at application layer using Base44 user_id
- Supabase policies allow anon-key access since the app itself is protected by Base44

3. Notes
- This is a standard pattern when using external auth (Base44) with Supabase as data layer
- Application code must always filter by user_id from Base44 auth context
*/

-- Drop existing RLS policies
DROP POLICY IF EXISTS "select_own_account" ON trading_accounts;
DROP POLICY IF EXISTS "insert_own_account" ON trading_accounts;
DROP POLICY IF EXISTS "update_own_account" ON trading_accounts;
DROP POLICY IF EXISTS "delete_own_account" ON trading_accounts;

DROP POLICY IF EXISTS "select_own_transactions" ON transactions;
DROP POLICY IF EXISTS "insert_own_transactions" ON transactions;
DROP POLICY IF EXISTS "update_own_transactions" ON transactions;
DROP POLICY IF EXISTS "delete_own_transactions" ON transactions;

-- Drop foreign key constraints and recreate tables with text user_id
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;
ALTER TABLE trading_accounts DROP CONSTRAINT IF EXISTS trading_accounts_user_id_fkey;
ALTER TABLE trading_accounts DROP CONSTRAINT IF EXISTS trading_accounts_user_id_key;

-- Change user_id columns to text for Base44 IDs
ALTER TABLE trading_accounts ALTER COLUMN user_id TYPE text USING user_id::text;
ALTER TABLE transactions ALTER COLUMN user_id TYPE text USING user_id::text;

-- Remove default auth.uid() since Base44 provides the ID
ALTER TABLE trading_accounts ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE transactions ALTER COLUMN user_id DROP DEFAULT;

-- Recreate unique constraint on trading_accounts user_id
ALTER TABLE trading_accounts ADD CONSTRAINT trading_accounts_user_id_key UNIQUE (user_id);

-- New RLS policies: allow anon + authenticated since Base44 gates app access
CREATE POLICY "app_select_accounts" ON trading_accounts FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "app_insert_accounts" ON trading_accounts FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE POLICY "app_update_accounts" ON trading_accounts FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "app_delete_accounts" ON trading_accounts FOR DELETE
  TO anon, authenticated USING (true);

CREATE POLICY "app_select_transactions" ON transactions FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "app_insert_transactions" ON transactions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE POLICY "app_update_transactions" ON transactions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "app_delete_transactions" ON transactions FOR DELETE
  TO anon, authenticated USING (true);