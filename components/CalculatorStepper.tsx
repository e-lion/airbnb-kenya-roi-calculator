import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AcquisitionModel,
  FurnishingStandard,
  PropertyType,
  PaymentMethod,
  UserInputs
} from '../types';
import {
  BASE_FURNISHING_COSTS,
  FURNISHING_COST_MULTIPLIERS,
  KENYA_REGIONS
} from '../constants';
import {
  MapPin,
  Home,
  Armchair,
  Wallet,
  Settings2,
  TrendingUp,
  ArrowLeft,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { AssumptionsForm } from './forms/AssumptionsForm';
import { trackEvent } from '../services/analyticsService';

interface CalculatorStepperProps {
  inputs: UserInputs;
  setInputs: React.Dispatch<React.SetStateAction<UserInputs>>;
  onCalculate: () => void;
  isPaid: boolean;
}

const STEPS = [
  { id: 'region', title: 'Select Region', icon: MapPin, mascot: "First, where are we setting up shop? Location is 90% of the game.", prompt: "Where is the property?" },
  { id: 'property', title: 'Unit Type', icon: Home, mascot: "What's the unit size? This changes our furnishing budget and nightly rates.", prompt: "What type of unit?" },
  { id: 'strategy', title: 'Strategy', icon: Wallet, mascot: "Are we buying the property or renting it (arbitrage)? This changes everything!", prompt: "Investment Strategy?" },
  { id: 'monthlyRent', title: 'Monthly Rent', icon: Wallet, mascot: "In rent-to-rent, your monthly lease is your biggest fixed cost. Keep it low!", prompt: "Monthly Rent (KES)?" },
  { id: 'propertyPrice', title: 'Price', icon: Wallet, mascot: "Buying is a long-term play. What's the damage for this unit?", prompt: "Property Price (KES)?" },
  { id: 'paymentMethod', title: 'Payment', icon: Wallet, mascot: "Cash is king, but mortgages let you scale with other people's money.", prompt: "Payment Method?" },
  { id: 'interestRate', title: 'Interest', icon: TrendingUp, mascot: "Interest rates in Kenya can be steep. Negotiate with your bank!", prompt: "Mortgage Interest Rate (%)?" },
  { id: 'finish', title: 'Interiors', icon: Armchair, mascot: "Premium finishings mean premium rates. Don't cheap out on the aesthetic!", prompt: "Furnishing Intensity?" },
  { id: 'occupancy', title: 'Occupancy', icon: TrendingUp, mascot: "Be realistic. 70% is the gold standard in premium areas.", prompt: "Expected Occupancy?" },
  { id: 'rate', title: 'Daily Rate', icon: Wallet, mascot: "Don't sell yourself short. Check your competition in the area.", prompt: "Nightly Rate (KES)?" },
  { id: 'cleaning', title: 'Cleaning', icon: CheckCircle2, mascot: "A clean unit is a 5-star unit. Happy guests, happy life.", prompt: "Cleaning Fee per stay?" },
  { id: 'wifi', title: 'Internet', icon: Settings2, mascot: "Fast internet is a utility, not a luxury. Don't compromise here.", prompt: "Monthly WiFi Cost?" },
  { id: 'power', title: 'Electric', icon: Settings2, mascot: "Tokens run out fast with AC and water heaters. Budget well.", prompt: "Monthly Electricity?" },
  { id: 'water', title: 'Water', icon: Settings2, mascot: "Water bills are usually steady, but keep a buffer for leakages.", prompt: "Monthly Water Bill?" },
  { id: 'entertainment', title: 'TV/Media', icon: Settings2, mascot: "Netflix and high-quality entertainment keep guests coming back.", prompt: "Streaming Services?" },
];

export const CalculatorStepper: React.FC<CalculatorStepperProps> = ({ inputs, setInputs, onCalculate, isPaid }) => {
  const [currentStep, setCurrentStep] = useState(0);

  React.useEffect(() => {
    trackEvent('calculator_step_viewed', { 
      stepIndex: currentStep, 
      stepId: STEPS[currentStep].id 
    });
  }, [currentStep]);

  const handleChange = <K extends keyof UserInputs>(key: K, value: UserInputs[K]) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const nextStep = () => {
    setCurrentStep(curr => {
      // Strategy (2) -> Sublease (3: Monthly Rent) OR Buy (4: Property Price)
      if (curr === 2) {
        return inputs.acquisitionModel === AcquisitionModel.BUY ? 4 : 3;
      }
      // Monthly Rent (3) -> Interiors (7)
      if (curr === 3) return 7;
      // Property Price (4) -> Payment Method (5)
      if (curr === 4) return 5;
      // Payment Method (5) -> Cash (7: Interiors) OR Mortgage (6: Interest)
      if (curr === 5) {
        return inputs.paymentMethod === PaymentMethod.CASH ? 7 : 6;
      }
      // Mortgage Interest (6) -> Interiors (7)
      if (curr === 6) return 7;

      if (curr < STEPS.length - 1) {
        return curr + 1;
      }
      
      // We are at the last step
      trackEvent('calculator_completed', { 
        strategy: inputs.acquisitionModel,
        propertyType: inputs.propertyType 
      });
      setTimeout(onCalculate, 0);
      return curr;
    });
  };

  const prevStep = () => {
    setCurrentStep(curr => {
      // Return to Strategy (2) from either Monthly Rent (3) or Property Price (4)
      if (curr === 3 || curr === 4) return 2;
      // Back from Payment Method (5) to Property Price (4)
      if (curr === 5) return 4;
      // Back from Mortgage Interest (6) to Payment Method (5)
      if (curr === 6) return 5;
      // Back from Interiors (7) to either Monthly Rent (3), Payment Method (5 - Cash), or Mortgage Interest (6)
      if (curr === 7) {
        if (inputs.acquisitionModel === AcquisitionModel.SUBLEASE) return 3;
        if (inputs.paymentMethod === PaymentMethod.CASH) return 5;
        return 6;
      }
      if (curr > 0) return curr - 1;
      return curr;
    });
  };

  const selectedRegion = KENYA_REGIONS.find(r => r.id === inputs.regionId) || KENYA_REGIONS[0];
  const marketOccupancy = selectedRegion.avgOccupancy * 100;
  const marketRate = selectedRegion.avgNightlyRate[inputs.propertyType];

  const handleSelection = <K extends keyof UserInputs>(key: K, value: UserInputs[K]) => {
    handleChange(key, value);
    // Auto-advance after selection with a small delay for visual feedback
    setTimeout(() => {
      nextStep();
    }, 300);
  };

  const renderStepHeader = (index: number) => (
    <div className="flex items-center space-x-4 mb-8">
      <div className="w-16 h-16 shrink-0">
        <img src="/business_daddy.png" alt="Mascot" className="w-full h-full object-contain" />
      </div>
      <div className="bg-slate-50 p-4 rounded-2xl rounded-bl-none border border-slate-100 flex-1">
        <p className="text-sm font-bold text-brand-navy leading-relaxed">
          "{STEPS[index].mascot}"
        </p>
      </div>
    </div>
  );

  const renderContinueButton = (label = "CONTINUE") => (
    <button
      onClick={nextStep}
      className={`w-full py-5 bg-brand-navy text-brand-white text-xl font-black rounded-2xl shadow-[0_6px_0_0_#00152B] hover:translate-y-[2px] hover:shadow-[0_4px_0_0_#00152B] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-3 mt-8`}
    >
      <span>{label}</span>
      <ArrowRight size={24} />
    </button>
  );

  const renderRegionStep = () => (
    <div className="flex flex-col h-full">
      {renderStepHeader(0)}
      <h2 className="text-2xl font-black text-brand-navy mb-6">{STEPS[0].prompt}</h2>
      <div className="grid gap-4 flex-1">
        {KENYA_REGIONS.map((region) => (
          <motion.button
            key={region.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => handleSelection('regionId', region.id)}
            className={`flex items-center p-6 rounded-3xl border-4 transition-all ${
              inputs.regionId === region.id
                ? 'border-brand-yellow bg-white shadow-lg'
                : 'border-slate-100 bg-white hover:border-slate-200'
            }`}
          >
            <div className="bg-brand-navy/5 p-4 rounded-2xl mr-6">
              <MapPin size={24} className="text-brand-navy" />
            </div>
            <div className="text-left flex-1">
              <h4 className="font-black text-brand-navy">{region.name}</h4>
              <p className="text-sm text-slate-500 font-bold">{region.county}</p>
            </div>
            {inputs.regionId === region.id && <CheckCircle2 className="text-brand-yellow" size={24} />}
          </motion.button>
        ))}
      </div>
    </div>
  );

  const renderPropertyTypeStep = () => (
    <div className="flex flex-col h-full">
      {renderStepHeader(1)}
      <h2 className="text-2xl font-black text-brand-navy mb-6">{STEPS[1].prompt}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.values(PropertyType).map((type) => (
          <motion.button
            key={type}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelection('propertyType', type)}
            className={`flex flex-col items-center p-4 rounded-3xl border-4 transition-all text-center ${
              inputs.propertyType === type
                ? 'border-brand-yellow bg-white shadow-lg'
                : 'border-slate-100 bg-white hover:border-slate-200'
            }`}
          >
            <div className={`p-3 rounded-2xl mb-3 transition-colors ${inputs.propertyType === type ? 'bg-brand-yellow/10' : 'bg-brand-navy/5'}`}>
              <Home size={24} className={inputs.propertyType === type ? 'text-brand-navy' : 'text-brand-navy/60'} />
            </div>
            <span className="font-black text-brand-navy text-base leading-tight">{type}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
  const renderStrategyStep = () => (
    <div className="flex flex-col h-full">
      {renderStepHeader(2)}
      <h2 className="text-2xl font-black text-brand-navy mb-6">{STEPS[2].prompt}</h2>
      <div className="space-y-4">
        {[
          { id: AcquisitionModel.SUBLEASE, label: 'Rent-to-Rent (Arbitrage)', sub: 'Pay monthly rent, furnish, and list.', icon: TrendingUp },
          { id: AcquisitionModel.BUY, label: 'Buy Unit (Mortgage/Cash)', sub: 'Own the property for long-term gains.', icon: Wallet }
        ].map((strat) => (
          <motion.button
            key={strat.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => handleSelection('acquisitionModel', strat.id as AcquisitionModel)}
            className={`w-full flex items-center p-6 rounded-3xl border-4 transition-all text-left ${
              inputs.acquisitionModel === strat.id
                ? 'border-brand-yellow bg-white shadow-lg'
                : 'border-slate-100 bg-white hover:border-slate-200'
            }`}
          >
            <div className="bg-brand-navy/5 p-4 rounded-2xl mr-6">
              <strat.icon size={28} className="text-brand-navy" />
            </div>
            <div className="flex-1">
              <h4 className="font-black text-brand-navy">{strat.label}</h4>
              <p className="text-sm text-slate-500 font-bold">{strat.sub}</p>
            </div>
            {inputs.acquisitionModel === strat.id && <CheckCircle2 className="text-brand-yellow" size={24} />}
          </motion.button>
        ))}
      </div>
    </div>
  );

  const renderPaymentMethodStep = () => (
    <div className="flex flex-col h-full">
      {renderStepHeader(5)}
      <h2 className="text-2xl font-black text-brand-navy mb-6">{STEPS[5].prompt}</h2>
      <div className="space-y-4">
        {[
          { id: PaymentMethod.CASH, label: 'Full Cash', sub: 'No monthly repayment, high upfront.', icon: Wallet },
          { id: PaymentMethod.MORTGAGE, label: 'Bank Mortgage', sub: 'Pay over time, leverage credit.', icon: TrendingUp }
        ].map((method) => (
          <motion.button
            key={method.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => handleSelection('paymentMethod', method.id as PaymentMethod)}
            className={`w-full flex items-center p-6 rounded-3xl border-4 transition-all text-left ${
              inputs.paymentMethod === method.id
                ? 'border-brand-yellow bg-white shadow-lg'
                : 'border-slate-100 bg-white hover:border-slate-200'
            }`}
          >
            <div className="bg-brand-navy/5 p-4 rounded-2xl mr-6">
              <method.icon size={28} className="text-brand-navy" />
            </div>
            <div className="flex-1">
              <h4 className="font-black text-brand-navy">{method.label}</h4>
              <p className="text-sm text-slate-500 font-bold">{method.sub}</p>
            </div>
            {inputs.paymentMethod === method.id && <CheckCircle2 className="text-brand-yellow" size={24} />}
          </motion.button>
        ))}
      </div>
    </div>
  );

  const renderFurnishingStep = () => {
    const getEstimate = (standard: FurnishingStandard) => {
      const base = BASE_FURNISHING_COSTS[inputs.propertyType];
      const multiplier = FURNISHING_COST_MULTIPLIERS[standard];
      return (base * multiplier).toLocaleString();
    };

    return (
      <div className="flex flex-col h-full">
        {renderStepHeader(7)}
        <h2 className="text-2xl font-black text-brand-navy mb-6">{STEPS[7].prompt}</h2>
        <div className="space-y-4">
          {Object.values(FurnishingStandard).map((standard) => (
            <motion.button
              key={standard}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleSelection('furnishingStandard', standard)}
              className={`w-full flex items-center p-6 rounded-3xl border-4 transition-all text-left ${
                inputs.furnishingStandard === standard
                  ? 'border-brand-yellow bg-white shadow-lg'
                  : 'border-slate-100 bg-white hover:border-slate-200'
              }`}
            >
              <div className="bg-brand-navy/5 p-4 rounded-2xl mr-6">
                <Armchair size={24} className="text-brand-navy" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-black text-brand-navy">{standard}</h4>
                  <span className="text-xs font-black px-3 py-1 bg-brand-yellow text-brand-navy rounded-lg uppercase tracking-wider">
                    ~KES {getEstimate(standard)}
                  </span>
                </div>
                <p className="text-sm text-slate-500 font-bold">Standard setup for this unit type.</p>
              </div>
              {inputs.furnishingStandard === standard && <CheckCircle2 className="text-brand-yellow ml-4" size={24} />}
            </motion.button>
          ))}
        </div>
      </div>
    );
  };

  const renderSliderInput = (
    stepIndex: number,
    value: number,
    min: number,
    max: number,
    step: number,
    onChange: (val: number) => void,
    displayValue: string,
    labelLow: string,
    labelHigh: string
  ) => (
    <div className="flex flex-col h-full">
      {renderStepHeader(stepIndex)}
      <h2 className="text-2xl font-black text-brand-navy mb-8">{STEPS[stepIndex].prompt}</h2>
      
      <div className="flex-1 flex flex-col justify-center">
        <div className="bg-white rounded-3xl border-4 border-slate-100 p-8 space-y-8 shadow-sm">
          <div className="text-center">
            <span className="text-5xl font-black text-brand-navy">{displayValue}</span>
          </div>
          
          <div className="space-y-4">
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={(e) => onChange(Number(e.target.value))}
              className="w-full h-4 bg-slate-100 rounded-full appearance-none cursor-pointer accent-brand-navy"
            />
            <div className="flex justify-between text-xs font-black text-slate-400 uppercase tracking-widest px-1">
              <span>{labelLow}</span>
              <span>{labelHigh}</span>
            </div>
          </div>
        </div>
      </div>
      
      {renderContinueButton()}
    </div>
  );

  return (
    <div className="flex flex-col min-h-[90vh] font-sans">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-3 bg-slate-100 z-50 overflow-hidden">
        <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            className="h-full bg-brand-yellow rounded-r-full shadow-[0_0_10px_rgba(255,215,0,0.5)]"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      </div>

      <div className="flex-1 p-6 flex flex-col max-w-2xl mx-auto w-full pt-4">
        <nav className="flex items-center justify-between mb-8">
          <button 
            onClick={prevStep}
            className={`p-2 rounded-xl transition-all ${currentStep > 0 ? 'text-slate-400 hover:text-brand-navy hover:bg-slate-50' : 'opacity-0 pointer-events-none'}`}
          >
            <ArrowLeft size={24} />
          </button>
          <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
            {STEPS[currentStep].title} • {currentStep + 1} / {STEPS.length}
          </div>
          <div className="w-10"></div>
        </nav>

        <div className="flex-1 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="h-full"
            >
              {currentStep === 0 && renderRegionStep()}
              {currentStep === 1 && renderPropertyTypeStep()}
              {currentStep === 2 && renderStrategyStep()}
              {currentStep === 3 && renderSliderInput(
                3,
                (inputs.customMonthlyRent || selectedRegion.avgRent[inputs.propertyType]),
                15000, 200000, 1000,
                (val) => handleChange('customMonthlyRent', val),
                `KES ${(inputs.customMonthlyRent || selectedRegion.avgRent[inputs.propertyType]).toLocaleString()}`,
                "Low", "High"
              )}
              {currentStep === 4 && renderSliderInput(
                4,
                (inputs.customPropertyPrice || selectedRegion.avgBuyPrice[inputs.propertyType]),
                1000000, 50000000, 100000,
                (val) => handleChange('customPropertyPrice', val),
                `KES ${(inputs.customPropertyPrice || selectedRegion.avgBuyPrice[inputs.propertyType]).toLocaleString()}`,
                "KES 1M", "KES 50M"
              )}
              {currentStep === 5 && renderPaymentMethodStep()}
              {currentStep === 6 && renderSliderInput(
                6,
                (inputs.interestRate || 14.5),
                8, 25, 0.1,
                (val) => handleChange('interestRate', val),
                `${(inputs.interestRate || 14.5)}%`,
                "Low", "High"
              )}
              {currentStep === 7 && renderFurnishingStep()}
              
              {currentStep === 8 && renderSliderInput(
                8,
                (inputs.customOccupancy !== undefined ? inputs.customOccupancy * 100 : marketOccupancy),
                30, 100, 5,
                (val) => handleChange('customOccupancy', val / 100),
                `${(inputs.customOccupancy !== undefined ? inputs.customOccupancy * 100 : marketOccupancy).toFixed(0)}%`,
                "Pessimistic", "Optimistic"
              )}
              
              {currentStep === 9 && renderSliderInput(
                9,
                (inputs.customNightlyRate || marketRate),
                2000, 30000, 500,
                (val) => handleChange('customNightlyRate', val),
                `KES ${(inputs.customNightlyRate || marketRate).toLocaleString()}`,
                "KES 2K", "KES 30K"
              )}
              
              {currentStep === 10 && renderSliderInput(
                10,
                (inputs.customCleaningCost !== undefined ? inputs.customCleaningCost : 500),
                200, 2000, 50,
                (val) => handleChange('customCleaningCost', val),
                `KES ${(inputs.customCleaningCost !== undefined ? inputs.customCleaningCost : 500).toLocaleString()}`,
                "Budget", "Hospitality"
              )}

              {currentStep === 11 && renderSliderInput(
                11,
                (inputs.customWifiCost !== undefined ? inputs.customWifiCost : 3000),
                2000, 8000, 500,
                (val) => handleChange('customWifiCost', val),
                `KES ${(inputs.customWifiCost !== undefined ? inputs.customWifiCost : 3000).toLocaleString()}`,
                "Basic", "Fiber Pro"
              )}

              {currentStep === 12 && renderSliderInput(
                12,
                (inputs.customElectricityCost !== undefined ? inputs.customElectricityCost : (inputs.propertyType === 'Studio' ? 2500 : 5000)),
                1000, 15000, 500,
                (val) => handleChange('customElectricityCost', val),
                `KES ${(inputs.customElectricityCost !== undefined ? inputs.customElectricityCost : (inputs.propertyType === 'Studio' ? 2500 : 5000)).toLocaleString()}`,
                "Eco", "Unlimited"
              )}

              {currentStep === 13 && renderSliderInput(
                13,
                (inputs.customWaterCost !== undefined ? inputs.customWaterCost : 1000),
                100, 5000, 100,
                (val) => handleChange('customWaterCost', val),
                `KES ${(inputs.customWaterCost !== undefined ? inputs.customWaterCost : 1000).toLocaleString()}`,
                "Minimum", "Family"
              )}

              {currentStep === 14 && renderSliderInput(
                14,
                (inputs.customNetflixCost !== undefined ? inputs.customNetflixCost : 0),
                0, 2000, 100,
                (val) => handleChange('customNetflixCost', val),
                `KES ${(inputs.customNetflixCost !== undefined ? inputs.customNetflixCost : 0).toLocaleString()}`,
                "None", "Premium"
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};