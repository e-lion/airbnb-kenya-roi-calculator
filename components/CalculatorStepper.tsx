import React, { useState } from 'react';
import {
  AcquisitionModel,
  FurnishingStandard,
  PropertyType,
  UserInputs
} from '../types';
import { KENYA_REGIONS, OPERATING_COSTS } from '../constants';
import { MapPin, Home, Armchair, Wallet, Settings2, TrendingUp, Info } from 'lucide-react';

interface CalculatorStepperProps {
  inputs: UserInputs;
  setInputs: React.Dispatch<React.SetStateAction<UserInputs>>;
  onCalculate: () => void;
  isPaid: boolean;
}

export const CalculatorStepper: React.FC<CalculatorStepperProps> = ({ inputs, setInputs, onCalculate, isPaid }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = <K extends keyof UserInputs>(key: K, value: UserInputs[K]) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const selectedRegion = KENYA_REGIONS.find(r => r.id === inputs.regionId) || KENYA_REGIONS[0];
  const marketOccupancy = selectedRegion.avgOccupancy * 100;
  const marketRate = selectedRegion.avgNightlyRate[inputs.propertyType];

  // Helper to toggle management fee
  const handleManagementChange = (mode: 'self' | 'agency' | 'full') => {
    let fee = 0;
    if (mode === 'agency') fee = 15;
    if (mode === 'full') fee = 20;
    handleChange('managementFeePercent', fee);
  };

  const currentMgmtFee = inputs.managementFeePercent !== undefined
    ? inputs.managementFeePercent
    : OPERATING_COSTS.MANAGEMENT_FEE_PCT * 100;

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <TrendingUp size={120} />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight relative z-10">Smart ROI Calculator</h2>
        <p className="text-emerald-200 mt-2 relative z-10 flex items-center gap-2">
          <span className="bg-emerald-500/20 px-2 py-1 rounded text-xs font-bold border border-emerald-500/30 uppercase">Beta</span>
          Westlands & Parklands Edition
        </p>
      </div>

      <div className="p-8 space-y-10">
        {/* Core Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Region (Locked) */}
          <div className="space-y-3 opacity-75 grayscale-[0.5] pointer-events-none relative group">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wider">
              <MapPin size={16} className="text-emerald-600" /> Target Region
            </label>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-600 flex justify-between items-center">
              <span>{selectedRegion.name}</span>
              <span className="text-xs bg-slate-200 px-2 py-1 rounded text-slate-500">Fixed</span>
            </div>
            <p className="text-xs text-slate-400 absolute -bottom-6 left-0 w-full">
              More regions coming soon.
            </p>
          </div>

          {/* Property Type */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wider">
              <Home size={16} className="text-emerald-600" /> Property Type
            </label>
            <select
              className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition font-medium text-slate-800 shadow-sm hover:border-slate-300"
              value={inputs.propertyType}
              onChange={(e) => handleChange('propertyType', e.target.value as PropertyType)}
            >
              {Object.values(PropertyType).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Acquisition Model */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wider">
              <Wallet size={16} className="text-emerald-600" /> Investment Strategy
            </label>
            <div className="flex gap-3 p-1.5 bg-slate-100 rounded-xl">
              {Object.values(AcquisitionModel).map(m => (
                <button
                  key={m}
                  onClick={() => handleChange('acquisitionModel', m)}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all ${inputs.acquisitionModel === m
                    ? 'bg-white text-emerald-700 shadow-md ring-1 ring-black/5'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                    }`}
                >
                  {m === AcquisitionModel.SUBLEASE ? 'Rent-to-Rent' : 'Buy Unit'}
                </button>
              ))}
            </div>
          </div>

          {/* Furnishing Standard */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wider">
              <Armchair size={16} className="text-emerald-600" /> Interior Finish
            </label>
            <select
              className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition font-medium text-slate-800 shadow-sm hover:border-slate-300"
              value={inputs.furnishingStandard}
              onChange={(e) => handleChange('furnishingStandard', e.target.value as FurnishingStandard)}
            >
              {Object.values(FurnishingStandard).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="border-t border-slate-100 my-8"></div>

        {/* Smart Settings & Assumptions */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 relative">
          <div className={`p-6 transition-all duration-500 ${!isPaid ? 'blur-sm select-none pointer-events-none opacity-50' : ''}`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Settings2 size={20} className="text-emerald-600" />
                Smart Assumptions
              </h3>
              <div className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 shadow-sm flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live Market Data
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* Occupancy Rate Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-sm font-medium text-slate-600">Occupancy Rate</label>
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
                  <span>Conservative (30%)</span>
                  <span>Market Avg ({marketOccupancy.toFixed(0)}%)</span>
                  <span>Aggressive (100%)</span>
                </div>
              </div>

            </div>

            {/* Cleaning Cost Slider (New) */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-sm font-medium text-slate-600">Daily Cleaning Cost</label>
                <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded text-sm">
                  {inputs.customCleaningCost !== undefined ? `KES ${inputs.customCleaningCost}` : 'Smart Default'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                step="50"
                value={inputs.customCleaningCost !== undefined ? inputs.customCleaningCost : (inputs.propertyType === 'Studio' ? 250 : 500)} // Default display logic
                onChange={(e) => handleChange('customCleaningCost', Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-xs text-slate-400 font-medium">
                <span>Self (0)</span>
                <span>Casual (300)</span>
                <span>Pro (800+)</span>
              </div>
            </div>

            {/* Nightly Rate Input */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-sm font-medium text-slate-600">Nightly Rate (KES)</label>
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
              <div className="flex justify-between text-xs text-slate-400 font-medium">
                <span>Value</span>
                <span>Avg ({marketRate.toLocaleString()})</span>
                <span>Luxury</span>
              </div>
            </div>


            {/* --- UTILITY COSTS (Granular) --- */}
            <div className="col-span-1 md:col-span-2 border-t border-slate-200 pt-6 mt-2">
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Settings2 size={14} className="text-emerald-500" /> Granular Utilities (Monthly)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* WiFi */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-sm font-medium text-slate-600">Internet / WiFi</label>
                    <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded text-sm">
                      {inputs.customWifiCost !== undefined ? `KES ${inputs.customWifiCost}` : 'Std (3k)'}
                    </span>
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
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-sm font-medium text-slate-600">Electricity (Tokens)</label>
                    <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded text-sm">
                      {inputs.customElectricityCost !== undefined ? `KES ${inputs.customElectricityCost}` : 'Smart Default'}
                    </span>
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

                {/* Water */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-sm font-medium text-slate-600">Water Bill</label>
                    <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded text-sm">
                      {inputs.customWaterCost !== undefined ? `KES ${inputs.customWaterCost}` : 'Smart Default'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="100"
                    value={inputs.customWaterCost !== undefined ? inputs.customWaterCost : 1000}
                    onChange={(e) => handleChange('customWaterCost', Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                </div>

                {/* DStv */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-sm font-medium text-slate-600">DStv / Entertainment</label>
                    <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded text-sm">
                      {inputs.customDstvCost !== undefined ? `KES ${inputs.customDstvCost}` : 'None'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="500"
                    value={inputs.customDstvCost !== undefined ? inputs.customDstvCost : 0}
                    onChange={(e) => handleChange('customDstvCost', Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                </div>

              </div>
            </div>
          </div>

          {/* Locked Overlay for Smart Assumptions */}
          {!isPaid && (
            <div className="absolute inset-0 z-20 overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-white/40 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                <div className="p-4 bg-white/80 rounded-full shadow-xl mb-4 relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500"></div>
                  <Settings2 size={32} className="relative text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Advanced Controls Locked</h3>
                <p className="text-sm text-slate-600 max-w-xs mb-6">
                  Unlock Pro mode to customize granular utility costs, occupancy rates, and cleaning fees.
                </p>
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wide border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Pro Feature
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={onCalculate}
        className="w-full py-5 bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-lg rounded-2xl shadow-xl shadow-emerald-900/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        <span className="relative z-10">Reveal Profit Potential 🚀</span>
        <TrendingUp className="relative z-10 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};