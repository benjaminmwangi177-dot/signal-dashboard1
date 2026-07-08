import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import { Wallet, TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownLeft, CreditCard, Plus, Minus } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useToast } from '@/components/ui/use-toast';

export default function AccountBalance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (user?.id) {
      loadAccount();
    }
  }, [user?.id]);

  async function loadAccount() {
    try {
      // Check if account exists
      let { data: accountData, error } = await supabase
        .from('trading_accounts')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Create account if doesn't exist
      if (!accountData) {
        const { data: newAccount, error: createError } = await supabase
          .from('trading_accounts')
          .insert({ user_id: user.id, balance: 10000, initial_balance: 10000 })
          .select()
          .single();

        if (createError) throw createError;

        // Create initial deposit transaction
        await supabase
          .from('transactions')
          .insert({
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

      // Load transactions
      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .eq('account_id', accountData.id)
        .order('created_at', { ascending: false })
        .limit(100);

      setTransactions(txData || []);
    } catch (err) {
      console.error('Error loading account:', err);
      toast({ title: 'Error loading account', variant: 'destructive' });
    }
    setLoading(false);
  }

  async function handleDeposit(e) {
    e.preventDefault();
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) return;

    try {
      const newBalance = account.balance + depositAmount;

      await supabase
        .from('trading_accounts')
        .update({ balance: newBalance })
        .eq('id', account.id);

      await supabase
        .from('transactions')
        .insert({
          account_id: account.id,
          user_id: user.id,
          type: 'deposit',
          amount: depositAmount,
          balance_after: newBalance,
          description: 'Deposit to paper trading account'
        });

      setAccount({ ...account, balance: newBalance });
      setShowDepositModal(false);
      setAmount('');
      loadAccount();
      toast({ title: `Deposited $${depositAmount.toLocaleString()}` });
    } catch (err) {
      toast({ title: 'Deposit failed', variant: 'destructive' });
    }
  }

  async function handleWithdraw(e) {
    e.preventDefault();
    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) return;
    if (withdrawAmount > account.balance) {
      toast({ title: 'Insufficient balance', variant: 'destructive' });
      return;
    }

    try {
      const newBalance = account.balance - withdrawAmount;

      await supabase
        .from('trading_accounts')
        .update({ balance: newBalance })
        .eq('id', account.id);

      await supabase
        .from('transactions')
        .insert({
          account_id: account.id,
          user_id: user.id,
          type: 'withdrawal',
          amount: -withdrawAmount,
          balance_after: newBalance,
          description: 'Withdrawal from paper trading account'
        });

      setAccount({ ...account, balance: newBalance });
      setShowWithdrawModal(false);
      setAmount('');
      loadAccount();
      toast({ title: `Withdrew $${withdrawAmount.toLocaleString()}` });
    } catch (err) {
      toast({ title: 'Withdrawal failed', variant: 'destructive' });
    }
  }

  const equityCurveData = useMemo(() => {
    if (transactions.length === 0) {
      return [{ date: 'Today', balance: account?.initial_balance || 10000 }];
    }

    const sorted = [...transactions].sort((a, b) =>
      new Date(a.created_at) - new Date(b.created_at)
    );

    return sorted.map((tx, idx) => ({
      date: new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      balance: tx.balance_after,
      type: tx.type
    }));
  }, [transactions, account]);

  const totalPnl = account ? account.balance - account.initial_balance : 0;
  const pnlPercent = account ? ((totalPnl / account.initial_balance) * 100).toFixed(2) : 0;

  const todayTransactions = transactions.filter(tx => {
    const txDate = new Date(tx.created_at);
    const today = new Date();
    return txDate.toDateString() === today.toDateString();
  });
  const todayPnl = todayTransactions.reduce((sum, tx) => sum + (tx.type === 'trade_pnl' ? tx.amount : 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-emerald-400" />
          <h1 className="font-heading font-bold text-xl">Account & Balance</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDepositModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-sm font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Deposit
          </button>
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-medium transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
            Withdraw
          </button>
        </div>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <BalanceCard
          icon={DollarSign}
          label="Current Balance"
          value={`$${(account?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          color="text-emerald-400"
        />
        <BalanceCard
          icon={totalPnl >= 0 ? TrendingUp : TrendingDown}
          label="Total P&L"
          value={`${totalPnl >= 0 ? '+' : ''}$${totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subValue={`${pnlPercent}%`}
          color={totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}
        />
        <BalanceCard
          icon={todayPnl >= 0 ? TrendingUp : TrendingDown}
          label="Today's P&L"
          value={`${todayPnl >= 0 ? '+' : ''}$${todayPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          color={todayPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}
        />
        <BalanceCard
          icon={CreditCard}
          label="Total Transactions"
          value={transactions.length}
          color="text-blue-400"
        />
      </div>

      {/* Equity curve */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Equity Curve</h3>
        {equityCurveData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={equityCurveData}>
              <defs>
                <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 16%)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(215, 15%, 50%)' }} />
              <YAxis
                tick={{ fontSize: 10, fill: 'hsl(215, 15%, 50%)' }}
                tickFormatter={(val) => `$${val.toLocaleString()}`}
                domain={['dataMin - 100', 'dataMax + 100']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(220, 18%, 12%)',
                  border: '1px solid hsl(220, 16%, 18%)',
                  borderRadius: 8,
                  fontSize: 12
                }}
                formatter={(val) => [`$${val.toLocaleString()}`, 'Balance']}
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#equityGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[250px] text-sm text-muted-foreground">
            No transaction history yet
          </div>
        )}
      </div>

      {/* Transaction history */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Transaction History</h3>
        </div>
        {transactions.length > 0 ? (
          <div className="divide-y divide-border/50 max-h-[400px] overflow-y-auto">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    tx.type === 'deposit' ? 'bg-emerald-500/10' :
                    tx.type === 'withdrawal' ? 'bg-red-500/10' :
                    tx.type === 'trade_pnl' ? (tx.amount >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10') :
                    'bg-blue-500/10'
                  }`}>
                    {tx.type === 'deposit' ? <ArrowDownLeft className="w-4 h-4 text-emerald-400" /> :
                     tx.type === 'withdrawal' ? <ArrowUpRight className="w-4 h-4 text-red-400" /> :
                     <TrendingUp className={`w-4 h-4 ${tx.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />}
                  </div>
                  <div>
                    <div className="text-sm font-medium capitalize">{tx.type.replace('_', ' ')}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {tx.description || new Date(tx.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-mono font-medium text-sm ${tx.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {tx.amount >= 0 ? '+' : ''}${Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    Balance: ${tx.balance_after.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
            No transactions yet
          </div>
        )}
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Deposit Funds</h3>
            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="text-[10px] text-muted-foreground uppercase block mb-1">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 text-sm bg-secondary rounded-lg border border-border font-mono"
                    placeholder="1000.00"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowDepositModal(false); setAmount(''); }}
                  className="flex-1 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-sm transition-colors"
                >
                  Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Withdraw Funds</h3>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="text-[10px] text-muted-foreground uppercase block mb-1">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={account?.balance}
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 text-sm bg-secondary rounded-lg border border-border font-mono"
                    placeholder="1000.00"
                  />
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">
                  Available: ${account?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowWithdrawModal(false); setAmount(''); }}
                  className="flex-1 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors"
                >
                  Withdraw
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function BalanceCard({ icon: Icon, label, value, subValue, color }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <div className={`font-mono font-bold text-xl ${color}`}>
        {value}
        {subValue && <span className="text-sm ml-1">({subValue})</span>}
      </div>
    </div>
  );
}
