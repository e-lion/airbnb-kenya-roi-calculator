import React, { useState, useEffect } from 'react';
import { X, RotateCcw, Check } from 'lucide-react';
import { UserInputs, PropertyType, AcquisitionModel, FurnishingStandard } from '../types';
import { KENYA_REGIONS } from '../constants';
import { AssumptionsForm } from './forms/AssumptionsForm';

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    inputs: UserInputs;
    onApply: (newInputs: UserInputs) => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, inputs, onApply }) => {
    const [localInputs, setLocalInputs] = useState<UserInputs>(inputs);

    // Sync local state when modal opens
    useEffect(() => {
        if (isOpen) {
            setLocalInputs(inputs);
        }
    }, [isOpen, inputs]);

    if (!isOpen) return null;

    const handleChange = <K extends keyof UserInputs>(key: K, value: UserInputs[K]) => {
        setLocalInputs(prev => ({ ...prev, [key]: value }));
    };

    const handleApply = () => {
        onApply(localInputs);
        onClose();
    };

    const handleReset = () => {
        // We could reset to some defaults, but for now let's just reset to the props inputs 
        // or maybe clearing custom overrides. 
        // Let's clear custom overrides to show "Market Defaults"
        setLocalInputs(prev => ({
            ...prev,
            customOccupancy: undefined,
            customNightlyRate: undefined,
            customCleaningCost: undefined,
            customWifiCost: undefined,
            customElectricityCost: undefined,
            customWaterCost: undefined,
            customNetflixCost: undefined
        }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-lg bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-2 duration-300">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
                    <h3 className="text-lg font-bold text-slate-900">Filter & Assumptions</h3>
                    <button
                        onClick={handleReset}
                        className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mr-10 sm:mr-0"
                    >
                        <RotateCcw size={14} />
                        Reset Defaults
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Section 1: Core Parameters */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Core Strategy</h4>
                        <div className="grid grid-cols-1 gap-4">

                            {/* Region */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Region</label>
                                <select
                                    value={localInputs.regionId}
                                    onChange={(e) => handleChange('regionId', e.target.value)}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                                >
                                    {KENYA_REGIONS.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Property Type */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                    <select
                                        value={localInputs.propertyType}
                                        onChange={(e) => handleChange('propertyType', e.target.value as PropertyType)}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                                    >
                                        {Object.values(PropertyType).map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Strategy */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Model</label>
                                    <select
                                        value={localInputs.acquisitionModel}
                                        onChange={(e) => handleChange('acquisitionModel', e.target.value as AcquisitionModel)}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                                    >
                                        {Object.values(AcquisitionModel).map(m => (
                                            <option key={m} value={m}>{m === AcquisitionModel.BUY ? 'Buy & Host' : 'Rent-to-Rent'}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Interiors */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Interiors</label>
                                <select
                                    value={localInputs.furnishingStandard}
                                    onChange={(e) => handleChange('furnishingStandard', e.target.value as FurnishingStandard)}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                                >
                                    {Object.values(FurnishingStandard).map(s => (
                                        <option key={s} value={s}>{s} Standard</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Section 2: Detailed Assumptions */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Detailed Assumptions</h4>
                        <AssumptionsForm inputs={localInputs} handleChange={handleChange} />
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-white sm:rounded-b-2xl flex-shrink-0 safe-area-bottom">
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleApply}
                            className="px-4 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                        >
                            <Check size={18} />
                            Apply Changes
                        </button>
                    </div>
                </div>

                {/* Close Icon (Absolute Top Right) */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-full sm:hidden"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
};
