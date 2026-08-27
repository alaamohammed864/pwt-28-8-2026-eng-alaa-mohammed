import React from 'react';

interface OfflineStatusIndicatorProps {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  cachedCount: number;
  onOpenDiagnostics: () => void;
}

export const OfflineStatusIndicator: React.FC<OfflineStatusIndicatorProps> = ({
  isOnline,
  isSimulatedOffline,
  cachedCount,
  onOpenDiagnostics,
}) => {
  const isActuallyOffline = !isOnline || isSimulatedOffline;

  return (
    <button
      onClick={onOpenDiagnostics}
      title="Click to view Service Worker & Offline Cache Status"
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all shadow-sm cursor-pointer ${
        isActuallyOffline
          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
          : 'bg-white/[0.04] border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300'
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          isActuallyOffline
            ? 'bg-amber-400 animate-pulse shadow-[0_0_6px_rgba(245,158,11,0.8)]'
            : 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
        }`}
      />
      <span className="material-symbols-outlined text-sm">
        {isActuallyOffline ? 'cloud_off' : 'cloud_done'}
      </span>
      <span className="hidden sm:inline">
        {isActuallyOffline ? `Offline (${cachedCount} Cached)` : 'Offline Ready'}
      </span>
    </button>
  );
};
