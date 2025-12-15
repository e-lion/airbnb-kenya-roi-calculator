import { UserInputs, AcquisitionModel } from '../types';
import { KENYA_REGIONS } from '../constants';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export interface MarketData {
    averagePrice: number;
    minPrice: number;
    maxPrice: number;
    sampleSize: number;
    location: string;
    type: string;
}

export const fetchMarketData = async (
    inputs: UserInputs
): Promise<MarketData | null> => {
    // Extract location. id is like 'nbo-kilimani' -> 'kilimani'
    // This matches how the scraper stores data (e.g. 'westlands')
    const regionId = inputs.regionId.split('-')[1] || inputs.regionId;
    const type = inputs.acquisitionModel === AcquisitionModel.BUY ? 'sale' : 'rent';

    // Map property type to bedrooms for filtering
    let bedrooms = 0;
    if (inputs.propertyType.includes('1')) bedrooms = 1;
    if (inputs.propertyType.includes('2')) bedrooms = 2;
    if (inputs.propertyType.includes('3')) bedrooms = 3;
    // Studio remains 0

    try {
        // Try to fetch from API first
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout

        const url = `${API_BASE_URL}/api/market-data?type=${type}&location=${regionId}&bedrooms=${bedrooms}`;
        // Common pattern: logic to actually fetch
        // For this demo, let's default to generating from our CONSTANTS to ensure "Smart" behavior always works
        console.log(`Fetching market data: ${url} (Beds: ${bedrooms})`);
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (response.ok) {
            return await response.json();
        }

        console.warn('Market data fetch failed status:', response.status);
        throw new Error("API fetch failed");

    } catch (error) {
        console.error('Market fetch error:', error);
        return null;
    }
};
