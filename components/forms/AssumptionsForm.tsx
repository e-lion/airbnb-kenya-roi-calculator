import React from 'react';
import { UserInputs } from '../../types';
import { KENYA_REGIONS } from '../../constants';

interface AssumptionsFormProps {
    inputs: UserInputs;
    handleChange: <K extends keyof UserInputs>(key: K, value: UserInputs[K]) => void;
    marketOccupancy?: number;
    marketRate?: number;
}

export const AssumptionsForm: React.FC<AssumptionsFormProps> = ({
    inputs,
    handleChange,
    marketOccupancy: propMarketOccupancy,
    marketRate: propMarketRate
}) => {
    // Fallback defaults if not provided props (e.g. if loaded without full context, though uncommon)
    const selectedRegion = KENYA_REGIONS.find(r => r.id === inputs.regionId) || KENYA_REGIONS[0];
    const marketOccupancy = propMarketOccupancy ?? (selectedRegion.avgOccupancy * 100);
    const marketRate = propMarketRate ?? selectedRegion.avgNightlyRate[inputs.propertyType];

    return (
        <div className="space-y-8">
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

            {/* Monthly Operating Costs Group */}
            <div className="pt-4 border-t border-slate-200">
                <label className="text-sm font-bold text-slate-700 mb-4 block">Monthly Operating Costs</label>
                <div className="grid grid-cols-1 gap-6">

                    {/* Cleaning (Daily Rate) */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-xs font-medium text-slate-500">
                            <span>Cleaning (Daily Rate)</span>
                            <span>KES {inputs.customCleaningCost || 500}</span>
                        </div>
                        <input
                            type="range"
                            min="200"
                            max="2000"
                            step="50"
                            value={inputs.customCleaningCost !== undefined ? inputs.customCleaningCost : 500}
                            onChange={(e) => handleChange('customCleaningCost', Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        />
                    </div>

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

                    {/* Water */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-xs font-medium text-slate-500">
                            <span>Water Bill</span>
                            <span>KES {inputs.customWaterCost || 1000}</span>
                        </div>
                        <input
                            type="range"
                            min="100"
                            max="5000"
                            step="100"
                            value={inputs.customWaterCost !== undefined ? inputs.customWaterCost : 1000}
                            onChange={(e) => handleChange('customWaterCost', Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        />
                    </div>

                    {/* Netflix / Entertainment */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-xs font-medium text-slate-500">
                            <span>Netflix / Entertainment</span>
                            <span>KES {inputs.customNetflixCost || 0}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1100"
                            step="100"
                            value={inputs.customNetflixCost !== undefined ? inputs.customNetflixCost : 0}
                            onChange={(e) => handleChange('customNetflixCost', Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        />
                    </div>

                </div>
            </div>
        </div>
    );
};
