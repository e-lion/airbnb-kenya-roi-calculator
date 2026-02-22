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
    const selectedRegion = KENYA_REGIONS.find(r => r.id === inputs.regionId) || KENYA_REGIONS[0];
    const marketOccupancy = propMarketOccupancy ?? (selectedRegion.avgOccupancy * 100);
    const marketRate = propMarketRate ?? selectedRegion.avgNightlyRate[inputs.propertyType];

    return (
        <div className="space-y-8">
            {/* Occupancy Rate Slider */}
            <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <label className="text-sm font-black text-brand-navy uppercase tracking-wider">Projected Occupancy</label>
                    <span className="text-brand-navy font-black bg-brand-yellow/30 px-3 py-1 rounded-xl text-sm">
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
                    className="w-full h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-brand-navy"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-black uppercase tracking-widest px-1">
                    <span>Low (30%)</span>
                    <span>Avg ({marketOccupancy.toFixed(0)}%)</span>
                    <span>High (100%)</span>
                </div>
            </div>

            {/* Nightly Rate */}
            <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <label className="text-sm font-black text-brand-navy uppercase tracking-wider">Nightly Rate (KES)</label>
                    <span className="text-brand-navy font-black bg-brand-yellow/30 px-3 py-1 rounded-xl text-sm">
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
                    className="w-full h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-brand-navy"
                />
            </div>

            {/* Monthly Operating Costs Group */}
            <div className="pt-8 border-t-2 border-slate-100">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 block text-center">Monthly Operating Costs</label>
                <div className="grid grid-cols-1 gap-8">

                    {/* Cleaning (Daily Rate) */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-xs font-black text-brand-navy uppercase tracking-wider">
                            <span>Cleaning (Daily Rate)</span>
                            <span className="text-slate-400">KES {inputs.customCleaningCost || 500}</span>
                        </div>
                        <input
                            type="range"
                            min="200"
                            max="2000"
                            step="50"
                            value={inputs.customCleaningCost !== undefined ? inputs.customCleaningCost : 500}
                            onChange={(e) => handleChange('customCleaningCost', Number(e.target.value))}
                            className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-brand-navy"
                        />
                    </div>

                    {/* WiFi */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-xs font-black text-brand-navy uppercase tracking-wider">
                            <span>WiFi / Internet</span>
                            <span className="text-slate-400">KES {inputs.customWifiCost || 3000}</span>
                        </div>
                        <input
                            type="range"
                            min="2000"
                            max="6000"
                            step="500"
                            value={inputs.customWifiCost !== undefined ? inputs.customWifiCost : 3000}
                            onChange={(e) => handleChange('customWifiCost', Number(e.target.value))}
                            className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-brand-navy"
                        />
                    </div>

                    {/* Electricity */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-xs font-black text-brand-navy uppercase tracking-wider">
                            <span>Electricity (Tokens)</span>
                            <span className="text-slate-400">KES {inputs.customElectricityCost || (inputs.propertyType === 'Studio' ? 2500 : 5000)}</span>
                        </div>
                        <input
                            type="range"
                            min="1000"
                            max="10000"
                            step="500"
                            value={inputs.customElectricityCost !== undefined ? inputs.customElectricityCost : (inputs.propertyType === 'Studio' ? 2500 : 5000)}
                            onChange={(e) => handleChange('customElectricityCost', Number(e.target.value))}
                            className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-brand-navy"
                        />
                    </div>

                    {/* Water */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-xs font-black text-brand-navy uppercase tracking-wider">
                            <span>Water Bill</span>
                            <span className="text-slate-400">KES {inputs.customWaterCost || 1000}</span>
                        </div>
                        <input
                            type="range"
                            min="100"
                            max="5000"
                            step="100"
                            value={inputs.customWaterCost !== undefined ? inputs.customWaterCost : 1000}
                            onChange={(e) => handleChange('customWaterCost', Number(e.target.value))}
                            className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-brand-navy"
                        />
                    </div>

                    {/* Netflix / Entertainment */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-xs font-black text-brand-navy uppercase tracking-wider">
                            <span>Entertainment</span>
                            <span className="text-slate-400">KES {inputs.customNetflixCost || 0}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1100"
                            step="100"
                            value={inputs.customNetflixCost !== undefined ? inputs.customNetflixCost : 0}
                            onChange={(e) => handleChange('customNetflixCost', Number(e.target.value))}
                            className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-brand-navy"
                        />
                    </div>

                </div>
            </div>
        </div>
    );
};
