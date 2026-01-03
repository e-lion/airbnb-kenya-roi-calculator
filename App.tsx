import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  Instagram,
  Twitter,
  BarChart3,
  Shield,
  ArrowLeft
} from 'lucide-react';

import { CalculatorStepper } from './components/CalculatorStepper';
import { ResultsDashboard } from './components/ResultsDashboard';
import { PaymentModal } from './components/PaymentModal';
import { ReportFilters } from './components/ReportFilters';
import { calculateROI } from './services/calculatorService';
import { fetchMarketData } from './services/marketService';
import {
  AcquisitionModel,
  FurnishingStandard,
  PropertyType,
  UserInputs,
  CalculationResult
} from './types';
import { KENYA_REGIONS } from './constants';

// --- Landing Page Component ---
const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-slate-900 text-white overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 pt-24 pb-16 lg:pt-32 lg:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/50 border border-emerald-500/30 text-emerald-400 text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Live Kenya Market Data 2024
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
          Master the Kenyan <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
            Airbnb Market
          </span>
        </h1>

        <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-300 mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 leading-relaxed">
          Stop guessing. Estimate setup costs, revenue, and cash flow for properties in Nairobi, Mombasa, and Kisumu in seconds.
        </p>

        <div className="flex justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <button
            onClick={() => navigate('/calculator')}
            className="group relative px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-full shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] transition-all hover:scale-105 flex items-center gap-3 text-lg"
          >
            Start Calculator
            <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 rounded-full ring-2 ring-white/20 group-hover:ring-white/40 transition-all animate-pulse" />
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="relative z-10 py-24 border-t border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="group p-8 rounded-3xl bg-slate-800/50 border border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all duration-300">
            <div className="h-14 w-14 bg-emerald-900/50 rounded-2xl flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform duration-300 border border-emerald-500/20">
              <BarChart3 size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Real Market Data</h3>
            <p className="text-slate-400 leading-relaxed">
              We aggregate real-time signals from trusted sources to give you realistic ownership costs, nightly rates, and trends.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group p-8 rounded-3xl bg-slate-800/50 border border-slate-700 hover:border-purple-500/50 hover:bg-slate-800/80 transition-all duration-300">
            <div className="h-14 w-14 bg-purple-900/50 rounded-2xl flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform duration-300 border border-purple-500/20">
              <Building2 size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Furnishing Costs</h3>
            <p className="text-slate-400 leading-relaxed">
              Get detailed furnishing estimates for Studio, 1BR, or 2BR units based on Budget, Mid, or Premium finish standards.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group p-8 rounded-3xl bg-slate-800/50 border border-slate-700 hover:border-orange-500/50 hover:bg-slate-800/80 transition-all duration-300">
            <div className="h-14 w-14 bg-orange-900/50 rounded-2xl flex items-center justify-center text-orange-400 mb-6 group-hover:scale-110 transition-transform duration-300 border border-orange-500/20">
              <Shield size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Buy vs. Rent</h3>
            <p className="text-slate-400 leading-relaxed">
              Compare the ROI of buying a unit on mortgage versus the "Rent-to-Rent" arbitrage model to find your best strategy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Calculator Page Component ---
interface CalculatorPageProps {
  isPaid: boolean;
  onPaidSuccess: () => void;
  onOpenPayment: () => void;
  inputs: UserInputs;
  setInputs: React.Dispatch<React.SetStateAction<UserInputs>>;
  setResults: React.Dispatch<React.SetStateAction<CalculationResult | null>>;
}

