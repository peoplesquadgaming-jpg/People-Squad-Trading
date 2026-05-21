import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, User, Check, Award, Trophy, TrendingUp, TrendingDown, 
  Globe, Percent, Calendar, Zap, Edit3, Save, RotateCcw, 
  DollarSign, Activity, Sparkles, BookOpen, Crown, ChevronRight 
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  realBalance: number;
  demoBalance: number;
  onResetDemoBalance: () => void;
  performanceData: {
    winRate: number;
    profitFactor: number;
    totalTrades: number;
    averageDuration: string;
    netProfit: number;
  };
  accountType: 'REAL' | 'DEMO';
}

export interface ProfileData {
  nickname: string;
  bio: string;
  country: string;
  avatarId: string;
  favoriteAsset: string;
  joinedDate: string;
}

// Beautiful predefined avatars
const AVATARS = [
  { id: 'av-1', emoji: '🚀', name: 'Bull Rider / ষাঁড় চালক', bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
  { id: 'av-2', emoji: '🎯', name: 'Scalper Master / স্ক্যাল্পিং গুরু', bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400' },
  { id: 'av-3', emoji: '💎', name: 'Diamond Hands / হোল্ডার কিং', bg: 'bg-purple-500/10 border-purple-500/30 text-purple-400' },
  { id: 'av-4', emoji: '👑', name: 'Orbit Monarch / অরবিট সম্রাট', bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400' },
  { id: 'av-5', emoji: '⚡', name: 'Pulse Trader / পাল্স ট্রেডার', bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400' },
  { id: 'av-6', emoji: '🦊', name: 'Alpha Arbitrageur / আলফা ট্র্যাকার', bg: 'bg-teal-500/10 border-teal-500/30 text-teal-400' },
];

const COUNTRIES = [
  'Bangladesh', 'India', 'United States', 'United Kingdom', 
  'Saudi Arabia', 'Singapore', 'Malaysia', 'United Arab Emirates'
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  realBalance,
  demoBalance,
  onResetDemoBalance,
  performanceData,
  accountType
}) => {
  // Load or initialize static details
  const [profile, setProfile] = useState<ProfileData>(() => {
    const saved = localStorage.getItem('profitSignal_userProfile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    
    // Default initial profile values
    const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
    const dateStr = new Date().toLocaleDateString('bn-BD', options); // Default Bengali formatted joined month
    const fallbackDateStr = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    return {
      nickname: 'Alpha Trader',
      bio: 'সরাসরি কৃত্রিম বুদ্ধিমত্তা সিগন্যাল এবং স্মার্ট ইনডিকেটর ব্যবহারকারী।',
      country: 'Bangladesh',
      avatarId: 'av-1',
      favoriteAsset: 'EUR/USD',
      joinedDate: `${fallbackDateStr} (${dateStr})`
    };
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempNickname, setTempNickname] = useState(profile.nickname);
  const [tempBio, setTempBio] = useState(profile.bio);
  const [tempCountry, setTempCountry] = useState(profile.country);
  const [tempAvatarId, setTempAvatarId] = useState(profile.avatarId);
  const [tempFavoriteAsset, setTempFavoriteAsset] = useState(profile.favoriteAsset);
  
  const [resetSuccess, setResetSuccess] = useState(false);

  // Sync edits state when open
  useEffect(() => {
    if (isOpen) {
      setTempNickname(profile.nickname);
      setTempBio(profile.bio);
      setTempCountry(profile.country);
      setTempAvatarId(profile.avatarId);
      setTempFavoriteAsset(profile.favoriteAsset);
      setIsEditing(false);
      setResetSuccess(false);
    }
  }, [isOpen, profile]);

  // Handle Profile Save
  const handleSave = () => {
    const updated: ProfileData = {
      ...profile,
      nickname: tempNickname.trim() || 'Alpha Trader',
      bio: tempBio.trim() || 'AI Signals & Arbitrage Trader.',
      country: tempCountry,
      avatarId: tempAvatarId,
      favoriteAsset: tempFavoriteAsset,
    };
    setProfile(updated);
    localStorage.setItem('profitSignal_userProfile', JSON.stringify(updated));
    setIsEditing(false);
  };

  const currentAvatar = useMemo(() => {
    return AVATARS.find(av => av.id === profile.avatarId) || AVATARS[0];
  }, [profile.avatarId]);

  const activeTempAvatar = useMemo(() => {
    return AVATARS.find(av => av.id === tempAvatarId) || AVATARS[0];
  }, [tempAvatarId]);

  // Determine dynamic Trader Badge/Tier based on Win Rate & Balance
  const traderTier = useMemo(() => {
    const winRate = performanceData.winRate;
    const balance = accountType === 'REAL' ? realBalance : demoBalance;

    if (winRate >= 85 && balance >= 25000) {
      return {
        badge: 'CROWN VIP / অরবিট লিডার',
        desc: 'মেগা প্রফেশনাল লেভেল ট্র্যাকার',
        icon: Crown,
        color: 'from-amber-500 to-amber-700 text-amber-300 border-amber-500/40'
      };
    } else if (winRate >= 75 || balance >= 12000) {
      return {
        badge: 'ELITE EXPERT / এলিট এক্সপার্ট',
        desc: 'হাই পারফরম্যান্স ট্রেডিং এক্সপার্ট',
        icon: Award,
        color: 'from-indigo-500 to-purple-600 text-indigo-300 border-indigo-500/40'
      };
    } else if (winRate >= 60) {
      return {
        badge: 'GOLD LEAGUE / গোল্ড লিগ',
        desc: 'লাভজনক এবং আত্মবিশ্বাসী ট্রেডার',
        icon: Trophy,
        color: 'from-blue-500 to-cyan-500 text-cyan-300 border-blue-500/30'
      };
    } else {
      return {
        badge: 'BASIC ARBITRAGE / বেসিক ট্রেডার',
        desc: 'শেখা এবং বৃদ্ধির ধাপে থাকা ট্রেডার',
        icon: Zap,
        color: 'from-slate-600 to-slate-800 text-slate-300 border-slate-600/30'
      };
    }
  }, [performanceData.winRate, realBalance, demoBalance, accountType]);

  const winCount = useMemo(() => {
    return Math.round((performanceData.winRate / 100) * performanceData.totalTrades);
  }, [performanceData.winRate, performanceData.totalTrades]);

  const lossCount = useMemo(() => {
    return Math.max(0, performanceData.totalTrades - winCount);
  }, [performanceData.totalTrades, winCount]);

  const handleResetDemo = () => {
    onResetDemoBalance();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 2000);
  };

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

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-[#090a0d] border border-white/10 rounded-3xl shadow-2xl z-[101] overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-gradient-to-b from-[#13151c] to-[#090a0d] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono">ট্রেডার প্রোফাইল (Trader Profile)</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">আপনার পারফরম্যান্স রিপোর্ট, লেভেল র‍্যাংক এবং বায়োডাটা কাস্টমাইজ করুন</p>
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

            {/* Profile Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
              
              {/* Dynamic Tier Banner & Profile Summary Card */}
              <div className="bg-gradient-to-br from-[#12141c] to-[#0b0c10] border border-white/5 rounded-2xl p-5 relative overflow-hidden flex flex-col sm:flex-row items-center gap-5">
                
                {/* Background glow effects */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full" />

                {/* Avatar Display */}
                <div className="relative shrink-0">
                  <div className={cn(
                    "w-20 h-20 rounded-2xl flex items-center justify-center text-4xl border relative shadow-inner shadow-black/80",
                    currentAvatar.bg
                  )}>
                    {currentAvatar.emoji}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-slate-900 border border-white/10 rounded-full px-1.5 py-0.5 text-[8px] font-mono font-bold text-emerald-400">
                    LIVE
                  </div>
                </div>

                {/* Profile Stats Overview */}
                <div className="flex-1 text-center sm:text-left space-y-2 min-w-0 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <h4 className="text-base font-black text-white truncate font-sans tracking-wide">
                      {profile.nickname}
                    </h4>
                    <span className="inline-flex self-center sm:self-auto items-center gap-1 text-[9px] px-2 py-0.5 font-bold uppercase tracking-wider rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                      <Sparkles className="w-2.5 h-2.5" /> {profile.country}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed max-w-md italic line-clamp-2">
                    "{profile.bio}"
                  </p>

                  <div className="flex flex-wrap justify-center sm:justify-start items-center gap-x-4 gap-y-1 text-[10px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-600" /> 
                      Joined: <strong className="text-slate-400 font-medium">{profile.joinedDate}</strong>
                    </span>
                    <span className="hidden sm:inline text-slate-700">•</span>
                    <span className="flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-slate-600" />
                      Fav Pair: <span className="text-indigo-400 font-bold uppercase">{profile.favoriteAsset}</span>
                    </span>
                  </div>
                </div>

                {/* Edit Toggle Button */}
                <div className="w-full sm:w-auto shrink-0 self-stretch sm:self-center flex flex-col justify-center">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={cn(
                      "w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border",
                      isEditing 
                        ? "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20" 
                        : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {isEditing ? (
                      <>
                        <X className="w-3.5 h-3.5" />
                        বাতিল (Cancel)
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-3.5 h-3.5" />
                        এডিট প্রোফাইল
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Edit Mode Panel Container */}
              <AnimatePresence>
                {isEditing && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border border-indigo-500/20 bg-indigo-500/5 rounded-2xl"
                  >
                    <div className="p-5 space-y-4">
                      <span className="text-[10px] font-black uppercase text-indigo-300 tracking-wider font-mono flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 animate-pulse" /> প্রোফাইল মডিফাই করুন (Modify Fields)
                      </span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Nickname */}
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-semibold block">ট্রেডার নাম (Nickname)</label>
                          <input 
                            type="text"
                            value={tempNickname}
                            onChange={(e) => setTempNickname(e.target.value)}
                            className="w-full bg-[#050507] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 outline-none"
                            placeholder="যেমন: SmartScalper"
                            maxLength={25}
                          />
                        </div>

                        {/* Country */}
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-semibold block">দেশ (Country)</label>
                          <select
                            value={tempCountry}
                            onChange={(e) => setTempCountry(e.target.value)}
                            className="w-full bg-[#050507] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 outline-none"
                          >
                            {COUNTRIES.map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>

                        {/* Favorite Pair */}
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-semibold block">পছন্দের মার্কেট (Favorite Asset)</label>
                          <input 
                            type="text"
                            value={tempFavoriteAsset}
                            onChange={(e) => setTempFavoriteAsset(e.target.value)}
                            className="w-full bg-[#050507] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 outline-none uppercase"
                            placeholder="যেমন: EUR/USD, GOLD"
                          />
                        </div>

                        {/* Custom Bio */}
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-semibold block">স্ট্যাটাস বায়ো (Status Bio)</label>
                          <input 
                            type="text"
                            value={tempBio}
                            onChange={(e) => setTempBio(e.target.value)}
                            className="w-full bg-[#050507] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 outline-none"
                            placeholder="নিজেকে ব্যাখ্যা করুন..."
                            maxLength={80}
                          />
                        </div>
                      </div>

                      {/* Avatar Picker Grid */}
                      <div className="space-y-1.5 pt-2">
                        <label className="text-[10px] text-slate-400 font-semibold block">অ্যাভাটার চয়েস করুন (Choose Avatar)</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {AVATARS.map((av) => (
                            <button
                              key={av.id}
                              type="button"
                              onClick={() => setTempAvatarId(av.id)}
                              className={cn(
                                "p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all outline-none",
                                tempAvatarId === av.id 
                                  ? "bg-indigo-600/20 border-indigo-500 text-white font-bold" 
                                  : "bg-[#0b0c10]/60 border-white/5 text-slate-400 hover:bg-white/5"
                              )}
                            >
                              <span className="text-xl">{av.emoji}</span>
                              <div className="min-w-0">
                                <p className="text-[9px] font-bold truncate text-slate-100">{av.name.split('/')[0]}</p>
                                <p className="text-[8px] truncate text-slate-500">{av.name.split('/')[1]}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Save Buttons */}
                      <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                        <button
                          onClick={handleSave}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <Save className="w-3.5 h-3.5" />
                          সংরক্ষণ করুন (Save Profile)
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Dynamic Rankings / League Banner display */}
              <div className={cn(
                "border rounded-2xl p-4 bg-gradient-to-r flex items-center justify-between gap-4",
                traderTier.color
              )}>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
                    <traderTier.icon className="w-6 h-6 shrink-0" />
                  </div>
                  <div>
                    <span className="text-[8.5px] font-black uppercase tracking-widest block opacity-70">ট্রেডার লেভেল র‍্যাংক (Trader League Rank)</span>
                    <h5 className="text-xs font-black font-sans uppercase mt-0.5 tracking-wide">{traderTier.badge}</h5>
                    <p className="text-[9px] opacity-80 mt-0.5 font-mono">{traderTier.desc}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] opacity-75 font-mono">Win Rate Required:</div>
                  <div className="text-sm font-black font-mono">
                    {performanceData.winRate.toFixed(1)}% / {(accountType === 'REAL' ? realBalance : demoBalance) >= 12000 ? 'Level Up' : 'Active'}
                  </div>
                </div>
              </div>

              {/* Detailed Performance Statistics Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">
                    ট্রেডিং রিপোর্ট মেকানিজম (Trading Analytics Report)
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono uppercase bg-white/5 px-2 py-0.5 rounded">
                    Account: {accountType} Feed
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  
                  {/* Stats Card: Total Trades */}
                  <div className="bg-[#11131a]/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
                    <span className="text-[9px] text-slate-500 font-semibold uppercase">মোট ট্রেড (Total Trades)</span>
                    <div className="mt-2.5 flex items-baseline gap-1">
                      <span className="text-xl font-bold font-mono text-white">{performanceData.totalTrades}</span>
                      <span className="text-[9px] text-slate-600 font-mono">trades</span>
                    </div>
                    <div className="mt-2 text-[8px] text-slate-500 font-mono flex items-center gap-1">
                      <Activity className="w-3 h-3 text-indigo-400" /> Auto + Manual counts
                    </div>
                  </div>

                  {/* Stats Card: Win Rate */}
                  <div className="bg-[#11131a]/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
                    <span className="text-[9px] text-slate-500 font-semibold uppercase">উইন রেট (Win Rate)</span>
                    <div className="mt-2.5 flex items-baseline gap-1">
                      <span className="text-xl font-bold font-mono text-emerald-400">{performanceData.winRate.toFixed(1)}%</span>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 w-full bg-white/5 rounded-full h-1 overflow-hidden">
                      <div 
                        className="bg-emerald-400 h-full rounded-full" 
                        style={{ width: `${performanceData.winRate}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats Card: Wins & Losses */}
                  <div className="bg-[#11131a]/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
                    <span className="text-[9px] text-slate-500 font-semibold uppercase">জয়ের সংখ্যা (Wins / Losses)</span>
                    <div className="mt-2.5 flex items-baseline gap-2 font-mono">
                      <span className="text-base font-bold text-emerald-400">{winCount}W</span>
                      <span className="text-xs text-slate-600">/</span>
                      <span className="text-sm font-bold text-rose-400">{lossCount}L</span>
                    </div>
                    <div className="mt-2 text-[8px] text-slate-500 font-mono">
                      Ratio: {(winCount / Math.max(1, lossCount)).toFixed(2)}x Profitability
                    </div>
                  </div>

                  {/* Stats Card: Profit Factor */}
                  <div className="bg-[#11131a]/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
                    <span className="text-[9px] text-slate-500 font-semibold uppercase font-sans">প্রফিট ফ্যাক্টর (Factor)</span>
                    <div className="mt-2.5 flex items-baseline gap-1">
                      <span className="text-xl font-bold font-mono text-blue-400">{performanceData.profitFactor.toFixed(2)}</span>
                    </div>
                    <div className="mt-2 text-[8px] text-slate-500 font-mono flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-emerald-400" /> Net ratio positive
                    </div>
                  </div>

                </div>
              </div>

              {/* Net earnings display and reset balance operations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Simulated Balances Ledger */}
                <div className="bg-[#11131a]/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">সিমুলেটেড ব্যালেন্স হিস্ট্রি Ledger</span>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono border-b border-white/5 pb-2">
                      <span className="text-slate-500 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> Demo Wallet:</span>
                      <span className="font-bold text-blue-400">${demoBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono pt-1">
                      <span className="text-slate-500 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Real Wallet:</span>
                      <span className="font-bold text-emerald-400">${realBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                {/* Operations & Reset Area */}
                <div className="bg-[#11131a]/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono block mb-1">ব্যালেন্স রিসেট করুন (Reset Panel)</span>
                    <p className="text-[10px] text-slate-500">আপনার ডেমো ব্যালেন্স আবার রিফিল করতে বা প্রাকটিস পুনরায় শুরু করতে রিসেট করুন।</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleResetDemo}
                      disabled={resetSuccess}
                      className="flex-1 py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      {resetSuccess ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          রিসেট সফল! (Demo Refilled)
                        </>
                      ) : (
                        <>
                          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                          $10,000 এ ডেমো রিসেট
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>

            </div>

            {/* Footer */}
            <div className="bg-[#0b0c10] px-6 py-4 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                <span>ID Shield: Standard Simulation Secure Core Active</span>
              </span>
              <span>ব্যবহার সহায়িকা: প্রোফাইল চেঞ্জ সম্পূর্ণ লোকাল এবং সুরক্ষিত</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
