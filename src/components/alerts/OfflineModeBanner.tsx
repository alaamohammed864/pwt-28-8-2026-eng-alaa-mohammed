import React from 'react';

interface OfflineModeBannerProps {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  cachedPermitsCount: number;
  lastSyncTime: string | null;
  onOpenDiagnostics: () => void;
  onDisableSimulation?: () => void;
}

export const OfflineModeBanner: React.FC<OfflineModeBannerProps> = ({
  isOnline,
  isSimulatedOffline,
  cachedPermitsCount,
  lastSyncTime,
  onOpenDiagnostics,
  onDisableSimulation,
}) => {
  if (isOnline && !isSimulatedOffline) {
    return null;
  }

  const syncFormatted = lastSyncTime
    ? new Date(lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Local Cache';

  return (
    <div className="bg-gradient-to-r from-amber-950/90 via-amber-900/80 to-amber-950/90 border-b border-amber-500/40 text-amber-200 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 shadow-lg backdrop-blur-md sticky top-[53px] z-20">
      <div className="flex items-center gap-2.5">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.8)] shrink-0"></span>
        <span className="material-symbols-outlined text-base text-amber-300">wifi_off</span>
        <div>
          <span className="font-bold text-amber-100">
            {isSimulatedOffline ? 'Simulated Offline Field Mode Active' : 'Field Offline Mode Active'}
          </span>
          <span className="text-amber-200/90 ml-1.5 hidden sm:inline">
            — Serving <strong className="text-white font-mono">{cachedPermitsCount}</strong> permits directly from Service Worker offline CacheStorage.
          </span>
          <span className="text-[11px] text-amber-300/80 ml-2 font-mono">
            (Synced: {syncFormatted})
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {isSimulatedOffline && onDisableSimulation && (
          <button
            onClick={onDisableSimulation}
            className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 rounded text-[11px] font-semibold text-amber-200 transition-colors"
          >
            Re-enable Online
          </button>
        )}
        <button
          onClick={onOpenDiagnostics}
          className="px-2.5 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded text-[11px] font-semibold text-white flex items-center gap-1 transition-colors"
        >
          <span className="material-symbols-outlined text-xs">storage</span>
          <span>Cache Details</span>
        </button>
      </div>
    </div>
  );
};
