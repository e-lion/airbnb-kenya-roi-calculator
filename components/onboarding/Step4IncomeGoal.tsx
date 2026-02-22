import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

interface StepProps {
  onNext: () => void;
  onBack: () => void;
  data: any;
  updateData: (data: any) => void;
}

export const Step4IncomeGoal: React.FC<StepProps> = ({ onNext, onBack, data, updateData }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getDaddyReaction = (val: number) => {
    if (val < 50000) return "Starting point. Humble beginnings make for great stories.";
    if (val < 150000) return "Solid target. That's a comfortable side hustle right there.";
    if (val < 500000) return "Ambitious! Now we're talking serious business.";
    return "Legendary. You're aiming for the top of the food chain!";
  };

  return (
    <div className="flex-1 flex flex-col py-4">
      <button onClick={onBack} className="flex items-center text-slate-400 font-bold mb-6 hover:text-brand-navy transition-colors">
        <ArrowLeft className="w-5 h-5 mr-2" />
        BACK
      </button>

      <div className="flex items-center space-x-4 mb-8">
        <div className="w-16 h-16 shrink-0">
          <img src="/business_daddy.png" alt="Mascot" className="w-full h-full object-contain" />
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl rounded-bl-none border border-slate-100 flex-1">
          <p className="text-sm font-bold text-brand-navy">
            "{getDaddyReaction(data.incomeGoal)}"
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-black text-brand-navy mb-12 px-2 leading-tight">
        What monthly profit are you targeting?
      </h2>

      <div className="flex-1 flex flex-col justify-center px-4">
        <div className="text-center mb-12">
          <motion.div 
            key={data.incomeGoal}
            initial={{ scale: 0.9, opacity: 0.5 }}
            animate={{ scale: 1.1, opacity: 1 }}
            className="text-4xl font-black text-brand-navy mb-2"
          >
            {formatCurrency(data.incomeGoal)}
          </motion.div>
          <div className="text-slate-400 font-bold uppercase tracking-wider">Per Month</div>
        </div>

        <div className="relative pt-1 pb-12">
          <input
            type="range"
            min="10000"
            max="1000000"
            step="10000"
            value={data.incomeGoal}
            onChange={(e) => updateData({ incomeGoal: parseInt(e.target.value) })}
            className="w-full h-4 bg-slate-100 rounded-full appearance-none cursor-pointer accent-brand-yellow"
          />
          <div className="flex justify-between mt-4 text-xs font-bold text-slate-400">
            <span>KES 10K</span>
            <span>KES 500K</span>
            <span>KES 1M+</span>
          </div>
        </div>
      </div>

      <div className="px-4 mt-auto">
        <button
          onClick={onNext}
          className="w-full py-5 bg-brand-yellow text-brand-navy text-xl font-black rounded-2xl shadow-[0_6px_0_0_#D4AF37] hover:translate-y-[2px] hover:shadow-[0_4px_0_0_#D4AF37] active:translate-y-[4px] active:shadow-none transition-all"
        >
          CONTINUE
        </button>
      </div>
    </div>
  );
};
