import React, { useEffect, useRef, useMemo } from 'react';
import { createChart, ColorType, LineStyle, CrosshairMode, IChartApi, ISeriesApi, CandlestickData, UTCTimestamp, IPriceLine, CandlestickSeries } from 'lightweight-charts';
import { Trade } from './OpenTrades';

interface TradingViewChartProps {
  asset: string;
  currentPrice: number;
  openTrades?: Trade[];
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({ asset, currentPrice, openTrades = [] }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const priceLinesRef = useRef<{ id: string; line: IPriceLine }[]>([]);

  // Initial data generation
  const initialData = useMemo(() => {
    const data: CandlestickData[] = [];
    let basePrice = currentPrice;
    
    const volatility = asset.includes('BTC') || asset === 'ETH' ? 50 : asset === 'GOLD' ? 2 : 0.001;
    const now = Math.floor(Date.now() / 1000) as UTCTimestamp;

    for (let i = 0; i < 200; i++) {
        const time = (now - (200 - i) * 60) as UTCTimestamp;
        const open = basePrice + (Math.random() - 0.5) * volatility;
        const close = open + (Math.random() - 0.5) * volatility;
        const high = Math.max(open, close) + Math.random() * (volatility / 2);
        const low = Math.min(open, close) - Math.random() * (volatility / 2);
        
        data.push({ time, open, high, low, close });
        basePrice = close;
    }
    return data;
  }, [asset]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const container = chartContainerRef.current;
    
    // Create Chart with dynamic sizing support
    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: '#050507' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.02)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.02)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
            color: '#3b82f6',
            width: 1,
            style: LineStyle.Solid,
            labelBackgroundColor: '#3b82f6',
        },
        horzLine: {
            color: '#3b82f6',
            width: 1,
            style: LineStyle.Solid,
            labelBackgroundColor: '#3b82f6',
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.05)',
        autoScale: true,
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.05)',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: true,
      handleScale: true,
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    if (initialData.length > 0) {
      candleSeries.setData(initialData);
    }
    
    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;

    // Use ResizeObserver for perfect scaling on all devices
    const resizeObserver = new ResizeObserver(entries => {
      if (entries.length === 0 || !entries[0].contentRect) return;
      const { width, height } = entries[0].contentRect;
      chart.applyOptions({ width, height });
      chart.timeScale().fitContent();
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [asset, initialData]);

  // Sync real-time price from the main app's simulation
  useEffect(() => {
    if (!candleSeriesRef.current) return;

    const now = Math.floor(Date.now() / 1000);
    const candleTime = Math.floor(now / 60) * 60; // 1-minute candles

    candleSeriesRef.current.update({
      time: candleTime as UTCTimestamp,
      close: currentPrice,
    } as any);
  }, [currentPrice]);

  useEffect(() => {
    if (!candleSeriesRef.current) return;
    
    // Clean up obsolete lines
    const currentTradeIds = openTrades.filter(t => t.asset === asset).map(t => t.id);
    
    priceLinesRef.current = priceLinesRef.current.filter(entry => {
      if (!currentTradeIds.includes(entry.id)) {
        try {
          candleSeriesRef.current?.removePriceLine(entry.line);
        } catch (e) {
          console.error("Error removing price line", e);
        }
        return false;
      }
      return true;
    });

    // Add new lines
    const existingLineIds = priceLinesRef.current.map(e => e.id);
    openTrades.forEach(trade => {
      if (trade.asset !== asset) return;
      if (!existingLineIds.includes(trade.id)) {
        const isBuy = trade.type === 'BUY';
        const line = candleSeriesRef.current!.createPriceLine({
          price: trade.entryPrice,
          color: isBuy ? '#10b981' : '#ef4444',
          lineWidth: 2,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: `${trade.type} $${trade.amount}`,
        });
        priceLinesRef.current.push({ id: trade.id, line });
      }
    });
  }, [openTrades, asset]);

  return (
    <div className="w-full h-full bg-[#0a0a0c] relative">
      <div ref={chartContainerRef} className="w-full h-full" />
      
      {/* Visual Overlays for that Professional Feel */}
      <div className="absolute top-4 left-4 flex gap-2 z-20 pointer-events-none">
        <div className="bg-[#121216]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5 shadow-2xl flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-200 tracking-widest">{asset}</span>
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">LIVE</span>
          </div>
          <div className="w-px h-3 bg-white/10" />
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
            1M <span className="text-slate-600">|</span> CANDLES
          </div>
        </div>
      </div>

      {/* Decorative Grid Pulse */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_70%)]" />
    </div>
  );
};
