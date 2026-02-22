import React, { useState } from 'react';
import { MapPin, Home, Wallet, Armchair, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { UserInputs, PropertyType, AcquisitionModel, FurnishingStandard } from '../types';
import { KENYA_REGIONS } from '../constants';
import { FilterModal } from './FilterModal';

interface ReportFiltersProps {
    inputs: UserInputs;
    onFilterChange: (key: keyof UserInputs, value: any) => void;
    onBulkUpdate: (newInputs: UserInputs) => void;
    disabled?: boolean;
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({ inputs, onFilterChange, onBulkUpdate, disabled = false }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const regionName = KENYA_REGIONS.find(r => r.id === inputs.regionId)?.name || 'Nairobi';

    return (
        <>
            <div className={`border-b border-slate-200 sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-sm animate-in slide-in-from-top-2 duration-300 ${disabled ? 'opacity-60 pointer-events-none select-none blur-[1px]' : ''}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">

                        {/* Summary View (< lg) - Collapsed state for Mobile & Tablet */}
                        <div className="lg:hidden flex items-center gap-3 overflow-hidden flex-1">
                            <div className="flex flex-col min-w-0">
                                <span className="text-base font-black text-brand-navy truncate">{regionName}</span>
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-bold truncate uppercase tracking-wider">
                                    <span className="bg-slate-100 px-2 py-0.5 rounded-lg text-slate-600">{inputs.propertyType}</span>
                                    <span className="text-slate-300 font-black">•</span>
                                    <span className={`px-2 py-0.5 rounded-lg ${inputs.acquisitionModel === 'BUY' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                        {inputs.acquisitionModel === 'BUY' ? 'Buy & Host' : 'Rent-to-Rent'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Desktop Filters (>= lg) - Full Expanded Row */}
                        <div className="hidden lg:flex items-center gap-3 overflow-x-auto no-scrollbar">
                            <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2 flex-shrink-0">
                                <SettingsIcon size={14} />
                                Configuration:
                            </span>

                            {/* Region */}
                            <div className="relative group flex-shrink-0">
                                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-white border-2 border-slate-100 hover:border-brand-yellow rounded-2xl cursor-pointer transition-all shadow-sm hover:shadow-md">
                                    <MapPin size={14} className="text-brand-navy" />
                                    <select
                                        value={inputs.regionId}
                                        onChange={(e) => onFilterChange('regionId', e.target.value)}
                                        className="bg-transparent border-none text-xs font-black text-brand-navy outline-none cursor-pointer appearance-none pr-6 focus:ring-0 w-auto max-w-[150px] truncate uppercase tracking-tight"
                                    >
                                        {KENYA_REGIONS.map(region => (
                                            <option key={region.id} value={region.id}>{region.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Property Type */}
                            <div className="relative group flex-shrink-0">
                                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-white border-2 border-slate-100 hover:border-brand-yellow rounded-2xl cursor-pointer transition-all shadow-sm hover:shadow-md">
                                    <Home size={14} className="text-brand-navy" />
                                    <select
                                        value={inputs.propertyType}
                                        onChange={(e) => onFilterChange('propertyType', e.target.value)}
                                        className="bg-transparent border-none text-xs font-black text-brand-navy outline-none cursor-pointer appearance-none pr-6 focus:ring-0 uppercase tracking-tight"
                                    >
                                        {Object.values(PropertyType).map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Strategy */}
                            <div className="relative group flex-shrink-0">
                                <div className={`flex items-center gap-2 px-4 py-2 border-2 rounded-2xl cursor-pointer transition-all shadow-sm hover:shadow-md ${inputs.acquisitionModel === AcquisitionModel.BUY ? 'bg-blue-50 border-blue-200 hover:border-blue-400' : 'bg-emerald-50 border-emerald-200 hover:border-emerald-400'}`}>
                                    <Wallet size={14} className={inputs.acquisitionModel === AcquisitionModel.BUY ? 'text-blue-500' : 'text-emerald-500'} />
                                    <select
                                        value={inputs.acquisitionModel}
                                        onChange={(e) => onFilterChange('acquisitionModel', e.target.value)}
                                        className={`bg-transparent border-none text-xs font-black outline-none cursor-pointer appearance-none pr-6 focus:ring-0 uppercase tracking-tight ${inputs.acquisitionModel === AcquisitionModel.BUY ? 'text-blue-700' : 'text-emerald-700'}`}
                                    >
                                        {Object.values(AcquisitionModel).map(model => (
                                            <option key={model} value={model}>{model === AcquisitionModel.BUY ? 'Buy & Host' : 'Rent-to-Rent'}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${inputs.acquisitionModel === AcquisitionModel.BUY ? 'text-blue-400' : 'text-emerald-400'}`} />
                                </div>
                            </div>

                            {/* Interiors */}
                            <div className="relative group flex-shrink-0">
                                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-white border-2 border-slate-100 hover:border-brand-yellow rounded-2xl cursor-pointer transition-all shadow-sm hover:shadow-md">
                                    <Armchair size={14} className="text-brand-navy" />
                                    <select
                                        value={inputs.furnishingStandard}
                                        onChange={(e) => onFilterChange('furnishingStandard', e.target.value)}
                                        className="bg-transparent border-none text-xs font-black text-brand-navy outline-none cursor-pointer appearance-none pr-6 focus:ring-0 uppercase tracking-tight"
                                    >
                                        {Object.values(FurnishingStandard).map(std => (
                                            <option key={std} value={std}>{std}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                        </div>

                        {/* Edit / More Button */}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="ml-auto flex items-center gap-2 px-5 py-2.5 bg-brand-navy hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-[0_4px_0_0_#00152B] transition-all hover:translate-y-[1px] hover:shadow-[0_3px_0_0_#00152B] active:translate-y-[3px] active:shadow-none flex-shrink-0"
                        >
                            <SlidersHorizontal size={14} />
                            <span className="hidden sm:inline">Advanced Settings</span>
                            <span className="sm:hidden">Filters</span>
                        </button>

                    </div>
                </div>
            </div>

            <FilterModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                inputs={inputs}
                onApply={onBulkUpdate}
            />
        </>
    );
};

const SettingsIcon = ({ size }: { size: number }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
);
