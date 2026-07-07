import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';

import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Home from '@/pages/Home';
import MarketScanner from '@/pages/MarketScanner';
import InstrumentDetail from '@/pages/InstrumentDetail';
import Signals from '@/pages/Signals';
import Strategies from '@/pages/Strategies';
import Backtest from '@/pages/Backtest';
import PaperTrading from '@/pages/PaperTrading';
import Analytics from '@/pages/Analytics';
import Notifications from '@/pages/Notifications';
import SettingsPage from '@/pages/SettingsPage';
import CorrelationHeatMap from '@/pages/CorrelationHeatMap';
import SessionIntelligence from '@/pages/SessionIntelligence';
import CurrencyStrength from '@/pages/CurrencyStrength';
import SmartWatchlists from '@/pages/SmartWatchlists';
import EconomicCalendar from '@/pages/EconomicCalendar';
import ReplayMode from '@/pages/ReplayMode';
import TradeJournal from '@/pages/TradeJournal';
import AlertBuilder from '@/pages/AlertBuilder';
import StrategyBuilder from '@/pages/StrategyBuilder';
import ProbabilityDashboard from '@/pages/ProbabilityDashboard';
import SupportResistance from '@/pages/SupportResistance';
import SignalQueue from '@/pages/SignalQueue';
import AccuracyDashboard from '@/pages/AccuracyDashboard';
import PortfolioExposure from '@/pages/PortfolioExposure';
import DataQualityMonitor from '@/pages/DataQualityMonitor';
import PerformanceOptimizer from '@/pages/PerformanceOptimizer';
import SystemHealth from '@/pages/SystemHealth';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
          <span className="text-xs text-muted-foreground font-mono">LOADING</span>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/scanner" element={<MarketScanner />} />
          <Route path="/instrument/:symbol" element={<InstrumentDetail />} />
          <Route path="/signals" element={<Signals />} />
          <Route path="/strategies" element={<Strategies />} />
          <Route path="/backtest" element={<Backtest />} />
          <Route path="/paper-trading" element={<PaperTrading />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/correlation" element={<CorrelationHeatMap />} />
          <Route path="/sessions" element={<SessionIntelligence />} />
          <Route path="/currency-strength" element={<CurrencyStrength />} />
          <Route path="/watchlists" element={<SmartWatchlists />} />
          <Route path="/economic-calendar" element={<EconomicCalendar />} />
          <Route path="/replay" element={<ReplayMode />} />
          <Route path="/journal" element={<TradeJournal />} />
          <Route path="/alert-builder" element={<AlertBuilder />} />
          <Route path="/strategy-builder" element={<StrategyBuilder />} />
          <Route path="/probability" element={<ProbabilityDashboard />} />
          <Route path="/support-resistance" element={<SupportResistance />} />
          <Route path="/signal-queue" element={<SignalQueue />} />
          <Route path="/accuracy" element={<AccuracyDashboard />} />
          <Route path="/portfolio" element={<PortfolioExposure />} />
          <Route path="/data-quality" element={<DataQualityMonitor />} />
          <Route path="/performance" element={<PerformanceOptimizer />} />
          <Route path="/system-health" element={<SystemHealth />} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App