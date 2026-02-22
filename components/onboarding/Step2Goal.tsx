import React from 'react';
import { motion } from 'framer-motion';
import { Home, Sprout, ShoppingBag, Plus } from 'lucide-react';

interface StepProps {
  onNext: () => void;
  onBack: () => void;
  data: any;
  updateData: (data: any) => void;
}

const goals = [
  { id: 'airbnb', label: 'Airbnb', icon: Home, color: 'bg-rose-50' },
  { id: 'farming', label: 'Farming Profitability', icon: Sprout, color: 'bg-emerald-50' },
  { id: 'retail', label: 'Small Business Retail', icon: ShoppingBag, color: 'bg-blue-50' },
  { id: 'other', label: 'Something Else', icon: Plus, color: 'bg-slate-50' },
];

export const Step2Goal: React.FC<StepProps> = ({ onNext, data, updateData }) => {
  return (
    <div className="flex-1 flex flex-col py-4">
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-16 h-16 shrink-0">
          <img src="/business_daddy.png" alt="Mascot" className="w-full h-full object-contain" />
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl rounded-bl-none border border-slate-100 flex-1">
          <p className="text-sm font-bold text-brand-navy">
            "Step one of any hustle: Know what you're tracking. What's on your radar today?"
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-black text-brand-navy mb-6 px-2">
        What are you calculating today?
      </h2>

      <div className="grid grid-cols-1 gap-4 flex-1">
        {goals.map((goal) => (
          <motion.button
            key={goal.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              updateData({ goal: goal.id });
              onNext();
            }}
            className={`flex items-center p-6 rounded-3xl border-4 transition-all ${
              data.goal === goal.id 
                ? 'border-brand-yellow bg-white shadow-lg' 
                : 'border-slate-100 bg-white hover:border-slate-200'
            }`}
          >
            <div className={`p-4 rounded-2xl ${goal.color} mr-6`}>
              <goal.icon className="w-8 h-8 text-brand-navy" />
            </div>
            <span className="text-lg font-black text-brand-navy">{goal.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
