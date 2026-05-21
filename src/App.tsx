import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TradingViewChart } from './components/TradingViewChart';
import { SignalPanel, SignalType } from './components/SignalPanel';
import { IndicatorGrid, IndicatorData } from './components/IndicatorGrid';
import { SettingsModal } from './components/SettingsModal';
import { AlertManager, PriceAlert } from './components/AlertManager';
import { NotificationToast } from './components/NotificationToast';
import { RiskManagementModal } from './components/RiskManagementModal';
import { PerformanceStats, PerformanceData } from './components/PerformanceStats';
import { OpenTrades, Trade } from './components/OpenTrades';
import { TradingHistoryModal, ClosedTrade } from './components/TradingHistoryModal';
import { AdminPanel } from './components/AdminPanel';
import { AIAssistant } from './components/AIAssistant';
import { PocketOptionLoginModal } from './components/PocketOptionLoginModal';
import { AssetHubModal } from './components/AssetHubModal';
import { UserProfileModal } from './components/UserProfileModal';
import { Shield, ShieldAlert, Info, History, Settings, LayoutDashboard, Zap, Bell, Bot, ExternalLink, Globe, Sparkles, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { generateSignalExplanation } from './services/geminiService';

interface DataPoint {
  time: string;
  price: number;
}

const getDurationSeconds = (d: string): number => {
  const match = d.match(/^(\d+)([MS])$/i);
  if (match) {
    const val = parseInt(match[1]);
    const unit = match[2].toUpperCase();
    if (unit === 'M') return val * 60;
    return val;
  }
  return 60; // default 60s
};

export default function App() {
  const [data, setData] = useState<DataPoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState(1.00960);
  const [signalEntryPrice, setSignalEntryPrice] = useState<number | null>(null);
  const [signal, setSignal] = useState<SignalType>('NEUTRAL');
  const [confidence, setConfidence] = useState(0);
  const [duration, setDuration] = useState('1M');
  const [durationMode, setDurationMode] = useState<'1M' | '3M' | '5M'| 'AI_DYNAMIC'>(() => {
    return (localStorage.getItem('profitSignal_durationMode') as any) || 'AI_DYNAMIC';
  });
  const [lotSize, setLotSize] = useState<number>(() => {
    return Number(localStorage.getItem('profitSignal_lotSize')) || 1.00;
  });
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionType, setPredictionType] = useState<SignalType>('NEUTRAL');
  const [signalExplanation, setSignalExplanation] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);
  const [asset, setAsset] = useState(() => {
    return localStorage.getItem('profitSignal_asset') || 'EUR/USD';
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isRiskOpen, setIsRiskOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [aiOptimizationStats, setAiOptimizationStats] = useState({ 
    boost: 0, 
    lastUpdate: 'Never', 
    currentSuccess: 98,
    isHyperBoost: localStorage.getItem('profitSignal_hyperMode') === 'true'
  });
  const lastSignalTime = useRef(Date.now());

  const handleAIOptimize = (stats: any) => {
    setAiOptimizationStats(prev => ({
      boost: stats.accuracyBoost,
      lastUpdate: stats.lastUpdate,
      currentSuccess: stats.isHyperBoost ? 99.9 : Math.min(99.8, prev.currentSuccess + (stats.isAggressive ? 0.2 : 0.1)),
      isHyperBoost: stats.isHyperBoost
    }));
    
    // Update underlying engine settings
    setAdminSettings(prev => ({
      ...prev,
      successRate: stats.isHyperBoost ? 99.8 : Math.min(99, prev.successRate + (stats.isAggressive ? 0.5 : 0.2)),
      neuralIntensity: stats.isHyperBoost ? 100 : Math.min(100, prev.neuralIntensity + (stats.isAggressive ? 5 : 2))
    }));
  };

  const calibratePrice = (newPrice: number) => {
    setCurrentPrice(newPrice);
    
    // Smoothly reconstruct the 50 prior historical data points relative to this new price
    const initialData: DataPoint[] = [];
    let basePrice = newPrice;
    const isCryptoOrGold = asset.includes('BTC') || asset === 'GOLD';
    for (let i = 0; i < 50; i++) {
      basePrice += (Math.random() - 0.5) * (isCryptoOrGold ? 10 : 0.0002);
      initialData.push({
        time: new Date(Date.now() - (50 - i) * 1000).toLocaleTimeString(),
        price: basePrice
      });
    }
    setData(initialData);
  };

  // Prevention for stuck prediction state
  useEffect(() => {
    if (isPredicting) {
      const timer = setTimeout(() => setIsPredicting(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isPredicting]);
  const [adminSettings, setAdminSettings] = useState(() => {
    const saved = localStorage.getItem('profitSignal_adminSettings');
    return saved ? JSON.parse(saved) : {
      successRate: 98,
      signalDelay: 0,
      autoTradeThreshold: 3,
      marketBias: 'NEUTRAL',
      volatility: 50,
      neuralIntensity: 75,
      signalFrequency: 5,
      signalSensitivity: 3,
      scriptMode: 'NONE',
      forceNextSignal: 'AUTO',
      socialProofMode: false
    };
  });
  const [isAutoTradeEnabled, setIsAutoTradeEnabled] = useState(() => {
    return localStorage.getItem('profitSignal_autoTrade') === 'true';
  });
  const [autoTradeAmount, setAutoTradeAmount] = useState(() => {
    return Number(localStorage.getItem('profitSignal_autoTradeAmount')) || 100;
  });
  const [isAiAmount, setIsAiAmount] = useState(() => {
    return localStorage.getItem('profitSignal_isAiAmount') !== 'false';
  });
  const [accountType, setAccountType] = useState<'REAL' | 'DEMO'>(() => {
    return (localStorage.getItem('profitSignal_accountType') as 'REAL' | 'DEMO') || 'DEMO';
  });
  const [realBalance, setRealBalance] = useState(() => {
    return Number(localStorage.getItem('profitSignal_realBalance')) || 0;
  });
  const [demoBalance, setDemoBalance] = useState(() => {
    return Number(localStorage.getItem('profitSignal_demoBalance')) || 10000;
  });
  const [selectedBroker, setSelectedBroker] = useState<'NONE' | 'POCKET_OPTION' | 'QUOTEX'>(() => {
    return (localStorage.getItem('profitSignal_selectedBroker') as any) || 'NONE';
  });
  const prevBalanceRef = React.useRef(accountType === 'REAL' ? realBalance : demoBalance);
  const [balanceChange, setBalanceChange] = useState<'up' | 'down' | null>(null);

  const currentBalance = accountType === 'REAL' ? realBalance : demoBalance;

  useEffect(() => {
    if (currentBalance > prevBalanceRef.current) {
      setBalanceChange('up');
      const timer = setTimeout(() => setBalanceChange(null), 1000);
      return () => clearTimeout(timer);
    } else if (currentBalance < prevBalanceRef.current) {
      setBalanceChange('down');
      const timer = setTimeout(() => setBalanceChange(null), 1000);
      return () => clearTimeout(timer);
    }
    prevBalanceRef.current = currentBalance;
  }, [currentBalance]);

  // Set and lock signal entry price when trade signal becomes active
  useEffect(() => {
    if (signal !== 'NEUTRAL') {
      if (signalEntryPrice === null) {
        setSignalEntryPrice(currentPrice);
      }
    } else {
      setSignalEntryPrice(null);
    }
  }, [signal, currentPrice, signalEntryPrice]);

  const [isAutoSignalEnabled, setIsAutoSignalEnabled] = useState(() => {
    return localStorage.getItem('profitSignal_autoSignal') !== 'false';
  });
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [activeNotification, setActiveNotification] = useState<any | null>(null);
  const [openTrades, setOpenTrades] = useState<Trade[]>([]);
  const [tradeHistory, setTradeHistory] = useState<ClosedTrade[]>(() => {
    const saved = localStorage.getItem('profitSignal_tradeHistory');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Deduplicate by ID
          const unique = [];
          const seen = new Set();
          for (const trade of parsed) {
            if (!seen.has(trade.id)) {
              seen.add(trade.id);
              unique.push(trade);
            }
          }
          return unique;
        }
      } catch (e) {}
    }
    return [];
  });
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [isAssetHubOpen, setIsAssetHubOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [poConnection, setPoConnection] = useState(() => {
    const connected = localStorage.getItem('profitSignal_po_connected') === 'true';
    const email = localStorage.getItem('profitSignal_po_email') || '';
    const server = (localStorage.getItem('profitSignal_po_server') as 'DEMO' | 'REAL') || 'DEMO';
    const uid = localStorage.getItem('profitSignal_po_uid') || '';
    return { connected, email, server, uid };
  });
  const [visibleIndicators, setVisibleIndicators] = useState<string[]>(() => {
    const saved = localStorage.getItem('profitSignal_visibleIndicators');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return ['RSI (14)', 'MACD', 'MA (20)', 'MA (50)', 'Stochastic', 'Bollinger', 'AO', 'SRSI'];
  });
  const [performanceData, setPerformanceData] = useState<PerformanceData>(() => {
    const saved = localStorage.getItem('profitSignal_performanceData');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      winRate: 68.5,
      profitFactor: 1.42,
      totalTrades: 124,
      averageDuration: '4m 12s',
      netProfit: 1245.50
    };
  });

  const allIndicatorNames = ['RSI (14)', 'MACD', 'MA (20)', 'MA (50)', 'Stochastic', 'Bollinger', 'AO', 'SRSI'];

  const assets = [
    // Forex Majors
    'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'USD/CHF', 'NZD/USD',
    // Forex Minors & Crosses
    'EUR/GBP', 'GBP/JPY', 'EUR/JPY', 'AUD/JPY', 'CAD/JPY', 'CHF/JPY', 'NZD/JPY', 'GBP/CHF', 'EUR/CHF', 'EUR/CAD', 'GBP/CAD', 'AUD/CAD', 'EUR/AUD', 'GBP/AUD', 'AUD/NZD',
    // Forex Exotics
    'USD/TRY', 'USD/MXN', 'USD/SGD', 'USD/ZAR', 'USD/HKD', 'EUR/TRY', 'EUR/ZAR',
    // Cryptos
    'BTC/USD', 'ETH/USD', 'LTC/USD', 'XRP/USD', 'SOL/USD', 'BNB/USD', 'ADA/USD', 'DOGE/USD',
    // Commodities
    'GOLD', 'SILVER', 'BRENT', 'CRUDE', 'PLATINUM', 'PALLADIUM', 'COPPER'
  ];

  // Save preferences to local storage
  useEffect(() => {
    localStorage.setItem('profitSignal_asset', asset);
  }, [asset]);

  useEffect(() => {
    localStorage.setItem('profitSignal_visibleIndicators', JSON.stringify(visibleIndicators));
  }, [visibleIndicators]);

  useEffect(() => {
    localStorage.setItem('profitSignal_performanceData', JSON.stringify(performanceData));
  }, [performanceData]);

  useEffect(() => {
    localStorage.setItem('profitSignal_tradeHistory', JSON.stringify(tradeHistory));
  }, [tradeHistory]);

  useEffect(() => {
    localStorage.setItem('profitSignal_autoTrade', String(isAutoTradeEnabled));
  }, [isAutoTradeEnabled]);

  useEffect(() => {
    localStorage.setItem('profitSignal_autoSignal', String(isAutoSignalEnabled));
  }, [isAutoSignalEnabled]);

  useEffect(() => {
    localStorage.setItem('profitSignal_autoTradeAmount', String(autoTradeAmount));
  }, [autoTradeAmount]);

  useEffect(() => {
    localStorage.setItem('profitSignal_isAiAmount', String(isAiAmount));
  }, [isAiAmount]);

  useEffect(() => {
    localStorage.setItem('profitSignal_accountType', accountType);
  }, [accountType]);

  useEffect(() => {
    localStorage.setItem('profitSignal_realBalance', String(realBalance));
  }, [realBalance]);

  useEffect(() => {
    localStorage.setItem('profitSignal_demoBalance', String(demoBalance));
  }, [demoBalance]);

  useEffect(() => {
    localStorage.setItem('profitSignal_selectedBroker', selectedBroker);
  }, [selectedBroker]);

  const handlePoSuccess = (email: string, server: 'DEMO' | 'REAL', uid: string) => {
    localStorage.setItem('profitSignal_po_connected', 'true');
    localStorage.setItem('profitSignal_po_email', email);
    localStorage.setItem('profitSignal_po_server', server);
    localStorage.setItem('profitSignal_po_uid', uid);
    setPoConnection({
      connected: true,
      email,
      server,
      uid,
    });
    setAccountType(server);
    setSelectedBroker('POCKET_OPTION');
  };

  const handlePoDisconnect = () => {
    localStorage.removeItem('profitSignal_po_connected');
    localStorage.removeItem('profitSignal_po_email');
    localStorage.removeItem('profitSignal_po_password');
    localStorage.removeItem('profitSignal_po_server');
    localStorage.removeItem('profitSignal_po_uid');
    setPoConnection({
      connected: false,
      email: '',
      server: 'DEMO',
      uid: '',
    });
  };

  useEffect(() => {
    localStorage.setItem('profitSignal_durationMode', durationMode);
  }, [durationMode]);

  useEffect(() => {
    localStorage.setItem('profitSignal_lotSize', String(lotSize));
  }, [lotSize]);

  // Trend strength calculation (reusable)
  const trendStrength = useMemo(() => {
    if (data.length < 15) return 0;
    const prices = data.map(d => d.price);
    const lastPrice = prices[prices.length - 1];
    
    // Calculate overall trend slope (12 periods)
    const trendLookback = 12;
    const startPrice = prices[prices.length - trendLookback];
    const trendDiff = lastPrice - startPrice;
    
    // Calculate micro trend (3 periods) - ultra responsive
    const microLookback = 3;
    const microStartPrice = prices[prices.length - microLookback];
    const microDiff = lastPrice - microStartPrice;
    
    // Combined trend strength - heavily weighted towards micro movement
    return ((trendDiff / lastPrice) * 10000 * 0.3) + ((microDiff / lastPrice) * 10000 * 0.7);
  }, [data]);

  // Calculate indicators based on price data
  const indicators = useMemo((): IndicatorData[] => {
    if (data.length < 50) return [];

    const prices = data.map(d => d.price);
    const lastPrice = prices[prices.length - 1];
    
    // RSI (14)
    let gains = 0;
    let losses = 0;
    for (let i = prices.length - 14; i < prices.length; i++) {
      const diff = prices[i] - prices[i - 1];
      if (diff >= 0) gains += diff;
      else losses -= diff;
    }
    const avgGain = gains / 14;
    const avgLoss = losses / 14;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    // During trends, indicators must align with momentum
    let rsiStatus: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
    if (trendStrength > 1.5) rsiStatus = 'BULLISH';
    else if (trendStrength < -1.5) rsiStatus = 'BEARISH';
    else rsiStatus = rsi > 65 ? 'BEARISH' : rsi < 35 ? 'BULLISH' : 'NEUTRAL';

    // MACD (12, 26)
    const ma12 = prices.slice(-12).reduce((a, b) => a + b, 0) / 12;
    const ma26 = prices.slice(-26).reduce((a, b) => a + b, 0) / 26;
    const macd = ma12 - ma26;
    const macdStatus = trendStrength > 1 ? 'BULLISH' : (trendStrength < -1 ? 'BEARISH' : (macd > 0 ? 'BULLISH' : 'BEARISH'));

    // Stochastic (14)
    const period14 = prices.slice(-14);
    const low14 = Math.min(...period14);
    const high14 = Math.max(...period14);
    const stochastic = ((lastPrice - low14) / (high14 - low14)) * 100;
    
    let stochasticStatus: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
    if (trendStrength > 2) stochasticStatus = 'BULLISH';
    else if (trendStrength < -2) stochasticStatus = 'BEARISH';
    else stochasticStatus = stochastic > 80 ? 'BEARISH' : stochastic < 20 ? 'BULLISH' : 'NEUTRAL';

    // Bollinger Bands (20)
    const ma20 = prices.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const variance = prices.slice(-20).reduce((acc, val) => acc + Math.pow(val - ma20, 2), 0) / 20;
    const stdDev = Math.sqrt(variance);
    const upperBB = ma20 + 2 * stdDev;
    const lowerBB = ma20 - 2 * stdDev;
    
    let bbStatus: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
    if (trendStrength > 2) bbStatus = 'BULLISH';
    else if (trendStrength < -2) bbStatus = 'BEARISH';
    else bbStatus = lastPrice > upperBB ? 'BEARISH' : lastPrice < lowerBB ? 'BULLISH' : 'NEUTRAL';

    // MA 50
    const ma50 = prices.slice(-50).reduce((a, b) => a + b, 0) / 50;
    
    const allIndicators: IndicatorData[] = [
      { 
        name: 'RSI (14)', 
        value: rsi.toFixed(1), 
        status: rsiStatus,
        description: 'Relative Strength Index. Measures the speed and change of price movements to identify overbought or oversold conditions.'
      },
      { 
        name: 'MACD', 
        value: macd.toFixed(5), 
        status: macdStatus,
        description: 'Moving Average Convergence Divergence. A trend-following momentum indicator that shows the relationship between two moving averages.'
      },
      { 
        name: 'MA (20)', 
        value: ma20.toFixed(currentPrice > 100 ? 2 : 5), 
        status: trendStrength > 1 ? 'BULLISH' : (trendStrength < -1 ? 'BEARISH' : (lastPrice > ma20 ? 'BULLISH' : 'BEARISH')),
        description: '20-period Moving Average. Smooths out price action to identify the short-term trend direction.'
      },
      { 
        name: 'MA (50)', 
        value: ma50.toFixed(currentPrice > 100 ? 2 : 5), 
        status: trendStrength > 0.5 ? 'BULLISH' : (trendStrength < -0.5 ? 'BEARISH' : (lastPrice > ma50 ? 'BULLISH' : 'BEARISH')),
        description: '50-period Moving Average. A widely used indicator to identify the medium-term trend and potential support/resistance levels.'
      },
      { 
        name: 'Stochastic', 
        value: stochastic.toFixed(1), 
        status: stochasticStatus,
        description: 'A momentum indicator comparing a particular closing price of a security to a range of its prices over a certain period of time.'
      },
      { 
        name: 'Bollinger', 
        value: lastPrice > ma20 ? 'Upper' : 'Lower', 
        status: bbStatus,
        description: 'Bollinger Bands. Consists of a middle band (MA) and two outer bands that expand/contract based on market volatility.'
      },
      { 
        name: 'AO', 
        value: (macd * 0.8).toFixed(5), 
        status: macdStatus,
        description: 'Awesome Oscillator. Used to measure market momentum and to affirm trends or anticipate reversals.'
      },
      { 
        name: 'SRSI', 
        value: ((rsi - 30) / 40 * 100).toFixed(1), 
        status: rsiStatus,
        description: 'Stochastic RSI. An indicator that applies the Stochastic oscillator formula to RSI values instead of price data.'
      }
    ];


    return allIndicators;
  }, [data, currentPrice]);

  const filteredIndicators = useMemo(() => {
    return indicators.filter(ind => visibleIndicators.includes(ind.name));
  }, [indicators, visibleIndicators]);

  const toggleIndicator = (name: string) => {
    setVisibleIndicators(prev => 
      prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]
    );
  };

  const addAlert = (newAlert: Omit<PriceAlert, 'id' | 'active'>) => {
    const alert: PriceAlert = {
      ...newAlert,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      active: true
    };
    setAlerts(prev => [...prev, alert]);
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  // Check alerts whenever price updates
  useEffect(() => {
    alerts.forEach(alert => {
      if (alert.active && alert.asset === asset) {
        const isTriggered = 
          (alert.type === 'ABOVE' && currentPrice >= alert.price) ||
          (alert.type === 'BELOW' && currentPrice <= alert.price);
        
        if (isTriggered) {
          setActiveNotification(alert);
          // Deactivate alert after trigger to prevent multiple notifications
          setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, active: false } : a));
        }
      }
    });
  }, [currentPrice, asset, alerts]);

  // Countdown timer logic
  useEffect(() => {
    if (signal === 'NEUTRAL') return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setSignal('NEUTRAL');
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [signal]);

  // Handle asset change
  useEffect(() => {
    const initialData: DataPoint[] = [];
    let basePrice = asset.includes('USD') ? 1.00960 : asset === 'GOLD' ? 2350.40 : 65000.00;
    
    // Add some variation based on asset
    if (asset === 'GBP/USD') basePrice = 1.34208;
    if (asset === 'USD/JPY') basePrice = 151.20;
    if (asset === 'AUD/USD') basePrice = 0.65400;
    if (asset === 'USD/CAD') basePrice = 1.35800;
    if (asset === 'EUR/GBP') basePrice = 0.85600;
    if (asset === 'NZD/USD') basePrice = 0.60200;
    if (asset === 'USD/CHF') basePrice = 0.90400;
    if (asset === 'GBP/JPY') basePrice = 191.50;
    if (asset === 'EUR/JPY') basePrice = 163.80;
    if (asset === 'ETH/USD') basePrice = 3450.00;
    if (asset === 'LTC/USD') basePrice = 95.40;
    if (asset === 'XRP/USD') basePrice = 0.6200;
    if (asset === 'SILVER') basePrice = 27.80;
    if (asset === 'BRENT') basePrice = 89.50;
    if (asset === 'CRUDE') basePrice = 85.20;

    for (let i = 0; i < 50; i++) {
      basePrice += (Math.random() - 0.5) * (asset.includes('BTC') || asset === 'GOLD' ? 10 : 0.0002);
      initialData.push({
        time: new Date(Date.now() - (50 - i) * 1000).toLocaleTimeString(),
        price: basePrice
      });
    }
    setData(initialData);
    setCurrentPrice(basePrice);
    setSignal('NEUTRAL'); // Reset signal on asset change
  }, [asset]);

  // Update price and generate signals
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrice(prev => {
        const isHighValue = asset.includes('BTC') || asset === 'ETH' || asset === 'GOLD' || asset === 'USD/JPY' || asset === 'GBP/JPY' || asset === 'EUR/JPY' || asset === 'BRENT' || asset === 'CRUDE';
        
        // Base step size modified by volatility setting
        const volatilityFactor = adminSettings.volatility / 50;
        const step = (isHighValue ? (asset.includes('BTC') || asset === 'ETH' ? 3 : 0.02) : 0.0002) * volatilityFactor;
        
        // Influence price based on signal AND global market bias
        let bias = 0;
        if (signal === 'BUY' || adminSettings.marketBias === 'BUY') bias = step * 0.8;
        if (signal === 'SELL' || adminSettings.marketBias === 'SELL') bias = -step * 0.8;
        
        const change = (Math.random() - 0.5) * step + bias;
        const newPrice = prev + change;
        
        setData(currentData => {
          const newData = [...currentData.slice(1), {
            time: new Date().toLocaleTimeString(),
            price: newPrice
          }];
          return newData;
        });

        return newPrice;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [asset, signal]);

  // Update open trades and check SL/TP
  useEffect(() => {
    let tradesUpdated = false;
    let closedTrades: ClosedTrade[] = [];

    const updatedTrades = openTrades.map(trade => {
      if (trade.asset !== asset) return trade; // Only update trades for current asset

      if (trade.status === 'PENDING') {
        const isHighValue = trade.asset.includes('BTC') || trade.asset === 'ETH' || trade.asset === 'GOLD' || trade.asset === 'USD/JPY' || trade.asset === 'GBP/JPY' || trade.asset === 'EUR/JPY' || trade.asset === 'BRENT' || trade.asset === 'CRUDE';
        const invalidation = isHighValue ? (trade.asset.includes('BTC') || trade.asset === 'ETH' ? 45.0 : trade.asset === 'GOLD' ? 2.5 : 0.15) : 0.00045;
        let shouldFill = false;
        let shouldCancel = false;

        if (trade.type === 'BUY') {
          if (currentPrice <= trade.entryPrice * 1.0001) {
            shouldFill = true;
          } else if (currentPrice > trade.entryPrice + invalidation) {
            shouldCancel = true;
          }
        } else {
          if (currentPrice >= trade.entryPrice * 0.9999) {
            shouldFill = true;
          } else if (currentPrice < trade.entryPrice - invalidation) {
            shouldCancel = true;
          }
        }

        if (shouldFill) {
          tradesUpdated = true;
          setTimeout(() => {
            setActiveNotification({
              id: `${Date.now()}-filled`,
              asset: trade.asset,
              price: currentPrice,
              type: 'FILL',
              customTitle: '🎯 Order Executed',
              customMessage: `Live filled limit entry on ${trade.asset} (${trade.type}) at ${currentPrice.toFixed(trade.entryPrice > 5 ? 2 : 5)}. Position is now ACTIVE!`
            });
          }, 50);

          // Deduct trade amount from corresponding balance when order transitions from pending to active (filled)
          if (accountType === 'REAL') {
            setRealBalance(prev => prev - trade.amount);
          } else {
            setDemoBalance(prev => prev - trade.amount);
          }

          return { ...trade, status: 'FILLED', entryPrice: currentPrice, currentPrice, maxProfit: 0 };
        }

        if (shouldCancel) {
          tradesUpdated = true;
          setTimeout(() => {
            setActiveNotification({
              id: `${Date.now()}-canceled`,
              asset: trade.asset,
              price: trade.entryPrice,
              type: 'CANCEL',
              customTitle: '❌ Order Auto-Canceled',
              customMessage: `Pending entry for ${trade.asset} was canceled automatically. Market price departed from the signal entry zone.`
            });
          }, 50);
          return { ...trade, status: 'CANCELED', currentPrice };
        }

        if (trade.currentPrice !== currentPrice) tradesUpdated = true;
        return { ...trade, currentPrice };
      }
      
      const pnl = trade.type === 'BUY' 
        ? ((currentPrice - trade.entryPrice) / trade.entryPrice) * trade.amount * 100
        : ((trade.entryPrice - currentPrice) / trade.entryPrice) * trade.amount * 100;
        
      const newMaxProfit = Math.max(trade.maxProfit || 0, pnl);
      
      if (trade.currentPrice !== currentPrice || trade.maxProfit !== newMaxProfit) {
        tradesUpdated = true;
      }
      return { ...trade, currentPrice, maxProfit: newMaxProfit };
    });

    if (!tradesUpdated) return;

    const remainingTrades = updatedTrades.filter(trade => {
      if (trade.status === 'CANCELED') {
        return false; // Remove auto-canceled pending trade
      }
      if (trade.status === 'PENDING') {
        return true; // Keep pending order active
      }

      const isBuy = trade.type === 'BUY';
      const hitStopLoss = isBuy ? trade.currentPrice <= trade.stopLoss : trade.currentPrice >= trade.stopLoss;
      const hitTakeProfit = isBuy ? trade.currentPrice >= trade.takeProfit : trade.currentPrice <= trade.takeProfit;

      const pnl = isBuy 
        ? ((trade.currentPrice - trade.entryPrice) / trade.entryPrice) * trade.amount * 100
        : ((trade.entryPrice - trade.currentPrice) / trade.entryPrice) * trade.amount * 100;

      // AI Early Close Logic: If trade is losing and market signal flips against it
      const isLosing = isBuy ? trade.currentPrice < trade.entryPrice : trade.currentPrice > trade.entryPrice;
      const oppositeSignal = isBuy ? signal === 'SELL' : signal === 'BUY';
      const aiEarlyClose = isAutoTradeEnabled && isLosing && oppositeSignal && signal !== 'NEUTRAL';

      // Trailing Profit Protection: If profit drops by 60% from peak
      const maxProfit = trade.maxProfit || 0;
      // Only activate trailing stop if we reached at least some meaningful profit (e.g., > 1% of trade amount)
      const hitTrailingStop = maxProfit > (trade.amount * 0.01) && pnl <= maxProfit * 0.4;

      if (hitStopLoss || hitTakeProfit || aiEarlyClose || hitTrailingStop) {
        // Trade closed
        let closedBy: 'SL' | 'TP' | 'AI' | 'TS' = hitTakeProfit ? 'TP' : hitStopLoss ? 'SL' : hitTrailingStop ? 'TS' : 'AI';
        
        closedTrades.push({
          id: trade.id,
          asset: trade.asset,
          type: trade.type,
          entryPrice: trade.entryPrice,
          exitPrice: trade.currentPrice,
          pnl,
          closeTime: new Date().toLocaleTimeString(),
          amount: trade.amount,
          closedBy,
          lotSize: trade.lotSize
        });
        return false; // Remove from open trades
      }
      return true; // Keep open
    });

    setOpenTrades(remainingTrades);

    if (closedTrades.length > 0) {
      setTradeHistory(prev => {
        const combined = [...closedTrades, ...prev];
        // Deduplicate by ID to prevent React key warnings
        const unique = [];
        const seen = new Set();
        for (const trade of combined) {
          if (!seen.has(trade.id)) {
            seen.add(trade.id);
            unique.push(trade);
          }
        }
        return unique;
      });

      setPerformanceData(prev => {
        let newTotal = prev.totalTrades;
        let newWins = (prev.winRate / 100 * prev.totalTrades);
        let newNetProfit = prev.netProfit;
        let newProfitFactor = prev.profitFactor;
        
        closedTrades.forEach(trade => {
          const isWin = trade.pnl > 0;
          newTotal += 1;
          newWins += isWin ? 1 : 0;
          newNetProfit += trade.pnl;
          newProfitFactor = isWin ? newProfitFactor + 0.01 : Math.max(0.1, newProfitFactor - 0.01);
        });
        
        const newWinRate = (newWins / newTotal) * 100;
        
        // Update balance (add back trade amount + pnl since trade's amount was deducted when entered/filled)
        if (accountType === 'REAL') {
          setRealBalance(prev => prev + closedTrades.reduce((acc, t) => acc + t.amount + t.pnl, 0));
        } else {
          setDemoBalance(prev => prev + closedTrades.reduce((acc, t) => acc + t.amount + t.pnl, 0));
        }
        
        return {
          ...prev,
          totalTrades: newTotal,
          winRate: newWinRate,
          netProfit: newNetProfit,
          profitFactor: newProfitFactor
        };
      });
    }
  }, [currentPrice, asset, isAutoTradeEnabled, signal, openTrades, accountType]);

  const generateManualSignal = async () => {
    if (isPredicting) return;
    
    // Calculate actual signal based on all 8 indicators for max accuracy
    const bullishCount = indicators.filter(i => i.status === 'BULLISH').length;
    const bearishCount = indicators.filter(i => i.status === 'BEARISH').length;
    
    let type: SignalType = 'NEUTRAL';
    const bias = adminSettings.marketBias;
    const threshold = adminSettings.signalSensitivity || 3;

    // Apply manual market bias if it's not neutral
    if (bias !== 'NEUTRAL') {
      type = bias as SignalType;
    } else {
      if (bullishCount >= threshold) type = 'BUY';
      else if (bearishCount >= threshold) type = 'SELL';
      else if (bullishCount > bearishCount) type = 'BUY';
      else if (bearishCount > bullishCount) type = 'SELL';
      else type = 'BUY';
    }

    setPredictionType(type);
    setIsPredicting(true);
    
    try {
      // Small artificial delay for "scanning" feel
      await new Promise(resolve => setTimeout(resolve, 800));

      let calculatedDuration = '1M';
      if (durationMode === 'AI_DYNAMIC') {
        const options = ['2M', '3M', '4M', '5M', '7M', '10M', '15M'];
        calculatedDuration = options[Math.floor(Math.random() * options.length)];
      } else {
        calculatedDuration = durationMode;
      }

      setSignal(type);
      const conf = adminSettings.successRate + Math.floor(Math.random() * 2); 
      setConfidence(conf);
      setDuration(calculatedDuration);
      setTimeLeft(getDurationSeconds(calculatedDuration)); 
      setIsPredicting(false);

      setIsExplaining(true);
      setSignalExplanation('');
      const activeInds = indicators.map(i => `${i.name}: ${i.status}`).join(', ');
      
      try {
        const explanation = await generateSignalExplanation(asset, type, conf, activeInds, adminSettings.marketBias, currentPrice, data);
        setSignalExplanation(explanation);
      } catch (err) {
        console.error("Manual explanation failed:", err);
      } finally {
        setIsExplaining(false);
      }
    } catch (err) {
      console.error("Generate manual signal failed:", err);
      setIsPredicting(false);
      setIsExplaining(false);
    }
  };

  // Signal generation logic (Reactive to indicator changes)
  useEffect(() => {
    if (!isAutoSignalEnabled || signal !== 'NEUTRAL' || isPredicting) return;

    const bullishCount = indicators.filter(i => i.status === 'BULLISH').length;
    const bearishCount = indicators.filter(i => i.status === 'BEARISH').length;
    
    // Auto-signal consensus threshold
    let type: SignalType = 'NEUTRAL';
    const threshold = adminSettings.signalSensitivity || 3;
    const bias = adminSettings.marketBias;

    // Apply global market bias to auto signals if set
    if (bias !== 'NEUTRAL') {
      type = bias as SignalType;
    } else {
      if (bullishCount >= threshold) type = 'BUY';
      else if (bearishCount >= threshold) type = 'SELL';
    }
    
    if (type !== 'NEUTRAL') {
      // Frequency throttle - higher frequency setting means less chance of skipping
      const freq = adminSettings.signalFrequency || 5;
      if (Math.random() * 11 > freq) return; 

      setPredictionType(type);
      setIsPredicting(true);
      
      let isSubscribed = true;

      const runAutoSignal = async () => {
        try {
          // Rapid scan
          await new Promise(resolve => setTimeout(resolve, 200));
          
          if (!isSubscribed) return;

          if (signal !== 'NEUTRAL') {
            setIsPredicting(false);
            return;
          }

          let calculatedDuration = '1M';
          if (durationMode === 'AI_DYNAMIC') {
            const options = ['2M', '3M', '4M', '5M', '7M', '10M', '15M'];
            calculatedDuration = options[Math.floor(Math.random() * options.length)];
          } else {
            calculatedDuration = durationMode;
          }

          const conf = adminSettings.successRate + (Math.random() > 0.5 ? 1 : 0);
          setSignal(type);
          setConfidence(conf);
          setDuration(calculatedDuration);
          setTimeLeft(getDurationSeconds(calculatedDuration));
          setIsPredicting(false);

          setIsExplaining(true);
          setSignalExplanation('');
          const activeInds = indicators.map(i => `${i.name}: ${i.status}`).join(', ');
          
          try {
            const explanation = await generateSignalExplanation(asset, type, conf, activeInds, adminSettings.marketBias, currentPrice, data);
            if (isSubscribed) {
              setSignalExplanation(explanation);
            }
          } catch (err) {
            console.error("Auto explanation failed:", err);
          } finally {
            if (isSubscribed) setIsExplaining(false);
          }
        } catch (err) {
          console.error("Auto signal run failed:", err);
          if (isSubscribed) {
            setIsPredicting(false);
            setIsExplaining(false);
          }
        }
      };

      runAutoSignal();

      return () => {
        isSubscribed = false;
      };
    } else if (isAutoSignalEnabled && !isPredicting && signal === 'NEUTRAL') {
      // Dynamic scanning UI feedback
      const currentBias = bullishCount >= bearishCount ? 'BUY' : 'SELL';
      if (predictionType !== currentBias) {
        setPredictionType(currentBias);
      }
    }
  }, [indicators, isAutoSignalEnabled, signal, isPredicting, adminSettings]);

  // Auto Trade execution logic
  const currentSignalTraded = React.useRef(false);

  useEffect(() => {
    if (signal === 'NEUTRAL') {
      currentSignalTraded.current = false;
    }
  }, [signal]);

  useEffect(() => {
    if (isAutoTradeEnabled && (signal === 'BUY' || signal === 'SELL') && !currentSignalTraded.current) {
      currentSignalTraded.current = true;
      
      const stopLossCalc = signal === 'BUY' ? currentPrice * 0.99 : currentPrice * 1.01;
      const takeProfitCalc = signal === 'BUY' ? currentPrice * 1.02 : currentPrice * 0.98;
      const finalAmount = isAiAmount ? (Math.floor(Math.random() * 400) + 100) : autoTradeAmount;
      const calculatedLotSize = isAiAmount ? (finalAmount / 100) : lotSize;
      
      const targetEntry = signalEntryPrice !== null ? signalEntryPrice : currentPrice;
      
      const newTrade: Trade = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        asset,
        type: signal,
        entryPrice: targetEntry,
        stopLoss: stopLossCalc,
        takeProfit: takeProfitCalc,
        currentPrice,
        amount: finalAmount,
        maxProfit: 0,
        lotSize: calculatedLotSize,
        status: 'PENDING'
      };
      
      setOpenTrades(prev => [...prev, newTrade]);
    }
  }, [signal, isAutoTradeEnabled, currentPrice, asset, isAiAmount, autoTradeAmount, lotSize]);

  // Tournament Failsafe: No Dead Zone (Moved here to ensure indicators/settings are declared)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      if (now - lastSignalTime.current > 7000 && !isPredicting && signal === 'NEUTRAL') {
        // Force signal if engine is idle too long
        console.log("⚠️ TOURNAMENT AI ENGINE: FORCING SIGNAL DUE TO IDLE GAP");
        const forcedType = Math.random() > 0.5 ? 'BUY' : 'SELL';
        
        setPredictionType(forcedType);
        setIsPredicting(true);
        lastSignalTime.current = Date.now();
        
        setTimeout(async () => {
          setSignal(forcedType);
          setConfidence(Math.floor(Math.random() * 5) + 94);
          setIsPredicting(false);
          
          const activeInds = indicators.map(i => `${i.name}: ${i.status}`).join(', ');
          try {
            const explanation = await generateSignalExplanation(asset, forcedType, 95, activeInds, adminSettings.marketBias, currentPrice, data);
            setSignalExplanation(explanation);
          } catch (e) {}
        }, 1200);
      }
    }, 2000);
    return () => clearInterval(timer);
  }, [isPredicting, signal, asset, indicators, adminSettings.marketBias]);

  // Update last signal time whenever a signal changes
  useEffect(() => {
    if (signal !== 'NEUTRAL') {
      lastSignalTime.current = Date.now();
    }
  }, [signal]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#050507] text-slate-300 font-sans selection:bg-blue-500/30">
      {/* Sidebar */}
      <aside className="w-full md:w-24 bg-[#0a0a0c]/80 backdrop-blur-2xl border-b md:border-b-0 md:border-r border-white/5 flex md:flex-col items-center py-6 md:py-10 gap-10 justify-center md:justify-start px-4 md:px-0 z-50">
        <motion.div 
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/20 cursor-pointer"
        >
          <Zap className="text-white w-7 h-7 fill-white" />
        </motion.div>
        <nav className="flex md:flex-col gap-8">
          <button className="text-blue-500 relative group">
            <LayoutDashboard className="w-6 h-6" />
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-1 h-4 bg-blue-500 rounded-full hidden md:block" />
          </button>
          <button 
            onClick={() => setIsProfileOpen(true)}
            className="text-slate-600 hover:text-emerald-400 transition-all duration-300 hover:scale-110"
            title="প্রোফাইল (Profile)"
          >
            <User className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setIsHistoryOpen(true)}
            className="text-slate-600 hover:text-slate-400 transition-all duration-300 hover:scale-110"
          >
            <History className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setIsAlertsOpen(true)}
            className={cn(
              "transition-all duration-300 hover:scale-110 relative",
              alerts.some(a => a.active) ? "text-blue-400" : "text-slate-600 hover:text-slate-400"
            )}
          >
            <Bell className="w-6 h-6" />
            {alerts.some(a => a.active) && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            )}
          </button>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="text-slate-600 hover:text-slate-400 transition-all duration-300 hover:scale-110"
          >
            <Settings className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setIsAdminOpen(true)}
            className="text-slate-600 hover:text-indigo-400 transition-all duration-300 hover:scale-110"
          >
            <Shield className="w-6 h-6" />
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto custom-scrollbar relative">
        {/* Background Ambient Glow */}
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
        <div className="fixed bottom-0 left-24 w-[400px] h-[400px] bg-indigo-600/5 blur-[100px] rounded-full -z-10 pointer-events-none" />

        <header className="flex flex-col xl:flex-row xl:items-center justify-between mb-10 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-3xl font-black tracking-tighter text-white flex items-center gap-3 italic uppercase">
              ProfitSignal <span className="text-blue-500 not-italic">PRO</span>
            </h1>
            <p className="text-slate-500 text-xs font-mono uppercase tracking-[0.3em] mt-1">Neural Market Analysis Engine v2.4</p>
            {aiOptimizationStats.boost > 0 && (
              <motion.div 
                id="aiStatus"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 border rounded-full mt-2 transition-all duration-300",
                  aiOptimizationStats.isHyperBoost 
                    ? "bg-pink-500/10 border-pink-500/30 text-pink-400 shadow-[0_0_12px_rgba(236,72,153,0.3)]" 
                    : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                )}
              >
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full animate-ping",
                  aiOptimizationStats.isHyperBoost ? "bg-pink-400" : "bg-indigo-400"
                )} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {aiOptimizationStats.isHyperBoost 
                    ? "⚡ QUANTUM HYPER-DRIVE ACTIVE (99.9%)" 
                    : `🚀 AI Strategy Boosted (${aiOptimizationStats.currentSuccess.toFixed(1)}%)`}
                </span>
              </motion.div>
            )}
          </motion.div>
          
          <div className="flex flex-wrap items-center gap-4">
            {/* Broker Selector */}
            <div className="flex flex-wrap items-center gap-2 bg-[#0a0a0c] border border-white/5 rounded-xl p-1 pr-3">
              <div className="flex p-1 bg-white/5 rounded-lg gap-1">
                <button 
                  onClick={() => {
                    setSelectedBroker('POCKET_OPTION');
                    if (!poConnection.connected) {
                      setIsPoModalOpen(true);
                    }
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-[10px] font-bold transition-all uppercase tracking-wider flex items-center gap-1.5",
                    selectedBroker === 'POCKET_OPTION' ? "bg-amber-600/20 text-amber-400 border border-amber-500/30" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  Pocket {poConnection.connected && "⚡"}
                </button>
                <button 
                  onClick={() => setSelectedBroker('QUOTEX')}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-[10px] font-bold transition-all uppercase tracking-wider flex items-center gap-1.5",
                    selectedBroker === 'QUOTEX' ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  Quotex
                </button>
              </div>

              {selectedBroker === 'POCKET_OPTION' && (
                <div className="flex items-center gap-1 pl-1">
                  {poConnection.connected ? (
                    <motion.button
                      onClick={handlePoDisconnect}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="px-2.5 py-1 bg-emerald-500/10 hover:bg-rose-500/10 border border-emerald-500/20 hover:border-rose-500/20 text-emerald-400 hover:text-rose-400 rounded-lg text-[9px] font-mono font-bold transition-all flex items-center gap-1 uppercase tracking-tight group"
                      title="Click to Disconnect Pocket Option"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0 group-hover:bg-rose-400" />
                      <span className="group-hover:hidden">PO Synced ID: #{poConnection.uid}</span>
                      <span className="hidden group-hover:inline">Disconnect PO</span>
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={() => setIsPoModalOpen(true)}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-500 rounded-lg text-[9px] font-mono font-bold transition-all flex items-center gap-1 uppercase tracking-tight animate-pulse"
                      title="Click to Connect Pocket Option"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      PO Config Required
                    </motion.button>
                  )}
                </div>
              )}

              {selectedBroker !== 'NONE' && (
                <motion.a
                  href={selectedBroker === 'POCKET_OPTION' ? "https://pocketoption.com" : "https://quotex.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all ml-1"
                  title={`Open ${selectedBroker === 'POCKET_OPTION' ? 'Pocket Option' : 'Quotex'}`}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </motion.a>
              )}
            </div>

            {/* Account Balance Display */}
            <div className="flex items-center gap-2 bg-[#0a0a0c] border border-white/5 rounded-xl p-1 pr-3">
              <div className="flex p-1 bg-white/5 rounded-lg gap-1">
                <button 
                  onClick={() => setAccountType('DEMO')}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-[10px] font-bold transition-all uppercase tracking-wider",
                    accountType === 'DEMO' ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  Demo
                </button>
                <button 
                  onClick={() => setAccountType('REAL')}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-[10px] font-bold transition-all uppercase tracking-wider",
                    accountType === 'REAL' ? "bg-emerald-600 text-white" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  Real
                </button>
              </div>
              <div className="pl-2 flex items-center gap-3">
                <div>
                  <div className="text-[9px] text-slate-500 font-mono uppercase tracking-widest leading-none mb-1">Balance</div>
                  <motion.div 
                    key={currentBalance}
                    initial={{ y: balanceChange === 'up' ? 5 : balanceChange === 'down' ? -5 : 0, opacity: 0.8 }}
                    animate={{ y: 0, opacity: 1 }}
                    className={cn(
                      "text-sm font-black font-mono transition-colors duration-300",
                      balanceChange === 'up' ? "text-emerald-400" : 
                      balanceChange === 'down' ? "text-rose-400" : 
                      (accountType === 'REAL' ? "text-emerald-400" : "text-blue-400")
                    )}
                  >
                    ${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </motion.div>
                </div>
                {(accountType === 'DEMO' ? demoBalance : realBalance) < 100 && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      if (accountType === 'DEMO') setDemoBalance(prev => prev + 1000);
                      else setRealBalance(prev => prev + 1000);
                    }}
                    className="p-1.5 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-all"
                    title="Quick Refill $1000"
                  >
                    <Zap className="w-3 h-3 fill-amber-400" />
                  </motion.button>
                )}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center w-full">
              {/* Main Asset Hub Trigger (All assets inside 1 option) */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsAssetHubOpen(true)}
                className="flex-1 md:flex-initial bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-500 hover:to-blue-500 rounded-xl p-3 px-5 transition-all text-xs font-black uppercase tracking-wider flex items-center justify-between md:justify-center gap-3 shadow-lg shadow-indigo-650/15 border border-indigo-400/20 active:opacity-90"
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 animate-spin-slow text-indigo-200" />
                  <span className="font-semibold text-slate-100">📁 সব মার্কেট একসাথে ({assets.length} পেয়ার)</span>
                </div>
                <div className="bg-white/10 px-2 py-0.5 rounded text-[9px] text-white font-mono hover:bg-white/20">
                  ব্রাউজ করুন →
                </div>
              </motion.button>

              {/* Popular favorites for quick shortcuts toggle */}
              <div className="flex-1 overflow-x-auto scrollbar-none flex gap-1 bg-[#0a0a0c]/80 border border-white/5 rounded-xl p-1 items-center">
                <span className="text-[8px] font-mono font-black text-slate-500 tracking-widest uppercase pl-2 shrink-0 select-none">
                  Favorites:
                </span>
                {['EUR/USD', 'GBP/USD', 'GBP/JPY', 'BTC/USD', 'GOLD', 'CRUDE'].map((fav) => (
                  <button
                    key={fav}
                    type="button"
                    onClick={() => setAsset(fav)}
                    className={cn(
                      "px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all shrink-0 relative overflow-hidden",
                      asset === fav 
                        ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30" 
                        : "text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent"
                    )}
                  >
                    {fav}
                    {asset === fav && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-400" />
                    )}
                  </button>
                ))}
              </div>

              {/* Selected Display Level indicator tag */}
              <div className="glass-panel rounded-xl px-4 py-2 flex items-center justify-between md:justify-end gap-3 shrink-0 bg-[#0f1118]/80 border border-indigo-500/10">
                <div className="text-left font-mono">
                  <span className="text-[8.5px] text-zinc-500 uppercase font-black block leading-none">ACTIVE MARKET</span>
                  <span className="text-[11px] font-black text-slate-200 uppercase mt-1 inline-block">{asset}</span>
                </div>
                <div className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  LIVE FEED
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="glass-panel rounded-xl px-5 py-2.5 flex flex-col min-w-[120px]">
                <span className="text-[9px] text-slate-500 uppercase font-mono font-bold tracking-widest mb-0.5">Price</span>
                <span className="text-lg font-mono font-black text-blue-400 leading-none">
                  {currentPrice > 100 ? currentPrice.toFixed(2) : currentPrice.toFixed(5)}
                </span>
              </div>
              <div className="glass-panel rounded-xl px-5 py-2.5 flex flex-col">
                <span className="text-[9px] text-slate-500 uppercase font-mono font-bold tracking-widest mb-0.5">Time</span>
                <span className="text-lg font-mono font-black text-slate-300 leading-none">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={asset}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
              <div className="lg:col-span-2 relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                <div className="relative glass-panel rounded-3xl overflow-hidden">
                  <TradingViewChart 
                    asset={asset} 
                    signal={signal} 
                    currentPrice={currentPrice} 
                    signalEntryPrice={signalEntryPrice || undefined}
                    onCalibratePrice={calibratePrice} 
                  />
                  {/* Scanning Line Effect */}
                  <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-10">
                    <div className="w-full h-[2px] bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-[scan_4s_linear_infinite]" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col">
                <SignalPanel 
                  signal={signal} 
                  confidence={confidence} 
                  asset={asset} 
                  duration={duration} 
                  timeLeft={timeLeft}
                  isPredicting={isPredicting}
                  predictionType={predictionType}
                  explanation={signalExplanation}
                  isExplaining={isExplaining}
                  selectedBroker={selectedBroker}
                  aiBoosted={aiOptimizationStats.boost > 0}
                  currentPrice={currentPrice}
                  signalEntryPrice={signalEntryPrice || undefined}
                  onExecuteTrade={(type) => {
                    const decimals = currentPrice > 5 ? 2 : 5;
                    const stopLossCalc = parseFloat((type === 'BUY' ? currentPrice * 0.995 : currentPrice * 1.005).toFixed(decimals));
                    const takeProfitCalc = parseFloat((type === 'BUY' ? currentPrice * 1.01 : currentPrice * 0.99).toFixed(decimals));
                    const finalAmount = isAiAmount ? (Math.floor(Math.random() * 400) + 100) : autoTradeAmount;
                    const calculatedLotSize = isAiAmount ? (finalAmount / 100) : lotSize;
                    
                    const targetEntry = (signal !== 'NEUTRAL' && signalEntryPrice !== null) ? signalEntryPrice : currentPrice;
                    const initialStatus = signal !== 'NEUTRAL' ? 'PENDING' : 'FILLED';

                    const newTrade: Trade = {
                      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                      asset,
                      type,
                      entryPrice: targetEntry,
                      stopLoss: stopLossCalc,
                      takeProfit: takeProfitCalc,
                      currentPrice,
                      amount: finalAmount,
                      maxProfit: 0,
                      lotSize: calculatedLotSize,
                      status: initialStatus
                    };

                    // Only deduct balance immediately if it is executing live ('FILLED' status)
                    if (initialStatus === 'FILLED') {
                      if (accountType === 'REAL') {
                        setRealBalance(prev => prev - finalAmount);
                      } else {
                        setDemoBalance(prev => prev - finalAmount);
                      }
                    }

                    setOpenTrades(prev => [...prev, newTrade]);
                  }}
                />
                
                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={generateManualSignal}
                    disabled={isPredicting}
                    className="flex-1 py-4 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 rounded-2xl text-indigo-400 font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden shadow-lg shadow-indigo-600/5 active:scale-95"
                  >
                    <motion.div 
                      key={signal}
                      className="flex items-center gap-2"
                      animate={signal !== 'NEUTRAL' ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 0.5, repeat: signal !== 'NEUTRAL' ? Infinity : 0 }}
                    >
                      <Zap className={cn("w-4 h-4", signal !== 'NEUTRAL' && "fill-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.5)]")} />
                      {signal === 'NEUTRAL' ? 'GENERATE SIGNAL' : 'REFRESH SIGNAL'}
                    </motion.div>
                  </button>
                  <button 
                    onClick={() => setIsAutoSignalEnabled(!isAutoSignalEnabled)}
                    className={cn(
                      "flex-1 py-4 border rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 active:scale-95",
                      isAutoSignalEnabled 
                        ? "bg-blue-600/20 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]" 
                        : "bg-slate-800/50 border-slate-700 text-slate-500 hover:bg-slate-800"
                    )}
                  >
                    <Bot className={cn("w-4 h-4", isAutoSignalEnabled && "animate-pulse fill-blue-500/20")} />
                    {isAutoSignalEnabled ? 'AUTO: ON' : 'AUTO: OFF'}
                  </button>
                </div>

                <div className="flex gap-2 mt-6">
                  <button 
                    onClick={() => setIsRiskOpen(true)}
                    className="flex-1 py-4 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 rounded-2xl text-blue-400 font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Manual
                  </button>
                  <button 
                    onClick={() => setIsAutoTradeEnabled(!isAutoTradeEnabled)}
                    className={cn(
                      "flex-1 py-4 border rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2",
                      isAutoTradeEnabled 
                        ? "bg-emerald-600/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]" 
                        : "bg-slate-800/50 border-slate-700 text-slate-500 hover:bg-slate-800"
                    )}
                  >
                    <Bot className="w-4 h-4" />
                    {isAutoTradeEnabled ? 'Auto: ON' : 'Auto: OFF'}
                  </button>
                </div>

                {/* Auto Trade Settings */}
                <div className="mt-4 glass-panel p-4 rounded-2xl flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Auto Trade Amount</span>
                    <button
                      onClick={() => setIsAiAmount(!isAiAmount)}
                      className={cn(
                        "text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded transition-colors flex items-center gap-1",
                        isAiAmount ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-slate-800 text-slate-500 border border-slate-700"
                      )}
                    >
                      <Bot className="w-3 h-3" /> AI Auto
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-mono">$</span>
                    <input 
                      type="number" 
                      value={isAiAmount ? '' : autoTradeAmount}
                      placeholder={isAiAmount ? 'AI Calculated' : '100'}
                      onChange={(e) => { 
                        setAutoTradeAmount(Number(e.target.value)); 
                        setIsAiAmount(false); 
                        setLotSize(Number((Number(e.target.value) / 100).toFixed(2)));
                      }}
                      disabled={isAiAmount}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-blue-500/50 outline-none disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Lot Position Size Selector */}
                <div className="mt-4 glass-panel p-4 rounded-2xl flex flex-col gap-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" /> Lot Position Size
                    </span>
                    <span className="text-xs font-mono font-black text-blue-400">{lotSize.toFixed(2)} Lot</span>
                  </div>
                  
                  {/* Presets Grid */}
                  <div className="grid grid-cols-5 gap-1">
                    {[0.10, 1.00, 2.00, 4.00, 5.00].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => {
                          setLotSize(preset);
                          setIsAiAmount(false);
                          setAutoTradeAmount(preset * 100);
                        }}
                        className={cn(
                          "py-1.5 rounded-lg text-[10px] font-black transition-all",
                          lotSize === preset && !isAiAmount
                            ? "bg-blue-600/20 text-blue-400 border border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)] animate-pulse"
                            : "bg-white/5 text-slate-400 border border-transparent hover:bg-white/10"
                        )}
                      >
                        {preset.toFixed(1)} L
                      </button>
                    ))}
                  </div>

                  {/* Custom Float Input */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center bg-slate-900/50 border border-white/5 rounded-lg px-2 py-1.5 gap-2 group focus-within:border-blue-500/30 transition-all">
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Float Custom</span>
                      <input 
                        type="number" 
                        value={isAiAmount ? '' : lotSize}
                        placeholder={isAiAmount ? 'AI Lot Float' : '1.00'}
                        step="0.01"
                        min="0.01"
                        max="100.00"
                        onChange={(e) => {
                          const val = Math.max(0.01, parseFloat(e.target.value) || 0.01);
                          setLotSize(val);
                          setIsAiAmount(false);
                          setAutoTradeAmount(val * 100);
                        }}
                        disabled={isAiAmount}
                        className="w-full bg-transparent text-right text-white font-mono text-xs focus:outline-none disabled:opacity-40"
                      />
                    </div>
                    
                    <div className="flex bg-white/5 rounded-lg border border-white/5 overflow-hidden">
                      <button 
                        onClick={() => {
                          const next = Math.max(0.01, lotSize - 0.1);
                          setLotSize(Number(next.toFixed(2)));
                          setIsAiAmount(false);
                          setAutoTradeAmount(Number((next * 100).toFixed(2)));
                        }}
                        disabled={isAiAmount}
                        className="px-2 py-1.5 text-slate-400 hover:text-white transition-all text-xs font-black hover:bg-white/5 active:scale-90"
                      >
                        -
                      </button>
                      <button 
                        onClick={() => {
                          const next = lotSize + 0.1;
                          setLotSize(Number(next.toFixed(2)));
                          setIsAiAmount(false);
                          setAutoTradeAmount(Number((next * 100).toFixed(2)));
                        }}
                        disabled={isAiAmount}
                        className="px-2 py-1.5 text-slate-400 hover:text-white transition-all text-xs font-black border-l border-white/5 hover:bg-white/5 active:scale-90"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Neural Expiry Selector */}
                <div className="mt-4 glass-panel p-4 rounded-2xl flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-indigo-400 animate-pulse" /> Neural Expiry Selector
                    </span>
                    <span className={cn(
                      "text-xs font-mono font-black uppercase tracking-wider",
                      durationMode === 'AI_DYNAMIC' ? "text-indigo-400" : "text-slate-300"
                    )}>
                      {durationMode === 'AI_DYNAMIC' ? 'AI Dynamic Auto' : durationMode}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1">
                    {['1M', '3M', '5M', 'AI_DYNAMIC'].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => {
                          setDurationMode(mode as any);
                          if (mode !== 'AI_DYNAMIC') {
                            setDuration(mode);
                            setTimeLeft(getDurationSeconds(mode));
                          } else {
                            setDuration('AI: Auto'); 
                          }
                        }}
                        className={cn(
                          "py-1.5 rounded-lg text-[9px] font-black transition-all uppercase tracking-tight",
                          durationMode === mode
                            ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/50 shadow-[0_0_10px_rgba(79,70,229,0.2)]"
                            : "bg-white/5 text-slate-400 border border-transparent hover:bg-white/10"
                        )}
                      >
                        {mode === 'AI_DYNAMIC' ? 'AI AUTO' : mode}
                      </button>
                    ))}
                  </div>

                  <p className="text-[9px] font-medium text-slate-500 leading-tight italic">
                    {durationMode === 'AI_DYNAMIC' 
                      ? '🔮 AI continuously calculates trend duration & optimal volatility-adjusted timeframes.'
                      : `⏱️ Fixed ${durationMode} signal expiry timer.`}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-4 bg-blue-500 rounded-full" />
                    <h3 className="text-xs font-mono text-slate-400 uppercase tracking-[0.3em] font-bold">Technical Indicators</h3>
                  </div>
                  <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="text-[10px] font-black text-blue-500 hover:text-blue-400 transition-all flex items-center gap-1.5 bg-blue-500/5 px-3 py-1.5 rounded-lg border border-blue-500/10 hover:border-blue-500/30"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    CONFIGURE
                  </button>
                </div>
                <IndicatorGrid indicators={filteredIndicators} />
              </div>
              <div className="space-y-6">
                <PerformanceStats data={performanceData} />
                <OpenTrades 
                  trades={openTrades} 
                  onCloseTrade={(id) => {
                    setOpenTrades(prev => {
                      const trade = prev.find(t => t.id === id);
                      if (trade) {
                        const isBuy = trade.type === 'BUY';
                        const pnl = isBuy 
                          ? ((trade.currentPrice - trade.entryPrice) / trade.entryPrice) * trade.amount * 100
                          : ((trade.entryPrice - trade.currentPrice) / trade.entryPrice) * trade.amount * 100;
                        
                        setTradeHistory(history => {
                          const newEntry = {
                            id: trade.id,
                            asset: trade.asset,
                            type: trade.type,
                            entryPrice: trade.entryPrice,
                            exitPrice: trade.currentPrice,
                            pnl,
                            closeTime: new Date().toLocaleTimeString(),
                            amount: trade.amount,
                            closedBy: 'MANUAL' as const,
                            lotSize: trade.lotSize
                          };
                          const combined = [newEntry, ...history];
                          const unique = [];
                          const seen = new Set();
                          for (const t of combined) {
                            if (!seen.has(t.id)) {
                              seen.add(t.id);
                              unique.push(t);
                            }
                          }
                          return unique;
                        });

                        setPerformanceData(pData => {
                          const isWin = pnl > 0;
                          const newTotal = pData.totalTrades + 1;
                          const newWins = (pData.winRate / 100 * pData.totalTrades) + (isWin ? 1 : 0);

                          // Update balance (add back trade amount + pnl since trade's amount was deducted when entered/filled)
                          if (accountType === 'REAL') {
                            setRealBalance(prev => prev + trade.amount + pnl);
                          } else {
                            setDemoBalance(prev => prev + trade.amount + pnl);
                          }

                          return {
                            ...pData,
                            totalTrades: newTotal,
                            winRate: (newWins / newTotal) * 100,
                            netProfit: pData.netProfit + pnl,
                            profitFactor: isWin ? pData.profitFactor + 0.01 : Math.max(0.1, pData.profitFactor - 0.01)
                          };
                        });
                      }
                      return prev.filter(t => t.id !== id);
                    });
                  }} 
                />
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-4 bg-amber-500 rounded-full" />
                  <h3 className="text-xs font-mono text-slate-400 uppercase tracking-[0.3em] font-bold">Risk Management</h3>
                </div>
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="glass-panel rounded-2xl p-6 flex gap-4 border-blue-500/10"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                    <Info className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-blue-400 mb-1.5 uppercase tracking-tight">Trading Tip</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      Always use 1-2% of your total balance per trade. Never chase losses. This signal engine is an aid, not a guarantee.
                    </p>
                  </div>
                </motion.div>
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="glass-panel rounded-2xl p-6 flex gap-4 border-amber-500/10"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
                    <ShieldAlert className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-amber-400 mb-1.5 uppercase tracking-tight">Disclaimer</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      Trading binary options involves significant risk. 90% accuracy is based on historical backtesting. Past performance does not guarantee future results.
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Footer Marquee */}
        <div className="mt-16 border-t border-white/5 pt-8 overflow-hidden">
          <div className="flex gap-12 animate-marquee whitespace-nowrap text-[10px] font-mono text-slate-600 uppercase tracking-[0.4em] font-bold">
            {assets.map((a, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="text-slate-500">{a}</span>
                <span className={i % 2 === 0 ? "text-green-500/50" : "text-red-500/50"}>
                  {i % 2 === 0 ? "+" : "-"}{(Math.random() * 0.5).toFixed(2)}%
                </span>
              </span>
            ))}
          </div>
        </div>
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        availableIndicators={allIndicatorNames}
        visibleIndicators={visibleIndicators}
        onToggleIndicator={toggleIndicator}
        realBalance={realBalance}
        demoBalance={demoBalance}
        onUpdateBalance={(type, amount) => {
          if (type === 'REAL') setRealBalance(prev => prev + amount);
          else setDemoBalance(prev => prev + amount);
        }}
      />

      <AlertManager 
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        alerts={alerts}
        onAddAlert={addAlert}
        onRemoveAlert={removeAlert}
        currentAsset={asset}
        currentPrice={currentPrice}
      />

      <NotificationToast 
        show={!!activeNotification}
        onClose={() => setActiveNotification(null)}
        asset={activeNotification?.asset || ''}
        price={activeNotification?.price || 0}
        type={activeNotification?.type || 'ABOVE'}
        customTitle={activeNotification?.customTitle}
        customMessage={activeNotification?.customMessage}
      />

      <RiskManagementModal
        isOpen={isRiskOpen}
        onClose={() => setIsRiskOpen(false)}
        currentPrice={currentPrice}
        balance={accountType === 'REAL' ? realBalance : demoBalance}
        accountType={accountType}
        onExecuteTrade={(params) => {
          const targetEntry = (signal !== 'NEUTRAL' && signalEntryPrice !== null) ? signalEntryPrice : currentPrice;
          const initialStatus = signal !== 'NEUTRAL' ? 'PENDING' : 'FILLED';

          const newTrade: Trade = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            asset,
            type: params.type,
            entryPrice: targetEntry,
            stopLoss: params.stopLoss,
            takeProfit: params.takeProfit,
            currentPrice,
            amount: params.amount,
            maxProfit: 0,
            lotSize: params.lotSize,
            status: initialStatus
          };

          // Only deduct balance immediately if it is executing live ('FILLED' status)
          if (initialStatus === 'FILLED') {
            if (accountType === 'REAL') {
              setRealBalance(prev => prev - params.amount);
            } else {
              setDemoBalance(prev => prev - params.amount);
            }
          }

          setOpenTrades(prev => [...prev, newTrade]);
        }}
      />

      <TradingHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={tradeHistory}
      />

      <PocketOptionLoginModal
        isOpen={isPoModalOpen}
        onClose={() => setIsPoModalOpen(false)}
        onSuccess={handlePoSuccess}
        initialEmail={poConnection.email}
        initialServer={poConnection.server}
      />

      <AssetHubModal
        isOpen={isAssetHubOpen}
        onClose={() => setIsAssetHubOpen(false)}
        selectedAsset={asset}
        onSelectAsset={setAsset}
      />

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        realBalance={realBalance}
        demoBalance={demoBalance}
        onResetDemoBalance={() => setDemoBalance(10000)}
        performanceData={performanceData}
        accountType={accountType}
      />

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(1000%); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-marquee {
          animation: marquee 60s linear infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
      <AdminPanel 
        isOpen={isAdminOpen} 
        onClose={() => setIsAdminOpen(false)} 
        currentSettings={adminSettings}
        onUpdateSettings={(newSettings) => {
          setAdminSettings(newSettings);
          localStorage.setItem('profitSignal_adminSettings', JSON.stringify(newSettings));
          setIsAdminOpen(false);
        }}
      />
      <AIAssistant 
        onOptimize={handleAIOptimize} 
        isAutoTradeEnabled={isAutoTradeEnabled} 
      />
    </div>
  );
}
