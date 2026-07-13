import { useCallback, useEffect, useState } from 'react';
import { PAPER_ACCOUNT_STARTING_BALANCE } from '@/lib/constants';

const STORAGE_KEY = 'signal-deck-paper-account';
const ACCOUNT_EVENT = 'signal-deck-paper-account-updated';

function createInitialState() {
  const createdAt = new Date().toISOString();

  return {
    account: {
      id: 'local-paper-account',
      balance: PAPER_ACCOUNT_STARTING_BALANCE,
      initial_balance: PAPER_ACCOUNT_STARTING_BALANCE,
      updated_at: createdAt,
    },
    transactions: [
      {
        id: 'free-paper-balance',
        type: 'demo_credit',
        amount: PAPER_ACCOUNT_STARTING_BALANCE,
        balance_after: PAPER_ACCOUNT_STARTING_BALANCE,
        description: 'Free virtual paper-trading balance',
        created_at: createdAt,
      },
    ],
  };
}

function readState() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : createInitialState();
  } catch {
    return createInitialState();
  }
}

function saveState(state) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent(ACCOUNT_EVENT));
}

export function useTradingAccount() {
  const [state, setState] = useState(() => readState());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!window.localStorage.getItem(STORAGE_KEY)) {
      saveState(state);
    }

    const syncState = () => setState(readState());
    window.addEventListener(ACCOUNT_EVENT, syncState);
    window.addEventListener('storage', syncState);

    return () => {
      window.removeEventListener(ACCOUNT_EVENT, syncState);
      window.removeEventListener('storage', syncState);
    };
  }, []);

  const loadAccount = useCallback(async () => {
    setLoading(true);
    setError(null);
    const nextState = readState();
    setState(nextState);
    setLoading(false);
    return nextState.account;
  }, []);

  const updateBalance = useCallback(async (amount, type, description, metadata = {}) => {
    try {
      const currentState = readState();
      const newBalance = currentState.account.balance + amount;

      if (newBalance < 0) {
        throw new Error('Insufficient balance');
      }

      const nextState = {
        account: {
          ...currentState.account,
          balance: newBalance,
          updated_at: new Date().toISOString(),
        },
        transactions: [
          {
            id: crypto.randomUUID(),
          type,
          amount,
          balance_after: newBalance,
          description,
            metadata,
            created_at: new Date().toISOString(),
          },
          ...currentState.transactions,
        ],
      };

      saveState(nextState);
      setState(nextState);
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const getTransactions = useCallback(async (limit = 100) => {
    return readState().transactions.slice(0, limit);
  }, []);

  const resetAccount = useCallback(() => {
    const nextState = createInitialState();
    saveState(nextState);
    setState(nextState);
  }, []);

  return {
    account: state.account,
    transactions: state.transactions,
    loading,
    error,
    loadAccount,
    updateBalance,
    getTransactions,
    resetAccount,
    balance: state.account.balance,
    initialBalance: state.account.initial_balance,
  };
}
