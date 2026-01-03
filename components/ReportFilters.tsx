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
            <div className={`bg-white border-b border-slate-200 sticky top-16 z-30 shadow-sm animate-in slide-in-from-top-2 duration-300 ${disabled ? 'opacity-60 pointer-events-none select-none blur-[1px]' : ''}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center justify-between">

                        {/* Summary View (< lg) - Collapsed state for Mobile & Tablet */}
                        <div className="lg:hidden flex items-center gap-3 overflow-hidden flex-1">
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm sm:text-base font-bold text-slate-900 truncate">{regionName}</span>
                                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 font-medium truncate">
                                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{inputs.propertyType}</span>
                                    <span className="text-slate-300">•</span>
                                    <span className={`px-1.5 py-0.5 rounded ${inputs.acquisitionModel === 'BUY' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                        {inputs.acquisitionModel === 'BUY' ? 'Buy' : 'Rent'}
                                    </span>
                                    <span className="text-slate-300 hidden sm:inline">•</span>
                                    <span className="hidden sm:inline bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{inputs.furnishingStandard}</span>
                                </div>
                            </div>
                        </div>

                        {/* Desktop Filters (>= lg) - Full Expanded Row */}
                        <div className="hidden lg:flex items-center gap-3 overflow-x-auto no-scrollbar">
                            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mr-2 flex-shrink-0">
                                <SettingsIcon size={14} />
                                Parameters:
                            </span>

                            {/* Region */}
                            <div className="relative group flex-shrink-0">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full cursor-pointer transition-colors">
                                    <MapPin size={14} className="text-slate-500" />
                                    <select
                                        value={inputs.regionId}
                                        onChange={(e) => onFilterChange('regionId', e.target.value)}
                                        className="bg-transparent border-none text-sm font-medium text-slate-700 outline-none cursor-pointer appearance-none pr-6 focus:ring-0 w-auto max-w-[150px] truncate"
                                    >
                                        {KENYA_REGIONS.map(region => (
                                            <option key={region.id} value={region.id}>{region.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Property Type */}
                            <div className="relative group flex-shrink-0">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full cursor-pointer transition-colors">
                                    <Home size={14} className="text-slate-500" />
                                    <select
                                        value={inputs.propertyType}
                                        onChange={(e) => onFilterChange('propertyType', e.target.value)}
                                        className="bg-transparent border-none text-sm font-medium text-slate-700 outline-none cursor-pointer appearance-none pr-6 focus:ring-0"
                                    >
                                        {Object.values(PropertyType).map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Strategy */}
                            <div className="relative group flex-shrink-0">
                                <div className={`flex items-center gap-2 px-3 py-1.5 border rounded-full cursor-pointer transition-colors ${inputs.acquisitionModel === AcquisitionModel.BUY ? 'bg-blue-50 border-blue-200' : 'bg-emerald-50 border-emerald-200'}`}>
                                    <Wallet size={14} className={inputs.acquisitionModel === AcquisitionModel.BUY ? 'text-blue-500' : 'text-emerald-500'} />
                                    <select
                                        value={inputs.acquisitionModel}
                                        onChange={(e) => onFilterChange('acquisitionModel', e.target.value)}
                                        className={`bg-transparent border-none text-sm font-bold outline-none cursor-pointer appearance-none pr-6 focus:ring-0 ${inputs.acquisitionModel === AcquisitionModel.BUY ? 'text-blue-700' : 'text-emerald-700'}`}
                                    >
                                        {Object.values(AcquisitionModel).map(model => (
                                            <option key={model} value={model}>{model === AcquisitionModel.BUY ? 'Buy & Host' : 'Rent-to-Rent'}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={12} className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${inputs.acquisitionModel === AcquisitionModel.BUY ? 'text-blue-400' : 'text-emerald-400'}`} />
                                </div>
                            </div>

                            {/* Interiors */}
                            <div className="relative group flex-shrink-0">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full cursor-pointer transition-colors">
                                    <Armchair size={14} className="text-slate-500" />
                                    <select
                                        value={inputs.furnishingStandard}
                                        onChange={(e) => onFilterChange('furnishingStandard', e.target.value)}
                                        className="bg-transparent border-none text-sm font-medium text-slate-700 outline-none cursor-pointer appearance-none pr-6 focus:ring-0"
                                    >
                                        {Object.values(FurnishingStandard).map(std => (
                                            <option key={std} value={std}>{std}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                        </div>

                        {/* Edit / More Button */}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="ml-auto flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wide rounded-full shadow-md hover:shadow-lg transition-all active:scale-95 flex-shrink-0"
                        >
                            <SlidersHorizontal size={14} />
                            <span className="hidden sm:inline">Advanced</span>
                            <span className="sm:hidden">Edit</span>
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
