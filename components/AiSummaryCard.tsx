import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Wallet, AlertTriangle, CheckCircle2, Lightbulb, Target, Zap, Bot, BrainCircuit } from 'lucide-react';
import { AiInsight } from '../utils/aiInsightGenerator';

interface AiSummaryCardProps {
    insight: AiInsight;
    loading?: boolean;
}

const LOADING_STEPS = [
    "Analyzing market demand...",
    "Comparing expense ratios...",
    "Optimizing for higher occupancy...",
    "Generating strategic insights..."
];

export const AiSummaryCard: React.FC<AiSummaryCardProps> = ({ insight, loading }) => {
    const [visible, setVisible] = useState(false);
    const [isSimulating, setIsSimulating] = useState(true);
    const [loadingStep, setLoadingStep] = useState(0);

    // Simulate AI "Thinking" every time insight changes
    useEffect(() => {
        setIsSimulating(true);
        setLoadingStep(0);
        setVisible(false);

        // Cycle through loading steps - Slower for better readability
        let stepIdx = 0;
        const stepInterval = setInterval(() => {
            stepIdx++;
            if (stepIdx < LOADING_STEPS.length) {
                setLoadingStep(stepIdx);
            }
        }, 1200); // Slower cycle (1.2s)

        // Finish simulation
        const finishTimer = setTimeout(() => {
            clearInterval(stepInterval);
            setIsSimulating(false);
            setTimeout(() => setVisible(true), 100);
        }, 4000); // Longer total time to match steps

        return () => {
            clearInterval(stepInterval);
            clearTimeout(finishTimer);
        };
    }, [insight]);

    const showLoader = loading || isSimulating;

    // Icon helper
    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'trending-up': return <TrendingUp size={18} className="text-emerald-300" />;
            case 'wallet': return <Wallet size={18} className="text-blue-300" />;
            case 'alert': return <AlertTriangle size={18} className="text-amber-300" />;
            case 'check': return <CheckCircle2 size={18} className="text-emerald-300" />;
            case 'lightbulb': return <Lightbulb size={18} className="text-yellow-300" />;
            case 'target': return <Target size={18} className="text-cyan-300" />;
            case 'zap': return <Zap size={18} className="text-orange-300" />;
            default: return <Sparkles size={18} className="text-purple-300" />;
        }
    };

    // Style config based on sentiment
    const getStyles = () => {
        switch (insight.sentiment) {
            case 'caution':
                return 'from-slate-900 via-red-950 to-slate-900 border-red-900/50 shadow-red-900/20';
            case 'positive':
                return 'from-slate-900 via-indigo-950 to-slate-900 border-indigo-500/30 shadow-indigo-500/20';
            default:
                return 'from-slate-800 to-slate-900 border-slate-700 shadow-slate-900/50';
        }
    };

    return (
        <div className={`relative rounded-xl p-6 text-white border shadow-2xl overflow-hidden min-h-[220px] transition-all duration-1000 bg-gradient-to-br ${showLoader ? 'from-slate-900 via-slate-800 to-slate-900 border-slate-800' : getStyles()} ${visible || showLoader ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

            {/* Background Decor - Smooth Fade */}
            <div className={`absolute top-0 right-0 p-8 pointer-events-none transition-opacity duration-1000 ${showLoader ? 'opacity-20' : 'opacity-10'}`}>
                {showLoader ? <BrainCircuit size={120} className="animate-pulse" /> : <Sparkles size={120} />}
            </div>

            <div className="relative z-10 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="bg-white/10 p-1.5 rounded-lg backdrop-blur-md transition-all duration-500">
                        {showLoader ? (
                            <Bot size={18} className="text-emerald-400 animate-spin-slow" />
                        ) : (
                            <Sparkles size={18} className="text-purple-300" />
                        )}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-white/60">
                        {showLoader ? 'AI Analysis in Progress' : 'AI Strategy Insight'}
                    </span>
                </div>

                {/* Content vs Loader - Absolute overlay for smooth transition if needed, or just conditional */}
                {showLoader ? (
                    <div className="flex flex-col items-center justify-center flex-grow py-6 space-y-6 animate-in fade-in duration-500">
                        <div className="flex gap-2">
                            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-2.5 h-2.5 bg-emerald-300 rounded-full animate-bounce"></span>
                        </div>
                        <p className="text-emerald-300 font-medium animate-pulse text-lg text-center tracking-wide">
                            {LOADING_STEPS[Math.min(loadingStep, LOADING_STEPS.length - 1)]}
                        </p>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Headline */}
                        <h2 className="text-xl md:text-2xl font-bold mb-6 text-white leading-tight">
                            {insight.headline}
                        </h2>

                        {/* Bullets */}
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
                    </div>
                )}
            </div>
        </div>
    );
};

