import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Wallet, AlertTriangle, CheckCircle2, Lightbulb } from 'lucide-react';
import { AiInsight } from '../utils/aiInsightGenerator';

interface AiSummaryCardProps {
    insight: AiInsight;
    loading?: boolean;
}

export const AiSummaryCard: React.FC<AiSummaryCardProps> = ({ insight, loading }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(false);
        const timer = setTimeout(() => setVisible(true), 100); // Small fade-in delay
        return () => clearTimeout(timer);
    }, [insight]);

    // Icon helper
    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'trending-up': return <TrendingUp size={18} className="text-emerald-300" />;
            case 'wallet': return <Wallet size={18} className="text-blue-300" />;
            case 'alert': return <AlertTriangle size={18} className="text-amber-300" />;
            case 'check': return <CheckCircle2 size={18} className="text-emerald-300" />;
            case 'lightbulb': return <Lightbulb size={18} className="text-yellow-300" />;
            default: return <Sparkles size={18} className="text-purple-300" />;
        }
    };

    // Style config based on sentiment
    const getStyles = () => {
        switch (insight.sentiment) {
            case 'caution':
                return 'bg-gradient-to-br from-slate-800 to-red-900 border-red-700/50';
            case 'positive':
                return 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-indigo-500/30';
            default:
                return 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700';
        }
    };

    return (
        <div className={`relative rounded-xl p-6 text-white border shadow-2xl overflow-hidden transition-all duration-500 ${getStyles()} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

            {/* Background Decor */}
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Sparkles size={120} />
            </div>

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="bg-white/10 p-1.5 rounded-lg backdrop-blur-md">
                        <Sparkles size={18} className="text-purple-300 animate-pulse" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-purple-200/80">AI Strategy Insight</span>
                </div>

                {/* Headline */}
                <h2 className="text-xl md:text-2xl font-bold mb-6 text-white leading-tight">
                    {loading ? (
                        <span className="animate-pulse">Analyzing market data...</span>
                    ) : (
                        insight.headline
                    )}
                </h2>

                {/* Bullets */}
                {!loading && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {insight.bulletPoints.map((point, idx) => (
                            <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-colors flex flex-col gap-2">
                                <div className="bg-slate-950/30 w-fit p-1.5 rounded-md">
                                    {getIcon(point.icon)}
                                </div>
                                <p className="text-sm text-slate-200 leading-snug">
                                    {point.text}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
