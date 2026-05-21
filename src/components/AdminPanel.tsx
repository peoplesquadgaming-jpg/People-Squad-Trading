import React, { useState } from 'react';
import { Shield, X, Zap, Target, BarChart3, Settings, AlertTriangle, Save, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: {
    successRate: number;
    signalDelay: number;
    autoTradeThreshold: number;
    marketBias?: 'BUY' | 'SELL' | 'NEUTRAL';
    volatility?: number;
    neuralIntensity?: number;
    socialProofMode?: boolean;
    signalFrequency?: number;
    signalSensitivity?: number;
    scriptMode?: 'NONE' | 'WIN_STREAK' | 'LOSS_STREAK' | 'REALISTIC';
    forceNextSignal?: 'AUTO' | 'WIN' | 'LOSS';
  };
  onUpdateSettings: (settings: any) => void;
}

export function AdminPanel({ isOpen, onClose, currentSettings, onUpdateSettings }: AdminPanelProps) {
  const [settings, setSettings] = useState({
    ...currentSettings,
    marketBias: currentSettings.marketBias || 'NEUTRAL',
    volatility: currentSettings.volatility || 50,
    neuralIntensity: currentSettings.neuralIntensity || 75,
    signalFrequency: currentSettings.signalFrequency || 5,
    signalSensitivity: currentSettings.signalSensitivity || 3,
    scriptMode: currentSettings.scriptMode || 'NONE',
    forceNextSignal: currentSettings.forceNextSignal || 'AUTO',
  });
  const [activeTab, setActiveTab] = useState<'matrix' | 'engine' | 'security'>('matrix');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      onUpdateSettings(settings);
      setIsSaving(false);
    }, 1200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="relative w-full max-w-6xl bg-[#050507] border border-indigo-500/20 rounded-[3rem] overflow-hidden shadow-[0_0_150px_rgba(79,70,229,0.2)] flex flex-col md:flex-row h-[90vh]"
          >
            {/* Professional Command Sidebar */}
            <div className="w-full md:w-80 bg-[#020204] p-10 border-b md:border-b-0 md:border-r border-indigo-500/10 flex flex-col">
              <div className="flex items-center gap-5 mb-14">
                <div className="relative group">
                  <div className="w-14 h-14 bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-400 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.4)] group-hover:rotate-12 transition-transform duration-500">
                    <Shield className="text-white w-8 h-8" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-[#020204] animate-pulse" />
                </div>
                <div>
                  <h2 className="text-white font-black uppercase tracking-tighter italic text-2xl leading-none">CORE <span className="text-indigo-500">V5</span></h2>
                  <p className="text-[10px] text-indigo-400/60 font-mono tracking-[0.4em] font-bold mt-1 uppercase">Admin Protocol</p>
                </div>
              </div>

              <nav className="flex flex-col gap-4 flex-1">
                {[
                  { id: 'matrix', label: 'NEURAL MATRIX', icon: Zap, desc: 'Signal logic & bias' },
                  { id: 'engine', label: 'ENGINE CONFIG', icon: Settings, desc: 'Core system variables' },
                  { id: 'security', label: 'USER CONTROL', icon: Shield, desc: 'Access & Verification' },
                ].map((tab) => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "flex items-start gap-4 px-6 py-5 rounded-[1.5rem] text-left transition-all relative group",
                      activeTab === tab.id ? "bg-indigo-600 text-white shadow-2xl shadow-indigo-600/30" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                    )}
                  >
                    <tab.icon className={cn("w-5 h-5 mt-0.5", activeTab === tab.id ? "text-white" : "text-slate-600")} />
                    <div>
                      <span className="text-sm font-black uppercase tracking-widest block">{tab.label}</span>
                      <span className="text-[10px] font-medium opacity-60 block mt-0.5">{tab.desc}</span>
                    </div>
                    {activeTab === tab.id && (
                      <motion.div 
                        layoutId="nav-glow"
                        className="absolute inset-0 rounded-[1.5rem] bg-gradient-to-r from-white/10 to-transparent pointer-events-none" 
                      />
                    )}
                  </button>
                ))}
              </nav>

              <div className="mt-auto space-y-6">
                <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-[2rem]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Uptime</span>
                    <span className="text-[10px] font-mono text-emerald-400">99.98%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div animate={{ width: '99.98%' }} className="h-full bg-emerald-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Matrix Command Center */}
            <div className="flex-1 flex flex-col min-h-0 bg-[#050507]">
              <div className="p-10 border-b border-indigo-500/10 flex items-center justify-between bg-gradient-to-b from-indigo-500/5 to-transparent">
                <div>
                  <h3 className="text-white text-3xl font-black uppercase tracking-tight italic flex items-center gap-4">
                    {activeTab === 'matrix' && "Neural Bias Matrix"}
                    {activeTab === 'engine' && "Core Engineering Hub"}
                    {activeTab === 'security' && "Master Identity Control"}
                    <div className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] not-italic">Live</div>
                  </h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">Global overrides and synaptic weight manipulation v5.0.2</p>
                </div>
                <button 
                  onClick={onClose}
                  className="w-14 h-14 flex items-center justify-center hover:bg-white/5 rounded-2xl transition-all text-slate-500 hover:text-white group"
                >
                  <X className="w-7 h-7 group-hover:rotate-90 transition-transform" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                {activeTab === 'matrix' && (
                  <div className="space-y-12">
                    {/* Market Bias Vector */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between px-2">
                        <label className="text-[11px] font-black font-mono text-indigo-400/60 uppercase tracking-[0.4em]">Engine Sentiment Bias</label>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Affects all smart signals</span>
                      </div>
                      <div className="grid grid-cols-3 gap-6">
                        {[
                          { id: 'BUY', label: 'BULLISH', color: 'emerald', icon: TrendingUp, desc: 'Force market optimism' },
                          { id: 'NEUTRAL', label: 'NEUTRAL', color: 'slate', icon: Target, desc: 'Advanced AI balance' },
                          { id: 'SELL', label: 'BEARISH', color: 'rose', icon: TrendingDown, desc: 'Force market pressure' },
                        ].map((m) => (
                          <button
                            key={m.id}
                            onClick={() => setSettings({...settings, marketBias: m.id as any})}
                            className={cn(
                              "p-8 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-4 group relative overflow-hidden",
                              settings.marketBias === m.id 
                                ? `border-${m.color === 'emerald' ? 'emerald' : m.color === 'rose' ? 'rose' : 'slate'}-500/50 bg-${m.color === 'emerald' ? 'emerald' : m.color === 'rose' ? 'rose' : 'slate'}-500/10` 
                                : "border-white/5 bg-white/2 hover:border-white/20"
                            )}
                          >
                            <m.icon className={cn(
                              "w-8 h-8 transition-all group-hover:scale-110",
                              settings.marketBias === m.id ? (m.id === 'BUY' ? 'text-emerald-400' : m.id === 'SELL' ? 'text-rose-400' : 'text-slate-400') : "text-slate-600"
                            )} />
                            <div className="text-center">
                              <span className={cn(
                                "text-sm font-black tracking-widest block uppercase",
                                settings.marketBias === m.id ? "text-white" : "text-slate-500"
                              )}>{m.label}</span>
                              <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-1 block group-hover:text-slate-400 transition-colors">{m.desc}</span>
                            </div>
                            {settings.marketBias === m.id && (
                              <motion.div className={cn("absolute bottom-0 left-0 right-0 h-1", m.id === 'BUY' ? 'bg-emerald-500' : m.id === 'SELL' ? 'bg-rose-500' : 'bg-slate-500')} layoutId="bias-glow" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-10">
                      {/* Force Next Result - Pocket Option Style */}
                      <div className="space-y-6">
                        <label className="text-[11px] font-black font-mono text-indigo-400/60 uppercase tracking-[0.4em] px-2 block">Cheat Mode: Force Next Outcome</label>
                        <div className="p-10 bg-indigo-500/5 border border-indigo-500/10 rounded-[3rem] relative overflow-hidden group">
                           <div className="flex gap-4">
                             {['AUTO', 'WIN', 'LOSS'].map(mode => (
                               <button
                                 key={mode}
                                 onClick={() => setSettings({...settings, forceNextSignal: mode as any})}
                                 className={cn(
                                   "flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                                   settings.forceNextSignal === mode 
                                    ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20" 
                                    : "bg-white/5 text-slate-500 hover:text-white"
                                 )}
                               >
                                 {mode}
                               </button>
                             ))}
                           </div>
                           <p className="text-[10px] text-indigo-400/40 text-center mt-6 font-bold uppercase tracking-widest">Guarantees next signal result regardless of indicators</p>
                        </div>
                      </div>

                      {/* Script Mode */}
                      <div className="space-y-6">
                        <label className="text-[11px] font-black font-mono text-indigo-400/60 uppercase tracking-[0.4em] px-2 block">Scripted Narrative Control</label>
                        <div className="p-10 bg-white/2 border border-white/5 rounded-[3rem] space-y-6">
                          <select 
                            value={settings.scriptMode}
                            onChange={(e) => setSettings({...settings, scriptMode: e.target.value as any})}
                            className="w-full bg-[#020204] border border-white/10 rounded-2xl p-4 text-white font-black text-sm uppercase tracking-widest outline-none focus:border-indigo-500 transition-all custom-select"
                          >
                            <option value="NONE">NO ACTIVE SCRIPT</option>
                            <option value="WIN_STREAK">GOD MODE: 10 WIN STREAK</option>
                            <option value="LOSS_STREAK">DRAKE MODE: PERSISTENT LOSSES</option>
                            <option value="REALISTIC">SMART REALISM (78% RATIO)</option>
                          </select>
                          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-relaxed">Overrides all neural weights with a pre-defined performance script.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'engine' && (
                  <div className="space-y-12">
                    <div className="grid grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <label className="text-[11px] font-black font-mono text-indigo-400/60 uppercase tracking-[0.4em] px-2 block">Signal Sensitivity (Score Threshold)</label>
                        <div className="p-10 bg-white/2 border border-white/5 rounded-[3rem] space-y-8">
                           <input 
                              type="range" 
                              min="2" 
                              max="5" 
                              step="1"
                              value={settings.signalSensitivity}
                              onChange={(e) => setSettings({...settings, signalSensitivity: parseInt(e.target.value)})}
                              className="w-full h-2 bg-indigo-950 rounded-full appearance-none cursor-pointer accent-indigo-500"
                            />
                            <div className="flex justify-between items-center h-8">
                              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">More (Aggressive)</span>
                              <span className="text-4xl font-mono font-black text-white italic">{settings.signalSensitivity}</span>
                              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Less (Safe)</span>
                            </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <label className="text-[11px] font-black font-mono text-indigo-400/60 uppercase tracking-[0.4em] px-2 block">Synaptic Signal Frequency</label>
                        <div className="p-10 bg-white/2 border border-white/5 rounded-[3rem] space-y-8">
                           <input 
                              type="range" 
                              min="1" 
                              max="10" 
                              value={settings.signalFrequency}
                              onChange={(e) => setSettings({...settings, signalFrequency: parseInt(e.target.value)})}
                              className="w-full h-2 bg-indigo-950 rounded-full appearance-none cursor-pointer accent-indigo-500"
                            />
                            <div className="flex justify-between items-center h-8">
                              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Slow (CANDLE)</span>
                              <span className="text-4xl font-mono font-black text-white italic">{settings.signalFrequency}<span className="text-xs text-slate-500 ml-2">Hz</span></span>
                              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Rapid (TICK)</span>
                            </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <label className="text-[11px] font-black font-mono text-indigo-400/60 uppercase tracking-[0.4em] px-2 block">Prediction Trust Index</label>
                        <div className="p-10 bg-white/2 border border-white/5 rounded-[3rem] space-y-8">
                           <input 
                              type="range" 
                              min="80" 
                              max="99" 
                              value={settings.successRate}
                              onChange={(e) => setSettings({...settings, successRate: parseInt(e.target.value)})}
                              className="w-full h-2 bg-emerald-950 rounded-full appearance-none cursor-pointer accent-emerald-500"
                            />
                            <div className="flex justify-between items-center h-8">
                              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Realistic</span>
                              <span className="text-4xl font-mono font-black text-emerald-400 italic">{settings.successRate}%</span>
                              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Ultra</span>
                            </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-10 bg-indigo-600/5 border-2 border-indigo-500/20 rounded-[3rem] relative overflow-hidden group">
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-600/30">
                            <Zap className="text-white w-8 h-8 fill-white" />
                          </div>
                          <div>
                            <h4 className="text-xl font-black text-white uppercase tracking-tight italic">Global Neural Intensity</h4>
                            <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest mt-1">Processor cycle dedication to signal matrix</p>
                          </div>
                        </div>
                        <div className="w-64">
                          <input 
                            type="range" 
                            min="20" 
                            max="100" 
                            value={settings.neuralIntensity}
                            onChange={(e) => setSettings({...settings, neuralIntensity: parseInt(e.target.value)})}
                            className="w-full h-3 bg-indigo-950/50 rounded-full appearance-none cursor-pointer accent-indigo-400"
                          />
                        </div>
                        <span className="text-4xl font-mono font-black text-white">{settings.neuralIntensity}%</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between p-8 bg-indigo-600/5 border-2 border-indigo-500/20 rounded-[2.5rem] relative overflow-hidden group">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white/5 rounded-[1.5rem] flex items-center justify-center border border-white/10 group-hover:bg-indigo-500/20 transition-all duration-500">
                          <Shield className="text-indigo-400 w-8 h-8" />
                        </div>
                        <div>
                          <h4 className="text-white text-lg font-black uppercase tracking-tight">peoplesquadgaming@gmail.com</h4>
                          <p className="text-[10px] text-indigo-400 font-mono font-black uppercase tracking-[0.3em] mt-1">Role: MASTER_ARCHITECT • Status: VERIFIED</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                         <div className="px-5 py-2 bg-emerald-500/20 text-emerald-400 text-xs font-black rounded-xl uppercase tracking-widest border border-emerald-500/30 flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                           REMOTE AUTH ACTIVE
                         </div>
                         <span className="text-[9px] text-slate-500 font-mono uppercase">Last Session: 2026-05-06T13:34:44Z</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      <div className="p-8 bg-white/2 border border-white/5 rounded-[2.5rem]">
                        <h4 className="text-white text-xs font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                          <BarChart3 className="w-4 h-4 text-slate-600" />
                          Master Signal Log (Live)
                        </h4>
                        <div className="space-y-3">
                          {[
                            { action: "Updated Matrix Vector to SELL", time: "2m ago", status: "SUCCESS" },
                            { action: "Forced WIN on Asset BTC/USD", time: "12m ago", status: "SUCCESS" },
                            { action: "Modified neural intensity to 85%", time: "1h ago", status: "SUCCESS" },
                            { action: "Cloud Sync established with node-42", time: "3h ago", status: "STABLE" },
                          ].map((log, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-[#020204] rounded-2xl border border-white/5">
                              <div className="flex items-center gap-4">
                                <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
                                <span className="text-xs text-slate-300 font-bold uppercase tracking-wider">{log.action}</span>
                              </div>
                              <div className="text-right">
                                <span className={cn(
                                  "text-[9px] font-black tracking-widest uppercase block",
                                  log.status === 'SUCCESS' ? "text-emerald-500" : "text-indigo-400"
                                )}>{log.status}</span>
                                <span className="text-[9px] text-slate-600 font-mono italic">{log.time}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Master Actions Bar */}
              <div className="p-10 border-t border-indigo-500/10 bg-[#020204]/80 backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <div className="w-2 h-2 rounded-full bg-slate-500" />
                    Protocol Offline
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    Neural Link Active
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={onClose}
                    className="px-8 py-4 rounded-2xl text-xs font-black text-slate-500 hover:text-white transition-all uppercase tracking-widest bg-white/2 hover:bg-white/5"
                  >
                    Discard Changes
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-12 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[1.8rem] text-sm font-black uppercase tracking-widest shadow-[0_15px_40px_rgba(79,70,229,0.4)] transition-all flex items-center gap-4 disabled:opacity-50 group active:scale-95"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        UPDATING CORE...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                        SYNC MASTER PROTOCOL
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

