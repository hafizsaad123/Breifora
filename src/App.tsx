import { useState } from 'react';
import Landing from './pages/Landing';
import { useAppSettings } from './context/AppSettingsContext';
import { AlertTriangle, Megaphone, X, RefreshCw } from 'lucide-react';

export default function App() {
  const { settings } = useAppSettings();
  const [bannerClosed, setBannerClosed] = useState(false);

  if (settings.maintenance) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 rounded-2xl bg-[#2516FF]/20 border border-[#2516FF]/30 flex items-center justify-center mb-6 text-[#2516FF]">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          System Maintenance in Progress
        </h1>
        <p className="text-slate-400 max-w-md text-sm sm:text-base leading-relaxed mb-8">
          {settings.maintenance_msg || 'Briefora is undergoing scheduled system upgrades. We will be back online shortly.'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#2516FF] hover:bg-[#2516FF]/90 text-white font-medium text-sm transition-all cursor-pointer shadow-lg shadow-[#2516FF]/20"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 antialiased relative">
      {/* Global Broadcast Banner */}
      {settings.broadcast_active && !bannerClosed && (
        <div className="bg-[#2516FF] text-white text-xs sm:text-sm py-2.5 px-4 font-medium flex items-center justify-between gap-3 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center w-full">
            <Megaphone className="w-4 h-4 shrink-0 animate-bounce" />
            <span>{settings.broadcast_msg || '⚡ Briefora v2.4 Release: Full interactive visual blueprint generator is live!'}</span>
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
