import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Globe, Coins, Flame, ChevronRight, BarChart3, Star, Sparkles } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface AssetHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAsset: string;
  onSelectAsset: (asset: string) => void;
}

export interface AssetInfo {
  symbol: string;
  name: string;
  category: 'MAJORS' | 'MINORS' | 'EXOTICS' | 'CRYPTO' | 'COMMODITIES';
  banglaName: string;
  changeSim: number; // simulated daily change
}

export const ASSET_LIST: AssetInfo[] = [
  // Forex Majors
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', category: 'MAJORS', banglaName: 'ইউরো / ইউএস ডলার (প্রধান)', changeSim: 0.15 },
  { symbol: 'GBP/USD', name: 'Great British Pound / US Dollar', category: 'MAJORS', banglaName: 'পাউন্ড / ইউএস ডলার (প্রধান)', changeSim: -0.22 },
  { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', category: 'MAJORS', banglaName: 'ইউএস ডলার / জাপানি ইয়েন', changeSim: 0.45 },
  { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar', category: 'MAJORS', banglaName: 'অস্ট্রেলিয়ান ডলার / ইউএস ডলার', changeSim: -0.12 },
  { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar', category: 'MAJORS', banglaName: 'ইউএস ডলার / কানাডিয়ান ডলার', changeSim: 0.08 },
  { symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc', category: 'MAJORS', banglaName: 'ইউএস ডলার / সুইস ফ্রাঙ্ক', changeSim: -0.05 },
  { symbol: 'NZD/USD', name: 'New Zealand Dollar / US Dollar', category: 'MAJORS', banglaName: 'নিউজিল্যান্ড ডলার / ইউএস ডলার', changeSim: 0.18 },

  // Forex Minors
  { symbol: 'EUR/GBP', name: 'Euro / Great British Pound', category: 'MINORS', banglaName: 'ইউরো / পাউন্ড', changeSim: 0.04 },
  { symbol: 'GBP/JPY', name: 'Great British Pound / Japanese Yen', category: 'MINORS', banglaName: 'পাউন্ড / জাপানি ইয়েন (উদ্বায়ী)', changeSim: 0.62 },
  { symbol: 'EUR/JPY', name: 'Euro / Japanese Yen', category: 'MINORS', banglaName: 'ইউরো / জাপানি ইয়েন', changeSim: 0.35 },
  { symbol: 'AUD/JPY', name: 'Australian Dollar / Japanese Yen', category: 'MINORS', banglaName: 'অস্ট্রেলিয়ান ডলার / জাপানি ইয়েন', changeSim: 0.28 },
  { symbol: 'CAD/JPY', name: 'Canadian Dollar / Japanese Yen', category: 'MINORS', banglaName: 'কানাডিয়ান ডলার / জাপানি ইয়েন', changeSim: -0.19 },
  { symbol: 'CHF/JPY', name: 'Swiss Franc / Japanese Yen', category: 'MINORS', banglaName: 'সুইস ফ্রাঙ্ক / জাপানি ইয়েন', changeSim: 0.11 },
  { symbol: 'NZD/JPY', name: 'New Zealand Dollar / Japanese Yen', category: 'MINORS', banglaName: 'নিউজিল্যান্ড ডলার / জাপানি ইয়েন', changeSim: -0.05 },
  { symbol: 'GBP/CHF', name: 'Great British Pound / Swiss Franc', category: 'MINORS', banglaName: 'পাউন্ড / সুইস ফ্রাঙ্ক', changeSim: -0.14 },
  { symbol: 'EUR/CHF', name: 'Euro / Swiss Franc', category: 'MINORS', banglaName: 'ইউরো / সুইস ফ্রাঙ্ক', changeSim: 0.02 },
  { symbol: 'EUR/CAD', name: 'Euro / Canadian Dollar', category: 'MINORS', banglaName: 'ইউরো / কানাডিয়ান ডলার', changeSim: 0.13 },
  { symbol: 'GBP/CAD', name: 'Great British Pound / Canadian Dollar', category: 'MINORS', banglaName: 'পাউন্ড / কানাডিয়ান ডলার', changeSim: -0.09 },
  { symbol: 'AUD/CAD', name: 'Australian Dollar / Canadian Dollar', category: 'MINORS', banglaName: 'অস্ট্রেলিয়ান ডলার / কানাডিয়ান ডলার', changeSim: 0.05 },
  { symbol: 'EUR/AUD', name: 'Euro / Australian Dollar', category: 'MINORS', banglaName: 'ইউরো / অস্ট্রেলিয়ান ডলার', changeSim: -0.24 },
  { symbol: 'GBP/AUD', name: 'Great British Pound / Australian Dollar', category: 'MINORS', banglaName: 'পাউন্ড / অস্ট্রেলিয়ান ডলার', changeSim: -0.31 },
  { symbol: 'AUD/NZD', name: 'Australian Dollar / New Zealand Dollar', category: 'MINORS', banglaName: 'অস্ট্রেলিয়ান ডলার / নিউজিল্যান্ড ডলার', changeSim: 0.07 },

  // Forex Exotics
  { symbol: 'USD/TRY', name: 'US Dollar / Turkish Lira', category: 'EXOTICS', banglaName: 'ইউএস ডলার / তুর্কি লিরা (উচ্চ রিস্ক)', changeSim: 1.45 },
  { symbol: 'USD/MXN', name: 'US Dollar / Mexican Peso', category: 'EXOTICS', banglaName: 'ইউএস ডলার / মেক্সিকান পেসো', changeSim: -0.65 },
  { symbol: 'USD/SGD', name: 'US Dollar / Singapore Dollar', category: 'EXOTICS', banglaName: 'ইউএস ডলার / সিঙ্গাপুর ডলার', changeSim: -0.02 },
  { symbol: 'USD/ZAR', name: 'US Dollar / South African Rand', category: 'EXOTICS', banglaName: 'ইউএস ডলার / সাউথ আফ্রিকান র্যান্ড', changeSim: 0.88 },
  { symbol: 'USD/HKD', name: 'US Dollar / Hong Kong Dollar', category: 'EXOTICS', banglaName: 'ইউএস ডলার / হংকং ডলার', changeSim: 0.01 },
  { symbol: 'EUR/TRY', name: 'Euro / Turkish Lira', category: 'EXOTICS', banglaName: 'ইউরো / তুর্কি লিরা', changeSim: 1.32 },
  { symbol: 'EUR/ZAR', name: 'Euro / South African Rand', category: 'EXOTICS', banglaName: 'ইউরো / সাউথ আফ্রিকান র্যান্ড', changeSim: 0.72 },

  // Crypto
  { symbol: 'BTC/USD', name: 'Bitcoin / US Dollar', category: 'CRYPTO', banglaName: 'বিটকয়েন / ডলার (ক্রিপ্টো)', changeSim: 2.15 },
  { symbol: 'ETH/USD', name: 'Ethereum / US Dollar', category: 'CRYPTO', banglaName: 'ইথেরিয়াম / ডলার', changeSim: 1.84 },
  { symbol: 'LTC/USD', name: 'Litecoin / US Dollar', category: 'CRYPTO', banglaName: 'লাইটকয়েন / ডলার', changeSim: -0.95 },
  { symbol: 'XRP/USD', name: 'Ripple / US Dollar', category: 'CRYPTO', banglaName: 'রিপল / ডলার', changeSim: 3.40 },
  { symbol: 'SOL/USD', name: 'Solana / US Dollar', category: 'CRYPTO', banglaName: 'সোয়ানা / ডলার', changeSim: 4.12 },
  { symbol: 'BNB/USD', name: 'Binance Coin / US Dollar', category: 'CRYPTO', banglaName: 'বাইন্যান্স কয়েন / ডলার', changeSim: 0.88 },
  { symbol: 'ADA/USD', name: 'Cardano / US Dollar', category: 'CRYPTO', banglaName: 'কার্ডানো / ডলার', changeSim: -1.20 },
  { symbol: 'DOGE/USD', name: 'Dogecoin / US Dollar', category: 'CRYPTO', banglaName: 'ডজকয়েন / ডলার', changeSim: 5.80 },

  // Commodities
  { symbol: 'GOLD', name: 'Gold Spot', category: 'COMMODITIES', banglaName: 'স্বর্ণ / সোনা (মেটাল)', changeSim: 0.54 },
  { symbol: 'SILVER', name: 'Silver Spot', category: 'COMMODITIES', banglaName: 'রুপা / সিলভার', changeSim: -0.32 },
  { symbol: 'BRENT', name: 'Brent Crude Oil', category: 'COMMODITIES', banglaName: 'ব্রেন্ট অপরিশোধিত তেল', changeSim: -1.05 },
  { symbol: 'CRUDE', name: 'WTI Crude Oil', category: 'COMMODITIES', banglaName: 'অপরিশোধিত জ্বালানি তেল (WTI)', changeSim: -1.18 },
  { symbol: 'PLATINUM', name: 'Platinum Spot', category: 'COMMODITIES', banglaName: 'প্লাটিনাম', changeSim: 0.22 },
  { symbol: 'PALLADIUM', name: 'Palladium Spot', category: 'COMMODITIES', banglaName: 'প্যালাডিয়াম', changeSim: -0.45 },
  { symbol: 'COPPER', name: 'Copper Futures', category: 'COMMODITIES', banglaName: 'তামা / কপার', changeSim: 0.90 },
];

export const CATEGORIES = [
  { id: 'ALL', label: 'সব মার্কেট', icon: Globe },
  { id: 'MAJORS', label: 'মেজর ফরেক্স (Majors)', icon: Globe },
  { id: 'MINORS', label: 'মাইনর ফরেক্স (Minors)', icon: Coins },
  { id: 'EXOTICS', label: 'এক্সোটিক (Exotics)', icon: Star },
  { id: 'CRYPTO', label: 'ক্রিপ্টো (Crypto)', icon: Sparkles },
  { id: 'COMMODITIES', label: 'কমোডিটি (Commodity)', icon: Flame },
];

export const AssetHubModal: React.FC<AssetHubModalProps> = ({
  isOpen,
  onClose,
  selectedAsset,
  onSelectAsset,
}) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const filteredAssets = useMemo(() => {
    return ASSET_LIST.filter(asset => {
      const matchSearch = asset.symbol.toLowerCase().includes(search.toLowerCase()) || 
                          asset.name.toLowerCase().includes(search.toLowerCase()) ||
                          asset.banglaName.includes(search);
      const matchCategory = activeCategory === 'ALL' || asset.category === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [search, activeCategory]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop screen */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100]"
          />

          {/* Modal layout container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-[#090a0d] border border-white/10 rounded-3xl shadow-2xl z-[101] overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-white/5 bg-gradient-to-b from-[#13151c] to-[#090a0d] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-400">
                  <BarChart3 className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono">মার্কেট সিলেকশন হাব</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">সব ফরেক্স কারেন্সি পেয়ার, মেটাল, কমোডিটি এবং ক্রিপ্টো বাজার একসাথে</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"
                title="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Search */}
            <div className="px-6 py-4 bg-white/[0.01] border-b border-white/5 flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="কারেন্সি পেয়ার বা কমোডিটি নাম দিয়ে খুঁজুন... (যেমন: GOLD, EUR/USD)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#111319] border border-white/5 focus:border-indigo-500/40 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-200 outline-none placeholder:text-slate-600 transition-colors"
                />
                {search && (
                  <button 
                    onClick={() => setSearch('')}
                    className="absolute right-3.5 top-2.5 text-[10px] text-zinc-500 hover:text-white hover:bg-white/5 px-2 py-1 rounded"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Content Hub Segment: Categorized List */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              {/* Category Sidebar Selector */}
              <div className="w-full md:w-56 bg-slate-950/20 border-b md:border-b-0 md:border-r border-white/5 p-4 overflow-y-auto space-y-1 scrollbar-none shrink-0">
                <span className="text-[9px] text-slate-600 uppercase font-mono tracking-widest font-black block mb-3 px-2">ক্যাটাগরি ফিল্টার</span>
                {CATEGORIES.map((cat) => {
                  const IconComponent = cat.icon;
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={cn(
                        "w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-all outline-none",
                        isActive 
                          ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 font-bold" 
                          : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                      )}
                    >
                      <IconComponent className={cn("w-4 h-4", isActive ? "text-indigo-400 animate-pulse" : "text-slate-500")} />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Assets Grid List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3 min-h-[300px] scrollbar-thin">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">
                    মার্কেট সমূহ ({filteredAssets.length})
                  </span>
                  {activeCategory !== 'ALL' && (
                    <button 
                      onClick={() => setActiveCategory('ALL')} 
                      className="text-[9px] text-indigo-400 hover:underline font-mono"
                    >
                      ক্লিয়ার ফিল্টার
                    </button>
                  )}
                </div>

                {filteredAssets.length === 0 ? (
                  <div className="py-16 text-center text-slate-500 space-y-2">
                    <Globe className="w-10 h-10 text-slate-700 mx-auto animate-bounce" />
                    <p className="text-xs font-semibold">কোনো ম্যাচিং মার্কেট খুঁজে পাওয়া যায়নি!</p>
                    <p className="text-[10px] text-slate-600 font-mono">অন্য কি-ওয়ার্ড বা স্পেলিং দিয়ে আবার চেষ্টা করুন।</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {filteredAssets.map((asset) => {
                      const isSelected = selectedAsset === asset.symbol;
                      const isUp = asset.changeSim >= 0;

                      return (
                        <motion.button
                          key={asset.symbol}
                          whileHover={{ scale: 1.01, x: 2 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => {
                            onSelectAsset(asset.symbol);
                            onClose();
                          }}
                          className={cn(
                            "w-full text-left p-3.5 rounded-2xl transition-all border outline-none relative group overflow-hidden flex items-center justify-between",
                            isSelected 
                              ? "bg-indigo-600/10 border-indigo-500/30 text-white" 
                              : "bg-[#11131a]/40 border-white/5 hover:border-white/10 hover:bg-[#141720]/80 text-slate-300"
                          )}
                        >
                          {isSelected && (
                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                          )}
                          <div className="flex-1 min-w-0 pr-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold font-mono tracking-wide text-slate-100 uppercase">
                                {asset.symbol}
                              </span>
                              <span className={cn(
                                "text-[8px] font-bold px-1.5 py-0.25 rounded",
                                asset.category === 'MAJORS' ? "bg-emerald-500/10 text-emerald-400" :
                                asset.category === 'CRYPTO' ? "bg-amber-500/10 text-amber-400" :
                                asset.category === 'COMMODITIES' ? "bg-blue-500/10 text-blue-400 animate-pulse" :
                                "bg-slate-500/10 text-slate-400"
                              )}>
                                {asset.category}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 truncate font-semibold block">
                              {asset.banglaName}
                            </div>
                            <div className="text-[9px] text-slate-600 truncate mt-0.5 font-mono">
                              {asset.name}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className={cn(
                              "text-[10px] font-mono font-black",
                              isUp ? "text-emerald-400" : "text-rose-400"
                            )}>
                              {isUp ? '▲' : '▼'} {isUp ? '+' : ''}{asset.changeSim.toFixed(2)}%
                            </div>
                            <div className="text-[8px] text-slate-600 font-mono mt-1 group-hover:text-indigo-400 transition-colors uppercase tracking-wider flex items-center gap-0.5 justify-end">
                              Select <ChevronRight className="w-2.5 h-2.5" />
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer Information */}
            <div className="bg-[#0b0c10] px-6 py-4 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>TradingView Realtime Socket Connected (42 pairs active)</span>
              </span>
              <span>ব্যবহার সহায়িকা: যে কোনো মার্কেটে সরাসরি ট্রেডিং ভিউ সিগন্যাল অ্যাক্টিভ করুন</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
