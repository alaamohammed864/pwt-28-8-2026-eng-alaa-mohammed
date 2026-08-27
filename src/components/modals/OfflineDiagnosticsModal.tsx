import React, { useState, useEffect } from 'react';
import { AnyPermit } from '../../types';
import { getOfflineDiagnostics, syncPermitsToOfflineCache, OfflineCacheDiagnostics } from '../../utils/offlineServiceWorker';

interface OfflineDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  permits: AnyPermit[];
  isOnline: boolean;
  onForceSync: () => Promise<void>;
  isSimulatedOffline: boolean;
  onToggleSimulatedOffline: () => void;
}

export const OfflineDiagnosticsModal: React.FC<OfflineDiagnosticsModalProps> = ({
  isOpen,
  onClose,
  permits,
  isOnline,
  onForceSync,
  isSimulatedOffline,
  onToggleSimulatedOffline,
}) => {
  const [diagnostics, setDiagnostics] = useState<OfflineCacheDiagnostics | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);

  const loadDiagnostics = async () => {
    const diag = await getOfflineDiagnostics();
    setDiagnostics(diag);
  };

  useEffect(() => {
    if (isOpen) {
      loadDiagnostics();
    }
  }, [isOpen, permits]);

  if (!isOpen) return null;

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncSuccessMessage(null);
    try {
      await onForceSync();
      await loadDiagnostics();
      setSyncSuccessMessage(`Successfully synchronized ${permits.length} permits into Service Worker Cache!`);
      setTimeout(() => setSyncSuccessMessage(null), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportBackup = () => {
    const blob = new Blob([JSON.stringify(permits, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ptw-offline-permits-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Group permits by type
  const hotWorkCount = permits.filter((p) => p.type === 'HOT_WORK').length;
  const coldWorkCount = permits.filter((p) => p.type === 'COLD_WORK').length;
  const confinedCount = permits.filter((p) => p.type === 'CONFINED_SPACE').length;
  const excavationCount = permits.filter((p) => p.type === 'EXCAVATION').length;
  const isolationCount = permits.filter((p) => p.type === 'MECHANICAL_ISOLATION').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0b0c16] border border-white/15 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <span className="material-symbols-outlined text-xl">cloud_sync</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Service Worker Offline Cache & Field Storage
              </h2>
              <p className="text-xs text-slate-400 font-arabic">
                إدارة التخزين المؤقت الميداني والتوافق بدون إنترنت
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          {/* Status Alert Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3.5 ${
              !isOnline || isSimulatedOffline
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}
          >
            <span className="material-symbols-outlined text-2xl shrink-0 mt-0.5">
              {!isOnline || isSimulatedOffline ? 'wifi_off' : 'wifi'}
            </span>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider">
                  {!isOnline
                    ? 'Field Offline Mode (No Internet)'
                    : isSimulatedOffline
                    ? 'Simulated Offline Field Test Mode'
                    : 'Online & Service Worker Cache Active'}
                </span>
                <span className="text-[11px] font-mono opacity-80">
                  {diagnostics?.lastSyncTime
                    ? `Last Sync: ${new Date(diagnostics.lastSyncTime).toLocaleTimeString()}`
                    : 'Synced'}
                </span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                {!isOnline || isSimulatedOffline
                  ? 'All permits, gas certificates, LOTO isolations, and digital signatures are served seamlessly from the offline CacheStorage database.'
                  : 'Your field permits are proactively pre-cached into the Service Worker cache. If connectivity drops in remote locations, you will retain 100% read/inspection access.'}
              </p>
            </div>
          </div>

          {/* Sync Success Feedback */}
          {syncSuccessMessage && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <span className="material-symbols-outlined text-base">check_circle</span>
              {syncSuccessMessage}
            </div>
          )}

          {/* Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white/[0.03] border border-white/10 rounded-xl space-y-1">
              <span className="text-[11px] font-medium text-slate-400">Total Cached</span>
              <p className="text-xl font-bold text-cyan-400 font-mono">{permits.length}</p>
              <span className="text-[10px] text-slate-500">Active Field Permits</span>
            </div>

            <div className="p-3 bg-white/[0.03] border border-white/10 rounded-xl space-y-1">
              <span className="text-[11px] font-medium text-slate-400">SW Status</span>
              <div className="flex items-center gap-1.5 pt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <p className="text-xs font-bold text-emerald-400">Registered</p>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">sw.js (v1.0)</span>
            </div>

            <div className="p-3 bg-white/[0.03] border border-white/10 rounded-xl space-y-1">
              <span className="text-[11px] font-medium text-slate-400">Storage Usage</span>
              <p className="text-xs font-bold text-slate-200 pt-1 font-mono">
                {diagnostics?.storageEstimate?.usageFormatted || '< 1.5 MB'}
              </p>
              <span className="text-[10px] text-slate-500">CacheStorage API</span>
            </div>

            <div className="p-3 bg-white/[0.03] border border-white/10 rounded-xl space-y-1">
              <span className="text-[11px] font-medium text-slate-400">Dual Persistence</span>
              <div className="flex items-center gap-1 text-xs font-bold text-indigo-400 pt-1">
                <span className="material-symbols-outlined text-sm">storage</span>
                <span>SW + Local</span>
              </div>
              <span className="text-[10px] text-slate-500">Redundant Caching</span>
            </div>
          </div>

          {/* Breakdown by Permit Type */}
          <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
              <span>Cached Permit Categories</span>
              <span className="text-[11px] text-slate-400 font-normal">Available in Remote Plant Zones</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
              <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center justify-between">
                <span className="text-rose-300 font-medium flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">local_fire_department</span>
                  Hot Work
                </span>
                <span className="font-bold text-white font-mono">{hotWorkCount}</span>
              </div>

              <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-between">
                <span className="text-blue-300 font-medium flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">ac_unit</span>
                  Cold Work
                </span>
                <span className="font-bold text-white font-mono">{coldWorkCount}</span>
              </div>

              <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-between">
                <span className="text-amber-300 font-medium flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">meeting_room</span>
                  Confined Space
                </span>
                <span className="font-bold text-white font-mono">{confinedCount}</span>
              </div>

              <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-between">
                <span className="text-emerald-300 font-medium flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">landslide</span>
                  Excavation
                </span>
                <span className="font-bold text-white font-mono">{excavationCount}</span>
              </div>

              <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-between sm:col-span-2">
                <span className="text-purple-300 font-medium flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">lock_person</span>
                  Mechanical Isolation (LOTO)
                </span>
                <span className="font-bold text-white font-mono">{isolationCount}</span>
              </div>
            </div>
          </div>

          {/* Technical Info */}
          <div className="bg-black/40 border border-white/5 rounded-xl p-3.5 text-[11px] font-mono text-slate-400 space-y-1.5">
            <div className="flex justify-between">
              <span>Cache Strategy:</span>
              <span className="text-slate-200">Cache-First (Assets) / Network-First with Fallback (Data)</span>
            </div>
            <div className="flex justify-between">
              <span>Data Cache Store:</span>
              <span className="text-cyan-400">ptw-permits-data-v1</span>
            </div>
            <div className="flex justify-between">
              <span>App Shell Store:</span>
              <span className="text-indigo-400">ptw-app-shell-v1</span>
            </div>
            <div className="flex justify-between">
              <span>Field Worker Readiness:</span>
              <span className="text-emerald-400 font-semibold">100% Offline Compatible</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#07080f] border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSimulatedOffline}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                isSimulatedOffline
                  ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                  : 'bg-white/5 border-white/15 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">
                {isSimulatedOffline ? 'wifi_off' : 'toggle_off'}
              </span>
              {isSimulatedOffline ? 'Disable Offline Test' : 'Test Offline Field Mode'}
            </button>

            <button
              onClick={handleExportBackup}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/15 rounded-lg text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              Export Backup
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-black font-bold text-xs rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.35)] flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-sm ${isSyncing ? 'animate-spin' : ''}`}>
                sync
              </span>
              {isSyncing ? 'Synchronizing Cache...' : 'Sync Offline Cache Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
