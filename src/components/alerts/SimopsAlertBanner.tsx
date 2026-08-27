import React, { useState } from 'react';
import { SimopsConflict, AnyPermit } from '../../types';

interface SimopsAlertBannerProps {
  conflicts: SimopsConflict[];
  onOpenConflictModal: (conflict: SimopsConflict) => void;
  onOpenPermit: (permit: AnyPermit) => void;
  onResolveConflict?: (conflictId: string, actionPermitIdToSuspend?: string) => void;
}

export const SimopsAlertBanner: React.FC<SimopsAlertBannerProps> = ({
  conflicts,
  onOpenConflictModal,
  onOpenPermit,
  onResolveConflict,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [expandedConflictId, setExpandedConflictId] = useState<string | null>(null);

  if (conflicts.length === 0 || isDismissed) {
    return null;
  }

  const primaryConflict = conflicts[0];
  const criticalCount = conflicts.filter((c) => c.severity === 'CRITICAL').length;
  const isCritical = criticalCount > 0;

  return (
    <div className="relative z-20 mb-6 animate-fade-in">
      <div
        className={`rounded-2xl border p-4 md:p-5 backdrop-blur-2xl shadow-2xl transition-all ${
          isCritical
            ? 'bg-rose-950/40 border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.25)]'
            : 'bg-amber-950/40 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)]'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left Icon & Message */}
          <div className="flex items-start gap-3.5">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                isCritical
                  ? 'bg-rose-500/20 border-rose-500/60 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.5)]'
                  : 'bg-amber-500/20 border-amber-500/60 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
              }`}
            >
              <span className="material-symbols-outlined text-2xl animate-pulse">
                {isCritical ? 'emergency' : 'warning'}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    isCritical
                      ? 'bg-rose-500/30 text-rose-200 border-rose-400'
                      : 'bg-amber-500/30 text-amber-200 border-amber-400'
                  }`}
                >
                  {isCritical ? 'CRITICAL SIMOPS ALERT' : 'SIMOPS OVERLAP WARNING'}
                </span>
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-cyan-400">location_on</span>
                  {primaryConflict.areaLocation}
                </span>
                {conflicts.length > 1 && (
                  <span className="text-[10px] bg-white/10 text-slate-300 px-2 py-0.5 rounded font-mono">
                    +{conflicts.length - 1} more conflict{conflicts.length > 2 ? 's' : ''}
                  </span>
                )}
              </div>

              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                {primaryConflict.title}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                {primaryConflict.description}
              </p>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap lg:justify-end shrink-0">
            <button
              onClick={() => onOpenConflictModal(primaryConflict)}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg shadow-lg flex items-center gap-1.5 transition-all ${
                isCritical
                  ? 'bg-gradient-to-r from-rose-500 to-rose-400 hover:from-rose-400 hover:to-rose-300 text-black shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                  : 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
              }`}
            >
              <span className="material-symbols-outlined text-sm font-bold">troubleshoot</span>
              Analyze & Resolve Conflict
            </button>

            <button
              onClick={() =>
                setExpandedConflictId(
                  expandedConflictId === primaryConflict.id ? null : primaryConflict.id
                )
              }
              className="px-3 py-2 text-xs font-semibold text-slate-200 bg-white/[0.06] hover:bg-white/10 border border-white/15 rounded-lg transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">
                {expandedConflictId === primaryConflict.id ? 'expand_less' : 'expand_more'}
              </span>
              <span>{expandedConflictId === primaryConflict.id ? 'Hide Steps' : 'Quick Actions'}</span>
            </button>

            <button
              onClick={() => setIsDismissed(true)}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] rounded-lg transition-colors"
              title="Dismiss warning banner"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        </div>

        {/* Conflicting Permits Pills */}
        <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400 text-[11px] font-semibold">Overlapping Permits:</span>
          {primaryConflict.permits.map((p) => (
            <button
              key={p.id}
              onClick={() => onOpenPermit(p)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/10 border border-white/15 text-slate-200 transition-colors group"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  p.type === 'HOT_WORK'
                    ? 'bg-amber-400'
                    : p.type === 'CONFINED_SPACE'
                    ? 'bg-rose-400'
                    : p.type === 'EXCAVATION'
                    ? 'bg-amber-600'
                    : 'bg-cyan-400'
                }`}
              ></span>
              <span className="font-mono font-bold text-cyan-300 group-hover:underline">
                {p.permitNumber}
              </span>
              <span className="text-[10px] text-slate-400">({p.title})</span>
              <span className="material-symbols-outlined text-xs text-slate-400 group-hover:text-cyan-300">
                launch
              </span>
            </button>
          ))}
        </div>

        {/* Expandable Recommended Mitigations */}
        {expandedConflictId === primaryConflict.id && (
          <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs animate-fade-in">
            <div className="bg-black/40 p-3 rounded-xl border border-white/10 space-y-2">
              <h5 className="font-bold text-slate-100 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-emerald-400">checklist</span>
                Mandatory Safety Controls (English)
              </h5>
              <ul className="space-y-1.5 text-slate-300">
                {primaryConflict.recommendedActions.map((action, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-black/40 p-3 rounded-xl border border-white/10 space-y-2 font-arabic text-right" dir="rtl">
              <h5 className="font-bold text-slate-100 flex items-center gap-1.5 justify-start">
                <span className="material-symbols-outlined text-sm text-emerald-400">gavel</span>
                إجراءات التحكم والوقاية الإلزامية
              </h5>
              <ul className="space-y-1.5 text-slate-300">
                {primaryConflict.recommendedActionsAr.map((action, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
