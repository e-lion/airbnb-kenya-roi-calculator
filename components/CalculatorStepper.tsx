import React from 'react';
import { 
  AcquisitionModel, 
  FurnishingStandard, 
  PropertyType, 
  UserInputs 
} from '../types';
import { KENYA_REGIONS } from '../constants';
import { MapPin, Home, Armchair, Wallet } from 'lucide-react';

interface CalculatorStepperProps {
  inputs: UserInputs;
  setInputs: React.Dispatch<React.SetStateAction<UserInputs>>;
  onCalculate: () => void;
}

export const CalculatorStepper: React.FC<CalculatorStepperProps> = ({ inputs, setInputs, onCalculate }) => {
  
  const handleChange = <K extends keyof UserInputs>(key: K, value: UserInputs[K]) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const selectedRegion = KENYA_REGIONS.find(r => r.id === inputs.regionId);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      <div className="bg-slate-900 p-6 text-white">
        <h2 className="text-2xl font-bold">Configure Your Investment</h2>
        <p className="text-slate-400">Step-by-step ROI simulation</p>
      </div>
      
      <div className="p-8 space-y-8">
        {/* Location & Property */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <MapPin size={16} /> Region
            </label>
            <select 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              value={inputs.regionId}
              onChange={(e) => handleChange('regionId', e.target.value)}
            >
              {KENYA_REGIONS.map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.county})</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
             <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Home size={16} /> Property Type
            </label>
            <select 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              value={inputs.propertyType}
              onChange={(e) => handleChange('propertyType', e.target.value as PropertyType)}
            >
              {Object.values(PropertyType).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Acquisition & Furnishing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
             <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Wallet size={16} /> Acquisition Model
            </label>
            <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
              {Object.values(AcquisitionModel).map(m => (
                <button
                  key={m}
                  onClick={() => handleChange('acquisitionModel', m)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                    inputs.acquisitionModel === m 
                    ? 'bg-white text-emerald-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {m.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
             <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Armchair size={16} /> Furnishing Level
            </label>
            <select 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              value={inputs.furnishingStandard}
              onChange={(e) => handleChange('furnishingStandard', e.target.value as FurnishingStandard)}
            >
              {Object.values(FurnishingStandard).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Market Data Snippet */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h4 className="text-sm font-bold text-blue-800 mb-2">Live Market Data ({selectedRegion?.name})</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="block text-blue-400 text-xs">Avg Daily Rate</span>
              <span className="font-semibold text-blue-700">KES {selectedRegion?.avgNightlyRate[inputs.propertyType].toLocaleString()}</span>
            </div>
            <div>
              <span className="block text-blue-400 text-xs">Avg Occupancy</span>
              <span className="font-semibold text-blue-700">{(selectedRegion!.avgOccupancy * 100).toFixed(0)}%</span>
            </div>
            <div>
              <span className="block text-blue-400 text-xs">Demand Score</span>
              <span className="font-semibold text-blue-700">{selectedRegion?.demandScore}/10</span>
            </div>
            <div>
              <span className="block text-blue-400 text-xs">{inputs.acquisitionModel === AcquisitionModel.BUY ? 'Est. Price' : 'Est. Rent'}</span>
              <span className="font-semibold text-blue-700">
                KES {inputs.acquisitionModel === AcquisitionModel.BUY 
                  ? (selectedRegion?.avgBuyPrice[inputs.propertyType]/1000000).toFixed(1) + 'M' 
                  : (selectedRegion?.avgRent[inputs.propertyType].toLocaleString())
                }
              </span>
            </div>
          </div>
        </div>

        {/* Action */}
        <button 
          onClick={onCalculate}
          className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 transition-all transform active:scale-95 flex items-center justify-center gap-2"
        >
          Calculate ROI
        </button>
      </div>
    </div>
  );
};