import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';

export function useTradingAccount() {
  const { user } = useAuth();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id) {
      loadAccount();
    }
  }, [user?.id]);

  const loadAccount = useCallback(async () => {
    if (!user?.id) return null;

    try {
      setLoading(true);
      setError(null);

      let { data: accountData, error: fetchError } = await supabase
        .from('trading_accounts')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!accountData) {
        const { data: newAccount, error: createError } = await supabase
          .from('trading_accounts')
          .insert({ user_id: user.id, balance: 10000, initial_balance: 10000 })
          .select()
          .single();

        if (createError) throw createError;

        await supabase.from('transactions').insert({
          account_id: newAccount.id,
          user_id: user.id,
          type: 'deposit',
          amount: 10000,
          balance_after: 10000,
          description: 'Initial paper trading balance'
        });

        accountData = newAccount;
      }

      setAccount(accountData);
      return accountData;
    } catch (err) {
      console.error('Error loading account:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const updateBalance = useCallback(async (amount, type, description, metadata = {}) => {
    if (!account) return false;

    try {
      const newBalance = account.balance + amount;

      if (newBalance < 0) {
        throw new Error('Insufficient balance');
      }

      const { error: updateError } = await supabase
        .from('trading_accounts')
        .update({ balance: newBalance })
        .eq('id', account.id);

      if (updateError) throw updateError;

      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          account_id: account.id,
          user_id: user.id,
          type,
          amount,
          balance_after: newBalance,
          description,
          metadata
        });

      if (txError) throw txError;

      setAccount({ ...account, balance: newBalance });
      return true;
    } catch (err) {
      console.error('Error updating balance:', err);
      throw err;
    }
  }, [account, user?.id]);

  const getTransactions = useCallback(async (limit = 100) => {
    if (!account) return [];

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('account_id', account.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }

    return data || [];
  }, [account]);

  return {
    account,
    loading,
    error,
    loadAccount,
    updateBalance,
    getTransactions,
    balance: account?.balance || 0,
    initialBalance: account?.initial_balance || 10000
  };
}
