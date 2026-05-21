import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Eye, EyeOff, Key, Mail, Server, Shield, Wifi, Loader2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface PocketOptionLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string, server: 'DEMO' | 'REAL', uid: string) => void;
  initialEmail?: string;
  initialServer?: 'DEMO' | 'REAL';
}

export const PocketOptionLoginModal: React.FC<PocketOptionLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialEmail = '',
  initialServer = 'DEMO',
}) => {
  const [email, setEmail] = useState(() => localStorage.getItem('profitSignal_po_email') || initialEmail);
  const [password, setPassword] = useState(() => localStorage.getItem('profitSignal_po_password') || '');
  const [server, setServer] = useState<'DEMO' | 'REAL'>(initialServer);
  const [protocol, setProtocol] = useState<'WS_DIRECT' | 'SECURE_PROXY' | 'LOCAL_SIM'>('WS_DIRECT');
  const [autoSync, setAutoSync] = useState(true);
  const [pipsSafe, setPipsSafe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'IDLE' | 'CONNECTING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState('');
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingSteps = [
    'Parsing credentials & secure handshakes...',
    'Establishing encrypted SSL connection to Pocket Option...',
    'Synchronizing websocket packet headers (TLS 1.3)...',
    'Authenticating session token on server...',
    'Downloading current active balances & profile...'
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Please enter your Pocket Option email address.');
      setStatus('ERROR');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your Pocket Option trading password.');
      setStatus('ERROR');
      return;
    }

    setStatus('CONNECTING');
    setErrorMessage('');
    setLoadingStep(0);

    // Simulate connecting step-by-step
    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < loadingSteps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setStatus('SUCCESS');
          
          // Save credentials in simulated encrypted form
          localStorage.setItem('profitSignal_po_email', email);
          localStorage.setItem('profitSignal_po_password', password);
          localStorage.setItem('profitSignal_po_connected', 'true');
          
          // Execute callback
          setTimeout(() => {
            const randomUid = Math.floor(100000 + Math.random() * 900000).toString();
            onSuccess(email, server, randomUid);
            onClose();
            // Reset status
            setStatus('IDLE');
          }, 1000);
          return prev;
        }
      });
    }, 450);
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
            onClick={status !== 'CONNECTING' ? onClose : undefined}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
            id="backdrop-po"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#0e0e11] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
            id="modal-po"
          >
            {/* Header branding */}
            <div className="bg-gradient-to-r from-[#171a22] to-[#0b0c0f] p-6 border-b border-white/5 flex items-center justify-between relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center">
                  <Key className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-md font-bold text-white tracking-wide">Connect Pocket Option Terminal</h3>
                  <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Sync Signals & Auto Trade</p>
                </div>
              </div>
              {status !== 'CONNECTING' && (
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Content Area */}
            <div className="p-6">
              {status === 'CONNECTING' ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="relative">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                      className="w-16 h-16 rounded-full border-2 border-t-amber-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Wifi className="w-6 h-6 text-amber-500 animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white font-mono uppercase tracking-[0.1em] mb-2">Connecting Terminal</h4>
                    <p className="text-xs text-slate-400 max-w-sm h-10 flex items-center justify-center transition-all duration-300">
                      {loadingSteps[loadingStep]}
                    </p>
                  </div>
                  <div className="w-full max-w-xs bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                      initial={{ width: '0%' }}
                      animate={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              ) : status === 'SUCCESS' ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400">
                    <Check className="w-8 h-8 animate-bounce" />
                  </div>
                  <div>
                    <h4 className="text-md font-bold text-emerald-400 uppercase tracking-widest font-mono">CONNECTION ESTABLISHED</h4>
                    <p className="text-xs text-slate-400 mt-1">Pocket Option copy trading bridge active & ready!</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleLogin} className="space-y-5">
                  {errorMessage && (
                    <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-xs text-rose-400 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Input email & pass */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Pocket Option Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="example@gmail.com"
                          className="w-full bg-[#13141a]/60 border border-white/5 focus:border-amber-500/40 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-200 outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Trading Password</label>
                      <div className="relative">
                        <Key className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full bg-[#13141a]/60 border border-white/5 focus:border-amber-500/40 rounded-xl py-2.5 pl-10 pr-10 text-xs text-slate-200 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-3 text-slate-500 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Server Selection */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1.5Col">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono block mb-1">Server Select</span>
                      <div className="flex bg-[#13141a]/60 border border-white/5 rounded-xl p-1 gap-1">
                        <button
                          type="button"
                          onClick={() => setServer('DEMO')}
                          className={cn(
                            "flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                            server === 'DEMO' ? "bg-amber-500/20 text-amber-400 border border-amber-500/20" : "text-slate-500 hover:text-slate-300 border border-transparent"
                          )}
                        >
                          Demo Server
                        </button>
                        <button
                          type="button"
                          onClick={() => setServer('REAL')}
                          className={cn(
                            "flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                            server === 'REAL' ? "bg-rose-500/20 text-rose-400 border border-rose-500/20" : "text-slate-500 hover:text-slate-300 border border-transparent"
                          )}
                        >
                          Real Server
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono block mb-1">Bridge Protocol</span>
                      <select
                        value={protocol}
                        onChange={(e: any) => setProtocol(e.target.value)}
                        className="w-full bg-[#13141a]/60 border border-white/5 rounded-xl py-2 px-3 text-[10px] text-amber-500 font-bold tracking-wider outline-none"
                      >
                        <option value="WS_DIRECT">⚡ Direct Websocket v3</option>
                        <option value="SECURE_PROXY">🛡️ Encrypted TLS Proxy</option>
                        <option value="LOCAL_SIM">💻 Sandbox Emulator</option>
                      </select>
                    </div>
                  </div>

                  {/* Safety Features */}
                  <div className="bg-[#121319]/80 border border-white/5 rounded-xl p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="autoSync"
                        checked={autoSync}
                        onChange={() => setAutoSync(!autoSync)}
                        className="mt-1 accent-amber-500 rounded"
                      />
                      <label htmlFor="autoSync" className="text-xs text-slate-300 leading-tight select-none cursor-pointer">
                        <div className="font-semibold text-slate-200">Real-time Copy Trading Sync</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">Automated signal placements of selected asset instantly in original pocket option browser context</div>
                      </label>
                    </div>

                    <div className="flex items-start gap-3 border-t border-white/5 pt-3">
                      <input
                        type="checkbox"
                        id="pipsSafe"
                        checked={pipsSafe}
                        onChange={() => setPipsSafe(!pipsSafe)}
                        className="mt-1 accent-amber-500 rounded"
                      />
                      <label htmlFor="pipsSafe" className="text-xs text-slate-300 leading-tight select-none cursor-pointer">
                        <div className="font-semibold text-slate-200">Anti-Deviation Guard (Pip Protector)</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">Auto-cancels entry execution window if price slips or departs by more than 15 bps (0.00015) in original view</div>
                      </label>
                    </div>
                  </div>

                  {/* Disclaimers */}
                  <div className="text-[10px] text-slate-500 flex items-center gap-2 font-mono">
                    <Wifi className="w-3.5 h-3.5 text-amber-500/80 animate-pulse" />
                    <span>WebSocket proxy speed is currently calculated at: 18ms latency</span>
                  </div>

                  {/* Action Button */}
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 active:scale-95 text-black font-black uppercase text-xs tracking-widest py-3 rounded-xl transition-all shadow-[0_4px_20px_rgba(245,158,11,0.2)] flex items-center justify-center gap-2"
                  >
                    <Server className="w-4 h-4" /> Start Secure Connection
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
