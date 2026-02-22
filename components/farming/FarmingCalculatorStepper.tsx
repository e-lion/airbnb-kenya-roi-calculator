import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sprout, 
  Tractor, 
  Coins, 
  ArrowRight, 
  ArrowLeft,
  Calculator,
  CheckCircle2,
  Leaf,
  Droplets,
  Zap,
  Tag,
  AlertCircle,
  Building2
} from 'lucide-react';
import { CropType, FarmingUserInputs } from '../../types';
import { FARMING_CONSTANTS } from '../../constants';
import { trackEvent } from '../../services/analyticsService';

interface FarmingCalculatorStepperProps {
  inputs: FarmingUserInputs;
  setInputs: React.Dispatch<React.SetStateAction<FarmingUserInputs>>;
  onCalculate: () => void;
}

const STEPS = [
  { id: 'crop', title: 'Crop Type', icon: Sprout, mascot: "First, what are we planting? Selection depends on your soil and market demand.", prompt: "Which crop are you growing?" },
  { id: 'scale', title: 'Farm Size', icon: Tractor, mascot: "How much land are we working with? Economies of scale kick in above 5 acres.", prompt: "What's the total acreage?" },
  { id: 'ownership', title: 'Land Ownership', icon: Building2, mascot: "Do you own this land or are you leasing? This significantly affects your final ROI.", prompt: "What's the land situation?" },
  { id: 'lease', title: 'Lease Cost', icon: Coins, mascot: "Leasing is a fixed production cost. Make sure your yield covers this overhead.", prompt: "How much is the lease cost?" },
  { id: 'seeds', title: 'Seeds', icon: Leaf, mascot: "Quality seeds are non-negotiable. Don't go cheap here if you want high yields.", prompt: "Seed cost per acre (KES)?" },
  { id: 'fertilizer', title: 'Fertility', icon: Droplets, mascot: "Soil health is wealth. Budget for proper fertilization and manure.", prompt: "Fertilizer cost per acre (KES)?" },
  { id: 'labor', title: 'Human Capital', icon: Zap, mascot: "From planting to harvest, labor is your biggest operational variable.", prompt: "Total labor per acre (KES)?" },
  { id: 'pest', title: 'Crop Protection', icon: AlertCircle, mascot: "Pests can wipe out a season. Stay proactive with your protection budget.", prompt: "Pest control per acre (KES)?" },
  { id: 'yield', title: 'Harvest Goal', icon: Sprout, mascot: "What's the target? Professional farmers aim for the upper percentiles.", prompt: "Expected yield per acre?" },
  { id: 'price', title: 'Market Value', icon: Tag, mascot: "What's the farm-gate price? Always have a buyer contract if possible.", prompt: "Selling price per unit?" },
];

