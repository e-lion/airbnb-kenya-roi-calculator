import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CalculationResult, UserInputs, AcquisitionModel } from '../types';
import { KENYA_REGIONS } from '../constants';

const formatMoney = (val: number) => {
    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        maximumFractionDigits: 0,
    }).format(val);
};

export const generatePDF = (results: CalculationResult, inputs: UserInputs) => {
    const doc = new jsPDF();
    const regionName = KENYA_REGIONS.find(r => r.id === inputs.regionId)?.name || inputs.regionId;
    const dateStr = new Date().toLocaleDateString();

    // --- HEADER ---
    doc.setFillColor(6, 95, 70); // Emerald 800
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Airbnb Investment Strategy Report', 14, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Region: ${regionName} | Generated: ${dateStr}`, 14, 30);
    doc.text('Standard: KenyanHustle ROI Calculator', 200, 30, { align: 'right' });

    // --- EXECUTIVE SUMMARY ---
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Executive Summary', 14, 55);

    const summaryData = [
        ['Investment Strategy', inputs.acquisitionModel === AcquisitionModel.BUY ? 'Buy & Host' : 'Rent-to-Rent'],
        ['Property Type', inputs.propertyType],
        ['Target Occupancy', `${(inputs.customOccupancy !== undefined ? inputs.customOccupancy * 100 : 70).toFixed(0)}%`],
        ['Nightly Rate', formatMoney(inputs.customNightlyRate || 0)],
    ];

    autoTable(doc, {
        startY: 60,
        head: [],
        body: summaryData,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } },
    });

    // --- KEY PERFORMANCE INDICATORS ---
    const kpiStartY = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Key Performance Indicators', 14, kpiStartY);

    const kpiData = [
        ['Total Initial Capital', formatMoney(results.initialInvestment)],
        ['Monthly Net Cash Flow', formatMoney(results.monthlyCashFlow)],
        ['Cash on Cash Return', `${results.cashOnCashReturn.toFixed(1)}%`],
        ['Payback Period', `${(results.paybackPeriodMonths / 12).toFixed(1)} Years`],
        ['Projected Annual Revenue', formatMoney(results.annualRevenue)],
        ['Net Operating Income (NOI)', formatMoney(results.netOperatingIncome)],
    ];

    autoTable(doc, {
        startY: kpiStartY + 5,
        head: [['Metric', 'Value']],
        body: kpiData,
        theme: 'grid',
        headStyles: { fillColor: [6, 95, 70], textColor: 255 },
        styles: { fontSize: 11, cellPadding: 4 },
        columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'right' } },
    });

    // --- STARTUP COSTS BREAKDOWN ---
    const startupStartY = (doc as any).lastAutoTable.finalY + 15;

    doc.setFontSize(14);
    doc.text('Startup Costs Breakdown', 14, startupStartY);

    const startupData = [
        ['Furnishing & Decor', formatMoney(results.startupCosts.furnishing)],
        ['Security Deposit', formatMoney(results.startupCosts.depositRounded)],
        ['First Month Rent', formatMoney(results.startupCosts.firstMonthRent)],
        ['Fixtures & Fittings', formatMoney(results.startupCosts.fixtures)],
        ['Legal & Utility Deposits', formatMoney(results.startupCosts.utilityDeposits + results.startupCosts.legalAdmin)],
        ['TOTAL STARTUP', formatMoney(results.initialInvestment)],
    ];

    autoTable(doc, {
        startY: startupStartY + 5,
        head: [['Item', 'Cost']],
        body: startupData,
        theme: 'striped',
        headStyles: { fillColor: [55, 65, 81] }, // Slate 700
        foot: [['TOTAL', formatMoney(results.initialInvestment)]],
        footStyles: { fillColor: [6, 95, 70], fontStyle: 'bold' },
    });


    // --- MONTHLY EXPENSES BREAKDOWN ---
    const expStartY = (doc as any).lastAutoTable.finalY + 15;

    // Check if we need a new page
    if (expStartY > 250) {
        doc.addPage();
        doc.text('Monthly Operating Expenses', 14, 20);
        // reset startY for new page
        // ... simplistic handling here for brevity
    } else {
        doc.text('Monthly Operating Expenses', 14, expStartY);
    }

    const expenseData = results.expenseBreakdown.map(item => [item.label, formatMoney(item.amount)]);

    autoTable(doc, {
        startY: expStartY > 250 ? 25 : expStartY + 5,
        head: [['Expense Category', 'Monthly Cost']],
        body: expenseData,
        theme: 'striped',
        headStyles: { fillColor: [185, 28, 28] }, // Red 700
        foot: [['TOTAL MONTHLY', formatMoney(
            (results.monthlyOpex.rent || 0) +
            (results.monthlyOpex.cleaning || 0) +
            (results.monthlyOpex.internet || 0) +
            (results.monthlyOpex.electricity || 0) +
            (results.monthlyOpex.water || 0) +
            (results.monthlyOpex.netflix || 0) +
            (results.monthlyOpex.management || 0) +
            (results.monthlyOpex.platform || 0) +
            (results.monthlyOpex.maintenance || 0)
        )]],
    });

    // --- DISCLAIMER ---
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'italic');
    const disclaimer = "Disclaimer: This report is for informational purposes only. Actual results may vary based on market conditions, occupancy rates, and management effectiveness. Does not constitute financial advice.";

    const splitText = doc.splitTextToSize(disclaimer, 180);
    doc.text(splitText, 14, finalY);

    doc.save(`Airbnb_ROI_Report_${regionName.replace(/\s+/g, '_')}.pdf`);
};
