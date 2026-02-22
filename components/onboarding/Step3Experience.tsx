import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

interface StepProps {
  onNext: () => void;
  onBack: () => void;
  data: any;
  updateData: (data: any) => void;
}

const levels = [
  { id: 'beginner', label: 'Beginner', description: 'Just starting my first project.', emoji: '🌱' },
  { id: 'intermediate', label: 'Intermediate', description: 'I have some active operations.', emoji: '🚀' },
  { id: 'operator', label: 'Operator', description: 'Running multiple units/businesses.', emoji: '💼' },
];

export const Step3Experience: React.FC<StepProps> = ({ onNext, onBack, data, updateData }) => {
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
            "Experience is the best teacher, but data is a close second. How deep are you in the game?"
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-black text-brand-navy mb-6 px-2">
        What's your experience level?
      </h2>

      <div className="space-y-4 flex-1">
        {levels.map((level) => (
          <motion.button
            key={level.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              updateData({ experience: level.id });
              onNext();
            }}
            className={`w-full flex items-center p-6 rounded-3xl border-4 text-left transition-all ${
              data.experience === level.id 
                ? 'border-brand-yellow bg-white shadow-lg' 
                : 'border-slate-100 bg-white hover:border-slate-200'
            }`}
          >
            <div className="text-4xl mr-6">{level.emoji}</div>
            <div>
              <div className="text-lg font-black text-brand-navy">{level.label}</div>
              <div className="text-slate-500 font-medium">{level.description}</div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
