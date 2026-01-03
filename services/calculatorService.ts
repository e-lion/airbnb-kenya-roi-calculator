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

  let monthlyRent = 0;
  let monthlyMortgage = 0;

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
      monthlyMortgage = principal * (monthlyRate * Math.pow(1 + monthlyRate, termsMonths)) / (Math.pow(1 + monthlyRate, termsMonths) - 1);
    }
  } else {
    // RENTAL ARBITRAGE
    const monthlyRentValue = inputs.customMonthlyRent || region.avgRent[inputs.propertyType];
    monthlyRent = monthlyRentValue;

    // 2 Months Deposit
    depositRounded = monthlyRentValue * STARTUP_COSTS.DEPOSIT_MONTHS;
    // 1 Month Advance Rent
    firstMonthRent = monthlyRentValue * STARTUP_COSTS.ADVANCE_RENT_MONTHS;

    acquisitionCost = depositRounded + firstMonthRent;
    legalAdmin = STARTUP_COSTS.LEGAL_ADMIN_FEE;
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

  const monthlyNetflix = inputs.customNetflixCost !== undefined
    ? inputs.customNetflixCost
    : 0; // Optional by default

  const monthlyUtilitesTotal = monthlyInternet + monthlyElectricity + monthlyWater + monthlyNetflix;

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
  // Note: For BUY logic, Mortgage is Debt Service, NOT Opex.
  // For RENT logic, Rent IS Opex.
  const totalMonthlyOpex = monthlyRent + monthlyCleaning + monthlyUtilitesTotal + monthlyManagement + monthlyPlatformFees + monthlyMaintenance;
  const annualOperatingExpenses = totalMonthlyOpex * 12;

  // ----------------------------------------------------
  // 4. METRICS / ROI
  // ----------------------------------------------------
  const netOperatingIncome = annualGrossRevenue - annualOperatingExpenses;

  // Cash Flow = NOI - Debt Service
  const monthlyCashFlow = (netOperatingIncome / 12) - monthlyMortgage;

  const cashOnCashReturn = totalInitialInvestment > 0 ? ((monthlyCashFlow * 12) / totalInitialInvestment) * 100 : 0;

  const paybackPeriodMonths = monthlyCashFlow > 0 ? (totalInitialInvestment / monthlyCashFlow) : 0;

  // Cap Rate (Buy only)
  let capRate = 0;
  if (inputs.acquisitionModel === AcquisitionModel.BUY) {
    // Cap Rate = NOI / Property Value
    capRate = (netOperatingIncome / region.avgBuyPrice[inputs.propertyType]) * 100;
  }

  // ----------------------------------------------------
  // 5. BREAKDOWNS
  // ----------------------------------------------------
  // ----------------------------------------------------
  // 5. BREAKDOWNS (SIMULATION)
  // ----------------------------------------------------
  const minMonths = 36; // Min 3 Years
  const maxMonths = 360; // Max 30 Years (to capture long mortgage payoff)

  let currentCumulative = -totalInitialInvestment;
  let computedPaybackMonths = 0;
  let foundPayback = false;

  // Terms for loop
  const mortgageTermMonths = (inputs.loanTermYears || 15) * 12;

  // We simply simulate up to maxMonths to find payback and show the curve
  const monthlyBreakdown: { month: number; cumulative: number }[] = [];

  for (let i = 1; i <= maxMonths; i++) {
    // Current Period Analysis
    const hasMortgage = inputs.acquisitionModel === AcquisitionModel.BUY && i <= mortgageTermMonths;
    // If mortgage is done, cashflow increases by the monthlyMortgage amount (since it's no longer paid)
    // Current logic: monthlyCashFlow = (NOI/12) - monthlyMortgage
    // If mortgage is gone: newCashFlow = (NOI/12) - 0
    let periodCashFlow = monthlyCashFlow;

    // ADJUSTMENT: The base `monthlyCashFlow` variable calculated above includes the mortgage deduction.
    // If the mortgage is finished (i > mortgageTermMonths), we ADD it back to cash flow.
    if (inputs.acquisitionModel === AcquisitionModel.BUY && i > mortgageTermMonths) {
      periodCashFlow += monthlyMortgage;
    }

    currentCumulative += periodCashFlow;

    // Record Payback
    if (!foundPayback && currentCumulative >= 0) {
      computedPaybackMonths = i;
      foundPayback = true;
    }

    // Optimization: Don't store 360 points for the chart if not needed? 
    // Actually, Recharts handles 360 points fine. Let's just store all for accuracy.
    monthlyBreakdown.push({
      month: i,
      cumulative: currentCumulative
    });
  }

  // Determine how much of the breakdown to actually return/display
  // If payback is short (e.g. 18 months), showing 360 months is overkill and flattens the chart.
  // We want to show: Max(Payback + 2 Years, MortgageTerm + 2 Years, 5 Years)
  // But capped at maxMonths.
  let displayMonths = 60; // Default 5 years
  if (foundPayback) {
    displayMonths = Math.max(displayMonths, computedPaybackMonths + 24);
  }
  if (inputs.acquisitionModel === AcquisitionModel.BUY) {
    displayMonths = Math.max(displayMonths, mortgageTermMonths + 24);
  }
  displayMonths = Math.min(displayMonths, maxMonths);

  // Slice the breakdown for the chart
  const chartData = monthlyBreakdown.slice(0, displayMonths);

  const finalPaybackPeriod = foundPayback ? computedPaybackMonths : 0; // 0 implies "Never" or ">30y" in UI logic

  const expenseBreakdown = [
    { label: 'Rent', amount: monthlyRent * 12 },
    { label: 'Mortgage (Debt)', amount: monthlyMortgage * 12 },
    { label: 'Cleaning', amount: monthlyCleaning * 12 },
    { label: 'Management', amount: monthlyManagement * 12 },
    { label: 'Platform Fees', amount: monthlyPlatformFees * 12 },
    { label: 'Electricity', amount: monthlyElectricity * 12 },
    { label: 'Water', amount: monthlyWater * 12 },
    { label: 'Internet / WiFi', amount: monthlyInternet * 12 },
    { label: 'Netflix / Ent', amount: monthlyNetflix * 12 },
    { label: 'Maintenance', amount: monthlyMaintenance * 12 },
  ].filter(i => i.amount > 0);

  return {
    initialInvestment: totalInitialInvestment,
    furnishingCost,
    monthlyRevenue,
    annualRevenue: annualGrossRevenue,
    monthlyFixedCost: monthlyRent + monthlyMortgage, // Kept for legacy compatibility if needed, but splits are better
    monthlyCashFlow,
    annualExpenses: annualOperatingExpenses,
    netOperatingIncome,
    capRate: inputs.acquisitionModel === AcquisitionModel.BUY ? capRate : undefined,
    cashOnCashReturn,
    paybackPeriodMonths: finalPaybackPeriod,
    monthlyBreakdown: chartData,
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
      rent: monthlyRent,
      mortgage: monthlyMortgage,
      cleaning: monthlyCleaning,
      internet: monthlyInternet,
      electricity: monthlyElectricity,
      water: monthlyWater,
      netflix: monthlyNetflix,
      management: monthlyManagement,
      platform: monthlyPlatformFees,
      maintenance: monthlyMaintenance
    }
  };
};