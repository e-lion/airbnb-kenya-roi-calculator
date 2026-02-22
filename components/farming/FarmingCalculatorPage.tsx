import React from 'react';
import { FarmingCalculatorStepper } from './FarmingCalculatorStepper';
import { FarmingUserInputs } from '../../types';

interface FarmingCalculatorPageProps {
  inputs: FarmingUserInputs;
  setInputs: React.Dispatch<React.SetStateAction<FarmingUserInputs>>;
  onCalculate: () => void;
}

export const FarmingCalculatorPage: React.FC<FarmingCalculatorPageProps> = ({
  inputs,
  setInputs,
  onCalculate
}) => {
  return (
    <div className="bg-white min-h-screen relative overflow-hidden">
      {/* Immersive Background Blobs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden opacity-50">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-yellow/5 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-navy/5 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 relative z-10">
        <FarmingCalculatorStepper
          inputs={inputs}
          setInputs={setInputs}
          onCalculate={onCalculate}
        />
      </div>
    </div>
  );
};
