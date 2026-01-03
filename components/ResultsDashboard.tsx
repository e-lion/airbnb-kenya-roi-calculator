import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, ReferenceLine, Legend
} from 'recharts';
import { Download, Lock, Share2, TrendingUp, DollarSign, Calendar, Info, CheckCircle2, AlertTriangle, HelpCircle, Briefcase, Wallet } from 'lucide-react';
import { PaymentCard } from './PaymentModal';
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
  const regionName = KENYA_REGIONS.find(r => r.id === inputs.regionId)?.name || inputs.regionId;
  const regionData = KENYA_REGIONS.find(r => r.id === inputs.regionId);

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

      {/* Top Action Bar */}
      <div className={`flex justify-end gap-3 mb-4 ${blurClass}`}>
        <button
          disabled={isLocked}
          className={`flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all text-sm font-medium ${isLocked ? 'text-slate-400 cursor-not-allowed opacity-50' : 'text-slate-700 hover:text-emerald-700 hover:border-emerald-300'
            }`}
        >
          <Share2 size={18} />
          <span>Share Report</span>
        </button>
        <button
          disabled={isLocked}
          onClick={() => {
            if (isLocked) return;
            generatePDF(results, inputs);
          }}
          className={`flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all transform hover:-translate-y-0.5 text-sm font-bold ${isLocked ? 'cursor-not-allowed opacity-50 bg-slate-400 shadow-none' : ''
            }`}
        >
          {isLocked ? <Lock size={18} /> : <Download size={18} />}
          <span>Export PDF</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${blurClass}`}>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <TrendingUp size={18} />
            <span className="text-sm font-medium">Cash on Cash Return</span>
            <InfoTooltip text="The percentage of your total cash investment that is returned to you as liquid cash (profit) each year." />
          </div>
          <div className={`text-3xl font-bold ${results.cashOnCashReturn > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {results.cashOnCashReturn.toFixed(1)}%
          </div>
          <p className="text-xs text-slate-400 mt-1">ROI excluding property appreciation</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <DollarSign size={18} />
            <span className="text-sm font-medium">Net Monthly Cash Flow</span>
            <InfoTooltip text="Exact amount of profit entering your pocket each month after paying all expenses (management, rent, utilities, etc)." />
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {formatMoney(results.monthlyCashFlow)}
          </div>
          <p className="text-xs text-slate-400 mt-1">Average monthly profit</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <Calendar size={18} />
            <span className="text-sm font-medium">Payback Period</span>
            <InfoTooltip text="How long it takes for your cumulative profits to equal your initial startup costs (furnishing, deposit, etc)." />
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {(results.paybackPeriodMonths / 12).toFixed(1)} <span className="text-lg text-slate-500 font-normal">Years</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">{Math.ceil(results.paybackPeriodMonths)} months to break even</p>
        </div>

        {/* Market Benchmark Widget */}
        {loading ? (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center">
            <div className="animate-spin h-5 w-5 border-2 border-emerald-600 border-t-transparent rounded-full mb-2"></div>
            <span className="text-xs text-slate-400">Loading market data...</span>
          </div>
        ) : marketData ? (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <Info size={18} />
              <span className="text-sm font-medium">Avg {inputs.acquisitionModel === AcquisitionModel.BUY ? 'Buy' : 'Rent'} Market Price</span>
              <InfoTooltip text={`Startlingly live data! This is the current average ${inputs.acquisitionModel === AcquisitionModel.BUY ? 'listing price' : 'rental rate'} for ${inputs.propertyType} units in ${regionName}.`} />
            </div>

            <div className="text-3xl font-bold text-slate-900">
              {formatMoney(marketData.averagePrice, true)}
            </div>

            <div className="flex flex-col mt-1">
              <span className="text-xs text-slate-400">
                Avg {inputs.propertyType} {inputs.acquisitionModel === AcquisitionModel.BUY ? 'Price' : 'Rent'} in {regionName}
              </span>
              {/* Only show comparison if user actually entered a different number manually */}
              {hasCustomInput && Math.abs(diffPercent) > 0.1 && (
                <span className={`text-xs font-medium mt-1 flex items-center gap-1 ${isGoodDeal ? 'text-emerald-600' : 'text-amber-500'}`}>
                  {isGoodDeal ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                  {Math.abs(diffPercent).toFixed(1)}% {isGoodDeal ? 'lower' : 'higher'} than avg
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center">
            <span className="text-sm text-slate-400">No market data found.</span>
            <p className="text-[10px] text-slate-300 mt-1">Try running the backend server.</p>
          </div>
        )}
      </div>

      {/* Assumptions Section */}
      <div className={`bg-blue-50/50 rounded-xl p-6 border border-blue-100 ${blurClass}`}>
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="text-blue-600" size={20} />
          <h3 className="text-lg font-bold text-slate-800">Basis of Analysis</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-100 group hover:shadow-md transition-all duration-300">
            {/* Animated Background Effect */}
            <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
            <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>

            <div className="flex justify-between items-start mb-2">
              <span className="block text-indigo-600 text-xs uppercase tracking-wide font-bold">Smart Occupancy</span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-100 rounded-full border border-indigo-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <span className="text-[10px] font-medium text-indigo-700">Live IQ</span>
              </div>
            </div>

            <div className="mb-2">
              <span className="text-xs font-semibold text-indigo-900 block">{inputs.propertyType}</span>
              <span className="text-[10px] text-indigo-500 uppercase tracking-wide font-medium">{regionName}</span>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-800 tracking-tight">{(occupancyRate * 100).toFixed(0)}%</span>
              <span className="text-sm text-slate-500 font-medium">Occupancy</span>
            </div>

            <div className="mt-2 pt-2 border-t border-indigo-100/50">
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Briefcase size={12} className="text-indigo-400" />
                <span>Rate: <span className="font-semibold text-slate-800">{formatMoney(nightlyRate)}</span> /night</span>
              </div>
              <p className="text-[10px] text-indigo-400 mt-1.5 flex items-center gap-1">
                <CheckCircle2 size={10} /> Analyzed via AirDNA & Market Feeds
              </p>
            </div>
          </div>
          <div>
            <span className="block text-slate-500 text-xs uppercase tracking-wide font-semibold mb-1">Expenses</span>
            <div className="font-medium text-slate-800">Includes Management, Utilities, & Maintenance</div>
            <p className="text-slate-400 text-xs mt-1">Comprehensive operating cost model</p>
          </div>
          <div>
            <span className="block text-slate-500 text-xs uppercase tracking-wide font-semibold mb-1">Property Type</span>
            <div className="font-medium text-slate-800">{inputs.propertyType} in {regionName}</div>
            <p className="text-slate-400 text-xs mt-1">Model: {inputs.acquisitionModel === AcquisitionModel.BUY ? 'Buy & Host' : 'Rent & Sublease'}</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${blurClass}`}>
        {/* Cash Flow Projection */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96 flex flex-col">
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
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96 flex flex-col">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Where Does the Money Go?</h3>
            <p className="text-sm text-slate-500">Breakdown of your monthly operating expenses.</p>
          </div>
          <div className="flex flex-grow items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={results.expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="amount"
                  nameKey="label"
                >
                  {results.expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number) => formatMoney(val)} />
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  formatter={(value, entry: any) => <span className="text-xs text-slate-600 ml-2">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* DETAILED BREAKDOWNS (New Section) */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${blurClass}`}>
        {/* 1. STARTUP CAPITAL BREAKDOWN */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <Briefcase size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Initial Startup Capital</h3>
              <p className="text-xs text-slate-500">What you need in the bank on Day 1</p>
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
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
              <Wallet size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Monthly Profit & Loss</h3>
              <p className="text-xs text-slate-500">Income vs. The Grind (Expenses)</p>
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
                <span className="text-slate-500">Rent Payment</span>
                <span className="text-slate-700 font-medium">{formatMoney(results.monthlyOpex.rent)}</span>
              </div>
            )}
            {results.monthlyOpex.mortgage > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Mortgage Payment</span>
                <span className="text-slate-700 font-medium">{formatMoney(results.monthlyOpex.mortgage)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Cleaning ({Math.round(occupancyRate * 30.5)} days)</span>
              <span className="text-slate-700 font-medium">{formatMoney(results.monthlyOpex.cleaning)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Electricity</span>
              <span className="text-slate-700 font-medium">{formatMoney(results.monthlyOpex.electricity)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Water</span>
              <span className="text-slate-700 font-medium">{formatMoney(results.monthlyOpex.water)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 group relative cursor-help">
                Internet / WiFi
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
                <span className="text-slate-500">Netflix / Entertainment</span>
                <span className="text-slate-700 font-medium">{formatMoney(results.monthlyOpex.netflix)}</span>
              </div>
            )}
            <div className="border-t border-slate-100 my-1"></div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Management</span>
              <span className="text-slate-700 font-medium">{formatMoney(results.monthlyOpex.management)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Platform Fees</span>
              <span className="text-slate-700 font-medium">{formatMoney(results.monthlyOpex.platform)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Maintenance Reserve</span>
              <span className="text-slate-700 font-medium">{formatMoney(results.monthlyOpex.maintenance)}</span>
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
      <div className={`bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden ${blurClass}`}>
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-semibold text-slate-800">Financial Summary</h3>
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
            <div className="flex items-center">
              <span className="text-slate-600">Furnishing Cost</span>
            </div>
            <span className="font-semibold">{formatMoney(results.furnishingCost)}</span>
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