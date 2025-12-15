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
  STARTUP_COSTS,
  OPERATING_CONSTANTS,
  DEFAULT_MORTGAGE_RATE
} from '../constants';

export const calculateROI = (inputs: UserInputs): CalculationResult => {
  const region = KENYA_REGIONS.find(r => r.id === inputs.regionId);
  if (!region) throw new Error("Invalid Region");

  const nightlyRate = inputs.customNightlyRate || region.avgNightlyRate[inputs.propertyType];
  const occupancy = inputs.customOccupancy !== undefined ? inputs.customOccupancy : region.avgOccupancy;

  // ----------------------------------------------------
  // 1. REVENUE
  // ----------------------------------------------------
  const annualGrossRevenue = nightlyRate * 365 * occupancy;
  const monthlyRevenue = annualGrossRevenue / 12;

  // ----------------------------------------------------
  // 2. INITIAL INVESTMENT (Startup Capital)
  // ----------------------------------------------------

  // A. Furnishing
  const furnishingBase = BASE_FURNISHING_COSTS[inputs.propertyType];
  const furnishingMultiplier = FURNISHING_COST_MULTIPLIERS[inputs.furnishingStandard];
  const furnishingCost = inputs.customFurnishingCost !== undefined
    ? inputs.customFurnishingCost
    : furnishingBase * furnishingMultiplier;

  // B. Acquisition Costs (Deposits/Downpayment)
  let acquisitionCost = 0;
  let depositRounded = 0;
  let firstMonthRent = 0;

  // C. Other Starup Costs
  let legalAdmin = 0;
  const utilityDeposits = STARTUP_COSTS.UTILITY_DEPOSIT;
  const fixtures = STARTUP_COSTS.FIXTURES_AND_FITTINGS;

  let monthlyFixedCost = 0; // Mortgage or Rent

  if (inputs.acquisitionModel === AcquisitionModel.BUY) {
    const buyPrice = inputs.customPropertyPrice || region.avgBuyPrice[inputs.propertyType];
    const downPaymentPct = (inputs.downPaymentPercent || 20) / 100;

    acquisitionCost = buyPrice * downPaymentPct; // Downpayment
    depositRounded = acquisitionCost; // Reusing field for downpayment display
    legalAdmin = 150000; // Est. Closing costs

    // Mortgage Calc
    const principal = buyPrice - acquisitionCost;
    const annualRate = (inputs.interestRate || DEFAULT_MORTGAGE_RATE) / 100;
    const termsMonths = (inputs.loanTermYears || 15) * 12;
    const monthlyRate = annualRate / 12;

    if (principal > 0) {
      monthlyFixedCost = principal * (monthlyRate * Math.pow(1 + monthlyRate, termsMonths)) / (Math.pow(1 + monthlyRate, termsMonths) - 1);
    }
  } else {
    // RENTAL ARBITRAGE
    const monthlyRent = inputs.customMonthlyRent || region.avgRent[inputs.propertyType];

    // 2 Months Deposit
    depositRounded = monthlyRent * STARTUP_COSTS.DEPOSIT_MONTHS;
    // 1 Month Advance Rent
    firstMonthRent = monthlyRent * STARTUP_COSTS.ADVANCE_RENT_MONTHS;

    acquisitionCost = depositRounded + firstMonthRent;
    legalAdmin = STARTUP_COSTS.LEGAL_ADMIN_FEE;
    monthlyFixedCost = monthlyRent;
  }

  const totalInitialInvestment = acquisitionCost + furnishingCost + legalAdmin + utilityDeposits + fixtures;

  // ----------------------------------------------------
  // 3. OPERATING EXPENSES (Monthly)
  // ----------------------------------------------------

  // Cleaning: Driven by OCCUPANCY (More guests = more cleaning)
  // Avg 30 days * occupancy * rate
  const daysOccupied = 30.5 * occupancy;

  // Smart Default for Cleaning per day if not custom
  let defaultCleaningPerDay = OPERATING_CONSTANTS.CLEANING_PER_DAY;
  if (inputs.propertyType === 'Studio') defaultCleaningPerDay = 250;
  if (inputs.propertyType === '3 Bedroom') defaultCleaningPerDay = 500;

  const cleaningRate = inputs.customCleaningCost !== undefined
    ? inputs.customCleaningCost
    : defaultCleaningPerDay;

  const monthlyCleaning = daysOccupied * cleaningRate;

  // Utilities
  const monthlyInternet = inputs.customWifiCost !== undefined
    ? inputs.customWifiCost
    : OPERATING_CONSTANTS.INTERNET_MONTHLY;

  const monthlyElectricity = inputs.customElectricityCost !== undefined
    ? inputs.customElectricityCost
    : OPERATING_CONSTANTS.ELECTRICITY_MONTHLY[inputs.propertyType];

  const monthlyWater = inputs.customWaterCost !== undefined
    ? inputs.customWaterCost
    : OPERATING_CONSTANTS.WATER_MONTHLY[inputs.propertyType];

  const monthlyDstv = inputs.customDstvCost !== undefined
    ? inputs.customDstvCost
    : 0; // Optional by default

  const monthlyUtilitesTotal = monthlyInternet + monthlyElectricity + monthlyWater + monthlyDstv;

  // Management (of Gross Revenue)
  const mgmtRate = inputs.managementFeePercent !== undefined
    ? inputs.managementFeePercent / 100
    : OPERATING_COSTS.MANAGEMENT_FEE_PCT;

  const monthlyManagement = monthlyRevenue * mgmtRate;

  // Platform Fees (Airbnb)
  const monthlyPlatformFees = monthlyRevenue * OPERATING_COSTS.PLATFORM_FEE_PCT;

  // Maintenance Reserve
  const monthlyMaintenance = monthlyRevenue * OPERATING_COSTS.MAINTENANCE_RESERVE_PCT;

  // Expenses Object
  const totalMonthlyFixed = monthlyFixedCost + monthlyCleaning + monthlyUtilitesTotal + monthlyManagement + monthlyPlatformFees + monthlyMaintenance;
  const annualOperatingExpenses = totalMonthlyFixed * 12;

  // ----------------------------------------------------
  // 4. METRICS / ROI
  // ----------------------------------------------------
  const netOperatingIncome = annualGrossRevenue - annualOperatingExpenses;
  const monthlyCashFlow = netOperatingIncome / 12;

  const cashOnCashReturn = totalInitialInvestment > 0 ? (netOperatingIncome / totalInitialInvestment) * 100 : 0;

  const paybackPeriodMonths = monthlyCashFlow > 0 ? (totalInitialInvestment / monthlyCashFlow) : 0;

  // Cap Rate (Buy only)
  let capRate = 0;
  if (inputs.acquisitionModel === AcquisitionModel.BUY) {
    // NOI for Cap Rate usually excludes financing costs (mortgage), but includes all opex
    // Here we calculated NOI *after* Mortgage. Let's adjust for standard Cap Rate def (Pre-debt).
    const annualDebtService = monthlyFixedCost * 12;
    const noiPreDebt = netOperatingIncome + annualDebtService;
    capRate = (noiPreDebt / region.avgBuyPrice[inputs.propertyType]) * 100;
  }

  // ----------------------------------------------------
  // 5. BREAKDOWNS
  // ----------------------------------------------------
  // Determine projection length based on payback period
  const minMonths = 36; // Minimum 3 years
  const maxMonths = 180; // Maximum 15 years

  let projectionMonths = minMonths;
  if (paybackPeriodMonths > 24) {
    // If payback is long, show the payback point + 1 extra year for context
    projectionMonths = Math.ceil((paybackPeriodMonths + 12) / 12) * 12;
  }
  // Clamp between min and max
  projectionMonths = Math.min(Math.max(projectionMonths, minMonths), maxMonths);

  const monthlyBreakdown = Array.from({ length: projectionMonths }).map((_, i) => {
    const month = i + 1;
    return {
      month,
      cumulative: -totalInitialInvestment + (monthlyCashFlow * month),
    };
  });

  const expenseBreakdown = [
    { label: inputs.acquisitionModel === AcquisitionModel.BUY ? 'Mortgage' : 'Rent', amount: monthlyFixedCost * 12 },
    { label: 'Cleaning', amount: monthlyCleaning * 12 },
    { label: 'Management', amount: monthlyManagement * 12 },
    { label: 'Platform Fees', amount: monthlyPlatformFees * 12 },
    { label: 'Electricity', amount: monthlyElectricity * 12 },
    { label: 'Water', amount: monthlyWater * 12 },
    { label: 'Internet / WiFi', amount: monthlyInternet * 12 },
    { label: 'DStv / Canal+', amount: monthlyDstv * 12 },
    { label: 'Maintenance', amount: monthlyMaintenance * 12 },
  ].filter(i => i.amount > 0);

  return {
    initialInvestment: totalInitialInvestment,
    furnishingCost,
    monthlyRevenue,
    annualRevenue: annualGrossRevenue,
    monthlyFixedCost,
    monthlyCashFlow,
    annualExpenses: annualOperatingExpenses,
    netOperatingIncome,
    capRate: inputs.acquisitionModel === AcquisitionModel.BUY ? capRate : undefined,
    cashOnCashReturn,
    paybackPeriodMonths,
    monthlyBreakdown,
    expenseBreakdown,

    // New Granular Data
    startupCosts: {
      furnishing: furnishingCost,
      depositRounded, // or downpayment
      firstMonthRent, // 0 if buy
      legalAdmin,
      utilityDeposits,
      fixtures,
      total: totalInitialInvestment
    },
    monthlyOpex: {
      rent: monthlyFixedCost,
      cleaning: monthlyCleaning,
      internet: monthlyInternet,
      electricity: monthlyElectricity,
      water: monthlyWater,
      dstv: monthlyDstv,
      management: monthlyManagement,
      platform: monthlyPlatformFees,
      maintenance: monthlyMaintenance
    }
  };
};