import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { Download, Lock, Share2, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { CalculationResult, AcquisitionModel } from '../types';
import { PAYMENT_AMOUNT_KES } from '../constants';

interface ResultsDashboardProps {
  results: CalculationResult;
  isLocked: boolean;
  onUnlock: () => void;
  model: AcquisitionModel;
}

const COLORS = ['#059669', '#3b82f6', '#f59e0b', '#ef4444', '#64748b'];

const formatMoney = (val: number) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(val);
};

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ results, isLocked, onUnlock, model }) => {

  // If locked, we blur the content and show an overlay
  const blurClass = isLocked ? "blur-md select-none opacity-50 pointer-events-none" : "";

  return (
    <div className="space-y-8 relative">
      {/* Locked Overlay */}
      {isLocked && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center z-10">
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl text-center max-w-sm border border-slate-200">
            <Lock className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Unlock Full Analysis</h3>
            <p className="text-slate-600 mb-6">
              Get the detailed breakdown, 3-year cash flow projections, and exportable PDF report.
            </p>
            <button
              onClick={onUnlock}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-emerald-600/30 transition transform hover:-translate-y-1"
            >
              Unlock Now (KES {PAYMENT_AMOUNT_KES})
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${blurClass}`}>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <TrendingUp size={18} />
            <span className="text-sm font-medium">Cash on Cash Return</span>
          </div>
          <div className={`text-3xl font-bold ${results.cashOnCashReturn > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {results.cashOnCashReturn.toFixed(1)}%
          </div>
          <p className="text-xs text-slate-400 mt-1">Annualized based on initial cash</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <DollarSign size={18} />
            <span className="text-sm font-medium">Est. Monthly Cash Flow</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {formatMoney(results.monthlyCashFlow)}
          </div>
          <p className="text-xs text-slate-400 mt-1">After all operating expenses</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <Calendar size={18} />
            <span className="text-sm font-medium">Payback Period</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {(results.paybackPeriodMonths / 12).toFixed(1)} <span className="text-lg text-slate-500 font-normal">Years</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">{Math.ceil(results.paybackPeriodMonths)} months to break even</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${blurClass}`}>
        {/* Cash Flow Projection */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Cumulative Cash Flow (3 Years)</h3>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={results.monthlyBreakdown}>
              <defs>
                <linearGradient id="colorCum" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" label={{ value: 'Months', position: 'insideBottom', offset: -5 }} />
              <YAxis
                tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
                width={60}
              />
              <Tooltip
                formatter={(val: number) => formatMoney(val)}
                labelFormatter={(label) => `Month ${label}`}
              />
              <Area type="monotone" dataKey="cumulative" stroke="#059669" fillOpacity={1} fill="url(#colorCum)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Annual Expense Breakdown</h3>
          <div className="flex items-center justify-center h-full pb-8">
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
                >
                  {results.expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number) => formatMoney(val)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 text-sm">
              {results.expenseBreakdown.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                  <span className="text-slate-600">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Financial Table */}
      <div className={`bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden ${blurClass}`}>
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-semibold text-slate-800">Financial Summary</h3>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition">
              <Share2 size={16} /> Share
            </button>
            <button className="flex items-center gap-2 text-emerald-600 font-medium hover:text-emerald-700 transition">
              <Download size={16} /> Export PDF
            </button>
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-600">Total Initial Capital</span>
            <span className="font-semibold">{formatMoney(results.initialInvestment)}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-600">Furnishing Cost</span>
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
            <span className="text-slate-600">Net Operating Income</span>
            <span className="font-semibold text-emerald-700">{formatMoney(results.netOperatingIncome)}</span>
          </div>
          {model === AcquisitionModel.BUY && (
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-600">Cap Rate</span>
              <span className="font-semibold text-blue-600">{(results.capRate || 0).toFixed(2)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};