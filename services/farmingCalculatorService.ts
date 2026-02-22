import { CropType, FarmingUserInputs, FarmingCalculationResult } from '../types';
import { FARMING_CONSTANTS } from '../constants';

export const calculateFarmingROI = (inputs: FarmingUserInputs): FarmingCalculationResult => {
  const { cropType, acreage } = inputs;
  const cropData = FARMING_CONSTANTS[cropType];

  // 1. Determine Costs (Per Acre) -> Total
  // Use custom input if provided, otherwise default from constant
  const seedCostPerAcre = inputs.customSeedCost ?? cropData.costs.seeds;
  const fertilizerCostPerAcre = inputs.customFertilizerCost ?? cropData.costs.fertilizer;
  const laborCostPerAcre = inputs.customLaborCost ?? cropData.costs.labor;
  const pestControlCostPerAcre = inputs.customPestControlCost ?? cropData.costs.pestControl;
  const otherCostPerAcre = inputs.customOtherCost ?? cropData.costs.other;

  // Land Lease Cost calculation
  const leaseCostTotal = inputs.landOwnership === 'Lease' ? (inputs.leaseCost || 0) : 0;
  const leaseCostPerAcre = leaseCostTotal / acreage;

  const totalCostPerAcre = seedCostPerAcre + fertilizerCostPerAcre + laborCostPerAcre + pestControlCostPerAcre + otherCostPerAcre + leaseCostPerAcre;
  const totalCost = totalCostPerAcre * acreage;

  // 2. Determine Revenue
  const yieldPerAcre = inputs.customYieldPerAcre ?? cropData.avgYieldPerAcre;
  const pricePerUnit = inputs.customPricePerUnit ?? cropData.avgPricePerUnit;

  const totalRevenuePerAcre = yieldPerAcre * pricePerUnit;
  const totalRevenue = totalRevenuePerAcre * acreage;

  // 3. Profit & ROI
  const netProfit = totalRevenue - totalCost;
  const profitPerAcre = netProfit / acreage;
  const roi = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;

  return {
    totalCost,
    totalRevenue,
    netProfit,
    roi,
    profitPerAcre,
    costBreakdown: {
      seeds: seedCostPerAcre * acreage,
      fertilizer: fertilizerCostPerAcre * acreage,
      labor: laborCostPerAcre * acreage,
      pestControl: pestControlCostPerAcre * acreage,
      lease: leaseCostTotal,
      other: otherCostPerAcre * acreage,
    }
  };
};