const CalculatorPage: React.FC<CalculatorPageProps> = ({
  isPaid,
  onPaidSuccess,
  onOpenPayment,
  inputs,
  setInputs,
  setResults
}) => {
  // Removed local showPayment state
  const [isCalculated, setIsCalculated] = useState(false);
  const calculatorRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const location = useLocation();

  useEffect(() => {
    // Only auto-scroll if we haven't just calculated (prevents jumping on back nav)
    if (!isCalculated) {
      calculatorRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Check if we were redirected with intent to open payment
  useEffect(() => {
    if (location.state && (location.state as any).openPayment && !isPaid) {
      onOpenPayment();
      // Clean up state
      window.history.replaceState({}, document.title);
    }
  }, [location.state, isPaid, onOpenPayment]);

  const handleCalculate = async (forceProceed = false) => {
    // Paywall Gate: Require payment before generating report
    if (!isPaid && !forceProceed) {
      onOpenPayment();
      return;
    }

    // 1. Fetch live market data first
    let calculationInputs = { ...inputs };

    try {
      const marketData = await fetchMarketData(inputs);
      if (marketData && marketData.averagePrice > 0) {
        // Override the default/static costs with live market data
        if (inputs.acquisitionModel === AcquisitionModel.BUY) {
          calculationInputs.customPropertyPrice = marketData.averagePrice;
        } else {
          calculationInputs.customMonthlyRent = marketData.averagePrice; // For rent, avgPrice returned is rent
        }
      }
    } catch (err) {
      console.warn("Could not sync with market data, using defaults");
    }

    // 2. Calculate using the live data (or defaults if fetch failed)
    const res = calculateROI(calculationInputs);
    setResults(res);

    // 3. Update inputs state to reflect what was used
    setInputs(calculationInputs);

    // 4. Navigate to Report page
    navigate('/report');
  };

  return (
    <div className="bg-slate-50 py-12" ref={calculatorRef}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <CalculatorStepper
          inputs={inputs}
          setInputs={setInputs}
          onCalculate={handleCalculate}
          isPaid={isPaid}
        />
      </div>

    </div>
  );
};

// --- Report Page Component ---
interface ReportPageProps {
  results: CalculationResult | null;
  inputs: UserInputs;
  setInputs: React.Dispatch<React.SetStateAction<UserInputs>>;
  setResults: React.Dispatch<React.SetStateAction<CalculationResult | null>>;
  isPaid: boolean;
  onUnlock: () => void;
  onPaidSuccess: () => void;
}

const ReportPage: React.FC<ReportPageProps> = ({ results, inputs, setInputs, setResults, isPaid, onUnlock, onPaidSuccess }) => {
  const navigate = useNavigate();

  // Redirect if no results (e.g. direct valid access)
  useEffect(() => {
    if (!results) {
      navigate('/calculator');
    }
  }, [results, navigate]);

  const handleFilterChange = (key: keyof UserInputs, value: any) => {
    const newInputs = { ...inputs, [key]: value };
    setInputs(newInputs);

    // Recalculate immediately with new inputs
    // Note: This uses default market data if not re-fetched.
    // For V1, we accept this. Ideally we'd re-fetch smart data here too.
    const newResults = calculateROI(newInputs);
    setResults(newResults);
  };

  const handleBulkUpdate = (newInputs: UserInputs) => {
    setInputs(newInputs);
    // Recalculate immediately
    const newResults = calculateROI(newInputs);
    setResults(newResults);
  };

  if (!results) return null;

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      <ReportFilters
        inputs={inputs}
        onFilterChange={handleFilterChange}
        onBulkUpdate={handleBulkUpdate}
        disabled={!isPaid}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-500 mt-8">

        {/* Header */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${!isPaid ? 'opacity-50 blur-[2px] select-none pointer-events-none' : ''}`}>
          <h2 className="text-3xl font-bold text-slate-900">Analysis Report</h2>


        </div>

        <ResultsDashboard
          results={results}
          inputs={inputs}
          isLocked={!isPaid}
          onUnlock={onUnlock}
          onPaidSuccess={onPaidSuccess}
        />
      </div>
    </div>
  );
};

// --- Main App Component ---
const App: React.FC = () => {
  const [isPaid, setIsPaid] = useState<boolean>(() => {
    return localStorage.getItem('roiCalculatorUnlocked') === 'true';
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Lifted State
  const [inputs, setInputs] = useState<UserInputs>({
    regionId: 'nbo-westlands',
    propertyType: PropertyType.ONE_BEDROOM,
    acquisitionModel: AcquisitionModel.SUBLEASE,
    furnishingStandard: FurnishingStandard.MID_RANGE,
    downPaymentPercent: 20,
    interestRate: 14,
    loanTermYears: 15,
    monthsDeposit: 2,
  });
  const [results, setResults] = useState<CalculationResult | null>(null);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handlePaidSuccess = () => {
    setIsPaid(true);
    localStorage.setItem('roiCalculatorUnlocked', 'true');
    setShowPaymentModal(false);
  };

  const handleOpenPayment = () => {
    setShowPaymentModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="bg-emerald-600 p-2 rounded-lg text-white">
                <Building2 size={24} />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">Airbnb<span className="text-emerald-600">Kenya</span>ROI</span>
            </div>
            <div className="flex gap-4">
              {!isPaid && (
                <button
                  onClick={() => navigate('/calculator')}
                  className="text-sm font-medium text-slate-600 hover:text-emerald-600"
                >
                  Calculator
                </button>
              )}
              {isPaid && (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wide">
                  Pro Unlocked
                </span>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/calculator"
            element={<CalculatorPage
              isPaid={isPaid}
              onPaidSuccess={handlePaidSuccess}
              onOpenPayment={handleOpenPayment}
              inputs={inputs}
              setInputs={setInputs}
              setResults={setResults}
            />}
          />
          <Route
            path="/report"
            element={<ReportPage
              results={results}
              inputs={inputs}
              setInputs={setInputs}
              setResults={setResults}
              isPaid={isPaid}
              onUnlock={handleOpenPayment}
              onPaidSuccess={handlePaidSuccess}
            />}
          />
        </Routes>
      </main>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={() => {
          handlePaidSuccess();
          // Logic to auto-proceed if we were trying to calculate?
          // For now, if on Calculator page, user can click "Generate" again.
          // Or we can assume if they paid, they want to see results. 
          // But since handleCalculate logic is inside CalculatorPage...
          // We can perhaps just close modal and let user click. 
          // OR: We can trigger a re-render/logic. 
          // Actually, passing `handlePaidSuccess` which closes modal is enough.
          // The previous logic had `handleCalculate(true)` in `onSuccess`.
          // To preserve that: `CalculatorPage` might need to listen to `isPaid` change?
          // Or we can rely on user clicking safely.
        }}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
          <p>© 2025 Airbnb Kenya ROI. Data is for estimation only.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="https://www.instagram.com/kenya_hustle/" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600"><Instagram size={20} /></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
