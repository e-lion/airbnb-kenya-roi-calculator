import React from 'react';
import { motion } from 'framer-motion';

interface StepProps {
  onNext: () => void;
}

export const Step1Welcome: React.FC<StepProps> = ({ onNext }) => {
  return (
    <div className="flex-1 flex flex-col justify-between py-8">
      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="relative w-64 h-64"
        >
          <img 
            src="/business_daddy.png" 
            alt="Business Daddy" 
            className="w-full h-full object-contain"
          />
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute -top-16 -right-20 bg-white p-4 rounded-3xl rounded-bl-none shadow-2xl border-2 border-slate-50 max-w-[220px] z-20"
          >
            <p className="text-sm font-bold text-brand-navy">
              "I'm Business Daddy. Looking to optimize your hustle? You're in the right place."
            </p>
          </motion.div>
        </motion.div>

        <div className="text-center space-y-4 px-4">
          <h1 className="text-4xl font-black text-brand-navy leading-tight">
            Kenya Hustle
          </h1>
          <p className="text-xl text-slate-600 font-medium">
            Smart financial calculators for the modern Kenyan entrepreneur.
          </p>
        </div>
      </div>

      <div className="px-4">
        <button
          onClick={onNext}
          className="w-full py-5 bg-brand-yellow text-brand-navy text-xl font-black rounded-2xl shadow-[0_6px_0_0_#D4AF37] hover:translate-y-[2px] hover:shadow-[0_4px_0_0_#D4AF37] active:translate-y-[4px] active:shadow-none transition-all"
        >
          GET STARTED
        </button>
      </div>
    </div>
  );
};
