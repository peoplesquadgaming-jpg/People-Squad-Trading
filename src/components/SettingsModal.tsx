import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableIndicators: string[];
  visibleIndicators: string[];
  onToggleIndicator: (name: string) => void;
  realBalance: number;
  demoBalance: number;
  onUpdateBalance: (type: 'REAL' | 'DEMO', amount: number) => void;
  autoTradeAssets: string[];
  onToggleAutoTradeAsset: (asset: string) => void;
  dailyLossLimit: number;
  profitTarget: number;
  onUpdateDailyLossLimit: (val: number) => void;
  onUpdateProfitTarget: (val: number) => void;
  autoSignalThreshold: number;
  onUpdateAutoSignalThreshold: (val: number) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  availableIndicators,
  visibleIndicators,
  onToggleIndicator,
  realBalance,
  demoBalance,
  onUpdateBalance,
  autoTradeAssets,
  onToggleAutoTradeAsset,
  dailyLossLimit,
  profitTarget,
  onUpdateDailyLossLimit,
  onUpdateProfitTarget,
  autoSignalThreshold,
  onUpdateAutoSignalThreshold,
}) => {
  const [activeTab, setActiveTab] = React.useState<'indicators' | 'autotrade' | 'balance'>('indicators');
  const [depositAmount, setDepositAmount] = React.useState('1000');

  const assetsList = [
    'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'EUR/GBP', 'NZD/USD', 'USD/CHF',
    'GBP/JPY', 'EUR/JPY', 'BTC/USD', 'ETH/USD', 'LTC/USD', 'XRP/USD',
    'GOLD', 'SILVER', 'BRENT', 'CRUDE'
  ];

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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#121216] border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Settings</h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex border-b border-slate-800">
              <button 
                onClick={() => setActiveTab('indicators')}
                className={cn(
                  "flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all",
                  activeTab === 'indicators' ? "text-blue-500 border-b-2 border-blue-500" : "text-slate-500 hover:text-slate-300"
                )}
              >
                Indicators
              </button>
              <button 
                onClick={() => setActiveTab('autotrade')}
                className={cn(
                  "flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all",
                  activeTab === 'autotrade' ? "text-blue-500 border-b-2 border-blue-500" : "text-slate-500 hover:text-slate-300"
                )}
              >
                Auto-Trade
              </button>
              <button 
                onClick={() => setActiveTab('balance')}
                className={cn(
                  "flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all",
                  activeTab === 'balance' ? "text-blue-500 border-b-2 border-blue-500" : "text-slate-500 hover:text-slate-300"
                )}
              >
                Balance
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'indicators' ? (
                <>
                  <p className="text-sm text-slate-500 mb-6">Select which technical indicators you want to display on your dashboard.</p>
                  
                  <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {availableIndicators.map((name) => {
                      const isVisible = visibleIndicators.includes(name);
                      return (
                        <button
                          key={name}
                          onClick={() => onToggleIndicator(name)}
                          className={cn(
                            "flex items-center justify-between p-4 rounded-xl border transition-all text-left",
                            isVisible 
                              ? "bg-blue-600/10 border-blue-600/50 text-white" 
                              : "bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700"
                          )}
                        >
                          <span className="font-medium">{name}</span>
                          <div className={cn(
                            "w-6 h-6 rounded-full border flex items-center justify-center transition-all",
                            isVisible 
                              ? "bg-blue-600 border-blue-600 text-white" 
                              : "border-slate-700 text-transparent"
                          )}>
                            <Check className="w-4 h-4" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : activeTab === 'autotrade' ? (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Auto & AI Settings</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                        <label className="text-[10px] text-slate-500 uppercase font-mono tracking-widest block mb-1">Signal Strategy</label>
                        <label className="text-[9px] text-slate-600 block mb-2 leading-tight">Minimum % confidence for Auto Signals</label>
                        <input 
                          type="number"
                          min="50"
                          max="99"
                          value={autoSignalThreshold}
                          onChange={(e) => onUpdateAutoSignalThreshold(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500/50"
                        />
                      </div>
                      <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                        <label className="text-[10px] text-slate-500 uppercase font-mono tracking-widest block mb-1">Daily Loss Limit</label>
                        <label className="text-[9px] text-slate-600 block mb-2 leading-tight">Stop trading if loss hits limit</label>
                        <input 
                          type="number"
                          value={dailyLossLimit}
                          onChange={(e) => onUpdateDailyLossLimit(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-rose-500/50"
                        />
                      </div>
                      <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl md:col-span-2 lg:col-span-1">
                        <label className="text-[10px] text-slate-500 uppercase font-mono tracking-widest block mb-1">Profit Target</label>
                        <label className="text-[9px] text-slate-600 block mb-2 leading-tight">Stop trading if profit hits target</label>
                        <input 
                          type="number"
                          value={profitTarget}
                          onChange={(e) => onUpdateProfitTarget(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Enabled Assets</div>
                    <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                      {assetsList.map((assetName) => {
                        const isEnabled = autoTradeAssets.includes(assetName);
                        return (
                          <button
                            key={assetName}
                            onClick={() => onToggleAutoTradeAsset(assetName)}
                            className={cn(
                              "flex items-center justify-between p-4 rounded-xl border transition-all text-left",
                              isEnabled 
                                ? "bg-emerald-600/10 border-emerald-600/50 text-white" 
                                : "bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700"
                            )}
                          >
                            <span className="font-medium text-sm">{assetName}</span>
                            <div className={cn(
                              "w-5 h-5 rounded-full border flex items-center justify-center transition-all shrink-0",
                              isEnabled 
                                ? "bg-emerald-600 border-emerald-600 text-white" 
                                : "border-slate-700 text-transparent"
                            )}>
                              <Check className="w-3 h-3" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                      <div className="text-[10px] text-slate-500 uppercase font-mono tracking-widest mb-1">Demo Balance</div>
                      <div className="text-xl font-black text-blue-400 font-mono">${demoBalance.toLocaleString()}</div>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                      <div className="text-[10px] text-slate-500 uppercase font-mono tracking-widest mb-1">Real Balance</div>
                      <div className="text-xl font-black text-emerald-400 font-mono">${realBalance.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Deposit Funds</div>
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                        placeholder="Amount"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => onUpdateBalance('DEMO', Number(depositAmount))}
                        className="py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                      >
                        Deposit Demo
                      </button>
                      <button 
                        onClick={() => onUpdateBalance('REAL', Number(depositAmount))}
                        className="py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                      >
                        Deposit Real
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => onUpdateBalance('DEMO', -demoBalance + 10000)}
                        className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                      >
                        Reset Demo ($10k)
                      </button>
                      <button 
                        onClick={() => onUpdateBalance('REAL', -realBalance)}
                        className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                      >
                        Reset Real ($0)
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 bg-slate-900/30 border-t border-slate-800 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-blue-600/20"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
