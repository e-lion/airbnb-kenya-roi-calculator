import React from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  PieChart, 
  Sprout, 
  Wallet, 
  Banknote,
  AlertCircle,
  TrendingUp,
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { FarmingCalculationResult, FarmingUserInputs } from '../../types';
import { FARMING_CONSTANTS } from '../../constants';

interface FarmingResultsDashboardProps {
  results: FarmingCalculationResult;
  inputs: FarmingUserInputs;
  onRecalculate: () => void;
}

export const FarmingResultsDashboard: React.FC<FarmingResultsDashboardProps> = ({
  results,
  inputs,
  onRecalculate
}) => {
  const cropData = FARMING_CONSTANTS[inputs.cropType];
  const formatCurrency = (val: number) => `KES ${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  const isProfitable = results.netProfit > 0;

  return (
    <div className="space-y-10">
      
      {/* Top Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Net Profit Card */}
        <div className={`col-span-1 md:col-span-2 relative overflow-hidden rounded-[40px] p-10 border ${isProfitable ? 'bg-brand-navy border-slate-100' : 'bg-rose-950 border-rose-900'} text-white shadow-2xl group`}>
           <div className="relative z-10">
             <div className="flex items-center gap-2 text-slate-400 uppercase text-[10px] font-black tracking-[0.2em] mb-4">
               <Wallet size={16} className="text-brand-yellow" /> Projected Net Profit ({inputs.acreage} Acres)
             </div>
             <div className="text-5xl sm:text-7xl font-black mb-6 tracking-tighter">
               {formatCurrency(results.netProfit)}
             </div>
             <div className="flex flex-wrap items-center gap-6">
               <div className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 ${isProfitable ? 'bg-brand-yellow text-brand-navy' : 'bg-rose-500 text-white'}`}>
                 {isProfitable ? <TrendingUp size={16} /> : <ArrowDownRight size={16} />}
                 {results.roi.toFixed(1)}% ROI
               </div>
               <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                 Per Acre Profit: <span className="text-white ml-1">{formatCurrency(results.profitPerAcre)}</span>
               </div>
             </div>
           </div>
           
           {/* Background Decoration */}
           <div className={`absolute -right-10 -bottom-10 w-64 h-64 rounded-full blur-[100px] transition-all duration-700 group-hover:scale-110 opacity-20 ${isProfitable ? 'bg-brand-yellow' : 'bg-rose-500'}`}></div>
        </div>

        {/* Total Cost Card */}
        <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm flex flex-col justify-center relative overflow-hidden group hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Banknote size={80} className="text-brand-navy" />
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4 relative z-10">
               <Banknote size={16} /> Total Production
            </div>
            <div className="text-4xl font-black text-brand-navy mb-2 tracking-tighter relative z-10">
               {formatCurrency(results.totalCost)}
            </div>
            <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest relative z-10">
               {formatCurrency(results.totalCost / inputs.acreage)} / acre cost
            </div>
        </div>
      </div>

      {/* Basis of Analysis Card (Restyled) */}
      <div className="bg-brand-navy/5 rounded-[40px] p-10 border border-slate-100">
        <div className="flex items-center gap-2 mb-8">
          <HelpCircle className="text-brand-yellow" size={20} />
          <h3 className="text-xl font-black text-brand-navy uppercase tracking-tight">Market Assumptions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Yield Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <span className="block text-brand-navy text-[10px] uppercase tracking-widest font-black mb-4">Yield Efficiency</span>
                <div className="text-2xl font-black text-brand-navy tracking-tight mb-1">
                    {((inputs.customYieldPerAcre || cropData.avgYieldPerAcre) * inputs.acreage).toLocaleString()} {cropData.unit}
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Total Seasonal Output</p>
            </div>
            
            {/* Revenue Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <span className="block text-brand-navy text-[10px] uppercase tracking-widest font-black mb-4">Gross Revenue</span>
                <div className="text-2xl font-black text-emerald-600 tracking-tight mb-1">
                    {formatCurrency(results.totalRevenue)}
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Projected Sales</p>
            </div>

            {/* Price Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <span className="block text-brand-navy text-[10px] uppercase tracking-widest font-black mb-4">Market Price</span>
                <div className="text-2xl font-black text-brand-navy tracking-tight mb-1">
                    {formatCurrency(inputs.customPricePerUnit || cropData.avgPricePerUnit)}
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Per {cropData.unit.replace(/s$/, '')}</p>
            </div>
        </div>
      </div>

      {/* Breakdown Section */}
      <div className="grid md:grid-cols-2 gap-8">
         {/* Strategic Note */}
         <div className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm flex flex-col justify-center">
             <div className="inline-flex p-4 bg-brand-yellow/10 rounded-3xl mb-6 w-fit">
                <Sprout className="text-brand-navy" size={32} />
             </div>
             <h3 className="text-2xl font-black text-brand-navy uppercase tracking-tight mb-4">
                Strategic Analysis
             </h3>
             <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
                Your <span className="text-brand-navy font-bold">{inputs.cropType}</span> venture on <span className="text-brand-navy font-bold">{inputs.acreage} acres</span> shows a competitive ROI potential. These estimates assume professional irrigation and pest management protocols.
             </p>
             <div className="p-4 bg-slate-50 rounded-2xl flex gap-3 border border-slate-100">
                <AlertCircle className="text-brand-navy shrink-0" size={20} />
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest leading-loose">
                  Prices fluctuate based on seasonal gluts. Secure off-take agreements to lock in these margins.
                </p>
             </div>
         </div>

         {/* Cost Breakdown Panel */}
         <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm">
             <div className="px-10 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-black text-brand-navy uppercase tracking-tight">Production Costs</h3>
                <div className="px-3 py-1 bg-brand-navy text-white text-[9px] font-black uppercase tracking-widest rounded-full">Cost IQ</div>
             </div>

              <div className="p-10 space-y-6">
                 {Object.entries(results.costBreakdown).map(([key, value]) => {
                    if (key === 'lease' && value === 0) return null;
                    return (
                      <div key={key} className="flex items-center justify-between group">
                         <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-brand-yellow transition-transform group-hover:scale-150"></div>
                            <span className="text-slate-500 capitalize text-[10px] font-black uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                         </div>
                         <span className="font-black text-brand-navy text-sm tracking-tight">{formatCurrency(value as number)}</span>
                      </div>
                    );
                 })}
                
                <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                   <div className="flex flex-col">
                     <span className="font-black text-brand-navy uppercase tracking-widest text-[10px]">Total Production Cost</span>
                     <span className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">Initial Investment</span>
                   </div>
                   <span className="text-2xl font-black text-brand-navy tracking-tighter">{formatCurrency(results.totalCost)}</span>
                </div>
              </div>
         </div>
      </div>

       <div className="flex justify-center pt-12">
            <button 
              onClick={onRecalculate}
              className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-brand-navy transition-all group"
            >
              <RotateCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
              Reset Market Simulation
            </button>
       </div>
    </div>
  );
};
