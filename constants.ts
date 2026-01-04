import { PropertyType, RegionData } from './types';

export const KENYA_REGIONS: RegionData[] = [
  {
    id: 'nbo-kilimani',
    name: 'Kilimani / Kileleshwa',
    county: 'Nairobi',
    demandScore: 9.2,
    avgOccupancy: 0.72,
    avgNightlyRate: {
      [PropertyType.STUDIO]: 3500,
      [PropertyType.ONE_BEDROOM]: 5500,
      [PropertyType.TWO_BEDROOM]: 8500,
      [PropertyType.THREE_BEDROOM]: 12000,
    },
    avgRent: {
      [PropertyType.STUDIO]: 35000,
      [PropertyType.ONE_BEDROOM]: 60000,
      [PropertyType.TWO_BEDROOM]: 85000,
      [PropertyType.THREE_BEDROOM]: 120000,
    },
    avgBuyPrice: {
      [PropertyType.STUDIO]: 4500000,
      [PropertyType.ONE_BEDROOM]: 7500000,
      [PropertyType.TWO_BEDROOM]: 13000000,
      [PropertyType.THREE_BEDROOM]: 18000000,
    },
  },
  {
    id: 'nbo-westlands',
    name: 'Westlands / Parklands',
    county: 'Nairobi',
    demandScore: 8.8,
    avgOccupancy: 0.68,
    avgNightlyRate: {
      [PropertyType.STUDIO]: 4000,
      [PropertyType.ONE_BEDROOM]: 6500,
      [PropertyType.TWO_BEDROOM]: 10000,
      [PropertyType.THREE_BEDROOM]: 15000,
    },
    avgRent: {
      [PropertyType.STUDIO]: 45000,
      [PropertyType.ONE_BEDROOM]: 75000,
      [PropertyType.TWO_BEDROOM]: 110000,
      [PropertyType.THREE_BEDROOM]: 150000,
    },
    avgBuyPrice: {
      [PropertyType.STUDIO]: 5500000,
      [PropertyType.ONE_BEDROOM]: 9500000,
      [PropertyType.TWO_BEDROOM]: 16000000,
      [PropertyType.THREE_BEDROOM]: 24000000,
    },
  },
  {
    id: 'msa-nyali',
    name: 'Nyali / Bamburi',
    county: 'Mombasa',
    demandScore: 8.5,
    avgOccupancy: 0.55, // Seasonal
    avgNightlyRate: {
      [PropertyType.STUDIO]: 3000,
      [PropertyType.ONE_BEDROOM]: 5000,
      [PropertyType.TWO_BEDROOM]: 9000,
      [PropertyType.THREE_BEDROOM]: 14000,
    },
    avgRent: {
      [PropertyType.STUDIO]: 25000,
      [PropertyType.ONE_BEDROOM]: 40000,
      [PropertyType.TWO_BEDROOM]: 65000,
      [PropertyType.THREE_BEDROOM]: 90000,
    },
    avgBuyPrice: {
      [PropertyType.STUDIO]: 3500000,
      [PropertyType.ONE_BEDROOM]: 6000000,
      [PropertyType.TWO_BEDROOM]: 11000000,
      [PropertyType.THREE_BEDROOM]: 16000000,
    },
  },
];

export const FURNISHING_COST_MULTIPLIERS = {
  Budget: 0.7,
  'Mid-Range': 1.0,
  Premium: 1.6,
};

// Base furnishing costs for Mid-Range (KES)
export const BASE_FURNISHING_COSTS = {
  [PropertyType.STUDIO]: 250000,
  [PropertyType.ONE_BEDROOM]: 400000,
  [PropertyType.TWO_BEDROOM]: 650000,
  [PropertyType.THREE_BEDROOM]: 900000,
};

export const OPERATING_COSTS = {
  MANAGEMENT_FEE_PCT: 0, // 0% Self-Manage Assumed (was 0.15)
  PLATFORM_FEE_PCT: 0.03, // 3% Airbnb
  MAINTENANCE_RESERVE_PCT: 0, // 0% (was 0.05)
};

export const STARTUP_COSTS = {
  DEPOSIT_MONTHS: 2,
  ADVANCE_RENT_MONTHS: 1,
  LEGAL_ADMIN_FEE: 5000,
  UTILITY_DEPOSIT: 7500, // Water/Elec deposit
  FIXTURES_AND_FITTINGS: 20000, // WiFi install, small decor, locks
};

export const OPERATING_CONSTANTS = {
  CLEANING_PER_DAY: 750, // Cleaner daily rate
  INTERNET_MONTHLY: 3000,
  ELECTRICITY_MONTHLY: {
    [PropertyType.STUDIO]: 2500,
    [PropertyType.ONE_BEDROOM]: 3500,
    [PropertyType.TWO_BEDROOM]: 5000,
    [PropertyType.THREE_BEDROOM]: 7000,
  },
  WATER_MONTHLY: {
    [PropertyType.STUDIO]: 500,
    [PropertyType.ONE_BEDROOM]: 1000,
    [PropertyType.TWO_BEDROOM]: 1500,
    [PropertyType.THREE_BEDROOM]: 2000,
  },
  DSTV_MONTHLY: 3000, // Premium Package approx
};

export const ISP_PROVIDERS = {
  'nbo-westlands': ['Safaricom Home Fibre', 'Zuku Fiber', 'JTL Faiba'],
  'nbo-kilimani': ['Safaricom Home Fibre', 'Zuku Fiber', 'JTL Faiba'],
  'msa-nyali': ['Safaricom Home Fibre', 'Zuku Fiber'],
};

export const DEFAULT_MORTGAGE_RATE = 14.5; // Current Kenya Avg
export const PAYMENT_AMOUNT_KES = Number(import.meta.env.VITE_PAYMENT_AMOUNT) || 99;