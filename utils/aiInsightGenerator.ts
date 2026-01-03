import { CalculationResult, UserInputs, AcquisitionModel } from '../types';

export interface AiInsight {
    headline: string;
    sentiment: 'positive' | 'neutral' | 'caution';
    bulletPoints: {
        icon: 'trending-up' | 'wallet' | 'alert' | 'check' | 'lightbulb';
        text: string;
    }[];
}

export const generateAiInsight = (results: CalculationResult, inputs: UserInputs, regionName: string): AiInsight => {
    const isBuy = inputs.acquisitionModel === AcquisitionModel.BUY;
    const roi = results.cashOnCashReturn;
    const cashflow = results.monthlyCashFlow;
    const occupancy = inputs.customOccupancy !== undefined ? inputs.customOccupancy : 0.7; // Default assumption

    // 1. Determine Sentiment & Headline
    let sentiment: AiInsight['sentiment'] = 'neutral';
    let headline = `Analysis for ${inputs.propertyType} in ${regionName}`;

    if (cashflow < 0) {
        sentiment = 'caution';
        headline = `Caution: Negative Cash Flow Requested`;
    } else if (roi > 20) {
        sentiment = 'positive';
        headline = `High-Yield Opportunity Detected in ${regionName}`;
    } else if (roi > 10) {
        sentiment = 'positive';
        headline = `Solid Investment Case for ${inputs.propertyType}`;
    } else {
        sentiment = 'neutral';
        headline = `Moderate Returns for this ${inputs.propertyType}`;
    }

    // 2. Generate Bullet Points
    const bulletPoints: AiInsight['bulletPoints'] = [];

    // Insight 1: Cash Flow & ROI
    if (cashflow < 0) {
        bulletPoints.push({
            icon: 'alert',
            text: `Negative monthly cash flow of ${Math.abs(cashflow).toLocaleString()} KES. You will need to top up expenses.`
        });
    } else if (roi > 25) {
        bulletPoints.push({
            icon: 'trending-up',
            text: `Exceptional ${roi.toFixed(1)}% Cash-on-Cash Return. outperforms standard market averages.`
        });
    } else {
        bulletPoints.push({
            icon: 'wallet',
            text: `Generates ${Math.round(cashflow).toLocaleString()} KES in monthly net passive income.`
        });
    }

    // Insight 2: Strategy Specific
    if (isBuy) {
        const paybackYears = (results.paybackPeriodMonths / 12).toFixed(1);
        if (results.paybackPeriodMonths > 180) { // > 15 Years
            bulletPoints.push({
                icon: 'lightbulb',
                text: `Long payback period of ${paybackYears} years. Consider this a long-term equity play rather than a cash cow.`
            });
        } else {
            bulletPoints.push({
                icon: 'check',
                text: `Full capital recovery estimated in ${paybackYears} years via cash flow alone.`
            });
        }
    } else {
        // Rent-to-Rent
        const breakEvenMonths = Math.ceil(results.initialInvestment / (cashflow > 0 ? cashflow : 1));
        if (cashflow > 0) {
            bulletPoints.push({
                icon: 'check',
                text: `Short breakeven projected at just ${breakEvenMonths} months. Low capital risk.`
            });
        } else {
            bulletPoints.push({
                icon: 'alert',
                text: `At current rates, you may not recover your initial furnishing costs.`
            });
        }
    }

    // Insight 3: Occupancy & Market
    if (occupancy < 0.5) {
        bulletPoints.push({
            icon: 'alert',
            text: `Low occupancy assumption (${occupancy * 100}%) significantly impacts viability. Ensure marketing is strong.`
        });
    } else if (roi > 15 && occupancy > 0.75) {
        bulletPoints.push({
            icon: 'lightbulb',
            text: `High occupancy (${occupancy * 100}%) is driving these returns. Verify demand in ${regionName}.`
        });
    } else {
        bulletPoints.push({
            icon: 'lightbulb',
            text: `Strategy assumes stable ${occupancy * 100}% occupancy amidst ${regionName} market conditions.`
        });
    }

    return { headline, sentiment, bulletPoints };
};
