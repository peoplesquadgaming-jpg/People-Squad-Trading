import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, TrendingDown, Clock, ChevronRight, HelpCircle, Bot, ShieldCheck } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { SignalType } from './SignalPanel';

interface DealPanelProps {
  asset: string;
  amount: number;
  onAmountChange: (amount: number) => void;
  duration: string;
  onDurationChange: (duration: string) => void;
  balance: number;
  signal: SignalType;
  confidence: number;
  explanation?: string;
  isExplaining?: boolean;
  onTrade: (type: 'BUY' | 'SELL') => void;
  onGenerateSignal: () => void;
  isPredicting?: boolean;
  payout?: number;
  isAutoSignalEnabled: boolean;
  onToggleAutoSignal: () => void;
}

export const DealPanel: React.FC<DealPanelProps> = ({
  asset,
  amount,
  onAmountChange,
  duration,
  onDurationChange,
  balance,
  signal,
  confidence,
  explanation,
  isExplaining,
  onTrade,
  onGenerateSignal,
  isPredicting,
  payout = 82,
  isAutoSignalEnabled,
  onToggleAutoSignal
}) => {
  const isBuy = signal === 'BUY';
  const isSell = signal === 'SELL';

  const getAccuracyLabel = (conf: number) => {
    if (conf >= 90) return { label: 'STRONG', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    if (conf >= 80) return { label: 'MEDIUM', color: 'text-amber-400', bg: 'bg-amber-500/10' };
    return { label: 'LOW', color: 'text-slate-400', bg: 'bg-slate-500/10' };
  };

  const accuracy = getAccuracyLabel(confidence);

  const timePresets = ['1M', '2M', '3M', '5M', '15M', '30M'];

  return (
    <div className="w-full h-full bg-gradient-to-b from-[#0a0a0c] via-[#0d0d12] to-[#050507] border-l border-white/5 flex flex-col pt-4 overflow-y-auto custom-scrollbar relative shadow-[-20px_0_30px_-15px_rgba(0,0,0,0.8)] z-20">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-0 w-full h-32 bg-blue-500/5 blur-3xl pointer-events-none" />
      
      {/* Asset Switcher / Header */}
      <div className="px-4 mb-6 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] leading-none mb-1">Trading Asset</span>
            <span className="text-xl font-black text-white italic drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{asset}</span>
          </div>
          <motion.div 
            whileHover={{ rotate: 15 }}
            className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center border border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer shadow-lg backdrop-blur-xl"
          >
            <HelpCircle className="w-5 h-5" />
          </motion.div>
        </div>

        {/* Amount Input */}
        <div className="space-y-5 mb-8 relative z-10">
          <div className="relative group">
            <div className="absolute -top-2.5 left-4 px-2 bg-[#0d0d12] border border-white/5 rounded-md z-10 shadow-sm">
              <span className="text-[9px] text-blue-400 uppercase font-bold tracking-widest">Investment</span>
            </div>
            <div className="flex items-center bg-black/40 border border-white/10 rounded-2xl p-2 focus-within:border-blue-500/50 focus-within:bg-blue-500/5 focus-within:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all">
              <span className="pl-3 text-slate-500 font-mono font-bold text-xl">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => onAmountChange(Number(e.target.value))}
                className="w-full bg-transparent border-none focus:ring-0 text-white font-mono font-black text-2xl px-3 outline-none"
              />
              <div className="flex gap-1.5 pr-1">
                <button onClick={() => onAmountChange(Math.max(1, amount - 10))} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 font-mono text-xl transition-colors">-</button>
                <button onClick={() => onAmountChange(amount + 10)} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 font-mono text-xl transition-colors">+</button>
              </div>
            </div>
          </div>

          {/* Time Selection */}
          <div className="relative group mt-6">
            <div className="absolute -top-2.5 left-4 px-2 bg-[#0d0d12] border border-white/5 rounded-md z-10 shadow-sm">
              <span className="text-[9px] text-emerald-400 uppercase font-bold tracking-widest">Expiration</span>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center bg-black/40 border border-white/10 rounded-2xl p-2 focus-within:border-emerald-500/50 focus-within:bg-emerald-500/5 focus-within:shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all">
                <Clock className="ml-3 w-5 h-5 text-emerald-500/80" />
                <select
                  value={duration}
                  onChange={(e) => onDurationChange(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 text-white font-mono font-black text-xl px-3 appearance-none cursor-pointer outline-none"
                >
                  {timePresets.map(preset => (
                    <option key={preset} value={preset} className="bg-[#0a0a0c]">{preset}</option>
                  ))}
                </select>
                <ChevronRight className="w-5 h-5 text-slate-500 mr-3 rotate-90" />
              </div>
              <div className="grid grid-cols-3 gap-2 px-1">
                {timePresets.slice(0, 3).map(preset => (
                  <button
                    key={preset}
                    onClick={() => onDurationChange(preset)}
                    className={cn(
                      "py-2 rounded-xl text-[10px] font-black transition-all border shadow-sm",
                      duration === preset 
                        ? "bg-emerald-600 border-emerald-500 text-white shadow-emerald-600/20" 
                        : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                    )}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Payout Display */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border border-blue-500/20 mb-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] text-blue-300/80 font-black uppercase tracking-[0.2em]">Expected Payout</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 font-mono font-black text-emerald-400">+{payout}%</span>
            </div>
            <div className="text-3xl font-black text-white font-mono drop-shadow-[0_2px_10px_rgba(59,130,246,0.3)]">
              ${(amount + (amount * (payout / 100))).toFixed(2)}
            </div>
          </div>
        </div>

        {/* AI SIGNAL INDICATOR - Integrated into Deal Panel */}
        <div className={cn(
          "mb-8 p-5 rounded-3xl border transition-all duration-700 relative overflow-hidden group/signal flex flex-col",
          isBuy ? "bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.1)]" : 
          isSell ? "bg-rose-500/5 border-rose-500/20 shadow-[0_0_40px_rgba(239,68,68,0.1)]" : 
          "bg-white/[0.02] border-white/10"
        )}>
           {/* Background Grid */}
           <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
           
           {/* Scanning Beam */}
           <AnimatePresence>
             {signal === 'NEUTRAL' || isPredicting ? (
               <motion.div 
                 initial={{ top: '-10%' }}
                 animate={{ top: '110%' }}
                 transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                 className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_20px_rgba(59,130,246,1)] z-10"
               />
             ) : null}
           </AnimatePresence>

           <div className="relative z-20 flex-1">
             <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2">
                 <div className={cn("p-1.5 rounded-lg bg-white/5", isBuy ? "text-emerald-400" : isSell ? "text-rose-400" : "text-blue-400")}>
                    <Bot className="w-4 h-4" />
                 </div>
                 <span className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-300">People Squad AI</span>
               </div>
               
               <div className="flex items-center gap-2">
                 <button 
                   onClick={onToggleAutoSignal}
                   className={cn(
                     "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border flex items-center gap-1.5",
                     isAutoSignalEnabled
                       ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)] animate-pulse"
                       : "bg-white/[0.03] border-white/10 text-slate-500 hover:text-slate-300 hover:bg-white/[0.08]"
                   )}
                 >
                   <span className={cn("w-1.5 h-1.5 rounded-full", isAutoSignalEnabled ? "bg-indigo-400" : "bg-slate-600")} />
                   AUTO
                 </button>

                 <button 
                   onClick={onGenerateSignal}
                   disabled={signal !== 'NEUTRAL' || isPredicting}
                   className={cn(
                     "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border",
                     signal !== 'NEUTRAL' || isPredicting
                       ? "bg-white/5 border-white/10 text-slate-500 cursor-not-allowed hidden"
                       : "bg-blue-600/20 border-blue-500/50 hover:bg-blue-600/40 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)] active:scale-95"
                   )}
                 >
                   {isPredicting ? 'SCANNING...' : 'SCAN'}
                 </button>
               </div>
             </div>
             
             <div className="flex items-center justify-between mb-2">
               <div className="flex flex-col">
                 <AnimatePresence mode="wait">
                   <motion.span 
                     key={signal}
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: 10 }}
                     className={cn(
                       "text-2xl font-black italic tracking-tighter uppercase mb-1 drop-shadow-md",
                       isBuy ? "text-emerald-400" : 
                       isSell ? "text-rose-400" : 
                       "text-slate-500"
                     )}
                   >
                     {signal === 'NEUTRAL' ? 'ANALYZING...' : signal === 'BUY' ? 'CALL (UP)' : 'PUT (DOWN)'}
                   </motion.span>
                 </AnimatePresence>
                 {signal !== 'NEUTRAL' && (
                   <div className="flex items-center gap-2 mt-2">
                     <span className="text-xs text-slate-400 font-mono font-bold tracking-tight">{confidence}% CONFIDENCE</span>
                     <motion.span 
                       initial={{ scale: 0.8, opacity: 0 }}
                       animate={{ scale: 1, opacity: 1 }}
                       className={cn(
                         "px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-[0.2em] border",
                         accuracy.bg, accuracy.color,
                         accuracy.label === 'STRONG' ? "border-emerald-500/40" : 
                         accuracy.label === 'MEDIUM' ? "border-amber-500/40" : "border-slate-500/40"
                       )}
                     >
                       {accuracy.label}
                     </motion.span>
                   </div>
                 )}
               </div>
               
               <AnimatePresence mode="wait">
                 {signal !== 'NEUTRAL' && (
                   <motion.div 
                     key={signal}
                     initial={{ scale: 0.5, rotate: isBuy ? -45 : 45, opacity: 0 }}
                     animate={{ scale: 1, rotate: 0, opacity: 1 }}
                     className={cn(
                       "w-14 h-14 rounded-2xl flex items-center justify-center border shadow-xl relative",
                       isBuy ? "bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/40 text-emerald-400 shadow-emerald-500/20" : 
                       "bg-gradient-to-br from-rose-500/20 to-rose-600/10 border-rose-500/40 text-rose-400 shadow-rose-500/20"
                     )}
                   >
                     {isBuy ? <TrendingUp className="w-7 h-7 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> : <TrendingDown className="w-7 h-7 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />}
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>

             {/* Market Strength Bar */}
             <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden mt-6 relative border border-white/5">
               <motion.div 
                 className={cn("h-full relative z-10 shadow-[0_0_10px_currentColor]", isBuy ? "bg-emerald-500 text-emerald-500" : isSell ? "bg-rose-500 text-rose-500" : "bg-blue-500 text-blue-500")}
                 initial={{ width: 0 }}
                 animate={{ width: signal === 'NEUTRAL' ? '30%' : `${confidence}%` }}
                 transition={{ type: "spring", damping: 15, stiffness: 100 }}
               />
               <motion.div 
                 className="absolute inset-0 bg-white/10 z-0"
                 animate={{ opacity: [0.1, 0.3, 0.1] }}
                 transition={{ repeat: Infinity, duration: 2 }}
               />
             </div>
           </div>
        </div>

        {/* CALL & PUT BUTTONS - The Most Important Part */}
        <div className="flex flex-col gap-3 md:gap-4 mt-auto">
          <motion.button
            whileHover={{ scale: 1.02, translateY: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onTrade('BUY')}
            className="w-full py-4 md:py-6 bg-gradient-to-t from-[#16a34a] to-[#22c55e] hover:from-[#15803d] hover:to-[#16a34a] border border-[#22c55e]/50 text-white rounded-2xl flex flex-col items-center justify-center shadow-[0_10px_30px_-10px_rgba(34,197,94,0.5)] relative overflow-hidden group"
          >
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-6 h-6 md:w-7 md:h-7 drop-shadow-md" />
              <span className="text-xl md:text-2xl font-black italic tracking-tighter uppercase drop-shadow-md">HIGHER</span>
            </div>
            <span className="text-[9px] md:text-[11px] font-black opacity-90 uppercase tracking-[0.2em] drop-shadow-md">CALL (BUY)</span>
            {/* Glossy Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, translateY: 2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onTrade('SELL')}
            className="w-full py-4 md:py-6 bg-gradient-to-t from-[#dc2626] to-[#ef4444] hover:from-[#b91c1c] hover:to-[#dc2626] border border-[#ef4444]/50 text-white rounded-2xl flex flex-col items-center justify-center shadow-[0_10px_30px_-10px_rgba(239,68,68,0.5)] relative overflow-hidden group"
          >
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-6 h-6 md:w-7 md:h-7 drop-shadow-md" />
              <span className="text-xl md:text-2xl font-black italic tracking-tighter uppercase drop-shadow-md">LOWER</span>
            </div>
            <span className="text-[9px] md:text-[11px] font-black opacity-90 uppercase tracking-[0.2em] drop-shadow-md">PUT (SELL)</span>
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </motion.button>
        </div>
      </div>

      {/* AI Explanation Tooltip-like Info */}
      <AnimatePresence>
        {(isExplaining || explanation) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 mt-auto mb-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">AI Market Analysis</span>
            </div>
            {isExplaining ? (
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <motion.div 
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                    className="w-1 h-1 rounded-full bg-blue-500" 
                  />
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 italic leading-relaxed">
                "{explanation}"
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
