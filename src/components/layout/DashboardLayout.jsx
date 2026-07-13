import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  Activity,
  BarChart,
  BarChart3,
  Bell,
  BellRing,
  Blocks,
  BookOpen,
  BookOpenCheck,
  Bookmark,
  Brain,
  Briefcase,
  Calendar,
  CandlestickChart,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Coins,
  Crosshair,
  Database,
  Download,
  FlaskConical,
  Gauge,
  Gift,
  GitCompare,
  Globe,
  Heart,
  History,
  Layers,
  LayoutDashboard,
  ListOrdered,
  Menu,
  MessageSquare,
  Radar,
  Settings,
  Shield,
  Sigma,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
  Waves,
  Zap,
} from 'lucide-react';
import PriceTicker from '@/components/dashboard/PriceTicker';
import { ADMIN_EMAIL, FREE_ACCESS_LABEL } from '@/lib/constants';

const NAV_GROUPS = [
  {
    label: 'Core',
    items: [
      { path: '/', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/signals', label: 'Signal Log', icon: Zap },
      { path: '/signal-queue', label: 'Signal Queue', icon: ListOrdered },
    ],
  },
  {
    label: 'Trading',
    items: [
      { path: '/scanner', label: 'Market Scanner', icon: Radar },
      { path: '/strategies', label: 'Strategies', icon: Activity },
      { path: '/strategy-builder', label: 'Strategy Builder', icon: Blocks },
      { path: '/backtest', label: 'Backtest', icon: FlaskConical },
      { path: '/paper-trading', label: 'Paper Trading', icon: BookOpen },
      { path: '/account', label: 'Paper Wallet', icon: Wallet },
      { path: '/journal', label: 'Trade Journal', icon: ClipboardList },
      { path: '/portfolio', label: 'Portfolio', icon: Briefcase },
    ],
  },
  {
    label: 'Market intelligence',
    items: [
      { path: '/watchlists', label: 'Smart Watchlists', icon: Bookmark },
      { path: '/sessions', label: 'Session Intelligence', icon: Globe },
      { path: '/economic-calendar', label: 'Economic Calendar', icon: Calendar },
      { path: '/support-resistance', label: 'S&R / Liquidity', icon: Layers },
      { path: '/order-flow', label: 'Order Flow', icon: BarChart },
      { path: '/replay', label: 'Replay Mode', icon: History },
      { path: '/alert-builder', label: 'Alert Builder', icon: BellRing },
    ],
  },
  {
    label: 'Analysis',
    items: [
      { path: '/analytics', label: 'Performance Analytics', icon: BarChart3 },
      { path: '/accuracy', label: 'Strategy Accuracy', icon: Target },
      { path: '/probability', label: 'Probability', icon: Crosshair },
      { path: '/correlation', label: 'Correlation Heatmap', icon: LayoutDashboard },
      { path: '/currency-strength', label: 'Currency Strength', icon: Coins },
      { path: '/volatility', label: 'Volatility Intelligence', icon: Waves },
      { path: '/statistical', label: 'Statistical Engine', icon: Sigma },
      { path: '/risk-metrics', label: 'Risk Metrics', icon: Shield },
    ],
  },
  {
    label: 'AI & tools',
    items: [
      { path: '/ai-commentary', label: 'AI Commentary', icon: MessageSquare },
      { path: '/ai-research', label: 'AI Research', icon: Sparkles },
      { path: '/signal-intelligence', label: 'Signal Intelligence DB', icon: Database },
      { path: '/explainability', label: 'Explainability', icon: Brain },
      { path: '/microstructure', label: 'Microstructure', icon: Layers },
      { path: '/strategy-comparison', label: 'Strategy Lab', icon: GitCompare },
      { path: '/knowledge-base', label: 'Knowledge Base', icon: BookOpenCheck },
      { path: '/tradingview', label: 'TradingView Charts', icon: CandlestickChart },
      { path: '/data-export', label: 'Data Export', icon: Download },
    ],
  },
  {
    label: 'System',
    items: [
      { path: '/notifications', label: 'Notifications', icon: Bell },
      { path: '/data-quality', label: 'Data Quality', icon: Database },
      { path: '/performance', label: 'System Performance', icon: Gauge },
      { path: '/system-health', label: 'System Health', icon: Heart },
      { path: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

const INITIAL_OPEN_GROUPS = {
  Core: true,
  Trading: true,
  'Market intelligence': false,
  Analysis: false,
  'AI & tools': false,
  System: false,
};

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState(INITIAL_OPEN_GROUPS);
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const location = useLocation();

  useEffect(() => {
    const interval = window.setInterval(() => setCurrentTime(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const toggleGroup = (groupLabel) => {
    setOpenGroups((current) => ({
      ...current,
      [groupLabel]: !current[groupLabel],
    }));
  };

  const isActive = (path) => (
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed z-50 flex h-full flex-col border-r border-border bg-[hsl(220,18%,8%)]
          transition-all duration-300 ease-out lg:relative
          ${collapsed ? 'w-16' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex h-16 items-center border-b border-border px-4">
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-300 to-emerald-600 shadow-lg shadow-emerald-500/15">
              <TrendingUp className="h-4 w-4 text-black" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="truncate font-heading text-sm font-bold tracking-tight">
                  SIGNAL DECK
                </div>
                <div className="truncate text-[9px] uppercase tracking-[0.18em] text-emerald-400">
                  Free trading intelligence
                </div>
              </div>
            )}
          </Link>
        </div>

        <nav className="no-scrollbar flex-1 space-y-4 overflow-y-auto px-2 py-3">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="space-y-1">
              {!collapsed && (
                <button
                  type="button"
                  onClick={() => toggleGroup(group.label)}
                  className="flex w-full items-center justify-between px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 transition-colors hover:text-foreground"
                >
                  {group.label}
                  {openGroups[group.label] ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </button>
              )}

              {(openGroups[group.label] || collapsed) && (
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const active = isActive(item.path);

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        title={collapsed ? item.label : undefined}
                        onClick={() => setMobileOpen(false)}
                        className={`
                          flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all
                          ${active
                            ? 'bg-emerald-500/10 text-emerald-400 shadow-[inset_2px_0_0_hsl(142,70%,45%)]'
                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                          }
                        `}
                      >
                        <item.icon className={`h-4 w-4 shrink-0 ${active ? 'text-emerald-400' : ''}`} />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        {!collapsed && (
          <div className="m-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
            <div className="flex items-center gap-2 text-emerald-300">
              <Gift className="h-4 w-4" />
              <span className="text-xs font-semibold">Free forever</span>
            </div>
            <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
              Full access. No payments, trials, subscriptions, or usage limits.
            </p>
          </div>
        )}

        <button
          type="button"
          aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
          onClick={() => setCollapsed(!collapsed)}
          className="hidden h-10 items-center justify-center border-t border-border text-muted-foreground transition-colors hover:text-foreground lg:flex"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <PriceTicker />

        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-[hsl(220,18%,8%)] px-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-1.5 hover:bg-secondary lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-1.5">
              <div className="pulse-live h-2 w-2 rounded-full bg-emerald-400" />
              <span className="font-mono text-xs text-muted-foreground">LIVE</span>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-300 sm:flex">
            <Gift className="h-3.5 w-3.5" />
            {FREE_ACCESS_LABEL}
          </div>

          <div className="text-right">
            <div className="hidden font-mono text-xs text-muted-foreground sm:block">
              {currentTime.toLocaleTimeString('en-GB', { timeZone: 'UTC' })} UTC
            </div>
            <a
              href={`mailto:${ADMIN_EMAIL}`}
              className="text-[10px] text-muted-foreground transition-colors hover:text-emerald-400"
            >
              {ADMIN_EMAIL}
            </a>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
