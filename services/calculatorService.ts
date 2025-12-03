import { 
  AcquisitionModel, 
  CalculationResult, 
  FurnishingStandard, 
  UserInputs 
} from '../types';
import { 
  BASE_FURNISHING_COSTS, 
  FURNISHING_COST_MULTIPLIERS, 
  KENYA_REGIONS, 
  OPERATING_COSTS,
  DEFAULT_MORTGAGE_RATE
} from '../constants';

export const calculateROI = (inputs: UserInputs): CalculationResult => {
  const region = KENYA_REGIONS.find(r => r.id === inputs.regionId);
  if (!region) throw new Error("Invalid Region");

  const nightlyRate = inputs.customNightlyRate || region.avgNightlyRate[inputs.propertyType];
  const occupancy = inputs.customOccupancy !== undefined ? inputs.customOccupancy : region.avgOccupancy;
  
  // 1. Revenue
  const annualGrossRevenue = nightlyRate * 365 * occupancy;
  
  // 2. Initial Costs
  const furnishingBase = BASE_FURNISHING_COSTS[inputs.propertyType];
  const furnishingMultiplier = FURNISHING_COST_MULTIPLIERS[inputs.furnishingStandard];
  const furnishingCost = furnishingBase * furnishingMultiplier;

  let acquisitionCost = 0; // Down payment or Deposit
  let monthlyFixedCost = 0; // Mortgage or Rent

  if (inputs.acquisitionModel === AcquisitionModel.BUY) {
    const buyPrice = region.avgBuyPrice[inputs.propertyType];
    const downPaymentPct = (inputs.downPaymentPercent || 20) / 100;
    acquisitionCost = buyPrice * downPaymentPct;
    
    // Mortgage Calc
    const principal = buyPrice - acquisitionCost;
    const annualRate = (inputs.interestRate || DEFAULT_MORTGAGE_RATE) / 100;
    const termsMonths = (inputs.loanTermYears || 15) * 12;
    const monthlyRate = annualRate / 12;
    
    if (principal > 0) {
      monthlyFixedCost = principal * (monthlyRate * Math.pow(1 + monthlyRate, termsMonths)) / (Math.pow(1 + monthlyRate, termsMonths) - 1);
    }
  } else {
    // Sublease
    const monthlyRent = region.avgRent[inputs.propertyType];
    const depositMonths = inputs.monthsDeposit || 2;
    acquisitionCost = monthlyRent * depositMonths;
    monthlyFixedCost = monthlyRent;
  }

  // Legal & Closing estimates (Simplification)
  const closingCosts = inputs.acquisitionModel === AcquisitionModel.BUY ? 150000 : 10000; 
  const totalInitialInvestment = acquisitionCost + furnishingCost + closingCosts;

  // 3. Operating Expenses
  const managementFee = annualGrossRevenue * OPERATING_COSTS.MANAGEMENT_FEE_PCT;
  const platformFee = annualGrossRevenue * OPERATING_COSTS.PLATFORM_FEE_PCT;
  const maintenance = annualGrossRevenue * OPERATING_COSTS.MAINTENANCE_RESERVE_PCT;
  const utilities = OPERATING_COSTS.UTILITIES_BASE * 12; // Simplified
  const internet = 3500 * 12; // Zuku/Safaricom Home
  
  const annualOperatingExpenses = managementFee + platformFee + maintenance + utilities + internet + (monthlyFixedCost * 12);

  // 4. Net Income
  const netOperatingIncome = annualGrossRevenue - annualOperatingExpenses;
  const monthlyCashFlow = netOperatingIncome / 12;

  // 5. ROI Metrics
  const cashOnCashReturn = (netOperatingIncome / totalInitialInvestment) * 100;
  
  // Cap Rate (Only meaningful for Buy, based on full property value)
  let capRate = 0;
  if (inputs.acquisitionModel === AcquisitionModel.BUY) {
    const noiBeforeMortgage = annualGrossRevenue - (managementFee + platformFee + maintenance + utilities + internet);
    capRate = (noiBeforeMortgage / region.avgBuyPrice[inputs.propertyType]) * 100;
  }

  const paybackPeriodMonths = netOperatingIncome > 0 
    ? (totalInitialInvestment / (netOperatingIncome / 12)) 
    : 0;

  // 6. Projections for Chart
  const monthlyBreakdown = Array.from({ length: 36 }).map((_, i) => {
    const month = i + 1;
    // Simple linear projection without inflation for this demo
    return {
      month,
      cashFlow: monthlyCashFlow,
      cumulative: -totalInitialInvestment + (monthlyCashFlow * month),
    };
  });

  const expenseBreakdown = [
    { label: 'Fixed (Rent/Mortgage)', amount: monthlyFixedCost * 12 },
    { label: 'Management (15%)', amount: managementFee },
    { label: 'Platform Fees', amount: platformFee },
    { label: 'Utilities & WiFi', amount: utilities + internet },
    { label: 'Maintenance', amount: maintenance },
  ];

  return {
    initialInvestment: totalInitialInvestment,
    furnishingCost,
    annualRevenue: annualGrossRevenue,
    annualExpenses: annualOperatingExpenses,
    netOperatingIncome,
    cashOnCashReturn,
    capRate: inputs.acquisitionModel === AcquisitionModel.BUY ? capRate : undefined,
    paybackPeriodMonths,
    monthlyCashFlow,
    monthlyBreakdown,
    expenseBreakdown,
  };
};