export const FarmingCalculatorStepper: React.FC<FarmingCalculatorStepperProps> = ({
  inputs,
  setInputs,
  onCalculate
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const cropData = FARMING_CONSTANTS[inputs.cropType];

  React.useEffect(() => {
    trackEvent('calculator_step_viewed', { 
      stepIndex: currentStep, 
      stepId: STEPS[currentStep].id,
      flow: 'farming'
    });
  }, [currentStep]);

  const handleChange = <K extends keyof FarmingUserInputs>(key: K, value: FarmingUserInputs[K]) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const nextStep = () => {
    if (currentStep === 2 && inputs.landOwnership === 'Own') {
      setCurrentStep(curr => curr + 2); // Skip lease step
      return;
    }
    
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(curr => curr + 1);
    } else {
      trackEvent('calculator_completed', { 
        flow: 'farming',
        cropType: inputs.cropType 
      });
      onCalculate();
    }
  };

  const prevStep = () => {
    if (currentStep === 4 && inputs.landOwnership === 'Own') {
      setCurrentStep(curr => curr - 2); // Go back to ownership step
      return;
    }

    if (currentStep > 0) {
      setCurrentStep(curr => curr - 1);
    }
  };

  const handleSelection = <K extends keyof FarmingUserInputs>(key: K, value: FarmingUserInputs[K]) => {
    handleChange(key, value);
    setTimeout(() => {
      nextStep();
    }, 300);
  };

  const renderStepHeader = (index: number) => (
    <div className="flex items-center space-x-4 mb-8">
      <div className="w-16 h-16 shrink-0">
        <img src="/business_daddy.png" alt="Mascot" className="w-full h-full object-contain" />
      </div>
      <div className="bg-slate-50 p-4 rounded-2xl rounded-bl-none border border-slate-100 flex-1">
        <p className="text-sm font-bold text-brand-navy leading-relaxed">
          "{STEPS[index].mascot}"
        </p>
      </div>
    </div>
  );

  const renderContinueButton = (label = "CONTINUE") => (
    <button
      onClick={nextStep}
      className={`w-full py-5 bg-brand-navy text-brand-white text-xl font-black rounded-2xl shadow-[0_6px_0_0_#00152B] hover:translate-y-[2px] hover:shadow-[0_4px_0_0_#00152B] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-3 mt-8`}
    >
      <span>{label}</span>
      <ArrowRight size={24} />
    </button>
  );

  const renderCropStep = () => (
    <div className="flex flex-col h-full">
      {renderStepHeader(0)}
      <h2 className="text-2xl font-black text-brand-navy mb-6">{STEPS[0].prompt}</h2>
      <div className="grid grid-cols-2 gap-4">
        {Object.values(CropType).map((crop) => (
          <motion.button
            key={crop}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelection('cropType', crop)}
            className={`flex items-center p-6 rounded-3xl border-4 transition-all ${
              inputs.cropType === crop
                ? 'border-brand-yellow bg-white shadow-lg'
                : 'border-slate-100 bg-white hover:border-slate-200'
            }`}
          >
            <div className={`p-3 rounded-2xl mr-4 transition-colors ${inputs.cropType === crop ? 'bg-brand-yellow/10' : 'bg-brand-navy/5'}`}>
              <Sprout size={24} className="text-brand-navy" />
            </div>
            <span className="font-black text-brand-navy text-lg">{crop}</span>
            {inputs.cropType === crop && <CheckCircle2 className="ml-auto text-brand-yellow" size={24} />}
          </motion.button>
        ))}
      </div>
    </div>
  );

  const renderOwnershipStep = () => (
    <div className="flex flex-col h-full">
      {renderStepHeader(2)}
      <h2 className="text-2xl font-black text-brand-navy mb-6">{STEPS[2].prompt}</h2>
      <div className="grid grid-cols-1 gap-4">
        {[
          { id: 'Own', title: 'I Own the Land', icon: Building2, desc: "Total control & no lease fee" },
          { id: 'Lease', title: 'I am Leasing', icon: Coins, desc: "Renting land for farming" }
        ].map((opt) => (
          <motion.button
            key={opt.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelection('landOwnership', opt.id as any)}
            className={`flex items-center p-6 rounded-3xl border-4 transition-all ${
              inputs.landOwnership === opt.id
                ? 'border-brand-yellow bg-white shadow-lg'
                : 'border-slate-100 bg-white hover:border-slate-200'
            }`}
          >
            <div className={`p-4 rounded-2xl mr-4 transition-colors ${inputs.landOwnership === opt.id ? 'bg-brand-yellow/10' : 'bg-brand-navy/5'}`}>
              <opt.icon size={28} className="text-brand-navy" />
            </div>
            <div className="text-left">
              <span className="block font-black text-brand-navy text-xl uppercase tracking-tight">{opt.title}</span>
              <span className="text-sm text-slate-400 font-bold">{opt.desc}</span>
            </div>
            {inputs.landOwnership === opt.id && <CheckCircle2 className="ml-auto text-brand-yellow" size={24} />}
          </motion.button>
        ))}
      </div>
    </div>
  );

  const renderSliderInput = (
    stepIndex: number,
    value: number,
    min: number,
    max: number,
    step: number,
    onChange: (val: number) => void,
    displayValue: string,
    labelLow: string,
    labelHigh: string,
    Icon: any
  ) => (
    <div className="flex flex-col h-full">
      {renderStepHeader(stepIndex)}
      <h2 className="text-2xl font-black text-brand-navy mb-8">{STEPS[stepIndex].prompt}</h2>
      
      <div className="flex-1 flex flex-col justify-center">
        <div className="bg-white rounded-[40px] border-4 border-slate-50 p-10 space-y-8 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-brand-yellow opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity" />
          
          <div className="text-center">
            <div className="inline-flex p-4 bg-brand-navy/5 rounded-3xl mb-4">
                <Icon size={32} className="text-brand-navy" />
            </div>
            <div className="block">
                <span className="text-5xl font-black text-brand-navy tracking-tighter">{displayValue}</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={(e) => onChange(Number(e.target.value))}
              className="w-full h-4 bg-slate-100 rounded-full appearance-none cursor-pointer accent-brand-navy"
            />
            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
              <span>{labelLow}</span>
              <span>{labelHigh}</span>
            </div>
          </div>
        </div>
      </div>
      
      {renderContinueButton(stepIndex === STEPS.length - 1 ? "CALCULATE PROFITS" : "CONTINUE")}
    </div>
  );

  return (
    <div className="flex flex-col min-h-[85vh] font-sans">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-3 bg-slate-100 z-50 overflow-hidden">
        <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            className="h-full bg-brand-yellow rounded-r-full shadow-[0_0_10px_rgba(255,215,0,0.5)]"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      </div>

      <div className="flex-1 p-6 flex flex-col max-w-2xl mx-auto w-full pt-4">
        <nav className="flex items-center justify-between mb-8">
          <button 
            onClick={prevStep}
            className={`p-2 rounded-xl transition-all ${currentStep > 0 ? 'text-slate-400 hover:text-brand-navy hover:bg-slate-50' : 'opacity-0 pointer-events-none'}`}
          >
            <ArrowLeft size={24} />
          </button>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            {STEPS[currentStep].title} • {currentStep + 1} / {STEPS.length}
          </div>
          <div className="w-10"></div>
        </nav>

        <div className="flex-1 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="h-full"
            >
              {currentStep === 0 && renderCropStep()}
              
              {currentStep === 1 && renderSliderInput(
                1,
                inputs.acreage,
                0.5, 100, 0.5,
                (val) => handleChange('acreage', val),
                `${inputs.acreage} ACRES`,
                "Small Scale", "Commercial",
                Tractor
              )}

              {currentStep === 2 && renderOwnershipStep()}

              {currentStep === 3 && renderSliderInput(
                3,
                inputs.leaseCost || 0,
                0, 200000, 1000,
                (val) => handleChange('leaseCost', val),
                `KES ${(inputs.leaseCost || 0).toLocaleString()} / YR`,
                "Low Rent", "High Rent",
                Coins
              )}

              {currentStep === 4 && renderSliderInput(
                4,
                inputs.customSeedCost ?? cropData.costs.seeds,
                1000, 50000, 500,
                (val) => handleChange('customSeedCost', val),
                `KES ${(inputs.customSeedCost ?? cropData.costs.seeds).toLocaleString()}`,
                "Basic", "Premium",
                Leaf
              )}

              {currentStep === 5 && renderSliderInput(
                5,
                inputs.customFertilizerCost ?? cropData.costs.fertilizer,
                1000, 100000, 1000,
                (val) => handleChange('customFertilizerCost', val),
                `KES ${(inputs.customFertilizerCost ?? cropData.costs.fertilizer).toLocaleString()}`,
                "Organic", "Intensive",
                Droplets
              )}

              {currentStep === 6 && renderSliderInput(
                6,
                inputs.customLaborCost ?? cropData.costs.labor,
                1000, 80000, 1000,
                (val) => handleChange('customLaborCost', val),
                `KES ${(inputs.customLaborCost ?? cropData.costs.labor).toLocaleString()}`,
                "Manual", "Mechanized",
                Zap
              )}

              {currentStep === 7 && renderSliderInput(
                7,
                inputs.customPestControlCost ?? cropData.costs.pestControl,
                500, 30000, 500,
                (val) => handleChange('customPestControlCost', val),
                `KES ${(inputs.customPestControlCost ?? cropData.costs.pestControl).toLocaleString()}`,
                "Minimum", "Total Shield",
                AlertCircle
              )}

              {currentStep === 8 && renderSliderInput(
                8,
                inputs.customYieldPerAcre ?? cropData.avgYieldPerAcre,
                cropData.avgYieldPerAcre * 0.5, cropData.avgYieldPerAcre * 2, 1,
                (val) => handleChange('customYieldPerAcre', val),
                `${(inputs.customYieldPerAcre ?? cropData.avgYieldPerAcre).toLocaleString()} ${cropData.unit}`,
                "Pessimistic", "Pro Farming",
                Sprout
              )}

              {currentStep === 9 && renderSliderInput(
                9,
                inputs.customPricePerUnit ?? cropData.avgPricePerUnit,
                cropData.avgPricePerUnit * 0.3, cropData.avgPricePerUnit * 3, 1,
                (val) => handleChange('customPricePerUnit', val),
                `KES ${(inputs.customPricePerUnit ?? cropData.avgPricePerUnit).toLocaleString()}`,
                "Bulk", "Retail/Direct",
                Tag
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
