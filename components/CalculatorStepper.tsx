import React, { useState } from 'react';
import {
  AcquisitionModel,
  FurnishingStandard,
  PropertyType,
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
  Lock
} from 'lucide-react';

interface CalculatorStepperProps {
  inputs: UserInputs;
  setInputs: React.Dispatch<React.SetStateAction<UserInputs>>;
  onCalculate: () => void;
  isPaid: boolean;
}

const STEPS = [
  { id: 'region', title: 'Select Region', icon: MapPin },
  { id: 'property', title: 'Property Type', icon: Home },
  { id: 'strategy', title: 'Strategy', icon: Wallet },
  { id: 'finish', title: 'Interiors', icon: Armchair },
  { id: 'assumptions', title: 'Smart Data', icon: Settings2 },
];

export const CalculatorStepper: React.FC<CalculatorStepperProps> = ({ inputs, setInputs, onCalculate, isPaid }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleChange = <K extends keyof UserInputs>(key: K, value: UserInputs[K]) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(curr => curr + 1);
    } else {
      onCalculate();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(curr => curr - 1);
    }
  };

  const selectedRegion = KENYA_REGIONS.find(r => r.id === inputs.regionId) || KENYA_REGIONS[0];
  const marketOccupancy = selectedRegion.avgOccupancy * 100;
  const marketRate = selectedRegion.avgNightlyRate[inputs.propertyType];

  // Helper to auto-advance for single-choice selections
  const handleSelection = <K extends keyof UserInputs>(key: K, value: UserInputs[K]) => {
    handleChange(key, value);
    // Add small delay for visual feedback before auto-advancing
    setTimeout(() => {
      nextStep();
    }, 250);
  };

  // --- Step Renders ---

  const renderRegionStep = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
      <div className="text-center space-y-2 mb-8">
        <h3 className="text-2xl font-bold text-slate-900">Where is the property?</h3>
        <p className="text-slate-500">We currently support premium data for Westlands.</p>
      </div>

      <div className="grid gap-4">
        {KENYA_REGIONS.map((region) => (
          <button
            key={region.id}
            onClick={() => handleSelection('regionId', region.id)}
            className={`group relative p-6 rounded-2xl border-2 transition-all text-left flex items-center justify-between
              ${inputs.regionId === region.id
                ? 'border-emerald-500 bg-emerald-50/50 shadow-emerald-100 shadow-lg'
                : 'border-slate-200 hover:border-emerald-200 hover:bg-slate-50'}`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${inputs.regionId === region.id ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500'}`}>
                <MapPin size={24} />
              </div>
              <div>
                <h4 className={`font-bold text-lg ${inputs.regionId === region.id ? 'text-emerald-900' : 'text-slate-700'}`}>{region.name}</h4>
                <p className="text-sm text-slate-500">{region.county}</p>
              </div>
            </div>
            {inputs.regionId === region.id && (
              <CheckCircle2 className="text-emerald-500" size={24} />
            )}
          </button>
        ))}

        <div className="p-4 bg-slate-50 border border-slate-200 border-dashed rounded-xl text-center text-slate-400 text-sm">
          More regions (Kilimani, Mombasa, Diani) coming soon...
        </div>
      </div>
    </div>
  );

  const renderPropertyTypeStep = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
      <div className="text-center space-y-2 mb-8">
        <h3 className="text-2xl font-bold text-slate-900">What type of unit?</h3>
        <p className="text-slate-500">This determines furnishing costs and rental rates.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.values(PropertyType).map((type) => (
          <button
            key={type}
            onClick={() => handleSelection('propertyType', type)}
            className={`group p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-4 text-center
              ${inputs.propertyType === type
                ? 'border-emerald-500 bg-emerald-50/50 shadow-lg'
                : 'border-slate-200 hover:border-emerald-200 hover:bg-slate-50'}`}
          >
            <div className={`p-4 rounded-full ${inputs.propertyType === type ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500'}`}>
              <Home size={32} />
            </div>
            <span className={`font-bold text-lg ${inputs.propertyType === type ? 'text-emerald-900' : 'text-slate-700'}`}>
              {type}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStrategyStep = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
      <div className="text-center space-y-2 mb-8">
        <h3 className="text-2xl font-bold text-slate-900">Investment Strategy?</h3>
        <p className="text-slate-500">Are you buying the unit or subleasing (rent-to-rent)?</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <button
          onClick={() => handleSelection('acquisitionModel', AcquisitionModel.SUBLEASE)}
          className={`group p-6 rounded-2xl border-2 transition-all flex items-center justify-between text-left
            ${inputs.acquisitionModel === AcquisitionModel.SUBLEASE
              ? 'border-emerald-500 bg-emerald-50/50 shadow-lg'
              : 'border-slate-200 hover:border-emerald-200 hover:bg-slate-50'}`}
        >
          <div className="flex items-center gap-6">
            <div className={`p-4 rounded-full ${inputs.acquisitionModel === AcquisitionModel.SUBLEASE ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
              <TrendingUp size={28} />
            </div>
            <div>
              <h4 className="font-bold text-lg text-slate-900">Rent-to-Rent (Arbitrage)</h4>
              <p className="text-slate-500 text-sm mt-1">Pay monthly rent, furnish, and list on Airbnb.</p>
            </div>
          </div>
          {inputs.acquisitionModel === AcquisitionModel.SUBLEASE && <CheckCircle2 className="text-emerald-600" />}
        </button>

        <button
          onClick={() => handleSelection('acquisitionModel', AcquisitionModel.BUY)}
          className={`group p-6 rounded-2xl border-2 transition-all flex items-center justify-between text-left
            ${inputs.acquisitionModel === AcquisitionModel.BUY
              ? 'border-emerald-500 bg-emerald-50/50 shadow-lg'
              : 'border-slate-200 hover:border-emerald-200 hover:bg-slate-50'}`}
        >
          <div className="flex items-center gap-6">
            <div className={`p-4 rounded-full ${inputs.acquisitionModel === AcquisitionModel.BUY ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
              <Wallet size={28} />
            </div>
            <div>
              <h4 className="font-bold text-lg text-slate-900">Buy Unit (Mortgage/Cash)</h4>
              <p className="text-slate-500 text-sm mt-1">Purchase the property for long-term appreciation.</p>
            </div>
          </div>
          {inputs.acquisitionModel === AcquisitionModel.BUY && <CheckCircle2 className="text-emerald-600" />}
        </button>
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
      <div className="space-y-6 animate-in slide-in-from-right duration-500">
        <div className="text-center space-y-2 mb-8">
          <h3 className="text-2xl font-bold text-slate-900">Furnishing Quality</h3>
          <p className="text-slate-500">Better interiors allow for higher nightly rates, but require more capital upfront.</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Budget */}
          <button
            onClick={() => handleSelection('furnishingStandard', FurnishingStandard.BUDGET)}
            className={`group p-5 rounded-2xl border-2 transition-all flex items-center justify-between
              ${inputs.furnishingStandard === FurnishingStandard.BUDGET
                ? 'border-emerald-500 bg-emerald-50/50 shadow-lg'
                : 'border-slate-200 hover:border-emerald-200 hover:bg-slate-50'}`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${inputs.furnishingStandard === FurnishingStandard.BUDGET ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                <Armchair size={24} />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h4 className={`font-bold text-lg ${inputs.furnishingStandard === FurnishingStandard.BUDGET ? 'text-emerald-900' : 'text-slate-700'}`}>
                    Budget
                  </h4>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-600">
                    KES {getEstimate(FurnishingStandard.BUDGET)}
                  </span>
                </div>
                <p className="text-slate-500 text-sm mt-1">
                  Functional basics. Local furniture, simple decor. Good for students or long-term tenants.
                </p>
              </div>
            </div>
            {inputs.furnishingStandard === FurnishingStandard.BUDGET && <CheckCircle2 className="text-emerald-500" />}
          </button>

          {/* Mid-Range */}
          <button
            onClick={() => handleSelection('furnishingStandard', FurnishingStandard.MID_RANGE)}
            className={`group p-5 rounded-2xl border-2 transition-all flex items-center justify-between
              ${inputs.furnishingStandard === FurnishingStandard.MID_RANGE
                ? 'border-emerald-500 bg-emerald-50/50 shadow-lg'
                : 'border-slate-200 hover:border-emerald-200 hover:bg-slate-50'}`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${inputs.furnishingStandard === FurnishingStandard.MID_RANGE ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                <Armchair size={24} />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h4 className={`font-bold text-lg ${inputs.furnishingStandard === FurnishingStandard.MID_RANGE ? 'text-emerald-900' : 'text-slate-700'}`}>
                    Mid-Range
                  </h4>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                    KES {getEstimate(FurnishingStandard.MID_RANGE)}
                  </span>
                </div>
                <p className="text-slate-500 text-sm mt-1">
                  Modern aesthetic. Stylish furniture, good lighting, standard amenities. The Airbnb sweet spot.
                </p>
              </div>
            </div>
            {inputs.furnishingStandard === FurnishingStandard.MID_RANGE && <CheckCircle2 className="text-emerald-500" />}
          </button>

          {/* Premium */}
          <button
            onClick={() => handleSelection('furnishingStandard', FurnishingStandard.PREMIUM)}
            className={`group p-5 rounded-2xl border-2 transition-all flex items-center justify-between
              ${inputs.furnishingStandard === FurnishingStandard.PREMIUM
                ? 'border-emerald-500 bg-emerald-50/50 shadow-lg'
                : 'border-slate-200 hover:border-emerald-200 hover:bg-slate-50'}`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${inputs.furnishingStandard === FurnishingStandard.PREMIUM ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                <Armchair size={24} />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h4 className={`font-bold text-lg ${inputs.furnishingStandard === FurnishingStandard.PREMIUM ? 'text-emerald-900' : 'text-slate-700'}`}>
                    Premium
                  </h4>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                    KES {getEstimate(FurnishingStandard.PREMIUM)}
                  </span>
                </div>
                <p className="text-slate-500 text-sm mt-1">
                  High-end luxury. Imported fittings, designer furniture, 4K TV, premium bedding. Commands top dollar.
                </p>
              </div>
            </div>
            {inputs.furnishingStandard === FurnishingStandard.PREMIUM && <CheckCircle2 className="text-emerald-500" />}
          </button>
        </div>
      </div>
    );
  };

  const renderAssumptionsStep = () => (
    <div className="space-y-8 animate-in slide-in-from-right duration-500">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-slate-900">Smart Market Data</h3>
        <p className="text-slate-500">Review our AI-driven estimates based on real-time market data.</p>
      </div>

      <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden relative">
        {/* Pro Overlay */}
        {!isPaid && (
          <div className="absolute inset-0 z-20 backdrop-blur-[2px] bg-white/50 flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-white p-4 rounded-full shadow-lg mb-4">
              <Lock className="text-emerald-500" size={32} />
            </div>
            <h4 className="font-bold text-xl text-slate-900 mb-2">Pro Data Locked</h4>
            <p className="text-slate-600 text-sm max-w-xs mb-6">
              Unlock the full potential of your analysis by customizing granular costs, occupancy rates, and more.
            </p>
            <div className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wide border border-emerald-200">
              Smart Defaults Active
            </div>
          </div>
        )}

        <div className={`p-6 space-y-8 ${!isPaid ? 'opacity-40 pointer-events-none filter blur-[1px]' : ''}`}>
          {/* Occupancy Rate Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-sm font-bold text-slate-700">Projected Occupancy</label>
              <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded text-sm">
                {inputs.customOccupancy !== undefined ? (inputs.customOccupancy * 100).toFixed(0) : marketOccupancy.toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="30"
              max="100"
              step="5"
              value={inputs.customOccupancy !== undefined ? inputs.customOccupancy * 100 : marketOccupancy}
              onChange={(e) => handleChange('customOccupancy', Number(e.target.value) / 100)}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-xs text-slate-400 font-medium">
              <span>Low (30%)</span>
              <span>Avg ({marketOccupancy.toFixed(0)}%)</span>
              <span>High (100%)</span>
            </div>
          </div>

          {/* Nightly Rate */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-sm font-bold text-slate-700">Nightly Rate (KES)</label>
              <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded text-sm">
                KES {(inputs.customNightlyRate || marketRate).toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="2000"
              max="20000"
              step="500"
              value={inputs.customNightlyRate || marketRate}
              onChange={(e) => handleChange('customNightlyRate', Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          {/* Utilities Group */}
          <div className="pt-4 border-t border-slate-200">
            <label className="text-sm font-bold text-slate-700 mb-4 block">Granular Utilities</label>
            <div className="grid grid-cols-1 gap-6">
              {/* WiFi */}
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-medium text-slate-500">
                  <span>WiFi / Internet</span>
                  <span>KES {inputs.customWifiCost || 3000}</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="6000"
                  step="500"
                  value={inputs.customWifiCost !== undefined ? inputs.customWifiCost : 3000}
                  onChange={(e) => handleChange('customWifiCost', Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>
              {/* Electricity */}
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-medium text-slate-500">
                  <span>Electricity (Tokens)</span>
                  <span>KES {inputs.customElectricityCost || (inputs.propertyType === 'Studio' ? 2500 : 5000)}</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="10000"
                  step="500"
                  value={inputs.customElectricityCost !== undefined ? inputs.customElectricityCost : (inputs.propertyType === 'Studio' ? 2500 : 5000)}
                  onChange={(e) => handleChange('customElectricityCost', Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onCalculate}
        className="w-full py-4 mt-4 bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-lg rounded-2xl shadow-xl shadow-emerald-900/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
      >
        <span>Generate Return on Investment Report</span>
        <TrendingUp size={20} />
      </button>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden min-h-[600px] flex flex-col">
      {/* Stepper Header */}
      <div className="bg-slate-50 border-b border-slate-100 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          {currentStep > 0 ? (
            <button
              onClick={prevStep}
              className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
          ) : (
            <div className="w-9"></div>
          )}
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Step {currentStep + 1} of {STEPS.length}
          </div>
          <div className="w-9"></div>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 p-6 md:p-8 flex items-center justify-center overflow-y-auto">
        <div className="w-full max-w-lg mx-auto">
          {currentStep === 0 && renderRegionStep()}
          {currentStep === 1 && renderPropertyTypeStep()}
          {currentStep === 2 && renderStrategyStep()}
          {currentStep === 3 && renderFurnishingStep()}
          {currentStep === 4 && renderAssumptionsStep()}
        </div>
      </div>
    </div>
  );
};