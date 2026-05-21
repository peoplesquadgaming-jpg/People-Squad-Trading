import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, TrendingDown, ShieldCheck, AlertCircle, Bot, Copy, Check, Zap } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export type SignalType = 'BUY' | 'SELL' | 'NEUTRAL';

interface SignalPanelProps {
  signal: SignalType;
  confidence: number;
  asset: string;
  duration?: string;
  timeLeft?: number;
  isPredicting?: boolean;
  predictionType?: SignalType;
  explanation?: string;
  isExplaining?: boolean;
  selectedBroker?: 'NONE' | 'POCKET_OPTION' | 'QUOTEX';
  aiBoosted?: boolean;
  currentPrice?: number;
  signalEntryPrice?: number;
  onExecuteTrade?: (type: 'BUY' | 'SELL') => void;
}

export const SignalPanel: React.FC<SignalPanelProps> = ({ 
  signal, 
  confidence, 
  asset, 
  duration, 
  timeLeft,
  isPredicting,
  predictionType,
  explanation,
  isExplaining,
  selectedBroker = 'NONE',
  aiBoosted = false,
  currentPrice,
  signalEntryPrice,
  onExecuteTrade
}) => {
  const isBuy = signal === 'BUY';
  const isSell = signal === 'SELL';
  const [copied, setCopied] = React.useState(false);

  const activePrice = signalEntryPrice !== undefined ? signalEntryPrice : currentPrice;

  const copySignal = () => {
    const brokerName = selectedBroker === 'POCKET_OPTION' ? 'Pocket Option' : selectedBroker === 'QUOTEX' ? 'Quotex' : 'Broker';
    const direction = isBuy ? 'CALL (UP)' : 'PUT (DOWN)';
    
    let text = `${brokerName} Signal:\nAsset: ${asset}\nDirection: ${direction}\nDuration: ${duration}\nConfidence: ${confidence}%`;
    
    if (activePrice !== undefined) {
      const priceFormatter = (val: number) => val > 100 ? val.toFixed(2) : val.toFixed(5);
      const tpVal = isBuy ? activePrice * 1.01 : activePrice * 0.99;
      const slVal = isBuy ? activePrice * 0.995 : activePrice * 1.005;
      text += `\nEntry Price: ${priceFormatter(activePrice)}\nTake Profit (TP): ${priceFormatter(tpVal)}\nStop Loss (SL): ${priceFormatter(slVal)}`;
    }
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="signalBox" className={cn(
      "glass-panel rounded-2xl p-8 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500",
      isBuy && "glow-green border-green-500/20",
      isSell && "glow-red border-red-500/20",
      !isBuy && !isSell && (isPredicting ? "glow-indigo" : "glow-blue")
    )}>
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />
      </div>

      <div className="absolute top-6 left-6 flex items-center gap-2">
        <div className={cn(
          "w-1.5 h-1.5 rounded-full animate-pulse",
          isPredicting ? "bg-indigo-500" : "bg-blue-500"
        )} />
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.2em] font-bold">{asset}</span>
      </div>
      
      {signal !== 'NEUTRAL' && duration && (
        <div className="absolute top-6 right-6 flex flex-col items-end gap-1.5">
          <div className="bg-blue-500/10 border border-blue-500/30 px-2.5 py-1 rounded-md text-[10px] font-mono text-blue-400 uppercase tracking-tighter font-bold">
            Expiry: {duration}
          </div>
          {timeLeft !== undefined && (
            <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              Ends in: <span className="text-blue-400 font-bold">{timeLeft}s</span>
            </div>
          )}
        </div>
      )}
      
      <AnimatePresence mode="wait">
        <motion.div
          key={isPredicting ? 'predicting' : signal}
          initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          className="flex flex-col items-center relative z-10"
        >
          {isPredicting ? (
            <>
              <div className="w-24 h-24 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mb-6 relative">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 rounded-full border border-indigo-500/40"
                />
                <Bot className="w-10 h-10 text-indigo-400 animate-pulse" />
              </div>
              <h2 className="text-2xl font-black text-indigo-400 tracking-tighter uppercase italic">Predicting...</h2>
              <p className="text-[10px] font-mono text-indigo-500/70 mt-3 uppercase tracking-widest text-center">
                AI Anticipating {predictionType} Move
              </p>
            </>
          ) : signal === 'NEUTRAL' ? (
            <>
              <div className="w-24 h-24 rounded-full bg-slate-800/30 border border-slate-700/50 flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 rounded-full border border-blue-500/20 animate-ping" />
                <AlertCircle className="w-10 h-10 text-slate-500" />
              </div>
              <h2 className="text-2xl font-black text-slate-500 tracking-tighter uppercase italic">Scanning...</h2>
              <p className="text-[10px] font-mono text-slate-600 mt-3 uppercase tracking-widest">Awaiting Market Confirmation</p>
            </>
          ) : (
            <>
              <motion.div 
                animate={{ 
                  boxShadow: isBuy 
                    ? ["0 0 20px rgba(34,197,94,0.2)", "0 0 40px rgba(34,197,94,0.4)", "0 0 20px rgba(34,197,94,0.2)"]
                    : ["0 0 20px rgba(239,68,68,0.2)", "0 0 40px rgba(239,68,68,0.4)", "0 0 20px rgba(239,68,68,0.2)"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className={cn(
                  "w-28 h-28 rounded-full flex items-center justify-center mb-6 border-2 transition-colors duration-500",
                  isBuy ? "bg-green-500/10 border-green-500/50 text-green-500" : "bg-red-500/10 border-red-500/50 text-red-500"
                )}
              >
                {isBuy ? <TrendingUp className="w-14 h-14" /> : <TrendingDown className="w-14 h-14" />}
              </motion.div>
              <h2 className={cn(
                "font-black tracking-tighter uppercase italic leading-none text-center",
                confidence >= 90 ? "text-4xl md:text-5xl" : "text-6xl",
                isBuy ? "text-green-500" : "text-red-500"
              )}>
                {confidence >= 90 ? `STRONG ${signal}` : signal}
              </h2>
              <div className="flex items-center gap-2.5 mt-6 bg-blue-500/10 px-5 py-2.5 rounded-xl border border-blue-500/20 backdrop-blur-md relative group">
                {aiBoosted && (
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -top-4 -right-2 bg-indigo-600 text-white text-[8px] font-black px-2 py-0.5 rounded-md shadow-lg shadow-indigo-600/30 uppercase tracking-[0.1em] flex items-center gap-1"
                  >
                    <Bot className="w-2 h-2" />
                    AI Verified
                  </motion.div>
                )}
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-mono font-bold text-blue-400 tracking-tight">{confidence}% Accuracy</span>
              </div>

              {activePrice !== undefined && signal !== 'NEUTRAL' && (
                <div className="w-full max-w-[280px] mt-5 grid grid-cols-2 gap-2.5 relative z-10">
                  <div className="flex flex-col items-center justify-center bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 rounded-xl p-2.5 transition-all">
                    <span className="text-[8px] font-black font-mono text-emerald-400/70 uppercase tracking-wider flex items-center gap-1 mb-1">
                      🎯 TAKE PROFIT
                    </span>
                    <span className="text-xs font-mono font-black text-emerald-400">
                      {(isBuy ? activePrice * 1.01 : activePrice * 0.99).toFixed(activePrice > 100 ? 2 : 5)}
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-xl p-2.5 transition-all">
                    <span className="text-[8px] font-black font-mono text-red-400/70 uppercase tracking-wider flex items-center gap-1 mb-1">
                      🛑 STOP LOSS
                    </span>
                    <span className="text-xs font-mono font-black text-red-400">
                      {(isBuy ? activePrice * 0.995 : activePrice * 1.005).toFixed(activePrice > 100 ? 2 : 5)}
                    </span>
                  </div>
                </div>
              )}

              {/* Execute Trade Button */}
              {onExecuteTrade && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onExecuteTrade(signal as 'BUY' | 'SELL')}
                  className={cn(
                    "w-full max-w-[280px] mt-5 py-3 border rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all shadow-lg flex items-center justify-center gap-2 relative overflow-hidden group cursor-pointer",
                    isBuy 
                      ? "bg-emerald-600 hover:bg-emerald-500 border-emerald-500/30 shadow-emerald-500/20" 
                      : "bg-rose-600 hover:bg-rose-500 border-rose-500/30 shadow-rose-500/20"
                  )}
                >
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="flex items-center gap-2"
                  >
                    <Zap className="w-4 h-4 fill-white" />
                    <span>EXECUTE {signal} SIGNAL</span>
                  </motion.div>
                </motion.button>
              )}

              {/* Copy Signal Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={copySignal}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Signal</span>
                  </>
                )}
              </motion.button>

              {/* AI Explanation */}
              <AnimatePresence mode="wait">
                {(isExplaining || explanation) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-6 max-w-[280px] text-center"
                  >
                    {isExplaining ? (
                      <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-blue-400/60 uppercase tracking-widest">
                        <div className="flex gap-1">
                          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }}>.</motion.span>
                          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}>.</motion.span>
                          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}>.</motion.span>
                        </div>
                        AI Analyzing Market
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 leading-relaxed italic font-medium">
                        "{explanation}"
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="w-full mt-10 space-y-3 relative z-10">
        <div className="flex justify-between text-[10px] text-slate-500 uppercase font-mono font-bold tracking-widest">
          <span>Market Strength</span>
          <span className="text-slate-300">92.4%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-800/50 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
            initial={{ width: 0 }}
            animate={{ width: '92.4%' }}
            transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>
    </div>
  );
};
