import React, { useState, useEffect, useMemo } from 'react';
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
import { DealPanel } from './components/DealPanel';
import { ShieldAlert, Info, History, Settings, LayoutDashboard, Zap, Bell, Bot, ExternalLink, Globe, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { generateSignalExplanation } from './services/geminiService';

interface DataPoint {
  time: string;
  price: number;
}

export default function App() {
  const [data, setData] = useState<DataPoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState(1.08450);
  const [signal, setSignal] = useState<SignalType>('NEUTRAL');
  const [confidence, setConfidence] = useState(0);
  const [duration, setDuration] = useState('1M');
  const [timeLeft, setTimeLeft] = useState(60);
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
  const [autoTradeDailyLossLimit, setAutoTradeDailyLossLimit] = useState(() => {
    return Number(localStorage.getItem('profitSignal_autoTradeDailyLossLimit')) || 500;
  });
  const [autoTradeProfitTarget, setAutoTradeProfitTarget] = useState(() => {
    return Number(localStorage.getItem('profitSignal_autoTradeProfitTarget')) || 1000;
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

  const [tradeAmount, setTradeAmount] = useState(100);

  const currentBalance = accountType === 'REAL' ? realBalance : demoBalance;

  const [autoTradeAssets, setAutoTradeAssets] = useState<string[]>(() => {
    const saved = localStorage.getItem('profitSignal_autoTradeAssets');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return ['EUR/USD', 'GBP/USD', 'BTC/USD']; // Default enabled assets
  });

  useEffect(() => {
    localStorage.setItem('profitSignal_autoTradeAssets', JSON.stringify(autoTradeAssets));
  }, [autoTradeAssets]);

  const toggleAutoTradeAsset = (assetName: string) => {
    setAutoTradeAssets(prev => 
      prev.includes(assetName) ? prev.filter(a => a !== assetName) : [...prev, assetName]
    );
  };

  const handleManualTrade = (type: 'BUY' | 'SELL') => {
    const newTrade: Trade = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      asset,
      type,
      entryPrice: currentPrice,
      stopLoss: type === 'BUY' ? currentPrice * 0.99 : currentPrice * 1.01,
      takeProfit: type === 'BUY' ? currentPrice * 1.02 : currentPrice * 0.98,
      currentPrice,
      amount: tradeAmount,
      maxProfit: 0
    };
    setOpenTrades(prev => [newTrade, ...prev]);

    // Also trigger AI signal analysis for feedback if not active
    if (signal === 'NEUTRAL' && !isPredicting) {
      generateManualSignal();
    }
  };

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

  const [isAutoSignalEnabled, setIsAutoSignalEnabled] = useState(() => {
    return localStorage.getItem('profitSignal_autoSignal') !== 'false';
  });
  const [autoSignalThreshold, setAutoSignalThreshold] = useState(() => {
    return Number(localStorage.getItem('profitSignal_autoSignalThreshold')) || 95;
  });
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [activeNotification, setActiveNotification] = useState<PriceAlert | null>(null);
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
      winRate: 94.2,
      profitFactor: 3.82,
      totalTrades: 1245,
      averageDuration: '5m 12s',
      netProfit: 45245.50
    };
  });

  const allIndicatorNames = ['RSI (14)', 'MACD', 'MA (20)', 'MA (50)', 'SMA Cross', 'Stochastic', 'Bollinger', 'AO', 'SRSI'];

  const assets = [
    'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'EUR/GBP', 'NZD/USD', 'USD/CHF', 'GBP/JPY', 'EUR/JPY',
    'BTC/USD', 'ETH/USD', 'LTC/USD', 'XRP/USD',
    'GOLD', 'SILVER', 'BRENT', 'CRUDE'
  ];

  // Save preferences to local storage
  useEffect(() => {
    localStorage.setItem('profitSignal_asset', asset);
  }, [asset]);

  useEffect(() => {
    localStorage.setItem('profitSignal_autoSignalThreshold', String(autoSignalThreshold));
  }, [autoSignalThreshold]);

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
    localStorage.setItem('profitSignal_autoTradeDailyLossLimit', String(autoTradeDailyLossLimit));
  }, [autoTradeDailyLossLimit]);

  useEffect(() => {
    localStorage.setItem('profitSignal_autoTradeProfitTarget', String(autoTradeProfitTarget));
  }, [autoTradeProfitTarget]);

  useEffect(() => {
    localStorage.setItem('profitSignal_realBalance', String(realBalance));
  }, [realBalance]);

  useEffect(() => {
    localStorage.setItem('profitSignal_demoBalance', String(demoBalance));
  }, [demoBalance]);

  useEffect(() => {
    localStorage.setItem('profitSignal_selectedBroker', selectedBroker);
  }, [selectedBroker]);

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
    const rsiStatus = rsi > 70 ? 'BEARISH' : rsi < 30 ? 'BULLISH' : 'NEUTRAL';

    // MACD (12, 26)
    const ma12 = prices.slice(-12).reduce((a, b) => a + b, 0) / 12;
    const ma26 = prices.slice(-26).reduce((a, b) => a + b, 0) / 26;
    const macd = ma12 - ma26;
    const macdStatus = macd > 0 ? 'BULLISH' : 'BEARISH';

    // Stochastic (14)
    const period14 = prices.slice(-14);
    const low14 = Math.min(...period14);
    const high14 = Math.max(...period14);
    const stochastic = ((lastPrice - low14) / (high14 - low14)) * 100;
    const stochasticStatus = stochastic > 80 ? 'BEARISH' : stochastic < 20 ? 'BULLISH' : 'NEUTRAL';

    // Bollinger Bands (20)
    const ma20 = prices.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const variance = prices.slice(-20).reduce((acc, val) => acc + Math.pow(val - ma20, 2), 0) / 20;
    const stdDev = Math.sqrt(variance);
    const upperBB = ma20 + 2 * stdDev;
    const lowerBB = ma20 - 2 * stdDev;
    const bbStatus = lastPrice > upperBB ? 'BEARISH' : lastPrice < lowerBB ? 'BULLISH' : 'NEUTRAL';

    // MA 50
    const ma50 = prices.slice(-50).reduce((a, b) => a + b, 0) / 50;
    
    // SMA Crossover (short=9, long=21)
    const sma9 = prices.slice(-9).reduce((a, b) => a + b, 0) / 9;
    const sma21 = prices.slice(-21).reduce((a, b) => a + b, 0) / 21;
    const prevSma9 = prices.slice(-10, -1).reduce((a, b) => a + b, 0) / 9;
    const prevSma21 = prices.slice(-22, -1).reduce((a, b) => a + b, 0) / 21;
    
    let smaStatus: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
    if (prevSma9 <= prevSma21 && sma9 > sma21) smaStatus = 'BULLISH';
    else if (prevSma9 >= prevSma21 && sma9 < sma21) smaStatus = 'BEARISH';
    else smaStatus = sma9 > sma21 ? 'BULLISH' : 'BEARISH';

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
        status: lastPrice > ma20 ? 'BULLISH' : 'BEARISH',
        description: '20-period Moving Average. Smooths out price action to identify the short-term trend direction.'
      },
      { 
        name: 'MA (50)', 
        value: ma50.toFixed(currentPrice > 100 ? 2 : 5), 
        status: lastPrice > ma50 ? 'BULLISH' : 'BEARISH',
        description: '50-period Moving Average. A widely used indicator to identify the medium-term trend and potential support/resistance levels.'
      },
      {
        name: 'SMA Cross',
        value: `${sma9.toFixed(2)} / ${sma21.toFixed(2)}`,
        status: smaStatus,
        description: 'Simple Moving Average Crossover (9/21). Bullish when the fast MA crosses above the slow MA.'
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
        status: macd > 0 ? 'BULLISH' : 'BEARISH',
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

  const displayedIndicators = useMemo(() => {
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
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [signal]);

  // Handle asset change
  useEffect(() => {
    const initialData: DataPoint[] = [];
    let basePrice = asset.includes('USD') ? 1.08450 : asset === 'GOLD' ? 2350.40 : 65000.00;
    
    // Add some variation based on asset
    if (asset === 'GBP/USD') basePrice = 1.26500;
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
        const step = isHighValue ? (asset.includes('BTC') || asset === 'ETH' ? 2 : 0.01) : 0.0001;
        
        // Influence price based on signal to make it feel predictive
        let bias = 0;
        if (signal === 'BUY') bias = step * 0.7;
        if (signal === 'SELL') bias = -step * 0.7;
        
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
          timestamp: Date.now(),
          amount: trade.amount,
          closedBy
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
        
        // Update balance
        if (accountType === 'REAL') {
          setRealBalance(prev => prev + closedTrades.reduce((acc, t) => acc + t.pnl, 0));
        } else {
          setDemoBalance(prev => prev + closedTrades.reduce((acc, t) => acc + t.pnl, 0));
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
  }, [currentPrice, asset, isAutoTradeEnabled, signal, openTrades]);

  // Check Daily Profit/Loss limits to stop auto-trading
  useEffect(() => {
    if (!isAutoTradeEnabled) return;

    const today = new Date().toLocaleDateString();
    const todaysTrades = tradeHistory.filter(t => {
      if (!t.timestamp) return false;
      return new Date(t.timestamp).toLocaleDateString() === today;
    });

    const dailyPnL = todaysTrades.reduce((acc, t) => acc + t.pnl, 0);

    if (dailyPnL <= -autoTradeDailyLossLimit) {
      setIsAutoTradeEnabled(false);
      // Optional: Add notification here
    } else if (dailyPnL >= autoTradeProfitTarget) {
      setIsAutoTradeEnabled(false);
      // Optional: Add notification here
    }
  }, [tradeHistory, isAutoTradeEnabled, autoTradeDailyLossLimit, autoTradeProfitTarget]);

  const generateManualSignal = () => {
    if (signal !== 'NEUTRAL' || isPredicting) return;
    
    // Weighted Signal Engine for >93% Accuracy Goal
    let totalScore = 0;
    indicators.forEach(ind => {
      if (ind.status === 'BULLISH') totalScore += 1;
      if (ind.status === 'BEARISH') totalScore -= 1;
      
      // Bonus for high-conviction states
      if (ind.name === 'RSI (14)') {
        const rsiVal = parseFloat(ind.value);
        if (rsiVal < 25) totalScore += 2;
        if (rsiVal > 75) totalScore -= 2;
      }
      if (ind.name === 'SMA Cross') {
        totalScore += ind.status === 'BULLISH' ? 2 : -2;
      }
    });
    
    let type: SignalType = 'NEUTRAL';
    if (totalScore >= 3) type = 'BUY';
    else if (totalScore <= -3) type = 'SELL';
    else type = Math.random() > 0.5 ? 'BUY' : 'SELL'; // Fallback

    const calculatedConfidence = Math.min(99, 88 + Math.abs(totalScore) * 1.5 + (Math.random() * 2));

    setPredictionType(type);
    setIsPredicting(true);
    
    setTimeout(() => {
      setSignal(type);
      setConfidence(Math.floor(calculatedConfidence));
      setTimeLeft(60);
      setIsPredicting(false);

      setIsExplaining(true);
      setSignalExplanation('');
      const activeInds = indicators.map(i => `${i.name}: ${i.status}`).join(', ');
      generateSignalExplanation(asset, type, Math.floor(calculatedConfidence), activeInds).then(explanation => {
        setSignalExplanation(explanation);
        setIsExplaining(false);
      });
    }, 2000);
  };

  // Signal generation logic (Advanced Weighted Engine)
  useEffect(() => {
    if (!isAutoSignalEnabled) return;

    const signalInterval = setInterval(() => {
      if (signal !== 'NEUTRAL' || isPredicting) return;

      // Weighted Signal Engine
      let totalScore = 0;
      indicators.forEach(ind => {
        if (ind.status === 'BULLISH') totalScore += 1.25;
        if (ind.status === 'BEARISH') totalScore -= 1.25;
        
        if (ind.name === 'SMA Cross') {
          totalScore += ind.status === 'BULLISH' ? 2.5 : -2.5;
        }
      });
      
      let type: SignalType = 'NEUTRAL';
      
      // Strict threshold for high historical accuracy simulation
      if (totalScore >= 5.5) type = 'BUY';
      else if (totalScore <= -5.5) type = 'SELL';
      
      // Random "AI pattern" fallback for user engagement (reduced frequency, higher quality)
      if (type === 'NEUTRAL' && Math.random() > 0.95) {
        type = Math.random() > 0.5 ? 'BUY' : 'SELL';
      }
      
      if (type !== 'NEUTRAL') {
        let calculatedConfidence = Math.min(99, 90 + Math.abs(totalScore) * 1.2);
        
        // If it was a neutral fallback, fake a high confidence to simulate finding a hidden pattern
        if (Math.abs(totalScore) < 5.5) {
           calculatedConfidence = 90 + Math.random() * 5;
        }

        // Only emit auto signal if confidence meets or exceeds the threshold
        if (calculatedConfidence >= autoSignalThreshold) {
          setPredictionType(type);
          setIsPredicting(true);
          
          setTimeout(() => {
            setSignal(type);
            setConfidence(Math.floor(calculatedConfidence));
            setTimeLeft(60);
            setIsPredicting(false);

            setIsExplaining(true);
            setSignalExplanation('');
            const activeInds = indicators.map(i => `${i.name}: ${i.status}`).join(', ');
            generateSignalExplanation(asset, type, Math.floor(calculatedConfidence), activeInds).then(explanation => {
              setSignalExplanation(explanation);
              setIsExplaining(false);
            });
          }, 2200);
        }
      }
    }, 3000);

    return () => clearInterval(signalInterval);
  }, [signal, isPredicting, asset, indicators, isAutoSignalEnabled, autoSignalThreshold]);

  // Auto Trade execution logic
  const currentSignalTraded = React.useRef(false);

  useEffect(() => {
    if (signal === 'NEUTRAL') {
      currentSignalTraded.current = false;
    }
  }, [signal]);

  useEffect(() => {
    const isAssetAutoTradeEnabled = autoTradeAssets.includes(asset);
    if (isAutoTradeEnabled && isAssetAutoTradeEnabled && (signal === 'BUY' || signal === 'SELL') && !currentSignalTraded.current) {
      currentSignalTraded.current = true;
      
      const stopLossCalc = signal === 'BUY' ? currentPrice * 0.99 : currentPrice * 1.01;
      const takeProfitCalc = signal === 'BUY' ? currentPrice * 1.02 : currentPrice * 0.98;
      const finalAmount = isAiAmount ? (Math.floor(Math.random() * 400) + 100) : autoTradeAmount;
      
      const newTrade: Trade = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        asset,
        type: signal,
        entryPrice: currentPrice,
        stopLoss: stopLossCalc,
        takeProfit: takeProfitCalc,
        currentPrice,
        amount: finalAmount,
        maxProfit: 0
      };
      
      setOpenTrades(prev => [...prev, newTrade]);
    }
  }, [signal, isAutoTradeEnabled, autoTradeAssets, currentPrice, asset, isAiAmount, autoTradeAmount]);

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
          <button className="text-blue-500 relative group transition-all duration-300">
            <LayoutDashboard className="w-6 h-6 shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
            <motion.div 
              layoutId="active-nav"
              className="absolute -right-4 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)] hidden md:block" 
            />
          </button>
          
          {/* Indicators Toggle */}
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="text-slate-600 hover:text-blue-400 transition-all duration-300 hover:scale-110 active:scale-95 group relative"
            title="Settings & Indicators"
          >
            <Settings className="w-6 h-6 group-hover:rotate-45 transition-transform duration-500" />
          </button>

          {/* Auto Signal Toggle */}
          <button 
            onClick={() => setIsAutoSignalEnabled(!isAutoSignalEnabled)}
            className={cn(
              "transition-all duration-300 hover:scale-120 relative group",
              isAutoSignalEnabled ? "text-indigo-400" : "text-slate-600 hover:text-slate-400"
            )}
            title="AI Auto Signal"
          >
            <Bot className={cn("w-6 h-6 transition-all", isAutoSignalEnabled && "drop-shadow-[0_0_8px_rgba(129,140,248,0.6)]")} />
            {isAutoSignalEnabled ? (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(129,140,248,1)] animate-pulse" />
            ) : (
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-slate-800 rounded-full group-hover:bg-slate-700 transition-colors" />
            )}
          </button>

          {/* Auto Trade Toggle */}
          <button 
            onClick={() => setIsAutoTradeEnabled(!isAutoTradeEnabled)}
            className={cn(
              "transition-all duration-300 hover:scale-120 relative group",
              isAutoTradeEnabled ? "text-emerald-400" : "text-slate-600 hover:text-slate-400"
            )}
            title="AI Auto Trading"
          >
            <Zap className={cn("w-6 h-6 transition-all", isAutoTradeEnabled && "fill-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]")} />
            {isAutoTradeEnabled ? (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(52,211,153,1)] animate-pulse" />
            ) : (
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-slate-800 rounded-full group-hover:bg-slate-700 transition-colors" />
            )}
          </button>

          <button 
            onClick={() => setIsHistoryOpen(true)}
            className="text-slate-600 hover:text-slate-300 transition-all duration-300 hover:scale-110 active:scale-95"
            title="Trading History"
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
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 md:overflow-hidden relative">
        {/* Top Header Bar */}
        <header className="h-16 bg-[#0a0a0c] border-b border-white/5 flex items-center justify-between px-4 md:px-6 z-40 shrink-0">
          <div className="flex items-center gap-3 md:gap-6">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20 shrink-0">
                <Zap className="text-white w-5 h-5 fill-white" />
              </div>
              <h1 className="text-xl font-black tracking-tighter text-white italic uppercase hidden lg:block">
                People Squad <span className="text-blue-500 not-italic">Trading</span>
              </h1>
            </motion.div>

            {/* Asset Quick Switcher - Horizontal Scroll */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-[140px] xs:max-w-[200px] md:max-w-md lg:max-w-xl">
              {assets.map((a) => (
                <button
                  key={a}
                  onClick={() => setAsset(a)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-black transition-all uppercase tracking-tighter whitespace-nowrap",
                    asset === a 
                      ? "bg-white/10 text-white" 
                      : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Account Selector & Balance */}
            <div className="flex items-center gap-1 md:gap-2 bg-white/5 border border-white/5 rounded-xl p-0.5 md:p-1 pr-2 md:pr-3">
               <div className="flex p-0.5 bg-black/40 rounded-lg shrink-0">
                <button 
                  onClick={() => setAccountType('DEMO')}
                  className={cn(
                    "px-1.5 md:px-3 py-1 rounded-md text-[8px] md:text-[9px] font-bold transition-all uppercase tracking-wider",
                    accountType === 'DEMO' ? "bg-[#3b82f6] text-white" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  <span className="hidden xs:inline">Demo</span>
                  <span className="xs:hidden">D</span>
                </button>
                <button 
                  onClick={() => setAccountType('REAL')}
                  className={cn(
                    "px-1.5 md:px-3 py-1 rounded-md text-[8px] md:text-[9px] font-bold transition-all uppercase tracking-wider",
                    accountType === 'REAL' ? "bg-[#10b981] text-white" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  <span className="hidden xs:inline">Real</span>
                  <span className="xs:hidden">R</span>
                </button>
              </div>
              <div className="pl-1 md:pl-2">
                <motion.div 
                  key={currentBalance}
                  className={cn(
                    "text-[10px] md:text-xs font-black font-mono whitespace-nowrap",
                    accountType === 'REAL' ? "text-emerald-400" : "text-blue-400"
                  )}
                >
                  ${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                </motion.div>
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer transition-colors shrink-0">
              <User className="w-4 h-4" />
            </div>
          </div>
        </header>

        {/* Main Trading Interface (Split Screen) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-x-hidden custom-scrollbar md:no-scrollbar relative">
          {/* Left Side: Chart Section */}
          <div className="flex-1 relative flex flex-col bg-[#050507] min-h-[500px] md:min-h-0 border-r border-white/5">
            {/* Broker & Tools Toolbar */}
            <div className="h-12 bg-white/[0.02] border-b border-white/5 flex items-center justify-between px-3 md:px-6 shrink-0 z-10">
              <div className="flex items-center gap-2 md:gap-4">
                 <div className="flex items-center gap-2">
                   <Globe className="w-3.5 h-3.5 text-slate-500 hidden xs:block" />
                   <span className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate max-w-[80px] xs:max-w-none">
                     {selectedBroker === 'NONE' ? 'Global Market' : selectedBroker === 'POCKET_OPTION' ? 'People Squad Trading' : selectedBroker}
                   </span>
                 </div>
                 <div className="w-px h-4 bg-white/5 hidden xs:block" />
                 <div className="flex items-center gap-2 md:gap-3">
                   <button className="text-slate-500 hover:text-blue-400 transition-colors"><LayoutDashboard className="w-3.5 h-3.5 md:w-4 h-4" /></button>
                   <button className="text-slate-500 hover:text-blue-400 transition-colors"><Zap className="w-3.5 h-3.5 md:w-4 h-4" /></button>
                 </div>
              </div>
              
              <div className="flex items-center gap-3 md:gap-6">
                <div className="flex flex-col items-end">
                  <span className="text-[8px] md:text-[9px] text-slate-600 font-bold uppercase tracking-widest leading-none mb-0.5">Price</span>
                  <span className="text-[10px] md:text-xs font-mono font-black text-blue-400 leading-none">
                    {currentPrice > 100 ? currentPrice.toFixed(2) : currentPrice.toFixed(5)}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[8px] md:text-[9px] text-slate-600 font-bold uppercase tracking-widest leading-none mb-0.5">Time</span>
                  <span className="text-[10px] md:text-xs font-mono font-black text-slate-400 leading-none">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 relative overflow-hidden">
               <TradingViewChart asset={asset} currentPrice={currentPrice} openTrades={openTrades} />
               
               {/* Scanning Effect Overlay */}
               <div className="absolute inset-0 pointer-events-none opacity-5 overflow-hidden z-20">
                 <div className="w-full h-1 bg-blue-500 shadow-[0_0_20px_blue] animate-[scan_6s_linear_infinite]" />
               </div>
            </div>
            
            {/* Bottom Meta Info Bar */}
            <div className="h-10 border-t border-white/5 flex items-center justify-between px-4 md:px-6 bg-[#0a0a0c] shrink-0">
               <div className="flex items-center gap-3 md:gap-4">
                 <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[8px] md:text-[9px] text-slate-500 font-bold uppercase tracking-widest">Market Open</span>
                 </div>
                 <span className="text-[8px] md:text-[9px] text-slate-600 font-mono tracking-tighter">VOL: ${(526210).toLocaleString()}</span>
               </div>
               <div className="flex items-center gap-2 md:gap-4 text-[8px] md:text-[9px] text-slate-600 font-bold">
                 <span className="hidden xs:inline">NEURAL LINK ACTIVE</span>
                 <Bot className="w-3 h-3 text-blue-500" />
               </div>
            </div>

            {/* Indicators and Open Trades Overlay (Mobile Only) */}
            <div className="md:hidden flex flex-col gap-4 p-4 bg-[#050507]">
               <IndicatorGrid indicators={indicators.filter(i => visibleIndicators.includes(i.name))} />
               <OpenTrades trades={openTrades} onCloseTrade={(id) => {
                  setOpenTrades(prev => prev.filter(t => t.id !== id));
               }} />
            </div>
          </div>

          {/* Right Side: Deal Panel (People Squad style) */}
          <aside className="w-full md:w-80 shrink-0 z-10 border-t md:border-t-0 md:border-l border-white/5 flex flex-col md:overflow-hidden bg-[#0a0a0c]">
            <div className="flex-1 md:overflow-y-auto custom-scrollbar">
              <DealPanel 
                asset={asset}
                amount={tradeAmount}
                onAmountChange={setTradeAmount}
                duration={duration}
                onDurationChange={setDuration}
                balance={currentBalance}
                signal={signal}
                confidence={confidence}
                explanation={signalExplanation}
                isExplaining={isExplaining}
                onTrade={handleManualTrade}
                onGenerateSignal={generateManualSignal}
                isPredicting={isPredicting}
                isAutoSignalEnabled={isAutoSignalEnabled}
                onToggleAutoSignal={() => setIsAutoSignalEnabled(!isAutoSignalEnabled)}
              />
            </div>

            {/* Desktop Indicators Grid */}
            <div className="hidden md:block p-4 border-t border-white/5 bg-black/20 overflow-y-auto custom-scrollbar h-[300px]">
              <div className="flex items-center gap-2 mb-4">
                <LayoutDashboard className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Market Stats</span>
              </div>
              <IndicatorGrid indicators={indicators.filter(i => visibleIndicators.includes(i.name))} />
            </div>
          </aside>

          {/* Desktop Open Trades (Floating) */}
          <div className="hidden md:block absolute bottom-12 right-[340px] z-50 pointer-events-none">
             <div className="pointer-events-auto">
               <OpenTrades trades={openTrades} onCloseTrade={(id) => {
                  setOpenTrades(prev => prev.filter(t => t.id !== id));
               }} />
             </div>
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
        autoTradeAssets={autoTradeAssets}
        onToggleAutoTradeAsset={toggleAutoTradeAsset}
        dailyLossLimit={autoTradeDailyLossLimit}
        profitTarget={autoTradeProfitTarget}
        onUpdateDailyLossLimit={setAutoTradeDailyLossLimit}
        onUpdateProfitTarget={setAutoTradeProfitTarget}
        autoSignalThreshold={autoSignalThreshold}
        onUpdateAutoSignalThreshold={setAutoSignalThreshold}
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
      />

      <RiskManagementModal
        isOpen={isRiskOpen}
        onClose={() => setIsRiskOpen(false)}
        currentPrice={currentPrice}
        balance={accountType === 'REAL' ? realBalance : demoBalance}
        accountType={accountType}
        onExecuteTrade={(params) => {
          const newTrade: Trade = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            asset,
            type: params.type,
            entryPrice: currentPrice,
            stopLoss: params.stopLoss,
            takeProfit: params.takeProfit,
            currentPrice,
            amount: params.amount,
            maxProfit: 0
          };
          setOpenTrades(prev => [...prev, newTrade]);
        }}
      />

      <TradingHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={tradeHistory}
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
    </div>
  );
}
