import React, { useState } from 'react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface IndicatorProps {
  name: string;
  value: string | number;
  status: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  description?: string;
  index: number;
}

const Indicator: React.FC<IndicatorProps> = ({ name, value, status, description, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "glass-panel rounded-xl p-4 flex flex-col gap-2 hover:border-white/10 transition-all duration-300 group relative cursor-help overflow-hidden",
        status === 'BULLISH' ? "hover:shadow-[0_0_20px_rgba(34,197,94,0.1)]" : 
        status === 'BEARISH' ? "hover:shadow-[0_0_20px_rgba(239,68,68,0.1)]" : "hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]"
      )}
    >
      {/* Micro Grid Background */}
      <div className="absolute inset-0 grid-bg opacity-5 group-hover:opacity-10 transition-opacity" />

      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] font-bold group-hover:text-slate-400 transition-colors relative z-10">{name}</span>
      <div className="flex items-center justify-between relative z-10">
        <span className="text-sm font-mono font-bold text-slate-200 group-hover:text-white transition-colors">{value}</span>
        <span className={cn(
          "text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest transition-all",
          status === 'BULLISH' ? "bg-green-500/10 text-green-500 border border-green-500/20 glow-green" : 
          status === 'BEARISH' ? "bg-red-500/10 text-red-500 border border-red-500/20 glow-red" : 
          "bg-slate-800/50 text-slate-400 border border-slate-700/30"
        )}>
          {status}
        </span>
      </div>

      <AnimatePresence>
        {isHovered && description && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 5 }}
            className="absolute z-[100] bottom-full left-0 mb-2 w-48 p-3 bg-[#121216] border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl pointer-events-none"
          >
            <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
              {description}
            </p>
            <div className="absolute top-full left-6 -translate-y-1/2 rotate-45 w-2 h-2 bg-[#121216] border-r border-b border-white/10" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export interface IndicatorData {
  name: string;
  value: string | number;
  status: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  description?: string;
}

interface IndicatorGridProps {
  indicators: IndicatorData[];
}

export const IndicatorGrid: React.FC<IndicatorGridProps> = ({ indicators }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {indicators.map((indicator, index) => (
        <Indicator 
          key={indicator.name}
          index={index}
          name={indicator.name}
          value={indicator.value}
          status={indicator.status}
          description={indicator.description}
        />
      ))}
    </div>
  );
};
