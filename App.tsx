import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  Instagram,
  Twitter,
  BarChart3,
  Shield
} from 'lucide-react';

import { CalculatorStepper } from './components/CalculatorStepper';
import { ResultsDashboard } from './components/ResultsDashboard';
import { PaymentModal } from './components/PaymentModal';
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
  onPaid: () => void;
}

const CalculatorPage: React.FC<CalculatorPageProps> = ({ isPaid, onPaid }) => {
  const [showPayment, setShowPayment] = useState(false);
  const calculatorRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const [inputs, setInputs] = useState<UserInputs>({
    regionId: 'nbo-westlands', // Fixed for Smart Calc
    propertyType: PropertyType.ONE_BEDROOM,
    acquisitionModel: AcquisitionModel.SUBLEASE,
    furnishingStandard: FurnishingStandard.MID_RANGE,
    downPaymentPercent: 20,
    interestRate: 14,
    loanTermYears: 15,
    monthsDeposit: 2,
  });

  const [results, setResults] = useState<CalculationResult | null>(null);

  useEffect(() => {
    // Auto scroll to calculator on mount
    calculatorRef.current?.scrollIntoView({ behavior: 'smooth' });

    // Strict Protection: If not paid, show modal immediately on mount
    if (!isPaid) {
      setShowPayment(true);
    }
  }, [isPaid]); // Add isPaid to dependency array to re-check if it changes

  const handleCalculate = async () => {
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

    // 3. Update inputs state to reflect what was used (so dashboard sees it)
    setInputs(calculationInputs);

    // Scroll to results
    setTimeout(() => {
      const resultsElement = document.getElementById('results-section');
      resultsElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Secondary check: ensure modal opens if they somehow clicked without paying
      if (!isPaid) {
        setShowPayment(true);
      }
    }, 100);
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

        {results && (
          <div id="results-section" className="animate-in fade-in slide-in-from-bottom-10 duration-700 scroll-mt-24">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-slate-900">Analysis Results</h2>
              {!isPaid && (
                <span className="text-sm text-slate-500 italic">Preview Mode</span>
              )}
            </div>
            <ResultsDashboard
              results={results}
              inputs={inputs}
              isLocked={!isPaid}
              onUnlock={() => setShowPayment(true)}
            />
          </div>
        )}
      </div>

      <PaymentModal
        isOpen={showPayment}
        onClose={() => {
          setShowPayment(false);
          // Protection: If they close the modal without paying, send them back to home
          if (!isPaid) {
            navigate('/');
          }
        }}
        onSuccess={() => {
          onPaid();
          setShowPayment(false);
        }}
      />
    </div>
  );
};

// --- Main App Component ---
const App: React.FC = () => {
  const [isPaid, setIsPaid] = useState(false);
  const navigate = useNavigate();

  // Check if user has already unlocked the calculator
  // Check if user has already unlocked the calculator
  // useEffect(() => {
  //   const unlocked = localStorage.getItem('roiCalculatorUnlocked');
  //   if (unlocked === 'true') {
  //     setIsPaid(true);
  //   }
  // }, []);

  const handlePaid = () => {
    setIsPaid(true);
    localStorage.setItem('roiCalculatorUnlocked', 'true');
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
          <Route path="/calculator" element={<CalculatorPage isPaid={isPaid} onPaid={handlePaid} />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
          <p>© 2025 Airbnb Kenya ROI. Data is for estimation only.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-emerald-600"><Twitter size={20} /></a>
            <a href="#" className="hover:text-emerald-600"><Instagram size={20} /></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;