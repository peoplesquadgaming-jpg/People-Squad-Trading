import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export interface Trade {
  id: string;
  asset: string;
  type: 'BUY' | 'SELL';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  currentPrice: number;
  amount: number;
  maxProfit?: number;
  lotSize?: number;
  status?: 'PENDING' | 'FILLED' | 'CANCELED';
}

interface OpenTradesProps {
  trades: Trade[];
  onCloseTrade: (id: string) => void;
}

export function OpenTrades({ trades, onCloseTrade }: OpenTradesProps) {
  if (trades.length === 0) return null;

  const pendingTrades = trades.filter(t => t.status === 'PENDING');
  const activeTrades = trades.filter(t => t.status !== 'PENDING');

  return (
    <div className="space-y-6">
      {/* 1. Pending Limit Orders Block */}
      {pendingTrades.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <h3 className="text-xs font-mono text-amber-400 uppercase tracking-[0.25em] font-bold">
              Pending Entries ({pendingTrades.length})
            </h3>
          </div>
          
          <div className="space-y-3">
            {pendingTrades.map(trade => {
              const decimals = trade.entryPrice > 5 ? 2 : 5;
              const distance = Math.abs(trade.currentPrice - trade.entryPrice);
              
              return (
                <motion.div 
                  key={trade.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass-panel rounded-xl p-4 border-amber-500/10 bg-amber-950/5 relative overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-500 to-yellow-600 animate-pulse" />
                  
                  <div className="flex justify-between items-start pl-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20">
                          PENDING {trade.type}
                        </span>
                        <span className="font-bold text-slate-200">{trade.asset}</span>
                      </div>
                      
                      <div className="text-xs text-slate-400 font-mono mt-2">
                        Limit Entry: <span className="text-amber-400 font-bold">{trade.entryPrice.toFixed(decimals)}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Current: {trade.currentPrice.toFixed(decimals)} (<span className="text-slate-400">-{distance.toFixed(decimals)}</span>)
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => onCloseTrade(trade.id)}
                      className="text-[10px] text-rose-400 hover:text-rose-300 uppercase tracking-wider flex items-center gap-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/10 px-2 py-1 rounded transition-all"
                      title="Cancel Pending Limit Order"
                    >
                      <X className="w-3 h-3" /> Cancel
                    </button>
                  </div>

                  <div className="mt-3 pl-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1 text-slate-500 animate-pulse font-mono uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" />
                      Awaiting entry trigger...
                    </span>
                    <span className="font-mono text-[9px] text-slate-400 bg-white/5 px-1.5 py-0.5 rounded">
                      Vol: ${trade.amount}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Active Positions Block */}
      {activeTrades.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <h3 className="text-xs font-mono text-emerald-400 uppercase tracking-[0.25em] font-bold">
              Active Positions ({activeTrades.length})
            </h3>
          </div>

          <div className="space-y-3">
            {activeTrades.map(trade => {
              const decimals = trade.entryPrice > 5 ? 2 : 5;
              const isProfit = trade.type === 'BUY' 
                ? trade.currentPrice > trade.entryPrice 
                : trade.currentPrice < trade.entryPrice;
                
              const pnl = trade.type === 'BUY'
                ? ((trade.currentPrice - trade.entryPrice) / trade.entryPrice) * trade.amount * 100
                : ((trade.entryPrice - trade.currentPrice) / trade.entryPrice) * trade.amount * 100;

              return (
                <motion.div 
                  key={trade.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass-panel rounded-xl p-4 border-white/5 relative overflow-hidden group"
                >
                  <div className={cn(
                    "absolute top-0 left-0 w-1 h-full",
                    trade.type === 'BUY' ? "bg-emerald-500" : "bg-rose-500"
                  )} />
                  
                  <div className="flex justify-between items-start mb-3 pl-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded",
                          trade.type === 'BUY' ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                        )}>
                          {trade.type}
                        </span>
                        <span className="font-bold text-slate-200">{trade.asset}</span>
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-1">
                        Entry: {trade.entryPrice.toFixed(decimals)} <span className="text-slate-600 mx-1">|</span> Vol: ${trade.amount} {trade.lotSize !== undefined ? `(${trade.lotSize.toFixed(2)} Lot)` : ''}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={cn(
                        "font-mono font-black flex items-center justify-end gap-1 text-sm",
                        isProfit ? "text-emerald-400" : "text-rose-400"
                      )}>
                        {isProfit ? <TrendingUp className="w-3.5 h-3.5 animate-pulse" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                      </div>
                      <button 
                        onClick={() => onCloseTrade(trade.id)}
                        className="text-[10px] text-slate-400 hover:text-white mt-1.5 uppercase tracking-wider flex items-center gap-1 justify-end w-full bg-white/5 border border-white/5 hover:bg-white/10 px-1.5 py-0.5 rounded transition-all ml-auto"
                      >
                        <X className="w-3 h-3" /> Force Close
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pl-2 pt-3 border-t border-white/5">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase font-mono tracking-wider block mb-0.5">Stop Loss</span>
                      <span className="text-xs font-mono text-rose-400">{trade.stopLoss.toFixed(decimals)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase font-mono tracking-wider block mb-0.5">Take Profit</span>
                      <span className="text-xs font-mono text-emerald-400">{trade.takeProfit.toFixed(decimals)}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
