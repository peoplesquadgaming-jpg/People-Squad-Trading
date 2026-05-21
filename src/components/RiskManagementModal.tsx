import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Target, ShieldAlert, Zap, DollarSign, Bot } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface RiskManagementProps {
  isOpen: boolean;
  onClose: () => void;
  currentPrice: number;
  onExecuteTrade: (params: { type: 'BUY' | 'SELL', stopLoss: number, takeProfit: number, amount: number, lotSize: number }) => void;
  balance: number;
  accountType: 'REAL' | 'DEMO';
}

export const RiskManagementModal: React.FC<RiskManagementProps> = ({
  isOpen,
  onClose,
  currentPrice,
  onExecuteTrade,
  balance,
  accountType,
}) => {
  const [stopLoss, setStopLoss] = useState((currentPrice * 0.99).toFixed(5));
  const [takeProfit, setTakeProfit] = useState((currentPrice * 1.02).toFixed(5));
  const [amount, setAmount] = useState('100');
  const [lotSize, setLotSize] = useState('1.00');
  const [isAiAmount, setIsAiAmount] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const decimals = currentPrice > 5 ? 2 : 5;
      setStopLoss((currentPrice * 0.99).toFixed(decimals));
      setTakeProfit((currentPrice * 1.02).toFixed(decimals));
    }
  }, [isOpen, currentPrice]);

  useEffect(() => {
    if (isAiAmount && isOpen) {
      // Simulate AI calculating an optimal trade amount based on volatility/risk
      const aiCalculated = Math.floor(Math.random() * 400) + 100; // Random amount between 100 and 500
      setAmount(aiCalculated.toString());
      setLotSize((aiCalculated / 100).toFixed(2));
    }
  }, [isAiAmount, isOpen]);

  const handleTrade = (type: 'BUY' | 'SELL') => {
    onExecuteTrade({
      type,
      stopLoss: parseFloat(stopLoss),
      takeProfit: parseFloat(takeProfit),
      amount: parseFloat(amount) || 100,
      lotSize: parseFloat(lotSize) || 1.00,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="glass-panel w-full max-w-sm rounded-3xl p-6 space-y-6 border border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-white italic uppercase tracking-tight">Risk Parameters</h2>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <DollarSign className="w-3 h-3" /> Trade Amount ($)
                    </label>
                    <div className="text-[9px] font-mono text-slate-500">
                      Balance: <span className={cn(accountType === 'REAL' ? "text-emerald-400" : "text-blue-400")}>${balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => { 
                        setAmount(e.target.value); 
                        setIsAiAmount(false); 
                        setLotSize((parseFloat(e.target.value) / 100).toFixed(2));
                      }}
                      disabled={isAiAmount}
                      className="flex-1 bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-blue-500/50 outline-none disabled:opacity-50"
                    />
                    <button
                      onClick={() => setIsAiAmount(!isAiAmount)}
                      className={cn(
                        "h-[46px] px-3 rounded-xl transition-colors flex items-center gap-1 border",
                        isAiAmount ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "bg-slate-800 text-slate-500 border-slate-700"
                      )}
                    >
                      <Bot className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 bg-[#121216]/40 p-3 rounded-2xl border border-white/5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      ⚙️ Lot Position (Forex)
                    </label>
                    <span className="text-[11px] font-mono font-black text-blue-400">{parseFloat(lotSize).toFixed(2)} Lot</span>
                  </div>
                  
                  {/* Preset lot values */}
                  <div className="grid grid-cols-5 gap-1 pt-1">
                    {[0.10, 1.00, 2.00, 4.00, 5.00].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setLotSize(preset.toFixed(2));
                          setAmount((preset * 100).toString());
                          setIsAiAmount(false);
                        }}
                        className={cn(
                          "py-1.5 rounded-lg text-[9px] font-black transition-all",
                          parseFloat(lotSize) === preset && !isAiAmount
                            ? "bg-blue-600/20 text-blue-400 border border-blue-500/50"
                            : "bg-white/5 text-slate-400 border border-transparent hover:bg-white/10"
                        )}
                      >
                        {preset.toFixed(1)} L
                      </button>
                    ))}
                  </div>

                  {/* Manual Decimal Step */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={isAiAmount ? '' : lotSize}
                      placeholder={isAiAmount ? 'AI Lot Size' : '1.00'}
                      onChange={(e) => {
                        const val = Math.max(0.01, parseFloat(e.target.value) || 0.01);
                        setLotSize(val.toString());
                        setAmount((val * 100).toString());
                        setIsAiAmount(false);
                      }}
                      disabled={isAiAmount}
                      className="flex-1 bg-slate-900/40 border border-[#1e293b] rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-blue-500/50 outline-none text-right placeholder-slate-600"
                    />

                    <div className="flex bg-white/5 rounded-lg border border-white/5 overflow-hidden">
                      <button 
                        type="button"
                        onClick={() => {
                          const next = Math.max(0.01, parseFloat(lotSize) - 0.1);
                          setLotSize(next.toFixed(2));
                          setAmount((next * 100).toString());
                        }}
                        className="px-2 py-1 text-slate-400 hover:text-white text-xs font-black"
                      >
                        -
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          const next = parseFloat(lotSize) + 0.1;
                          setLotSize(next.toFixed(2));
                          setAmount((next * 100).toString());
                        }}
                        className="px-2 py-1 text-slate-400 hover:text-white text-xs font-black border-l border-white/5"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <ShieldAlert className="w-3 h-3" /> Stop Loss
                  </label>
                  <input
                    type="number"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-red-500/50 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Target className="w-3 h-3" /> Take Profit
                  </label>
                  <input
                    type="number"
                    value={takeProfit}
                    onChange={(e) => setTakeProfit(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-green-500/50 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleTrade('BUY')}
                  className="py-3 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl transition-all shadow-lg shadow-green-600/20 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                >
                  <Zap className="w-4 h-4" /> Buy
                </button>
                <button
                  onClick={() => handleTrade('SELL')}
                  className="py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                >
                  <Zap className="w-4 h-4" /> Sell
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
