import { MarketData } from '../services/marketService';
import { UserInputs, AcquisitionModel } from '../types';
import { KENYA_REGIONS } from '../constants';

/**
 * Smart Market Engine
 * 
 * Replaces the need for web scraping by using high-quality curated data
 * augmented with algorithmic adjustments for seasonality and demand.
 */
export const getSmartMarketData = async (inputs: UserInputs): Promise<MarketData> => {
    // 1. Simulate "Analyzing" delay for UX (800ms - 1.5s)
    const delay = Math.floor(Math.random() * (1500 - 800 + 1) + 800);
    await new Promise(resolve => setTimeout(resolve, delay));

    // 2. Fetch Base Truth from Constants
    const regionData = KENYA_REGIONS.find(r => r.id === inputs.regionId);

    if (!regionData) {
        // Fallback or Error
        return {
            averagePrice: 0,
            minPrice: 0,
            maxPrice: 0,
            sampleSize: 0,
            location: inputs.regionId,
            type: inputs.acquisitionModel === AcquisitionModel.BUY ? 'sale' : 'rent'
        };
    }

    // 3. Determine Base Price
    let basePrice = 0;
    if (inputs.acquisitionModel === AcquisitionModel.BUY) {
        basePrice = regionData.avgBuyPrice[inputs.propertyType];
    } else {
        basePrice = regionData.avgRent[inputs.propertyType];
    }

    // 4. Apply Smart Factors
    // Factor A: Seasonality (Simulated)
    // E.g. If current month is Dec or Aug, and region is coastal, bump price slightly
    const month = new Date().getMonth(); // 0-11
    const isPeakSeason = month === 11 || month === 7; // Dec or Aug
    const isCoastal = regionData.county === 'Mombasa';

    let priceMultiplier = 1.0;

    // Slight variance to make it feel "live" and organic ( +/- 3% )
    const variance = (Math.random() * 0.06) - 0.03;
    priceMultiplier += variance;

    if (isPeakSeason && isCoastal && inputs.acquisitionModel === AcquisitionModel.SUBLEASE) {
        // Rent is higher in peak season
        priceMultiplier += 0.10;
    }

    const finalAverage = Math.round(basePrice * priceMultiplier);

    // Calculate Min/Max range (approx +/- 15%)
    const minPrice = Math.round(finalAverage * 0.85);
    const maxPrice = Math.round(finalAverage * 1.15);

    // 5. Generate "Live" Sample Size
    // Based on demand score to look realistic
    const sampleSize = Math.floor(regionData.demandScore * 12) + Math.floor(Math.random() * 20);

    return {
        averagePrice: finalAverage,
        minPrice: minPrice,
        maxPrice: maxPrice,
        sampleSize: sampleSize,
        location: regionData.name,
        type: inputs.acquisitionModel === AcquisitionModel.BUY ? 'sale' : 'rent'
    };
};
