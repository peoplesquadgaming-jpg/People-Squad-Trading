import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface NotificationToastProps {
  show: boolean;
  onClose: () => void;
  asset: string;
  price: number;
  type: 'ABOVE' | 'BELOW' | 'CANCEL' | 'FILL';
  customTitle?: string;
  customMessage?: string;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  show,
  onClose,
  asset,
  price,
  type,
  customTitle,
  customMessage,
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 20, x: '-50%' }}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm"
        >
          <div className={cn(
            "glass-panel rounded-2xl p-4 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex items-center gap-4 relative overflow-hidden",
            type === 'CANCEL' ? "border-rose-500/30" : type === 'FILL' ? "border-emerald-500/30" : "border-blue-500/30"
          )}>
            <div className={cn(
              "absolute inset-0 pointer-events-none",
              type === 'CANCEL' ? "bg-rose-600/5 animate-pulse" : type === 'FILL' ? "bg-emerald-600/5 animate-pulse" : "bg-blue-600/5 animate-pulse"
            )} />
            
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border",
              type === 'CANCEL' ? "bg-rose-500/10 border-rose-500/30 text-rose-400" :
              type === 'FILL' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
              type === 'ABOVE' ? "bg-green-500/10 border-green-500/30 text-green-500" : "bg-red-500/10 border-red-500/30 text-red-500"
            )}>
              <Bell className="w-6 h-6 animate-bounce" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className="text-sm font-black text-white uppercase tracking-tight">
                  {customTitle || (type === 'CANCEL' ? 'Order Canceled' : type === 'FILL' ? 'Order Executed' : 'Price Alert Triggered')}
                </h4>
                <div className={cn(
                  "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-tighter",
                  type === 'CANCEL' ? "bg-rose-550/20 text-rose-400" : 
                  type === 'FILL' ? "bg-emerald-500/20 text-emerald-400" : 
                  type === 'ABOVE' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                )}>
                  {type}
                </div>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {customMessage || (
                  <>
                    <span className="text-blue-400 font-bold">{asset}</span> reached your target of <span className="text-white font-mono font-bold">{price > 100 ? price.toFixed(2) : price.toFixed(5)}</span>
                  </>
                )}
              </p>
            </div>

            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
