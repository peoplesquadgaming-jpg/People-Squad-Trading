import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DataPoint {
  time: string;
  price: number;
}

interface TradingChartProps {
  data: DataPoint[];
}

export const TradingChart: React.FC<TradingChartProps> = ({ data }) => {
  const minPrice = useMemo(() => Math.min(...data.map(d => d.price)) * 0.9999, [data]);
  const maxPrice = useMemo(() => Math.max(...data.map(d => d.price)) * 1.0001, [data]);

  return (
    <div className="w-full h-[400px] p-6">
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-1 h-4 bg-blue-500 rounded-full" />
          <h3 className="text-xs font-mono text-slate-400 uppercase tracking-[0.3em] font-bold">Live Market Analysis</h3>
        </div>
        <div className="flex items-center gap-3 bg-blue-500/5 px-3 py-1.5 rounded-lg border border-blue-500/10">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
          <span className="text-[10px] text-slate-400 font-mono font-bold tracking-widest">LIVE FEED</span>
        </div>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis 
              dataKey="time" 
              hide 
            />
            <YAxis 
              domain={[minPrice, maxPrice]} 
              orientation="right" 
              tick={{ fill: '#475569', fontSize: 10, fontFamily: 'JetBrains Mono', fontWeight: 700 }}
              tickFormatter={(val) => val > 100 ? val.toFixed(2) : val.toFixed(5)}
              axisLine={false}
              tickLine={false}
              width={70}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#121216', 
                border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '12px', 
                fontSize: '11px',
                fontFamily: 'JetBrains Mono',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(10px)'
              }}
              itemStyle={{ color: '#3b82f6', fontWeight: 800 }}
              labelStyle={{ display: 'none' }}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="#3b82f6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorPrice)" 
              isAnimationActive={true}
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
