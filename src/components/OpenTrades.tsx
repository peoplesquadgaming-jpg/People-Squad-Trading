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
}

interface OpenTradesProps {
  trades: Trade[];
  onCloseTrade: (id: string) => void;
}

export function OpenTrades({ trades, onCloseTrade }: OpenTradesProps) {
  if (trades.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-4 bg-blue-500 rounded-full" />
        <h3 className="text-xs font-mono text-slate-400 uppercase tracking-[0.3em] font-bold">Open Trades</h3>
      </div>
      
      <div className="space-y-3">
        {trades.map(trade => {
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
                    Entry: {trade.entryPrice > 100 ? trade.entryPrice.toFixed(2) : trade.entryPrice.toFixed(5)} <span className="text-slate-600 mx-1">|</span> Vol: ${trade.amount} {trade.lotSize !== undefined ? `(${trade.lotSize.toFixed(2)} Lot)` : ''}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={cn(
                    "font-mono font-black flex items-center justify-end gap-1",
                    isProfit ? "text-emerald-400" : "text-rose-400"
                  )}>
                    {isProfit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {pnl > 0 ? '+$' : '-$'}{Math.abs(pnl).toFixed(2)}
                  </div>
                  <button 
                    onClick={() => onCloseTrade(trade.id)}
                    className="text-[10px] text-slate-500 hover:text-white mt-1 uppercase tracking-wider flex items-center gap-1 justify-end w-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" /> Close
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pl-2 pt-3 border-t border-white/5">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-mono tracking-wider block mb-1">Stop Loss</span>
                  <span className="text-xs font-mono text-rose-400">{trade.stopLoss > 100 ? trade.stopLoss.toFixed(2) : trade.stopLoss.toFixed(5)}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-mono tracking-wider block mb-1">Take Profit</span>
                  <span className="text-xs font-mono text-emerald-400">{trade.takeProfit > 100 ? trade.takeProfit.toFixed(2) : trade.takeProfit.toFixed(5)}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
