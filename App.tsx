import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  CheckCircle2,
  ChevronRight,
  Instagram,
  Twitter,
  Shield,
  ArrowLeft,
  Building2,
} from 'lucide-react';

import { CalculatorStepper } from './components/CalculatorStepper';
import { ResultsDashboard } from './components/ResultsDashboard';
import { PaymentModal } from './components/PaymentModal';
import { ReportFilters } from './components/ReportFilters';
import { calculateROI } from './services/calculatorService';
import { fetchMarketData } from './services/marketService';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import {
  AcquisitionModel,
  FurnishingStandard,
  PropertyType,
  UserInputs,
  CalculationResult
} from './types';
import { KENYA_REGIONS, OPERATING_CONSTANTS, STARTUP_COSTS } from './constants';

// Farming Imports
import { FarmingCalculatorPage } from './components/farming/FarmingCalculatorPage';
import { FarmingReportPage } from './components/farming/FarmingReportPage';
import { calculateFarmingROI } from './services/farmingCalculatorService';
import { CropType, FarmingUserInputs, FarmingCalculationResult } from './types';
import { Onboarding } from './components/onboarding/Onboarding';

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
      navigate('/bnb-calculator');
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
    <div className="bg-white min-h-screen pb-12 relative overflow-hidden">
      {/* Immersive Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-yellow/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-navy/5 rounded-full blur-[120px]" />
      </div>

      <ReportFilters
        inputs={inputs}
        onFilterChange={handleFilterChange}
        onBulkUpdate={handleBulkUpdate}
        disabled={!isPaid}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-500 mt-12">

        {/* Header */}
        <div className={`flex flex-col gap-4 ${!isPaid ? 'opacity-50 blur-[2px] select-none pointer-events-none' : ''}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-yellow/20 border border-brand-yellow/30 text-brand-navy text-[10px] font-black uppercase tracking-widest w-fit">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-navy opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-navy"></span>
            </span>
            Live Market Intelligence
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-brand-navy uppercase tracking-tight">Analysis Report</h2>
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



import AnalyticsDefault from './components/AnalyticsDefault';

// --- Main App Component ---
const App: React.FC = () => {
  const [isPaid, setIsPaid] = useState<boolean>(() => {
    return localStorage.getItem('roiCalculatorUnlocked') === 'true';
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Lifted State
  const [inputs, setInputs] = useState<UserInputs>(() => {
    const saved = localStorage.getItem('calculatorInputs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved inputs", e);
      }
    }
    return {
      regionId: 'nbo-westlands',
      propertyType: PropertyType.ONE_BEDROOM,
      acquisitionModel: AcquisitionModel.SUBLEASE,
      furnishingStandard: FurnishingStandard.MID_RANGE,
      downPaymentPercent: 20,
      interestRate: 14,
      loanTermYears: 15,
      monthsDeposit: 2,
    };
  });

  const [results, setResults] = useState<CalculationResult | null>(() => {
    const saved = localStorage.getItem('calculatorResults');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved results", e);
      }
    }
    return null;
  });

  // Farming State
  const [farmingInputs, setFarmingInputs] = useState<FarmingUserInputs>({
    cropType: CropType.MAIZE,
    acreage: 1,
    landOwnership: 'Own',
    leaseCost: 0,
    leaseCycle: 'Per Year',
  });

  const [farmingResults, setFarmingResults] = useState<FarmingCalculationResult | null>(null);

  const handleFarmingCalculate = () => {
     const res = calculateFarmingROI(farmingInputs);
     setFarmingResults(res);
     navigate('/farming-report');
  };

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('calculatorInputs', JSON.stringify(inputs));
  }, [inputs]);

  useEffect(() => {
    if (results) {
      localStorage.setItem('calculatorResults', JSON.stringify(results));
    }
  }, [results]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handlePaidSuccess = () => {
    setIsPaid(true);
    localStorage.setItem('roiCalculatorUnlocked', 'true');
    setShowPaymentModal(false);
  };

  const handleCompleteOnboarding = (goal?: string) => {
    // If the user selected a specific goal, drop them directly into it
    if (goal === 'airbnb') {
      navigate('/bnb-calculator');
    } else if (goal === 'farming') {
      navigate('/farming-calculator');
    } else {
      navigate('/bnb-calculator');
    }
  };

  const handleOpenPayment = () => {
    setShowPaymentModal(true);
  };

  const handleCalculate = async (forceProceed = false) => {
    // 2. Calculate using the defaults
    const res = calculateROI(inputs);
    setResults(res);

    // 4. Navigate to Report page
    navigate('/bnb-report');
  };

  const isImmersivePage = ['/bnb-calculator', '/bnb-report', '/farming-calculator', '/farming-report', '/onboarding'].some(path => 
    location.pathname.toLowerCase().includes(path)
  );

  return (
    <div className="min-h-screen bg-brand-white flex flex-col font-sans selection:bg-brand-yellow/30">
      <AnalyticsDefault />
      {/* Navbar - Hidden on calculator page for immersive experience */}
      {!isImmersivePage && (
        <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/bnb-calculator')}>
                <div className="bg-brand-navy p-2 rounded-lg text-brand-yellow">
                  <Building2 size={24} />
                </div>
                <span className="font-black text-xl tracking-tight text-brand-navy">Kenya<span className="text-brand-yellow">Hustle</span></span>
              </div>
              
              <div className="hidden md:flex items-center space-x-8">
                <button 
                  onClick={() => navigate('/bnb-calculator')}
                  className="text-slate-600 hover:text-brand-navy font-bold transition-colors"
                >
                  Calculators
                </button>
                <button className="text-slate-600 hover:text-brand-navy font-bold transition-colors">Pricing</button>
                <button className="text-brand-navy font-black text-sm px-5 py-2.5 rounded-xl border-2 border-brand-navy hover:bg-brand-navy hover:text-white transition-all">
                  LOG IN
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to="/onboarding" replace />} />
          <Route path="/onboarding" element={<Onboarding onComplete={handleCompleteOnboarding} />} />
          <Route path="/bnb-calculator" element={
            <div className="max-w-7xl mx-auto px-4 py-4">
              <CalculatorStepper 
                inputs={inputs} 
                setInputs={setInputs} 
                onCalculate={handleCalculate}
                isPaid={isPaid}
              />
            </div>
          } />
          <Route
            path="/bnb-report"
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
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />

          {/* Farming Routes */}
          <Route 
             path="/farming-calculator" 
             element={
               <FarmingCalculatorPage 
                  inputs={farmingInputs} 
                  setInputs={setFarmingInputs}
                  onCalculate={handleFarmingCalculate}
               />
             } 
          />
          <Route 
             path="/farming-report" 
             element={
               <FarmingReportPage
                  results={farmingResults}
                  inputs={farmingInputs}
                  onRecalculate={() => navigate('/farming-calculator')}
               />
             } 
          />
        </Routes>
      </main>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={() => {
          handlePaidSuccess();
        }}
      />

      {/* Footer - Hidden on calculator page */}
      {!isImmersivePage && (
        <footer className="bg-brand-navy text-white pt-20 pb-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Building2 className="text-brand-yellow" size={28} />
                  <span className="font-black text-2xl tracking-tight">Kenya<span className="text-brand-yellow">Hustle</span></span>
                </div>
                <p className="text-slate-400 font-medium">
                  Empowering the next generation of Kenyan titans with hard data and smart tools.
                </p>
              </div>
              <div>
                <h4 className="font-black text-lg mb-6">Tools</h4>
                <ul className="space-y-4 text-slate-400 font-bold">
                  <li className="hover:text-brand-yellow cursor-pointer transition-colors">Airbnb Calculator</li>
                  <li className="hover:text-brand-yellow cursor-pointer transition-colors">Farming ROI</li>
                  <li className="hover:text-brand-yellow cursor-pointer transition-colors">Retail Ledger</li>
                </ul>
              </div>
              <div>
                <h4 className="font-black text-lg mb-6">Hustle</h4>
                <ul className="space-y-4 text-slate-400 font-bold">
                  <li className="hover:text-brand-yellow cursor-pointer transition-colors">Success Stories</li>
                  <li className="hover:text-brand-yellow cursor-pointer transition-colors">Market Reports</li>
                  <li className="hover:text-brand-yellow cursor-pointer transition-colors">Premium Mentors</li>
                </ul>
              </div>
              <div>
                <h4 className="font-black text-lg mb-6">Legal</h4>
                <ul className="space-y-4 text-slate-400 font-bold">
                  <li className="hover:text-brand-yellow cursor-pointer transition-colors" onClick={() => navigate('/privacy')}>Privacy Policy</li>
                  <li className="hover:text-brand-yellow cursor-pointer transition-colors">Terms of Service</li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-slate-500 font-bold text-sm">
                © 2026 Kenya Hustle. Build different.
              </p>
              <div className="flex items-center gap-6">
                <Instagram size={20} className="text-slate-500 hover:text-white cursor-pointer" />
                <Twitter size={20} className="text-slate-500 hover:text-white cursor-pointer" />
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;
