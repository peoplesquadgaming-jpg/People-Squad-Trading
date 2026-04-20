import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, TrendingUp, TrendingDown, History, Bot, Filter, ArrowUpDown, ChevronDown, Calendar, Search } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export interface ClosedTrade {
  id: string;
  asset: string;
  type: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  closeTime: string;
  timestamp?: number;
  amount: number;
  closedBy?: 'SL' | 'TP' | 'AI' | 'MANUAL' | 'TS';
}

interface TradingHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: ClosedTrade[];
}

type SortField = 'time' | 'pnl' | 'amount';
type SortOrder = 'desc' | 'asc';

export const TradingHistoryModal: React.FC<TradingHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
}) => {
  const [assetFilter, setAssetFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  const [reasonFilter, setReasonFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<SortField>('time');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showFilters, setShowFilters] = useState(false);

  const assets = useMemo(() => {
    const set = new Set(history.map(t => t.asset));
    return ['ALL', ...Array.from(set)];
  }, [history]);

  const reasons = ['ALL', 'SL', 'TP', 'AI', 'MANUAL', 'TS'];

  const filteredAndSortedHistory = useMemo(() => {
    let result = [...history];

    // Filtering
    if (assetFilter !== 'ALL') {
      result = result.filter(t => t.asset === assetFilter);
    }
    if (typeFilter !== 'ALL') {
      result = result.filter(t => t.type === typeFilter);
    }
    if (reasonFilter !== 'ALL') {
      result = result.filter(t => t.closedBy === reasonFilter || (reasonFilter === 'MANUAL' && !t.closedBy));
    }

    // Sorting
    result.sort((a, b) => {
      let valA: any = 0;
      let valB: any = 0;

      if (sortField === 'time') {
        // Simple string comparison for time as they are in HH:MM:SS format mostly
        valA = a.closeTime;
        valB = b.closeTime;
      } else if (sortField === 'pnl') {
        valA = a.pnl;
        valB = b.pnl;
      } else if (sortField === 'amount') {
        valA = a.amount;
        valB = b.amount;
      }

      if (valA < valB) return sortOrder === 'desc' ? 1 : -1;
      if (valA > valB) return sortOrder === 'desc' ? -1 : 1;
      return 0;
    });

    return result;
  }, [history, assetFilter, typeFilter, reasonFilter, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
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
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-[#0a0a0c] border-l border-white/10 z-50 flex flex-col shadow-2xl"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <History className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white italic uppercase tracking-tight">Trading History</h2>
                  <p className="text-xs text-slate-500 font-mono">Past closed positions</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "p-2 rounded-lg transition-all border",
                    showFilters ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "bg-white/5 border-white/5 text-slate-400 hover:text-slate-200"
                  )}
                >
                  <Filter className="w-4 h-4" />
                </button>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filters Section */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-b border-white/5 bg-white/[0.01] overflow-hidden"
                >
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] text-slate-500 uppercase font-mono font-bold tracking-widest block mb-2">Asset</label>
                        <div className="relative">
                          <select
                            value={assetFilter}
                            onChange={(e) => setAssetFilter(e.target.value)}
                            className="w-full bg-[#050507] border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500/50 appearance-none font-mono"
                          >
                            {assets.map(a => <option key={a} value={a}>{a}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 uppercase font-mono font-bold tracking-widest block mb-2">Type</label>
                        <div className="flex gap-1 p-1 bg-[#050507] rounded-lg border border-white/10">
                          {['ALL', 'BUY', 'SELL'].map(t => (
                            <button
                              key={t}
                              onClick={() => setTypeFilter(t as any)}
                              className={cn(
                                "flex-1 py-1.5 rounded-md text-[10px] font-bold transition-all",
                                typeFilter === t ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-300"
                              )}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 uppercase font-mono font-bold tracking-widest block mb-2">Close Reason</label>
                      <div className="flex flex-wrap gap-2">
                        {reasons.map(r => (
                          <button
                            key={r}
                            onClick={() => setReasonFilter(r)}
                            className={cn(
                              "px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all",
                              reasonFilter === r 
                                ? "bg-blue-500/20 border-blue-500/30 text-blue-400" 
                                : "bg-white/5 border-white/10 text-slate-500 hover:text-slate-300"
                            )}
                          >
                            {r === 'MANUAL' ? 'MANUAL' : r}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 flex gap-4">
                      <div className="flex-1">
                        <label className="text-[10px] text-slate-500 uppercase font-mono font-bold tracking-widest block mb-2">Sort By</label>
                        <div className="flex gap-2">
                          {(['time', 'pnl', 'amount'] as SortField[]).map(field => (
                            <button
                              key={field}
                              onClick={() => toggleSort(field)}
                              className={cn(
                                "px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all flex items-center gap-1.5",
                                sortField === field 
                                  ? "bg-white/10 border-white/20 text-white" 
                                  : "bg-white/5 border-white/5 text-slate-500"
                              )}
                            >
                              {field.toUpperCase()}
                              {sortField === field && <ArrowUpDown className="w-3 h-3 text-blue-400" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {filteredAndSortedHistory.length === 0 ? (
                <div className="text-center py-10 flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center border border-white/5 text-slate-700">
                    <History className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No matching trades</p>
                    <p className="text-[10px] text-slate-600 font-mono">Try adjusting your filters</p>
                  </div>
                  {(assetFilter !== 'ALL' || typeFilter !== 'ALL' || reasonFilter !== 'ALL') && (
                    <button 
                      onClick={() => {
                        setAssetFilter('ALL');
                        setTypeFilter('ALL');
                        setReasonFilter('ALL');
                      }}
                      className="text-[10px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-widest"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              ) : (
                filteredAndSortedHistory.map(trade => (
                  <div key={trade.id} className="glass-panel rounded-xl p-4 border-white/5 relative overflow-hidden">
                    <div className={cn(
                      "absolute top-0 left-0 w-1 h-full",
                      trade.pnl >= 0 ? "bg-emerald-500" : "bg-rose-500"
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
                          <div className="text-[10px] text-slate-500 font-mono mt-1 flex items-center gap-1.5 flex-wrap">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {trade.closeTime}</span>
                            <span className="text-slate-600">|</span>
                            <span>Vol: ${trade.amount}</span>
                            <span className="text-slate-600">|</span>
                            <span className={cn(
                              "px-1.5 py-0.5 rounded border text-[9px] font-bold flex items-center gap-1",
                              trade.closedBy === 'TP' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                              trade.closedBy === 'SL' ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                              trade.closedBy === 'AI' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                              trade.closedBy === 'TS' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                              "bg-slate-500/10 text-slate-400 border-slate-500/20"
                            )}>
                              {trade.closedBy === 'AI' && <Bot className="w-3 h-3" />}
                              {trade.closedBy === 'TS' && <TrendingUp className="w-3 h-3" />}
                              {trade.closedBy === 'TP' ? 'TAKE PROFIT' : 
                               trade.closedBy === 'SL' ? 'STOP LOSS' : 
                               trade.closedBy === 'AI' ? 'AI EARLY CLOSE' : 
                               trade.closedBy === 'TS' ? 'PROFIT PROTECTED' : 
                               'MANUAL CLOSE'}
                            </span>
                          </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={cn(
                          "font-mono font-black flex items-center justify-end gap-1 text-lg",
                          trade.pnl >= 0 ? "text-emerald-400" : "text-rose-400"
                        )}>
                          {trade.pnl >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          {trade.pnl >= 0 ? '+$' : '-$'}{Math.abs(trade.pnl).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pl-2 pt-3 border-t border-white/5">
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase font-mono tracking-wider block mb-1">Entry Price</span>
                        <span className="text-xs font-mono text-slate-300">{trade.entryPrice > 100 ? trade.entryPrice.toFixed(2) : trade.entryPrice.toFixed(5)}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase font-mono tracking-wider block mb-1">Exit Price</span>
                        <span className="text-xs font-mono text-slate-300">{trade.exitPrice > 100 ? trade.exitPrice.toFixed(2) : trade.exitPrice.toFixed(5)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
