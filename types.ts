export enum PropertyType {
  STUDIO = 'Studio',
  ONE_BEDROOM = '1 Bedroom',
  TWO_BEDROOM = '2 Bedroom',
  THREE_BEDROOM = '3 Bedroom',
}

export enum AcquisitionModel {
  BUY = 'Buy',
  SUBLEASE = 'Sublease (Rent-to-Rent)',
}

export enum FurnishingStandard {
  BUDGET = 'Budget',
  MID_RANGE = 'Mid-Range',
  PREMIUM = 'Premium',
}

export interface RegionData {
  id: string;
  name: string;
  county: string;
  demandScore: number; // 1-10
  avgOccupancy: number; // 0.0 - 1.0
  avgNightlyRate: Record<PropertyType, number>;
  avgRent: Record<PropertyType, number>;
  avgBuyPrice: Record<PropertyType, number>;
}

export interface FurnishingItem {
  name: string;
  qty: number;
  unitPrice: number;
}

export interface UserInputs {
  regionId: string;
  propertyType: PropertyType;
  acquisitionModel: AcquisitionModel;
  furnishingStandard: FurnishingStandard;
  customOccupancy?: number;
  customNightlyRate?: number;
  // Buy specific
  downPaymentPercent?: number;
  interestRate?: number;
  loanTermYears?: number;
  // Sublease specific
  monthsDeposit?: number;
}

export interface CalculationResult {
  initialInvestment: number;
  furnishingCost: number;
  annualRevenue: number;
  annualExpenses: number;
  netOperatingIncome: number;
  cashOnCashReturn: number; // Percentage
  capRate?: number; // Only for Buy
  paybackPeriodMonths: number;
  monthlyCashFlow: number;
  monthlyBreakdown: {
    month: number;
    cashFlow: number;
    cumulative: number;
  }[];
  expenseBreakdown: {
    label: string;
    amount: number;
  }[];
}