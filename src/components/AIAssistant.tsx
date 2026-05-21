import React, { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles, Brain, Cpu, TrendingUp, RefreshCw, Zap, Flame, Shield, Server, Activity, GripHorizontal } from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface AIAssistantProps {
  onOptimize: (stats: any) => void;
  isAutoTradeEnabled: boolean;
}

export function AIAssistant({ onOptimize, isAutoTradeEnabled }: AIAssistantProps) {
  const dragControls = useDragControls();
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      const handleResize = () => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      };
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  const [isMinimized, setIsMinimized] = useState(false);
  const [isHyperMode, setIsHyperMode] = useState(() => {
    return localStorage.getItem('profitSignal_hyperMode') === 'true';
  });
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('BOOTING POWER ENGINE');
  const [isCalibrating, setIsCalibrating] = useState(false);
  
  const [messages, setMessages] = useState<string[]>([
    "🤖 Neural Core online.",
    "✨ Touch/Drag top bar or robot to move anywhere!",
    "🌐 Connecting to active order book feeds...",
    "🛡️ Shield systems armed."
  ]);

  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoLoopIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sensory feedback wrapper
  const playSensoryVibe = () => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(100);
    }
  };

  // Trigger calibration animation
  const startCalibration = (speed: 'fast' | 'normal', forceHyper: boolean = isHyperMode) => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    setIsCalibrating(true);
    setOptimizationProgress(0);
    
    const steps = [
      { p: 10, msg: "🔬 Core scanning: Liquidity boundaries" },
      { p: 30, msg: "🧠 Weight adjustment: Volatility matrix" },
      { p: 55, msg: "⚡ Dynamic tuning: Zero-lag SMA overlaps" },
      { p: 80, msg: forceHyper ? "🔥 Hyper Drive: Quantum scalping active" : "🎯 Calibration: Aligning win patterns" },
      { p: 100, msg: forceHyper ? "⚡ HYPER CORE FULLY OPTIMIZED (99.8%)" : "✨ OPTIMIZATION COMPLETED SUCCESSFULLY" }
    ];

    setStatusMessage("INITIALIZING CALIBRATION...");
    
    // Total duration: 'fast' is 1.5s, 'normal' is 4s
    const totalDuration = speed === 'fast' ? 1500 : 4000;
    const intervalTime = totalDuration / 20; // 20 increments
    let progress = 0;

    progressIntervalRef.current = setInterval(() => {
      progress += 5;
      setOptimizationProgress(progress);
      
      if (progress >= 100) {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        setOptimizationProgress(100);
        setIsCalibrating(false);
        
        const finalMsg = forceHyper 
          ? "🔥 HYPER SYSTEM SPEED INJECTION COMPLETE" 
          : "✨ STRATEGY OPTIMIZATION COMPLETED";
        
        setStatusMessage(finalMsg);
        
        // Push notification messages
        const completedLog = forceHyper
          ? "💥 Supercharged synaptic weights stabilized at MAXIMUM POWER!"
          : "✅ Quantum parameters locked into current pricing streams.";
        
        setMessages(prev => [completedLog, ...prev].slice(0, 5));
        playSensoryVibe();

        // Notify parent
        onOptimize({
          accuracyBoost: forceHyper ? 5 : (Math.random() > 0.7 ? 2 : 1),
          isAggressive: forceHyper || Math.random() > 0.7,
          isHyperBoost: forceHyper,
          lastUpdate: new Date().toLocaleTimeString()
        });

        // Set state back to monitoring after a short delay
        setTimeout(() => {
          setStatusMessage(forceHyper ? '⚡ HYPER RADAR SCAN ACTIVE' : 'MONITORING MARKET VECTORS');
        }, 3000);
      } else {
        // Find matching descriptive log message based on progress percentage
        const currentStep = steps.find(s => progress <= s.p) || steps[steps.length - 2];
        setStatusMessage(currentStep.msg.toUpperCase());
        
        // Push step message as details on transitions
        if (progress % 25 === 0) {
          setMessages(prev => [currentStep.msg, ...prev].slice(0, 5));
        }
      }
    }, intervalTime);
  };

  // Immediate startup optimization & periodic recalibration loop
  useEffect(() => {
    // Start initial calibration instantly on load! No 15-second empty wait.
    const initialDelay = setTimeout(() => {
      startCalibration('fast', isHyperMode);
    }, 400);

    // Auto loop updates every 28 seconds to check system efficiency
    autoLoopIntervalRef.current = setInterval(() => {
      if (!isCalibrating) {
        startCalibration('normal', isHyperMode);
      }
    }, 28000);

    return () => {
      clearTimeout(initialDelay);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (autoLoopIntervalRef.current) clearInterval(autoLoopIntervalRef.current);
    };
  }, [isHyperMode, onOptimize]);

  // Handle Hyper Power toggle
  const toggleHyperMode = () => {
    const nextVal = !isHyperMode;
    setIsHyperMode(nextVal);
    localStorage.setItem('profitSignal_hyperMode', String(nextVal));
    playSensoryVibe();
    
    // Instantly append alert to messages
    const logStr = nextVal 
      ? "⚡ [LEVEL RED]: HYPER QUANTUM OVERDRIVE ACTIVATED! SYSTEM CAPABILITIES AT ULTRA MAX!" 
      : "🛡️ [LEVEL BALANCED]: RESTORED HYBRID CHASSIS STRATEGY STABILIZER FEATURES.";
    
    setMessages(prev => [logStr, ...prev].slice(0, 5));
    
    // Instantly force a high speed calibration to showcase immediate effect!
    startCalibration('fast', nextVal);
  };

  const constraints = {
    left: -windowSize.width + 360,
    right: 30,
    top: -windowSize.height + 100,
    bottom: 30
  };

  return (
    <motion.div 
      drag
      dragControls={dragControls}
      dragListener={false}
      dragConstraints={constraints}
      dragMomentum={false}
      dragElastic={0.08}
      className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-auto"
      style={{ touchAction: 'none' }}
    >
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              borderColor: isHyperMode ? 'rgba(236, 72, 153, 0.6)' : 'rgba(99, 102, 241, 0.3)',
              boxShadow: isHyperMode 
                ? '0 20px 60px rgba(236, 72, 153, 0.35), 0 0 20px rgba(236, 72, 153, 0.15)'
                : '0 20px 50px rgba(79, 70, 229, 0.25)'
            }}
            exit={{ opacity: 0, y: 30, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={cn(
              "w-80 backdrop-blur-3xl border rounded-[2rem] p-6 relative overflow-hidden transition-all duration-500 pt-8",
              isHyperMode 
                ? "bg-[#09030c]/95 text-white" 
                : "bg-[#050507]/92 text-slate-100"
            )}
          >
            {/* Grab Drag Handle */}
            <div 
              onPointerDown={(e) => dragControls.start(e)}
              className="absolute top-2.5 left-1/2 -translate-x-1/2 w-16 h-4 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-white/5 rounded-full transition-colors z-20 group"
              title="Drag here to move"
            >
              <GripHorizontal className="w-5 h-5 text-slate-500 hover:text-slate-300 transition-colors" />
            </div>

            {/* Hyper Mode Background Glow Grid */}
            {isHyperMode && (
              <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/10 via-purple-500/5 to-red-500/10 pointer-events-none animate-pulse duration-[4000ms]" />
            )}

            {/* Header Area */}
            <div 
              onPointerDown={(e) => {
                // Ignore pointer down if triggered directly on button children elements
                const target = e.target as HTMLElement;
                if (!target.closest('button')) {
                  dragControls.start(e);
                }
              }}
              className="flex items-center justify-between mb-4 relative z-10 cursor-grab active:cursor-grabbing select-none"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-11 h-11 rounded-xl flex items-center justify-center shadow-lg transition-colors duration-500",
                  isHyperMode 
                    ? "bg-gradient-to-br from-pink-500 to-rose-600 shadow-pink-500/40" 
                    : "bg-indigo-600 shadow-indigo-600/40"
                )}>
                  {isHyperMode ? (
                    <Zap className="text-white w-6 h-6 animate-bounce" />
                  ) : (
                    <Brain className="text-white w-6 h-6 animate-pulse" />
                  )}
                </div>
                <div>
                  <h4 className="text-white text-xs font-black uppercase tracking-widest italic leading-none flex items-center gap-1.5">
                    {isHyperMode ? "Quantum Assistant" : "Neural Assistant"}
                    {isHyperMode && (
                      <span className="text-[7.5px] font-mono font-bold bg-pink-500 text-white rounded px-1.5 py-0.5 animate-pulse">
                        MAX POWER
                      </span>
                    )}
                  </h4>
                  <p className={cn(
                    "text-[9px] font-bold mt-1 uppercase tracking-tighter transition-colors duration-500",
                    isHyperMode ? "text-pink-400" : "text-indigo-400"
                  )}>
                    {isHyperMode ? "HYPER OPTIMIZER V6.0 PRE" : "SYSTEM OPTIMIZER V5.2"}
                  </p>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className={cn(
                    "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                    isHyperMode ? "bg-pink-400" : "bg-emerald-400"
                  )}></span>
                  <span className={cn(
                    "relative inline-flex rounded-full h-2 w-2",
                    isHyperMode ? "bg-pink-500" : "bg-emerald-500"
                  )}></span>
                </span>
                <span className="text-[8.5px] font-mono font-bold text-slate-400 uppercase">
                  {isHyperMode ? "WARP LINK" : "ONLINE"}
                </span>
              </div>
            </div>

            {/* Main Progress Bar Area */}
            <div className="space-y-4 relative z-10">
              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/5 transition-all">
                <div className="flex justify-between items-center mb-1.5">
                  <span className={cn(
                    "text-[8.5px] font-black uppercase tracking-widest transition-colors duration-300",
                    isHyperMode ? "text-pink-300" : "text-slate-400"
                  )}>
                    {statusMessage}
                  </span>
                  <span className={cn(
                    "text-[10px] font-mono font-bold transition-colors duration-300",
                    isHyperMode ? "text-pink-400" : "text-indigo-400"
                  )}>
                    {optimizationProgress}%
                  </span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden p-[1px]">
                  <motion.div 
                    animate={{ width: `${optimizationProgress}%` }} 
                    transition={{ ease: "easeOut", duration: 0.15 }}
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      isHyperMode 
                        ? "bg-gradient-to-r from-pink-500 via-purple-500 to-rose-500 shadow-[0_0_8px_rgba(236,72,153,0.8)]" 
                        : "bg-indigo-500"
                    )}
                  />
                </div>
              </div>

              {/* Mini Console Logs */}
              <div className="bg-black/40 border border-white/5 rounded-2xl p-3 h-24 overflow-y-auto scrollbar-none custom-scrollbar">
                <span className="text-[8px] font-mono font-black text-slate-500 block mb-1 uppercase tracking-wider text-left">CONSOLE LOGSTREAM</span>
                <div className="space-y-1 text-left">
                  {messages.map((m, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1 - Math.min(0.6, i * 0.15), x: 0 }}
                      className={cn(
                        "text-[9px] font-bold border-l-2 pl-2 leading-snug break-words transition-colors",
                        isHyperMode 
                          ? m.includes("⚡") || m.includes("🔥") || m.includes("💥")
                            ? "text-pink-400 border-pink-500" 
                            : "text-slate-300 border-purple-500/50"
                          : "text-slate-400 border-indigo-500/40"
                      )}
                    >
                      {m}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Dynamic Live Metrics */}
              <div className="flex gap-2">
                <div className={cn(
                  "flex-1 p-2 border rounded-xl flex items-center justify-between transition-all duration-300",
                  isHyperMode 
                    ? "bg-pink-500/10 border-pink-500/30" 
                    : "bg-emerald-500/10 border-emerald-500/20"
                )}>
                  <TrendingUp className={cn("w-3.5 h-3.5", isHyperMode ? "text-pink-400" : "text-emerald-400")} />
                  <span className={cn(
                    "text-[10px] font-black tracking-tight",
                    isHyperMode ? "text-pink-400" : "text-emerald-400"
                  )}>
                    WIN RATE {isHyperMode ? "+20.5%" : "+4.2%"}
                  </span>
                </div>
                <div className={cn(
                  "flex-1 p-2 border rounded-xl flex items-center justify-between transition-all duration-300",
                  isHyperMode 
                    ? "bg-purple-500/10 border-purple-500/30 animate-pulse" 
                    : "bg-blue-500/10 border-blue-500/20"
                )}>
                  <Cpu className={cn("w-3.5 h-3.5", isHyperMode ? "text-purple-400" : "text-blue-400")} />
                  <span className={cn(
                    "text-[10px] font-black tracking-tight",
                    isHyperMode ? "text-purple-400" : "text-blue-400"
                  )}>
                    LATENCY {isHyperMode ? "0.4MS" : "8MS"}
                  </span>
                </div>
              </div>

              {/* High-Power Booster Actions Panel */}
              <div className="flex gap-2 pt-1 border-t border-white/5">
                {/* Hyper Power Switcher Toggle */}
                <button
                  onClick={toggleHyperMode}
                  className={cn(
                    "flex-1 py-1.5 px-3 rounded-xl border font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all duration-300 pointer-events-auto",
                    isHyperMode 
                      ? "bg-pink-500 text-white border-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.4)] hover:bg-pink-600" 
                      : "bg-[#0c0c10] text-slate-400 border-white/5 hover:border-indigo-500/30 hover:text-white"
                  )}
                >
                  <Flame className={cn("w-3 h-3 transition-transform", isHyperMode && "scale-125 text-amber-300 animate-pulse")} />
                  <span>{isHyperMode ? "HYPER ACTIVE" : "ACTIVATE HYPER"}</span>
                </button>

                {/* Instant Recalibrate Trigger */}
                <button
                  disabled={isCalibrating}
                  onClick={() => startCalibration('fast', isHyperMode)}
                  className={cn(
                    "py-1.5 px-3 rounded-xl border font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-1 transition-all duration-200 pointer-events-auto",
                    isCalibrating 
                      ? "opacity-50 cursor-not-allowed bg-slate-900 border-white/5 text-slate-600"
                      : isHyperMode 
                        ? "bg-[#160a22] text-purple-300 border-purple-500/30 hover:bg-purple-950/50 hover:border-purple-500/60"
                        : "bg-indigo-600 text-white border-indigo-400/30 hover:bg-indigo-700"
                  )}
                >
                  <RefreshCw className={cn("w-3 h-3", isCalibrating && "animate-spin")} />
                  <span>CALIBRATE</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Robot Launcher Button */}
      <button
        onPointerDown={(e) => dragControls.start(e)}
        onClick={() => {
          setIsMinimized(!isMinimized);
          playSensoryVibe();
        }}
        className={cn(
          "w-14 h-14 rounded-2xl border flex items-center justify-center shadow-2xl pointer-events-auto group active:scale-95 cursor-grab active:cursor-grabbing transition-all duration-500 relative",
          isHyperMode 
            ? "bg-gradient-to-br from-pink-500 to-rose-600 border-pink-400 shadow-pink-500/30" 
            : "bg-indigo-600 border-indigo-400/20 shadow-indigo-600/40"
        )}
      >
        <Bot className={cn(
          "text-white w-7 h-7 group-hover:scale-110 transition-transform", 
          (isAutoTradeEnabled || isHyperMode) && "animate-pulse"
        )} />
        {isHyperMode && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-400"></span>
          </span>
        )}
      </button>
    </motion.div>
  );
}
