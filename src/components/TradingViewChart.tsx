import React, { useMemo, useState } from 'react';
import { Target, ShieldAlert, Layers, Eye, EyeOff, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TradingViewChartProps {
  asset: string;
  signal?: 'BUY' | 'SELL' | 'NEUTRAL';
  currentPrice?: number;
  signalEntryPrice?: number;
  onCalibratePrice?: (price: number) => void;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({ 
  asset,
  signal = 'NEUTRAL',
  currentPrice = 1.00960,
  signalEntryPrice,
  onCalibratePrice
}) => {
  const [showOverlays, setShowOverlays] = useState(true);
  const [isCalibrateOpen, setIsCalibrateOpen] = useState(false);
  const [calValue, setCalValue] = useState('');

  // Sane visual level percentage defaults
  const [tpTopPercent, setTpTopPercent] = useState(22);
  const [entryTopPercent, setEntryTopPercent] = useState(50);
  const [slTopPercent, setSlTopPercent] = useState(78);

  // Take Profit and Stop Loss manual price override state triggers
  const [customTp, setCustomTp] = useState('');
  const [customSl, setCustomSl] = useState('');

  const isBuy = signal === 'BUY';
  const isSell = signal === 'SELL';
  const isNeutral = signal === 'NEUTRAL';

  // Anchoring calculations to fixed signalEntryPrice if available, otherwise fallback to currentPrice
  const activePrice = useMemo(() => {
    return signalEntryPrice !== undefined ? signalEntryPrice : currentPrice;
  }, [signalEntryPrice, currentPrice]);

  const tpPrice = useMemo(() => {
    if (customTp && !isNaN(parseFloat(customTp))) {
      return parseFloat(customTp);
    }
    if (!activePrice || isNeutral) return 0;
    return isBuy ? activePrice * 1.01 : activePrice * 0.99;
  }, [activePrice, isBuy, isNeutral, customTp]);

  const slPrice = useMemo(() => {
    if (customSl && !isNaN(parseFloat(customSl))) {
      return parseFloat(customSl);
    }
    if (!activePrice || isNeutral) return 0;
    return isBuy ? activePrice * 0.995 : activePrice * 1.005;
  }, [activePrice, isBuy, isNeutral, customSl]);

  const formatPrice = (val: number) => {
    if (!val) return '';
    return val > 100 ? val.toFixed(2) : val.toFixed(5);
  };
  const getSymbol = (assetName: string) => {
    const mapping: Record<string, string> = {
      // Forex Majors
      'EUR/USD': 'FX:EURUSD',
      'GBP/USD': 'FX:GBPUSD',
      'USD/JPY': 'FX:USDJPY',
      'AUD/USD': 'FX:AUDUSD',
      'USD/CAD': 'FX:USDCAD',
      'USD/CHF': 'FX:USDCHF',
      'NZD/USD': 'FX:NZDUSD',
      // Forex Minors & Crosses
      'EUR/GBP': 'FX:EURGBP',
      'GBP/JPY': 'FX:GBPJPY',
      'EUR/JPY': 'FX:EURJPY',
      'AUD/JPY': 'FX:AUDJPY',
      'CAD/JPY': 'FX:CADJPY',
      'CHF/JPY': 'FX:CHFJPY',
      'NZD/JPY': 'FX:NZDJPY',
      'GBP/CHF': 'FX:GBPCHF',
      'EUR/CHF': 'FX:EURCHF',
      'EUR/CAD': 'FX:EURCAD',
      'GBP/CAD': 'FX:GBPCAD',
      'AUD/CAD': 'FX:AUDCAD',
      'EUR/AUD': 'FX:EURAUD',
      'GBP/AUD': 'FX:GBPAUD',
      'AUD/NZD': 'FX:AUDNZD',
      // Forex Exotics
      'USD/TRY': 'FX:USDTRY',
      'USD/MXN': 'FX:USDMXN',
      'USD/SGD': 'FX:USDSGD',
      'USD/ZAR': 'FX:USDZAR',
      'USD/HKD': 'FX:USDHKD',
      'EUR/TRY': 'FX:EURTRY',
      'EUR/ZAR': 'FX:EURZAR',
      // Crypto
      'BTC/USD': 'BITSTAMP:BTCUSD',
      'ETH/USD': 'BITSTAMP:ETHUSD',
      'LTC/USD': 'BITSTAMP:LTCUSD',
      'XRP/USD': 'BITSTAMP:XRPUSD',
      'SOL/USD': 'BINANCE:SOLUSD',
      'BNB/USD': 'BINANCE:BNBUSD',
      'ADA/USD': 'BINANCE:ADAUSD',
      'DOGE/USD': 'BINANCE:DOGEUSD',
      // Commodities
      'GOLD': 'TVC:GOLD',
      'SILVER': 'TVC:SILVER',
      'BRENT': 'TVC:UKOIL',
      'CRUDE': 'TVC:USOIL',
      'PLATINUM': 'TVC:PLATINUM',
      'PALLADIUM': 'TVC:PALLADIUM',
      'COPPER': 'COMEX:HG1!',
    };
    return mapping[assetName] || 'FX:EURUSD';
  };

  const iframeSrc = useMemo(() => {
    const symbol = getSymbol(asset);
    const params = new URLSearchParams({
      symbol: symbol,
      interval: '1',
      theme: 'dark',
      style: '1',
      timezone: 'Etc/UTC',
      locale: 'en',
      hide_top_toolbar: 'false',
      hide_legend: 'false',
      save_image: 'false',
      enable_publishing: 'false',
      allow_symbol_change: 'false',
      calendar: 'false'
    });
    return `https://s.tradingview.com/widgetembed/?${params.toString()}`;
  }, [asset]);

  return (
    <div className="w-full h-[500px] bg-[#0a0a0c] rounded-3xl overflow-hidden border border-white/5 relative group/chart">
      <iframe 
        src={iframeSrc}
        className="w-full h-full border-none"
        title={`TradingView Chart - ${asset}`}
        allowFullScreen
      />

      {/* Floating HUD Controls */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 max-w-[90%] pointer-events-auto">
        <button
          onClick={() => setShowOverlays(!showOverlays)}
          className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-[10px] font-mono font-black tracking-wider transition-all backdrop-blur-md shadow-xl cursor-pointer ${
            showOverlays 
              ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30' 
              : 'bg-slate-900/80 text-slate-400 border-white/5 hover:text-slate-300'
          }`}
        >
          {showOverlays ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          {showOverlays ? 'AI TARGETS: ON' : 'AI TARGETS: OFF'}
        </button>

        {showOverlays && (
          <button
            onClick={() => {
              setCalValue(formatPrice(currentPrice));
              setIsCalibrateOpen(!isCalibrateOpen);
            }}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-[10px] font-mono font-black tracking-wider transition-all backdrop-blur-md shadow-xl cursor-pointer ${
              isCalibrateOpen 
                ? 'bg-blue-600/30 text-blue-400 border-blue-500/50' 
                : 'bg-slate-900/80 text-slate-400 border-white/5 hover:text-slate-300'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse animate-duration-1000" />
            <span>CALIBRATE LIVE PRICE</span>
          </button>
        )}

        {showOverlays && !isNeutral && currentPrice && (
          <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-white/5 backdrop-blur-md shadow-xl flex items-center gap-1.5 text-[9px] font-mono text-slate-400">
            <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
            <span>SL/TP HUD ACTIVE</span>
          </div>
        )}
      </div>

      {/* Floating Calibration popover */}
      <AnimatePresence>
        {isCalibrateOpen && showOverlays && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute top-16 left-4 z-30 w-72 max-h-[420px] overflow-y-auto bg-slate-950/95 border border-indigo-500/30 rounded-2xl p-4 backdrop-blur-xl shadow-2xl pointer-events-auto flex flex-col gap-3 scrollbar-none"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-[10px] font-mono text-indigo-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> SYNC & ALIGNMENT TOOL
              </span>
              <button 
                onClick={() => setIsCalibrateOpen(false)}
                className="text-slate-400 hover:text-white text-[9px] font-mono uppercase bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded-md transition-all font-bold"
              >
                Close
              </button>
            </div>
            
            <p className="text-[9px] text-slate-400 leading-snug font-medium">
              Synchronize the app's internal live feed to match the exact prices and locations displayed on the real chart.
            </p>

            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between bg-white/5 border border-white/5 rounded-xl px-3 py-2">
                <span className="text-[8px] font-mono text-slate-500 font-bold uppercase tracking-wider">Internal Price Now</span>
                <span className="text-xs font-mono font-black text-blue-400">{formatPrice(currentPrice)}</span>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[8px] font-mono text-slate-500 uppercase tracking-widest font-black">Sync Target Price (Entry Point)</label>
                <div className="flex gap-1">
                  <input
                    type="number"
                    step={currentPrice > 100 ? "0.1" : "0.00001"}
                    value={calValue}
                    onChange={(e) => setCalValue(e.target.value)}
                    placeholder={formatPrice(currentPrice)}
                    className="flex-1 bg-slate-900/90 border border-slate-700/60 rounded-xl px-2.5 py-1.5 text-xs font-mono text-white focus:border-indigo-500/80 outline-none"
                  />
                  <button
                    onClick={() => {
                      const num = parseFloat(calValue);
                      if (!isNaN(num) && num > 0 && onCalibratePrice) {
                        onCalibratePrice(num);
                        setIsCalibrateOpen(false);
                      }
                    }}
                    className="px-3 bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-black uppercase tracking-wider rounded-xl transition-all shadow-lg"
                  >
                    SYNC NOW
                  </button>
                </div>
              </div>

              {/* Custom TP and SL Inputs */}
              <div className="flex flex-col gap-1.5 border-t border-white/5 pt-2">
                <label className="text-[8px] font-mono text-slate-500 uppercase tracking-widest font-black">Specify TP & SL Price Target</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[7px] font-mono text-emerald-400 font-bold uppercase tracking-wider">Take Profit (TP)</span>
                    <input
                      type="number"
                      step={currentPrice > 100 ? "0.1" : "0.00001"}
                      value={customTp}
                      onChange={(e) => setCustomTp(e.target.value)}
                      placeholder={formatPrice(tpPrice || (isBuy ? activePrice * 1.01 : activePrice * 0.99))}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-2 py-1 text-[10px] font-mono text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[7px] font-mono text-rose-400 font-bold uppercase tracking-wider">Stop Loss (SL)</span>
                    <input
                      type="number"
                      step={currentPrice > 100 ? "0.1" : "0.00001"}
                      value={customSl}
                      onChange={(e) => setCustomSl(e.target.value)}
                      placeholder={formatPrice(slPrice || (isBuy ? activePrice * 0.995 : activePrice * 1.005))}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-2 py-1 text-[10px] font-mono text-white focus:border-rose-500 outline-none"
                    />
                  </div>
                </div>
                {(customTp || customSl) && (
                  <button
                    onClick={() => {
                      setCustomTp('');
                      setCustomSl('');
                    }}
                    className="text-[7px] font-mono text-red-400 hover:text-red-300 transition-colors uppercase font-bold self-end"
                  >
                    Reset Overrides
                  </button>
                )}
              </div>

              {/* Presets Grid */}
              <div className="flex flex-col gap-1 border-t border-white/5 pt-2">
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest font-black mb-1">Pairs live market presets</span>
                <div className="grid grid-cols-2 gap-1 animate-fadeIn">
                  {[
                    { label: 'EUR/USD Target (1.00960)', val: 1.00960 },
                    { label: 'EUR/USD (1.16252)', val: 1.16252 },
                    { label: 'GBP/USD (1.34208)', val: 1.34208 },
                    { label: 'GOLD (2350.40)', val: 2350.40 }
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => {
                        setCalValue(preset.val.toString());
                        if (onCalibratePrice) {
                          onCalibratePrice(preset.val);
                        }
                        setIsCalibrateOpen(false);
                      }}
                      className="py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[8px] font-mono text-slate-300 transition-all font-bold text-center border border-white/5"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual Alignment Sliders */}
              <div className="flex flex-col gap-1.5 border-t border-white/5 pt-2">
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest font-black flex items-center gap-1">
                  📐 DRAG TO ALIGN LINES VISUALLY
                </span>
                
                <div className="flex flex-col gap-0.5">
                  <div className="flex justify-between text-[7px] font-mono text-slate-400">
                    <span>TAKE PROFIT (TP)</span>
                    <span className="text-emerald-400 font-bold">{tpTopPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="98"
                    value={tpTopPercent}
                    onChange={(e) => setTpTopPercent(parseInt(e.target.value))}
                    className="accent-emerald-500 h-1 bg-slate-850 rounded appearance-none cursor-pointer w-full"
                  />
                </div>

                <div className="flex flex-col gap-0.5">
                  <div className="flex justify-between text-[7px] font-mono text-slate-400">
                    <span>ENTRY LEVEL</span>
                    <span className="text-blue-400 font-bold">{entryTopPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="98"
                    value={entryTopPercent}
                    onChange={(e) => setEntryTopPercent(parseInt(e.target.value))}
                    className="accent-blue-500 h-1 bg-slate-850 rounded appearance-none cursor-pointer w-full"
                  />
                </div>

                <div className="flex flex-col gap-0.5">
                  <div className="flex justify-between text-[7px] font-mono text-slate-400">
                    <span>STOP LOSS (SL)</span>
                    <span className="text-rose-400 font-bold">{slTopPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="98"
                    value={slTopPercent}
                    onChange={(e) => setSlTopPercent(parseInt(e.target.value))}
                    className="accent-red-500 h-1 bg-slate-850 rounded appearance-none cursor-pointer w-full"
                  />
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SL/TP Visual Targets Overlays */}
      <AnimatePresence>
        {showOverlays && !isNeutral && currentPrice && (
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            
            {/* Take Profit (TP) Level Line Overlay */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-0 right-0 h-px flex items-center justify-between"
              style={{ top: `${tpTopPercent}%` }}
            >
              {/* Green Glow Line */}
              <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-emerald-500/5 via-emerald-500/70 to-emerald-500/5 border-t border-dashed border-emerald-400/80 shadow-[0_0_12px_rgba(16,185,129,0.4)]" />
              
              {/* Left Label Tag */}
              <div className="relative z-10 ml-4 pointer-events-auto bg-emerald-950/90 border border-emerald-500/40 text-emerald-400 text-[8px] font-mono font-bold px-2 py-0.5 rounded-lg backdrop-blur-md shadow-md flex items-center gap-1">
                <Target className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                <span>🎯 TAKE PROFIT LEVEL</span>
              </div>

              {/* Right Value Tag (Solid Green Marker for Take Profit) */}
              <div className="relative z-10 mr-1 pointer-events-auto flex items-center">
                <div className="w-0 h-0 border-y-[6px] border-y-transparent border-r-[6px] border-r-emerald-500" />
                <div className="bg-emerald-500 text-white text-[9px] font-mono font-black px-2 py-0.5 rounded-r shadow-[0_2px_8px_rgba(0,0,0,0.45)] flex items-center gap-1">
                  <span>TP:</span>
                  <span>{formatPrice(tpPrice)}</span>
                </div>
              </div>
            </motion.div>

            {/* Entry Price level Reference Line */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="absolute left-0 right-0 h-px flex items-center justify-between"
              style={{ top: `${entryTopPercent}%` }}
            >
              {/* Blue Reference Line */}
              <div className="absolute inset-x-0 h-px bg-gradient-to-r from-blue-500/5 via-blue-500/40 to-blue-500/5" />
              
              {/* Left Point Tag (Small System Entry Marker with active signal indicator) */}
              <div className="relative z-10 ml-4 pointer-events-auto bg-blue-600 border border-blue-400 text-white text-[8px] font-mono font-extrabold px-1.5 py-0.5 rounded shadow flex items-center gap-1.5">
                <span className="w-1.2 h-1.2 rounded-full bg-white animate-ping" />
                <span>ENTRY: {formatPrice(activePrice)}</span>
                {signal !== 'NEUTRAL' && (
                  <span className={`px-1 rounded-[3px] text-[7px] font-extrabold text-white leading-none ${isBuy ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                    {isBuy ? 'BUY/CALL' : 'SELL/PUT'}
                  </span>
                )}
              </div>

              {/* Right Point Tag (Solid Blue Price Ticker Marker) */}
              <div className="relative z-10 mr-1 pointer-events-auto flex items-center">
                <div className="w-0 h-0 border-y-[6px] border-y-transparent border-r-[6px] border-r-blue-500" />
                <div className="bg-blue-500 text-white text-[9px] font-mono font-black px-2 py-0.5 rounded-r shadow-[0_2px_8px_rgba(0,0,0,0.45)] flex items-center gap-1 animate-pulse">
                  <span>ENTRY:</span>
                  <span>{formatPrice(currentPrice)}</span>
                </div>
              </div>
            </motion.div>

            {/* Stop Loss (SL) Level Line Overlay */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-0 right-0 h-px flex items-center justify-between"
              style={{ top: `${slTopPercent}%` }}
            >
              {/* Red Glow Line */}
              <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-red-500/5 via-red-500/70 to-red-500/5 border-t border-dashed border-red-400/80 shadow-[0_0_12px_rgba(239,68,68,0.4)]" />
              
              {/* Left Label Tag */}
              <div className="relative z-10 ml-4 pointer-events-auto bg-red-950/90 border border-red-500/40 text-red-400 text-[8px] font-mono font-bold px-2 py-0.5 rounded-lg backdrop-blur-md shadow-md flex items-center gap-1">
                <ShieldAlert className="w-2.5 h-2.5 text-red-400 animate-pulse" />
                <span>🛑 STOP LOSS LEVEL</span>
              </div>

              {/* Right Value Tag (Solid Red Marker for Stop Loss) */}
              <div className="relative z-10 mr-1 pointer-events-auto flex items-center">
                <div className="w-0 h-0 border-y-[6px] border-y-transparent border-r-[6px] border-r-red-500" />
                <div className="bg-red-500 text-white text-[9px] font-mono font-black px-2 py-0.5 rounded-r shadow-[0_2px_8px_rgba(0,0,0,0.45)] flex items-center gap-1">
                  <span>SL:</span>
                  <span>{formatPrice(slPrice)}</span>
                </div>
              </div>
            </motion.div>

          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
