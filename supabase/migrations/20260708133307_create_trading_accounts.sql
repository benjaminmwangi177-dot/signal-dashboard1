/*
# Create trading accounts and transactions tables

1. New Tables
- `trading_accounts`
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, references auth.users, defaults to auth.uid())
  - `balance` (decimal, not null, default 10000.00) - starting paper trading balance
  - `currency` (text, not null, default 'USD')
  - `initial_balance` (decimal, not null, default 10000.00) - for P&L calculations
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

- `transactions`
  - `id` (uuid, primary key)
  - `account_id` (uuid, not null, references trading_accounts)
  - `user_id` (uuid, not null, defaults to auth.uid()) - for direct RLS ownership
  - `type` (text, not null) - 'deposit', 'withdrawal', 'trade_open', 'trade_close', 'trade_pnl'
  - `amount` (decimal, not null) - positive for credits, negative for debits
  - `balance_after` (decimal, not null) - account balance after this transaction
  - `description` (text)
  - `trade_id` (uuid, nullable) - reference to paper trade if applicable
  - `metadata` (jsonb, default '{}') - additional data (symbol, direction, etc.)
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on both tables.
- Owner-scoped CRUD: each authenticated user can only access their own account and transactions.
- Policies use auth.uid() = user_id for ownership checks.

3. Notes
- One trading account per user (enforced by unique constraint on user_id).
- Balance starts at $10,000 for paper trading.
- All balance changes go through transactions table for audit trail.
- Equity curve can be derived from transaction history.
*/

-- Create trading_accounts table
CREATE TABLE IF NOT EXISTS trading_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  balance numeric(18, 2) NOT NULL DEFAULT 10000.00,
  currency text NOT NULL DEFAULT 'USD',
  initial_balance numeric(18, 2) NOT NULL DEFAULT 10000.00,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES trading_accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  amount numeric(18, 2) NOT NULL,
  balance_after numeric(18, 2) NOT NULL,
  description text,
  trade_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE trading_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trading_accounts
DROP POLICY IF EXISTS "select_own_account" ON trading_accounts;
CREATE POLICY "select_own_account" ON trading_accounts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_account" ON trading_accounts;
CREATE POLICY "insert_own_account" ON trading_accounts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_account" ON trading_accounts;
CREATE POLICY "update_own_account" ON trading_accounts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_account" ON trading_accounts;
CREATE POLICY "delete_own_account" ON trading_accounts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for transactions
DROP POLICY IF EXISTS "select_own_transactions" ON transactions;
CREATE POLICY "select_own_transactions" ON transactions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_transactions" ON transactions;
CREATE POLICY "insert_own_transactions" ON transactions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_transactions" ON transactions;
CREATE POLICY "update_own_transactions" ON transactions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_transactions" ON transactions;
CREATE POLICY "delete_own_transactions" ON transactions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trading_accounts_user_id ON trading_accounts(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for trading_accounts
DROP TRIGGER IF EXISTS update_trading_accounts_updated_at ON trading_accounts;
CREATE TRIGGER update_trading_accounts_updated_at
  BEFORE UPDATE ON trading_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();