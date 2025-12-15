import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  Instagram,
  Twitter
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
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <div className="pt-24 pb-16 lg:pt-32 lg:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
          Is that Airbnb <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
            Actually Profitable?
          </span>
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-500 mb-10">
          Stop guessing. Estimate setup costs, revenue, and cash flow for properties in Nairobi, Mombasa, and Kisumu in seconds.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate('/calculator')}
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full shadow-lg shadow-emerald-600/30 transition transform hover:-translate-y-1 text-lg flex items-center gap-2"
          >
            Start Calculator <ChevronRight />
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white py-24 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-12">
          <div className="text-left space-y-4">
            <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4">
              <CheckCircle2 />
            </div>
            <h3 className="text-xl font-bold">Real Market Data</h3>
            <p className="text-slate-500 leading-relaxed">
              We aggregate data from Property24, Jumia, and AirDNA to give you realistic nightly rates and furnishing costs.
            </p>
          </div>
          <div className="text-left space-y-4">
            <div className="h-12 w-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-4">
              <CheckCircle2 />
            </div>
            <h3 className="text-xl font-bold">Furnishing Estimates</h3>
            <p className="text-slate-500 leading-relaxed">
              Get a detailed Bill of Materials (BOM) cost for Studio, 1BR, or 2BR units based on Budget, Mid, or Premium finishes.
            </p>
          </div>
          <div className="text-left space-y-4">
            <div className="h-12 w-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 mb-4">
              <CheckCircle2 />
            </div>
            <h3 className="text-xl font-bold">Buy vs. Rent-to-Rent</h3>
            <p className="text-slate-500 leading-relaxed">
              Compare the ROI of buying a unit on mortgage versus the "Arbitrage" model of subleasing.
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
  }, []);

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
        onClose={() => setShowPayment(false)}
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