import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, ReferenceLine, Legend
} from 'recharts';
import { Download, Lock, Share2, TrendingUp, DollarSign, Calendar, Info, CheckCircle2, AlertTriangle, HelpCircle, Briefcase, Wallet } from 'lucide-react';
import { PaymentCard } from './PaymentModal';
import { EmailModal } from './EmailModal';
import { CalculationResult, AcquisitionModel, UserInputs, PropertyType } from '../types';
import { PAYMENT_AMOUNT_KES, KENYA_REGIONS, OPERATING_COSTS, ISP_PROVIDERS } from '../constants';
import { getSmartMarketData } from '../services/smartMarketService';
import { MarketData } from '../services/marketService';
import { InfoTooltip } from './ui/InfoTooltip';
import { generatePDF } from '../utils/pdfGenerator';
import { AiSummaryCard } from './AiSummaryCard';
import { generateAiInsight } from '../utils/aiInsightGenerator';

interface ResultsDashboardProps {
  results: CalculationResult;
  inputs: UserInputs;
  isLocked?: boolean;
  onUnlock?: () => void;
  onPaidSuccess?: () => void;
}

const COLORS = ['#059669', '#3b82f6', '#f59e0b', '#ef4444', '#64748b'];

const formatMoney = (val: number, abbreviate = false) => {
  if (abbreviate && val >= 1000000) {
    return 'KES ' + (val / 1000000).toFixed(2) + ' M';
  }
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(val);
};

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  results,
  inputs,
  isLocked = false,
  onUnlock,
  onPaidSuccess
}) => {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(false);

  // Scroll to top when unlocked (e.g. after payment)
  useEffect(() => {
    if (!isLocked) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isLocked]);

  const regionName = KENYA_REGIONS.find(r => r.id === inputs.regionId)?.name || inputs.regionId;
  const regionData = KENYA_REGIONS.find(r => r.id === inputs.regionId);

  const [showEmailModal, setShowEmailModal] = useState(false);

  const handleExport = () => {
    // Check if we already have the email
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
      generatePDF(results, inputs);
    } else {
      setShowEmailModal(true);
    }
  };

  const blurClass = isLocked ? "blur-md select-none opacity-50 pointer-events-none" : "";

  // Generate Insight
  const aiInsight = generateAiInsight(results, inputs, regionName);

  useEffect(() => {
    // Fetch market data when inputs result changes
    if (results) {
      setLoading(true);
      getSmartMarketData(inputs).then(data => {
        if (data && data.sampleSize > 0) {
          setMarketData(data);
        } else {
          setMarketData(null);
        }
        setLoading(false);
      });
    }
  }, [inputs, results]);

  const usedPrice = inputs.acquisitionModel === AcquisitionModel.BUY
    ? regionData?.avgBuyPrice[inputs.propertyType] || 0
    : regionData?.avgRent[inputs.propertyType] || 0;

  // Comparison Logic (Refined)
  // Only show comparison if user input a CUSTOM numeric value that differs from the fetched market average
  // Otherwise, we are just showing the market average, so 0% diff makes no sense to display as "0% higher"
  const hasCustomInput =
    (inputs.acquisitionModel === AcquisitionModel.BUY && inputs.customPropertyPrice && inputs.customPropertyPrice !== marketData?.averagePrice) ||
    (inputs.acquisitionModel === AcquisitionModel.SUBLEASE && inputs.customMonthlyRent && inputs.customMonthlyRent !== marketData?.averagePrice);

  const diffPercent = (marketData && hasCustomInput)
    ? ((usedPrice - marketData.averagePrice) / marketData.averagePrice) * 100
    : 0;

  const isGoodDeal = diffPercent < 0; // Lower than average is good

  // Assumptions for display
  const occupancyRate = inputs.customOccupancy !== undefined
    ? inputs.customOccupancy
    : (regionData?.avgOccupancy || 0.7);

  const nightlyRate = inputs.customNightlyRate || (regionData?.avgNightlyRate[inputs.propertyType] || 0);

  return (
    <div className="space-y-8 relative">
      {/* AI Insight Section */}
      <div className={blurClass}>
        <AiSummaryCard insight={aiInsight} />
      </div>

      {/* Locked Overlay */}
      {isLocked && (
        <div className="absolute inset-0 z-50 flex items-start justify-center pt-0">
          <div className="-mt-20 sticky top-32 mx-4 w-full max-w-md">
            <PaymentCard
              onSuccess={() => onPaidSuccess?.()}
              showCloseButton={false}
              className="shadow-2xl border border-slate-200/50"
            />
          </div>
        </div>
      )}

      <EmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSuccess={() => generatePDF(results, inputs)}
        userPhone={localStorage.getItem('userPhone')}
      />

      {/* Top Action Bar */}
      <div className={`flex justify-end gap-3 mb-2 ${blurClass}`}>
        <button
          disabled={isLocked}
          className={`flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all text-[11px] font-black uppercase tracking-widest ${isLocked ? 'text-slate-400 cursor-not-allowed opacity-50' : 'text-brand-navy hover:text-brand-yellow hover:border-brand-yellow'
            }`}
        >
          <Share2 size={16} />
          <span>Share Insights</span>
        </button>
        <button
          disabled={isLocked}
          onClick={() => {
            if (isLocked) return;
            handleExport();
          }}
          className={`flex items-center gap-2 px-8 py-3 bg-brand-navy hover:bg-slate-800 text-white rounded-2xl shadow-[0_4px_0_0_#00152B] hover:translate-y-[1px] hover:shadow-[0_3px_0_0_#00152B] active:translate-y-[3px] active:shadow-none transition-all text-[11px] font-black uppercase tracking-widest ${isLocked ? 'cursor-not-allowed opacity-50 bg-slate-400 shadow-none' : ''
            }`}
        >
          {isLocked ? <Lock size={16} /> : <Download size={16} />}
          <span>Export Analysis</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${blurClass}`}>
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-xl hover:border-brand-yellow/30 transition-all duration-300 group">
          <div className="flex items-center gap-2 text-slate-400 mb-3">
            <TrendingUp size={18} className="group-hover:text-brand-yellow transition-colors" />
            <span className="text-[10px] font-black uppercase tracking-widest">Cash on Cash Return</span>
            <InfoTooltip text="The percentage of your total cash investment that is returned to you as liquid cash (profit) each year." />
          </div>
          <div className={`text-4xl font-black tracking-tight ${results.cashOnCashReturn > 0 ? 'text-brand-navy' : 'text-red-500'}`}>
            {results.cashOnCashReturn.toFixed(1)}%
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-2">Annualized ROI Performance</p>
        </div>

        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-xl hover:border-brand-yellow/30 transition-all duration-300 group">
          <div className="flex items-center gap-2 text-slate-400 mb-3">
            <DollarSign size={18} className="group-hover:text-brand-yellow transition-colors" />
            <span className="text-[10px] font-black uppercase tracking-widest">Monthly Cash Flow</span>
            <InfoTooltip text="Exact amount of profit entering your pocket each month after paying all expenses (management, rent, utilities, etc)." />
          </div>
          <div className="text-4xl font-black tracking-tight text-brand-navy">
            {formatMoney(results.monthlyCashFlow)}
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-2">Average recurring profit</p>
        </div>

        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-xl hover:border-brand-yellow/30 transition-all duration-300 group">
          <div className="flex items-center gap-2 text-slate-400 mb-3">
            <Calendar size={18} className="group-hover:text-brand-yellow transition-colors" />
            <span className="text-[10px] font-black uppercase tracking-widest">Payback Period</span>
            <InfoTooltip text="How long it takes for your cumulative profits to equal your initial startup costs (furnishing, deposit, etc)." />
          </div>
          <div className="text-4xl font-black tracking-tight text-brand-navy">
            {(results.paybackPeriodMonths / 12).toFixed(1)} <span className="text-xl text-slate-300 font-bold uppercase">Yrs</span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-2">{Math.ceil(results.paybackPeriodMonths)} months to break even</p>
        </div>

        {/* Market Benchmark Widget */}
        {loading ? (
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center">
            <div className="animate-spin h-6 w-6 border-4 border-brand-yellow border-t-transparent rounded-full mb-3"></div>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Syncing Intelligence...</span>
          </div>
        ) : marketData ? (
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-xl hover:border-brand-yellow/30 transition-all duration-300 group">
            <div className="flex items-center gap-2 text-slate-400 mb-3">
              <Info size={18} className="group-hover:text-brand-yellow transition-colors" />
              <span className="text-[10px] font-black uppercase tracking-widest">Market Benchmark</span>
              <InfoTooltip text={`Calculated from current average ${inputs.acquisitionModel === AcquisitionModel.BUY ? 'listing prices' : 'rental rates'} for ${inputs.propertyType} units in ${regionName}.`} />
            </div>

            <div className="text-4xl font-black tracking-tight text-brand-navy">
              {formatMoney(marketData.averagePrice, true)}
            </div>

            <div className="flex flex-col mt-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                Avg {inputs.propertyType} in {regionName}
              </span>
              {/* Only show comparison if user actually entered a different number manually */}
              {hasCustomInput && Math.abs(diffPercent) > 0.1 && (
                <div className={`inline-flex items-center gap-1.5 mt-2 px-2 py-1 rounded-lg w-fit text-[10px] font-black uppercase tracking-wider ${isGoodDeal ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-500 border border-amber-100'}`}>
                  {isGoodDeal ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                  {Math.abs(diffPercent).toFixed(1)}% {isGoodDeal ? 'Advantage' : 'Premium'}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center">
            <span className="text-xs text-slate-400 font-black uppercase tracking-widest">Local Intel Unavailable</span>
            <p className="text-[10px] text-slate-300 font-bold uppercase mt-2">No regional data active</p>
          </div>
        )}
      </div>

      {/* Assumptions Section */}
      <div className={`bg-brand-navy/5 rounded-[40px] p-8 border border-slate-100 ${blurClass}`}>
        <div className="flex items-center gap-2 mb-6">
          <HelpCircle className="text-brand-yellow" size={20} />
          <h3 className="text-xl font-black text-brand-navy uppercase tracking-tight">Basis of Analysis</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="relative overflow-hidden bg-white p-6 rounded-3xl border border-slate-100 group hover:shadow-lg transition-all duration-300">
            {/* Animated Background Effect */}
            <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-brand-yellow rounded-full mix-blend-multiply filter blur-xl opacity-5 animate-blob"></div>
            <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-brand-navy rounded-full mix-blend-multiply filter blur-xl opacity-5 animate-blob animation-delay-2000"></div>

            <div className="flex justify-between items-start mb-3">
              <span className="block text-brand-navy text-[10px] uppercase tracking-widest font-black">Smart Occupancy</span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-brand-yellow/10 rounded-full border border-brand-yellow/20">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-navy opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-navy"></span>
                </span>
                <span className="text-[9px] font-black text-brand-navy uppercase tracking-tighter">Live IQ</span>
              </div>
            </div>

            <div className="mb-3">
              <span className="text-xs font-black text-brand-navy block uppercase tracking-tight">{inputs.propertyType}</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{regionName}</span>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-brand-navy tracking-tighter">{(occupancyRate * 100).toFixed(0)}%</span>
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-1">Avg Occupancy</span>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-50">
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Briefcase size={12} className="text-brand-yellow" />
                <span className="font-bold">Rate: <span className="text-brand-navy">{formatMoney(nightlyRate)}</span> <span className="text-[10px] text-slate-400 uppercase">/night</span></span>
              </div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide mt-2 flex items-center gap-1">
                <CheckCircle2 size={10} className="text-emerald-500" /> Market Aggregated Feeds
              </p>
            </div>
          </div>

          <div className="p-2">
            <span className="block text-slate-400 text-[10px] uppercase tracking-widest font-black mb-3">Operational Expenses</span>
            <div className="font-black text-brand-navy text-lg leading-tight mb-2 uppercase tracking-tight">Full-Utility Inclusion Model</div>
            <p className="text-slate-500 text-xs font-medium leading-relaxed">We calculate costs for Cleaning, WiFi, Water, Electricity, and DSTV/Netflix based on local {regionName} tariffs.</p>
          </div>

          <div className="p-2">
            <span className="block text-slate-400 text-[10px] uppercase tracking-widest font-black mb-3">Strategic Model</span>
            <div className="font-black text-brand-navy text-lg leading-tight mb-2 uppercase tracking-tight">{inputs.acquisitionModel === AcquisitionModel.BUY ? 'Capital Purchase' : 'Rental Arbitrage'}</div>
            <p className="text-slate-500 text-xs font-medium leading-relaxed">Analysis reflects {inputs.acquisitionModel === AcquisitionModel.BUY ? 'down payments and interest' : 'security deposits and rent'} scaling for {inputs.propertyType} units.</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${blurClass}`}>
        {/* Cash Flow Projection */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 h-96 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={18} className="text-emerald-500" />
            <h3 className="text-lg font-black text-brand-navy uppercase tracking-tight">Monthly Profit vs Expenses</h3>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-800">
              Cumulative Cash Flow ({Math.ceil(results.monthlyBreakdown.length / 12)} Years)
            </h3>
            <p className="text-sm text-slate-500">How your profits look over time. The curve shows your break-even point.</p>
          </div>
          <div className="flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={results.monthlyBreakdown} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                  ticks={
                    results.monthlyBreakdown.length > 36
                      ? Array.from({ length: Math.ceil(results.monthlyBreakdown.length / 12) }, (_, i) => (i + 1) * 12) // Every 12 months (Yearly)
                      : [6, 12, 18, 24, 30, 36] // Every 6 months
                  }
                />
                <YAxis
                  tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <Tooltip
                  formatter={(val: number) => [formatMoney(val), "Net Profit"]}
                  labelFormatter={(label) => `Month ${label}`}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#10b981', strokeWidth: 2, strokeDasharray: '5 5' }}
                />
                <ReferenceLine y={0} stroke="#cbd5e1" strokeDasharray="3 3" />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorCum)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 min-h-[500px] flex flex-col">
          <div className="mb-8">
            <h3 className="text-lg font-black text-brand-navy uppercase tracking-tight">Income Distribution</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wide mt-1">Allocation of your monthly gross revenue</p>
          </div>

          <div className="flex-grow flex flex-col items-center justify-center gap-8">
            {/* Chart Area */}
            <div className="w-full h-[280px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[...results.expenseBreakdown]
                      .map(item => ({ ...item, amount: item.amount / 12 }))
                      .sort((a, b) => b.amount - a.amount)
                    }
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="amount"
                    nameKey="label"
                  >
                    {[...results.expenseBreakdown]
                      .sort((a, b) => b.amount - a.amount)
                      .map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                      ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number) => formatMoney(val)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center cost text (optional flair) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <span className="text-xs text-slate-400 font-medium">Total / Mo</span>
                  <p className="text-slate-700 font-bold">{formatMoney(results.expenseBreakdown.reduce((sum, i) => sum + i.amount, 0) / 12, true)}</p>
                </div>
              </div>
            </div>

            {/* Premium Custom Legend */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[...results.expenseBreakdown]
                .map(item => ({ ...item, amount: item.amount / 12 })) // Convert to Monthly
                .sort((a, b) => b.amount - a.amount)
                .map((item, index) => {
                  const totalMonthly = results.expenseBreakdown.reduce((acc, curr) => acc + curr.amount, 0) / 12;
                  const percent = totalMonthly > 0 ? (item.amount / totalMonthly) * 100 : 0;

                  return (
                    <div key={index} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full shadow-sm"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm text-slate-700 font-medium">{item.label}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-800">{formatMoney(item.amount)}</p>
                        <p className="text-[10px] text-slate-500">{percent.toFixed(1)}%</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* DETAILED BREAKDOWNS (New Section) */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${blurClass}`}>
        {/* 1. STARTUP CAPITAL BREAKDOWN */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 h-full flex flex-col">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-brand-navy/5 p-3 rounded-2xl text-brand-navy">
              <Briefcase size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-brand-navy uppercase tracking-tight">Startup Capital</h3>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Initial Bankroll Requirements</p>
            </div>
          </div>

          <div className="space-y-4 flex-grow">
            <div className="flex justify-between items-center py-2 border-b border-slate-50">
              <span className="text-slate-600">Furnishing & Decor</span>
              <span className="font-semibold">{formatMoney(results.startupCosts.furnishing)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-50">
              <span className="text-slate-600">
                {inputs.acquisitionModel === AcquisitionModel.BUY ? 'Downpayment' : 'Security Deposit (2 Months)'}
                <InfoTooltip text={inputs.acquisitionModel === AcquisitionModel.BUY ? "Initial cash downpayment required for purchase." : "Standard Kenyan lease requirement. Refundable at end of lease."} />
              </span>
              <span className="font-semibold">{formatMoney(results.startupCosts.depositRounded)}</span>
            </div>
            {results.startupCosts.firstMonthRent > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-slate-600">First Month Rent (Advance)</span>
                <span className="font-semibold">{formatMoney(results.startupCosts.firstMonthRent)}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-2 border-b border-slate-50">
              <span className="text-slate-600">
                Fixtures & Fittings
                <InfoTooltip text="WiFi installation, smart locks, painting, small repairs usually needed for new units." />
              </span>
              <span className="font-semibold">{formatMoney(results.startupCosts.fixtures)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-50">
              <span className="text-slate-600">
                Utility Deposits & Legal
                <InfoTooltip text="KPLC/Water deposits and lease agreement admin fees." />
              </span>
              <span className="font-semibold">{formatMoney(results.startupCosts.utilityDeposits + results.startupCosts.legalAdmin)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 mt-2 bg-slate-50 p-4 rounded-lg">
            <span className="font-bold text-slate-800">Total Check To Write</span>
            <span className="font-bold text-emerald-600 text-lg">{formatMoney(results.initialInvestment)}</span>
          </div>
        </div>

        {/* 2. MONTHLY PROFIS & LOSS */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 h-full flex flex-col">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-brand-navy/5 p-3 rounded-2xl text-brand-navy">
              <Wallet size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-brand-navy uppercase tracking-tight">Monthly P&L</h3>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Cash In vs. Cash Out</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-emerald-50 p-4 rounded-lg text-center">
              <span className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">Gross Income</span>
              <div className="text-xl font-bold text-emerald-700">{formatMoney(results.monthlyRevenue)}</div>
              <div className="text-xs text-emerald-500 mt-1">Based on {occupancyRate * 100}% Occupancy</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <span className="text-xs text-red-600 font-semibold uppercase tracking-wider">Total Cash Outflow</span>
              <div className="text-xl font-bold text-red-700">{formatMoney(results.monthlyOpex.rent + results.monthlyOpex.mortgage + results.monthlyOpex.cleaning + results.monthlyOpex.internet + results.monthlyOpex.electricity + results.monthlyOpex.water + results.monthlyOpex.netflix + results.monthlyOpex.management + results.monthlyOpex.platform + results.monthlyOpex.maintenance)}</div>
            </div>
          </div>

          <div className="space-y-3 flex-grow">
            {/* Conditional Rent vs Mortgage */}
            {results.monthlyOpex.rent > 0 && (
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-slate-500">Rent Payment</span>
                  <InfoTooltip text="Monthly rent payable to the landlord." />
                </div>
                <span className="text-slate-700 font-medium">{formatMoney(results.monthlyOpex.rent)}</span>
              </div>
            )}
            {results.monthlyOpex.mortgage > 0 && (
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-slate-500">Mortgage Payment</span>
                  <InfoTooltip text="Monthly loan repayment (principal + interest)." />
                </div>
                <span className="text-slate-700 font-medium">{formatMoney(results.monthlyOpex.mortgage)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-1">
                <span className="text-slate-500">Cleaning ({Math.round(occupancyRate * 30.5)} days)</span>
                <InfoTooltip text="Cost of cleaning after every guest checkout." />
              </div>
              <span className="text-slate-700 font-medium">{formatMoney(results.monthlyOpex.cleaning)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-1">
                <span className="text-slate-500">Electricity</span>
                <InfoTooltip text="Estimated monthly power bill based on property size." />
              </div>
              <span className="text-slate-700 font-medium">{formatMoney(results.monthlyOpex.electricity)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-1">
                <span className="text-slate-500">Water</span>
                <InfoTooltip text="Estimated monthly water bill." />
              </div>
              <span className="text-slate-700 font-medium">{formatMoney(results.monthlyOpex.water)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 group relative cursor-help flex items-center gap-1">
                Internet / WiFi
                <InfoTooltip text="Monthly internet subscription cost." />
                {/* Mini tooltip for Providers */}
                <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-slate-800 text-white p-2 rounded text-xs w-48 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                  <strong>Available Providers:</strong><br />
                  {(ISP_PROVIDERS[inputs.regionId as keyof typeof ISP_PROVIDERS] || ['Safaricom', 'Zuku']).join(', ')}
                </div>
              </span>
              <span className="text-slate-700 font-medium">{formatMoney(results.monthlyOpex.internet)}</span>
            </div>
            {results.monthlyOpex.netflix > 0 && (
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-slate-500">Netflix / Entertainment</span>
                  <InfoTooltip text="Subscriptions for guest entertainment." />
                </div>
                <span className="text-slate-700 font-medium">{formatMoney(results.monthlyOpex.netflix)}</span>
              </div>
            )}
            <div className="border-t border-slate-100 my-1"></div>

            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-1">
                <span className="text-slate-500">Platform Fees</span>
                <InfoTooltip text="Service fees charged by platforms like Airbnb (approx. 3%)." />
              </div>
              <span className="text-slate-700 font-medium">{formatMoney(results.monthlyOpex.platform)}</span>
            </div>

          </div>

          <div className="border-t border-slate-100 mt-4 pt-3 flex justify-between items-center">
            <span className="font-bold text-slate-800">Net Monthly Pocket</span>
            <span className={`font-bold text-lg ${results.monthlyCashFlow > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatMoney(results.monthlyCashFlow)}
            </span>
          </div>
        </div>
      </div>

      {/* Financial Summary Table */}
      <div className={`bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden ${blurClass}`}>
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-black text-brand-navy uppercase tracking-tight mr-2">Core Financial Metrics</h3>
          <div className="px-3 py-1 bg-brand-navy text-white text-[9px] font-black uppercase tracking-widest rounded-full">Pro Analysis</div>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center">
              <span className="text-slate-600">Total Initial Capital</span>
              <InfoTooltip text="Total cash needed upfront (Deposit/Downpayment + Furnishing + First Month expenses)." />
            </div>
            <span className="font-semibold">{formatMoney(results.initialInvestment)}</span>
          </div>

          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-600">Proj. Annual Revenue</span>
            <span className="font-semibold text-emerald-600">{formatMoney(results.annualRevenue)}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-600">Annual Expenses</span>
            <span className="font-semibold text-red-500">{formatMoney(results.annualExpenses)}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center">
              <span className="text-slate-600">Annual Net Profit (NOI)</span>
              <InfoTooltip text="Net Operating Income. Pure profit before tax." />
            </div>
            <span className="font-semibold text-emerald-700">{formatMoney(results.netOperatingIncome)}</span>
          </div>
          {inputs.acquisitionModel === AcquisitionModel.BUY && (
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center">
                <span className="text-slate-600">Cap Rate</span>
                <InfoTooltip text="A measure of a property's unleveraged yield. Higher is generally better for pure income." />
              </div>
              <span className="font-semibold text-blue-600">{(results.capRate || 0).toFixed(2)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};