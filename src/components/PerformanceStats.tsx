import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Clock, Target, Activity } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export interface PerformanceData {
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  averageDuration: string;
  netProfit: number;
}

interface PerformanceStatsProps {
  data: PerformanceData;
}

export function PerformanceStats({ data }: PerformanceStatsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-4 bg-purple-500 rounded-full" />
        <h3 className="text-xs font-mono text-slate-400 uppercase tracking-[0.3em] font-bold">Performance Stats</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <motion.div 
          whileHover={{ y: -2 }}
          className="glass-panel rounded-2xl p-4 border-purple-500/10 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-purple-400" />
            <span className="text-[10px] text-slate-500 uppercase font-mono font-bold tracking-wider">Win Rate</span>
          </div>
          <span className="text-2xl font-black text-slate-200">{data.winRate.toFixed(1)}%</span>
        </motion.div>

        <motion.div 
          whileHover={{ y: -2 }}
          className="glass-panel rounded-2xl p-4 border-emerald-500/10 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] text-slate-500 uppercase font-mono font-bold tracking-wider">Profit Factor</span>
          </div>
          <span className="text-2xl font-black text-emerald-400">{data.profitFactor.toFixed(2)}</span>
        </motion.div>

        <motion.div 
          whileHover={{ y: -2 }}
          className="glass-panel rounded-2xl p-4 border-blue-500/10 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] text-slate-500 uppercase font-mono font-bold tracking-wider">Avg Duration</span>
          </div>
          <span className="text-xl font-black text-slate-200">{data.averageDuration}</span>
        </motion.div>

        <motion.div 
          whileHover={{ y: -2 }}
          className={cn(
            "glass-panel rounded-2xl p-4 flex flex-col",
            data.netProfit >= 0 ? "border-emerald-500/10" : "border-rose-500/10"
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            {data.netProfit >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-400" />
            )}
            <span className="text-[10px] text-slate-500 uppercase font-mono font-bold tracking-wider">Net Profit</span>
          </div>
          <span className={cn(
            "text-xl font-black",
            data.netProfit >= 0 ? "text-emerald-400" : "text-rose-400"
          )}>
            {data.netProfit >= 0 ? '+' : ''}${data.netProfit.toFixed(2)}
          </span>
        </motion.div>
      </div>
      
      <div className="glass-panel rounded-2xl p-4 border-white/5 flex items-center justify-between">
        <span className="text-xs text-slate-400 font-medium">Total Trades Executed</span>
        <span className="text-sm font-black text-slate-200">{data.totalTrades}</span>
      </div>
    </div>
  );
}
