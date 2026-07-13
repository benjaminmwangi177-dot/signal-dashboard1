import React, { useMemo } from 'react';
import {
  Gift,
  History,
  RefreshCcw,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useToast } from '@/components/ui/use-toast';
import { useTradingAccount } from '@/lib/useTradingAccount';

export default function AccountBalance() {
  const { toast } = useToast();
  const { account, transactions, loading, resetAccount } = useTradingAccount();

  const equityCurveData = useMemo(() => {
    const points = [...transactions]
      .reverse()
      .map((transaction) => ({
        date: new Date(transaction.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        balance: transaction.balance_after,
      }));

    return points.length > 0
      ? points
      : [{ date: 'Today', balance: account.initial_balance }];
  }, [account.initial_balance, transactions]);

  const totalPnl = account.balance - account.initial_balance;
  const pnlPercent = (totalPnl / account.initial_balance) * 100;
  const tradeTransactions = transactions.filter((transaction) => transaction.type === 'trade_pnl');
  const winningTrades = tradeTransactions.filter((transaction) => transaction.amount > 0).length;

  const handleReset = () => {
    resetAccount();
    toast({
      title: 'Paper wallet reset',
      description: 'Your free virtual balance is ready for a fresh simulation.',
    });
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-400/30 border-t-emerald-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-card to-card p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-emerald-400">
              <Wallet className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-[0.2em]">Paper wallet</span>
            </div>
            <h1 className="font-heading text-2xl font-bold">Practice with virtual funds</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              This wallet is for simulation only. There are no deposits, payment methods,
              subscriptions, or real-money withdrawals.
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary/80"
          >
            <RefreshCcw className="h-4 w-4" />
            Reset demo balance
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <StatusPill icon={Gift} label="Free virtual funds" />
          <StatusPill icon={ShieldCheck} label="No payment details" />
          <StatusPill icon={History} label="Stored on this device" />
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <BalanceCard
          label="Virtual balance"
          value={`$${account.balance.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          color="text-emerald-400"
        />
        <BalanceCard
          label="Total paper P&L"
          value={`${totalPnl >= 0 ? '+' : ''}$${totalPnl.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          subValue={`${pnlPercent >= 0 ? '+' : ''}${pnlPercent.toFixed(2)}%`}
          color={totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}
        />
        <BalanceCard
          label="Simulated trades"
          value={tradeTransactions.length}
          color="text-blue-400"
        />
        <BalanceCard
          label="Winning trades"
          value={winningTrades}
          color="text-amber-400"
        />
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Paper equity curve
        </h2>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={equityCurveData}>
            <defs>
              <linearGradient id="paperEquityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 16%)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: 'hsl(215, 15%, 50%)' }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'hsl(215, 15%, 50%)' }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
              domain={['dataMin - 100', 'dataMax + 100']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(220, 18%, 12%)',
                border: '1px solid hsl(220, 16%, 18%)',
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value) => [`$${value.toLocaleString()}`, 'Balance']}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#paperEquityGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Simulation history
          </h2>
        </div>
        <div className="max-h-[400px] divide-y divide-border/50 overflow-y-auto">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between gap-4 px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`rounded-lg p-2 ${
                    transaction.amount >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'
                  }`}
                >
                  {transaction.amount >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">
                    {transaction.description}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {new Date(transaction.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div
                  className={`font-mono text-sm font-medium ${
                    transaction.amount >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {transaction.amount >= 0 ? '+' : '-'}$
                  {Math.abs(transaction.amount).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div className="font-mono text-[10px] text-muted-foreground">
                  ${transaction.balance_after.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ icon: Icon, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-300">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

function BalanceCard({ label, value, subValue = null, color }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 font-mono text-lg font-bold ${color}`}>{value}</div>
      {subValue && <div className="mt-1 text-xs text-muted-foreground">{subValue}</div>}
    </div>
  );
}
