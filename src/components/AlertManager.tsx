import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export interface PriceAlert {
  id: string;
  asset: string;
  price: number;
  type: 'ABOVE' | 'BELOW';
  active: boolean;
}

interface AlertManagerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: PriceAlert[];
  onAddAlert: (alert: Omit<PriceAlert, 'id' | 'active'>) => void;
  onRemoveAlert: (id: string) => void;
  currentAsset: string;
  currentPrice: number;
}

export const AlertManager: React.FC<AlertManagerProps> = ({
  isOpen,
  onClose,
  alerts,
  onAddAlert,
  onRemoveAlert,
  currentAsset,
  currentPrice,
}) => {
  const [newPrice, setNewPrice] = useState(currentPrice.toString());
  const [type, setType] = useState<'ABOVE' | 'BELOW'>('ABOVE');

  const handleAdd = () => {
    const price = parseFloat(newPrice);
    if (isNaN(price)) return;
    onAddAlert({ asset: currentAsset, price, type });
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
            initial={{ opacity: 0, scale: 0.95, x: '100%' }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: '100%' }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0a0a0c] border-l border-white/5 shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#121216]/50 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <Bell className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white italic uppercase tracking-tight">Price Alerts</h2>
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Manage your notifications</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-8">
              {/* Add Alert Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-mono text-slate-500 uppercase tracking-[0.2em] font-bold">Set New Alert</h3>
                <div className="glass-panel rounded-2xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-300">{currentAsset}</span>
                    <span className="text-xs font-mono text-blue-400">Current: {currentPrice > 100 ? currentPrice.toFixed(2) : currentPrice.toFixed(5)}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setType('ABOVE')}
                      className={cn(
                        "flex-1 py-2 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                        type === 'ABOVE' 
                          ? "bg-green-500/10 border-green-500/50 text-green-500" 
                          : "bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700"
                      )}
                    >
                      <TrendingUp className="w-3 h-3" />
                      Above
                    </button>
                    <button
                      onClick={() => setType('BELOW')}
                      className={cn(
                        "flex-1 py-2 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                        type === 'BELOW' 
                          ? "bg-red-500/10 border-red-500/50 text-red-500" 
                          : "bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700"
                      )}
                    >
                      <TrendingDown className="w-3 h-3" />
                      Below
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-blue-500/50 transition-all"
                      placeholder="Enter target price..."
                    />
                  </div>

                  <button
                    onClick={handleAdd}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                  >
                    <Plus className="w-4 h-4" />
                    Create Alert
                  </button>
                </div>
              </div>

              {/* Alerts List */}
              <div className="space-y-4">
                <h3 className="text-xs font-mono text-slate-500 uppercase tracking-[0.2em] font-bold">Active Alerts ({alerts.length})</h3>
                <div className="space-y-3">
                  {alerts.length === 0 ? (
                    <div className="text-center py-10 glass-panel rounded-2xl border-dashed border-slate-800">
                      <Bell className="w-8 h-8 text-slate-700 mx-auto mb-3 opacity-20" />
                      <p className="text-xs text-slate-600 font-mono uppercase tracking-widest">No active alerts</p>
                    </div>
                  ) : (
                    alerts.map((alert) => (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="glass-panel rounded-xl p-4 flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center border",
                            alert.type === 'ABOVE' ? "bg-green-500/5 border-green-500/20 text-green-500" : "bg-red-500/5 border-red-500/20 text-red-500"
                          )}>
                            {alert.type === 'ABOVE' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-white uppercase tracking-tight">{alert.asset}</span>
                              <span className={cn(
                                "text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter",
                                alert.type === 'ABOVE' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                              )}>
                                {alert.type}
                              </span>
                            </div>
                            <span className="text-sm font-mono font-bold text-slate-400">
                              {alert.price > 100 ? alert.price.toFixed(2) : alert.price.toFixed(5)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => onRemoveAlert(alert.id)}
                          className="p-2 hover:bg-red-500/10 rounded-lg text-slate-600 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-[#121216]/50 backdrop-blur-xl border-t border-white/5">
              <div className="flex items-center gap-3 text-blue-400/60">
                <Bell className="w-4 h-4" />
                <p className="text-[10px] font-medium leading-tight">
                  You will receive a visual notification on the dashboard when your target price is reached.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
