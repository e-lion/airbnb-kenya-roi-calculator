import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Step1Welcome } from './Step1Welcome';
import { Step2Goal } from './Step2Goal';
import { Step3Experience } from './Step3Experience';
import { Step4IncomeGoal } from './Step4IncomeGoal';
import { Step5CTA } from './Step5CTA';
import { trackEvent } from '../../services/analyticsService';

export const Onboarding: React.FC<{ onComplete: (goal?: string) => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    goal: '',
    experience: '',
    incomeGoal: 50000,
  });

  const totalSteps = 5;

  useEffect(() => {
    trackEvent('onboarding_step_viewed', { step });
  }, [step]);

  const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const updateData = (newData: Partial<typeof data>) => {
    setData((prev) => ({ ...prev, ...newData }));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1Welcome onNext={nextStep} />;
      case 2:
        return <Step2Goal onNext={nextStep} onBack={prevStep} data={data} updateData={updateData} />;
      case 3:
        return <Step3Experience onNext={nextStep} onBack={prevStep} data={data} updateData={updateData} />;
      case 4:
        return <Step4IncomeGoal onNext={nextStep} onBack={prevStep} data={data} updateData={updateData} />;
      case 5:
        return <Step5CTA onBack={prevStep} data={data} onComplete={() => {
          trackEvent('onboarding_completed', { goal: data.goal });
          onComplete(data.goal);
        }} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-brand-white z-50 flex flex-col overflow-hidden font-sans">
      {/* Progress Bar */}
      <div className="w-full h-3 bg-slate-100 relative">
        <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(step / totalSteps) * 100}%` }}
            className="h-full bg-brand-yellow rounded-r-full shadow-[0_0_10px_rgba(255,215,0,0.5)]"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      </div>

      <div className="flex-1 relative overflow-y-auto overflow-x-hidden p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="h-full flex flex-col"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
