import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
    text: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ text }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div
            className="relative inline-flex items-center ml-1 group"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            <Info
                size={14}
                className="text-slate-400 hover:text-blue-500 cursor-help transition-colors"
            />

            {/* Tooltip Popup */}
            <div className={`
        absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 
        bg-slate-800 text-white text-xs p-3 rounded-lg shadow-xl 
        z-50 transition-all duration-200 pointer-events-none
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}
      `}>
                {text}
                {/* Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800"></div>
            </div>
        </div>
    );
};
