import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

interface StepProps {
  onBack: () => void;
  onComplete: () => void;
  data: any;
}

export const Step5CTA: React.FC<StepProps> = ({ onBack, onComplete, data }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const goalLabels: Record<string, string> = {
    airbnb: 'Airbnb Rent-to-Rent',
    farming: 'Farming Profitability',
    retail: 'Small Business Retail',
    other: 'New Hustle',
  };

  return (
    <div className="flex-1 flex flex-col py-4">
      <button onClick={onBack} className="flex items-center text-slate-400 font-bold mb-6 hover:text-brand-navy transition-colors">
        <ArrowLeft className="w-5 h-5 mr-2" />
        BACK
      </button>

      <div className="flex flex-col items-center justify-center space-y-8 flex-1">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring' }}
          className="w-32 h-32"
        >
          <img src="/business_daddy.png" alt="Business Daddy" className="w-full h-full object-contain" />
        </motion.div>

        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-brand-navy leading-tight">
            You're Ready!
          </h2>
          <p className="text-slate-500 font-medium px-8">
            Business Daddy has crunched the preliminary numbers. Let's get to work.
          </p>
        </div>

        <div className="w-full bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-bold uppercase text-xs">Targeting</span>
            <span className="text-brand-navy font-black">{goalLabels[data.goal] || 'Strategy'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-bold uppercase text-xs">Level</span>
            <span className="text-brand-navy font-black capitalize">{data.experience || 'Ambitious'}</span>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <span className="text-slate-500 font-bold uppercase text-xs">Monthly Goal</span>
            <span className="text-brand-yellow font-black text-lg">{formatCurrency(data.incomeGoal)}</span>
          </div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center space-x-2 text-emerald-500 font-bold"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>Profile Optimized</span>
        </motion.div>
      </div>

      <div className="px-4">
        <button
          onClick={onComplete}
          className="w-full py-5 bg-brand-navy text-brand-white text-xl font-black rounded-2xl shadow-[0_6px_0_0_#00152B] hover:translate-y-[2px] hover:shadow-[0_4px_0_0_#00152B] active:translate-y-[4px] active:shadow-none transition-all"
        >
          LET'S BUILD YOUR NUMBERS
        </button>
      </div>
    </div>
  );
};
