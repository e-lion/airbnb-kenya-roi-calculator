import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FarmingResultsDashboard } from './FarmingResultsDashboard';
import { FarmingCalculationResult, FarmingUserInputs } from '../../types';
import { ShieldCheck, TrendingUp, Share2, Download } from 'lucide-react';

interface FarmingReportPageProps {
  results: FarmingCalculationResult | null;
  inputs: FarmingUserInputs;
  onRecalculate: () => void;
}

export const FarmingReportPage: React.FC<FarmingReportPageProps> = ({
  results,
  inputs,
  onRecalculate
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!results) {
      navigate('/farming-calculator');
    }
  }, [results, navigate]);

  if (!results) return null;

  return (
    <div className="bg-white min-h-screen pb-20 relative overflow-hidden">
      {/* Immersive Background Blobs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-yellow/5 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-navy/5 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-emerald-500/5 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-navy text-white rounded-full">
                        <TrendingUp size={12} className="text-brand-yellow" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Live Market Intelligence</span>
                    </div>
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-brand-navy uppercase tracking-tighter leading-[0.9]">
                    Farming<br /><span className="text-brand-yellow">Analysis</span>
                </h1>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mt-6 flex items-center gap-2">
                    <ShieldCheck size={14} className="text-brand-navy" />
                    Verified ROI Projection • {new Date().toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })}
                </p>
            </div>

            <div className="flex gap-3">
                <button className="flex items-center gap-2 px-6 py-4 bg-white border-2 border-slate-100 text-brand-navy text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-sm hover:border-brand-yellow transition-all">
                    <Share2 size={16} />
                    Share
                </button>
                <button className="flex items-center gap-2 px-6 py-4 bg-brand-navy text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-[0_4px_0_0_#00152B] hover:translate-y-[1px] hover:shadow-[0_3px_0_0_#00152B] active:translate-y-[3px] active:shadow-none transition-all">
                    <Download size={16} className="text-brand-yellow" />
                    Export Analysis
                </button>
            </div>
        </div>
        
        <FarmingResultsDashboard
          results={results}
          inputs={inputs}
          onRecalculate={onRecalculate}
        />
      </div>
    </div>
  );
};
