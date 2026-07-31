import { useState, useEffect } from 'react';
import Landing from './pages/Landing';
import { getSystemConfig, ADMIN_SYNC_EVENT } from './lib/adminSync';
import { AlertTriangle, Megaphone, X, RefreshCw } from 'lucide-react';

export default function App() {
  const [config, setConfig] = useState(getSystemConfig);
  const [bannerClosed, setBannerClosed] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setConfig(getSystemConfig());
    };
    window.addEventListener(ADMIN_SYNC_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(ADMIN_SYNC_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  if (config.maintenanceMode) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 rounded-2xl bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center mb-6 text-brand-primary">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          System Maintenance in Progress
        </h1>
        <p className="text-slate-400 max-w-md text-sm sm:text-base leading-relaxed mb-8">
          {config.maintenanceMsg}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-primary hover:bg-brand-primary/90 text-white font-medium text-sm transition-all cursor-pointer shadow-lg shadow-brand-primary/20"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 antialiased selection:bg-[#2516FF]/10 selection:text-[#2516FF] relative">
      {/* Global Broadcast Banner */}
      {config.broadcastActive && !bannerClosed && (
        <div className="bg-[#2516FF] text-white text-xs sm:text-sm py-2.5 px-4 font-medium flex items-center justify-between gap-3 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center w-full">
            <Megaphone className="w-4 h-4 shrink-0 animate-bounce" />
            <span>{config.broadcastMsg}</span>
          </div>
          <button
            onClick={() => setBannerClosed(true)}
            className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer shrink-0"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <Landing />
    </div>
  );
}
