import { CalculationResult, UserInputs, AcquisitionModel, PropertyType } from '../types';

export interface AiInsight {
    headline: string;
    sentiment: 'positive' | 'neutral' | 'caution';
    bulletPoints: {
        icon: 'trending-up' | 'wallet' | 'alert' | 'check' | 'lightbulb' | 'target' | 'zap';
        text: string;
    }[];
}

export const generateAiInsight = (results: CalculationResult, inputs: UserInputs, regionName: string): AiInsight => {
    const isBuy = inputs.acquisitionModel === AcquisitionModel.BUY;
    const roi = results.cashOnCashReturn;
    const cashflow = results.monthlyCashFlow;
    const occupancy = inputs.customOccupancy !== undefined ? inputs.customOccupancy : 0.7;
    const monthlyRevenue = results.monthlyRevenue;
    const totalMonthlyExpenes = results.monthlyOpex.rent + results.monthlyOpex.mortgage +
        results.monthlyOpex.cleaning + results.monthlyOpex.internet + results.monthlyOpex.electricity +
        results.monthlyOpex.water + results.monthlyOpex.netflix + results.monthlyOpex.management +
        results.monthlyOpex.platform + results.monthlyOpex.maintenance;

    // 1. Determine Sentiment & Headline
    let sentiment: AiInsight['sentiment'] = 'neutral';
    let headline = `Strategy Analysis for ${inputs.propertyType}`;

    if (cashflow < 0) {
        sentiment = 'caution';
        headline = `Optimization Needed: Negative Cash Flow`;
    } else if (roi > 25) {
        sentiment = 'positive';
        headline = `Top-Tier Strategy Detected in ${regionName}`;
    } else if (roi > 12) {
        sentiment = 'positive';
        headline = `Solid Performing ${inputs.propertyType} Strategy`;
    } else {
        sentiment = 'neutral';
        headline = `Moderate Growth Potential in ${regionName}`;
    }

    // 2. Generate Smart Bullet Points
    const bulletPoints: AiInsight['bulletPoints'] = [];

    // --- CORE FINANCIALS ---
    if (cashflow < 0) {
        bulletPoints.push({
            icon: 'alert',
            text: `Critical: Your monthly expenses exceed revenue by KES ${Math.abs(cashflow).toLocaleString()}. prioritize reducing fixed costs (Rent/Mortgage) or increasing occupancy.`
        });
    } else if (roi > 20) {
        bulletPoints.push({
            icon: 'trending-up',
            text: `High Performance: ${roi.toFixed(1)}% Cash-on-Cash Return outperforms most Nairobi real estate assets (avg 8-12%).`
        });
    }

    // --- RULE 1: EFFICIENCY AUDIT (Expense Ratios) ---
    const expenseRatio = totalMonthlyExpenes / monthlyRevenue;
    const cleaningImpact = results.monthlyOpex.cleaning / totalMonthlyExpenes;
    // const managementImpact = results.monthlyOpex.management / totalMonthlyExpenes;

    // Only flag high expense ratio for Buy model. Rent-to-Rent naturally has high opex due to rent.
    if (isBuy && expenseRatio > 0.6 && cashflow > 0) {
        bulletPoints.push({
            icon: 'wallet',
            text: `High Operating Costs: You're spending ${(expenseRatio * 100).toFixed(0)}% of revenue on expenses. Target <45% for healthy margins.`
        });
    }

    if (cleaningImpact > 0.15) {
        bulletPoints.push({
            icon: 'zap',
            text: `Cost Save: Cleaning is ${(cleaningImpact * 100).toFixed(0)}% of your expenses. Negotiate a flat monthly rate with a cleaner or charge a higher guest cleaning fee.`
        });
    }

    if (inputs.includeManagementFees) {
        bulletPoints.push({
            icon: 'lightbulb',
            text: `Management Opportunity: Self-managing with smart locks & automated messages could save you KES ${results.monthlyOpex.management.toLocaleString()}/mo.`
        });
    }

    // --- RULE 2: AMENITY OPTIMIZATION ---
    if (!inputs.includeNetflix) {
        bulletPoints.push({
            icon: 'target',
            text: `Revenue Boost: Add Netflix/Entertainment (~KES 1,500/mo). It's a low-cost amenity that significantly increases perceived value.`
        });
    }

    if (!inputs.includeInternet) {
        bulletPoints.push({
            icon: 'alert',
            text: `Vital Upgrade: Fast WiFi is required for 98% of guests. Prioritize this immediately to avoid bad reviews.`
        });
    }

    // --- RULE 3: LISTING STRATEGY (Based on Unit Type) ---
    if (inputs.propertyType === PropertyType.STUDIO || inputs.propertyType === PropertyType.ONE_BEDROOM) {
        bulletPoints.push({
            icon: 'target',
            text: `Target Audience: Setup a dedicated workspace (desk + chair). Business travelers are the most lucrative demographic for ${inputs.propertyType}s.`
        });
    } else if (inputs.propertyType === PropertyType.TWO_BEDROOM || inputs.propertyType === PropertyType.THREE_BEDROOM) {
        bulletPoints.push({
            icon: 'target',
            text: `Family Appeal: Mention 'Child-friendly' or 'Secure compound' in your title. Long-stay families prefer these units.`
        });
    }

    // --- RULE 4: OCCUPANCY STRATEGY ---
    if (occupancy < 0.6) {
        bulletPoints.push({
            icon: 'lightbulb',
            text: `Occupancy Alert: At ${(occupancy * 100).toFixed(0)}%, you are below market average. Use professional photography and 'Instant Book' to boost visibility.`
        });
    } else if (occupancy > 0.85) {
        bulletPoints.push({
            icon: 'trending-up',
            text: `Pricing Power: High occupancy (${(occupancy * 100).toFixed(0)}%) suggests your rates are too low. Try increasing nightly rates by 10-15%.`
        });
    }

    // Limit to top 4 most impactful insights (excluding potential duplicate core financial insight if we have many others)
    // We want a mix of Financial + Strategic
    return { headline, sentiment, bulletPoints: bulletPoints.slice(0, 5) };
};

