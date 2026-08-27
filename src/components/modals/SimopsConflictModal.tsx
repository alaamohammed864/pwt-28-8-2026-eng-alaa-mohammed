import React, { useState } from 'react';
import { SimopsConflict, AnyPermit, PermitStatus } from '../../types';

interface SimopsConflictModalProps {
  conflict: SimopsConflict | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenPermit: (permit: AnyPermit) => void;
  onUpdatePermitStatus: (permitId: string, status: PermitStatus) => void;
}

export const SimopsConflictModal: React.FC<SimopsConflictModalProps> = ({
  conflict,
  isOpen,
  onClose,
  onOpenPermit,
  onUpdatePermitStatus,
}) => {
  const [checkedMitigations, setCheckedMitigations] = useState<Record<number, boolean>>({});
  const [simopsApproved, setSimopsApproved] = useState(false);
  const [activeTab, setActiveTab] = useState<'matrix' | 'permits' | 'mitigation'>('matrix');

  if (!isOpen || !conflict) return null;

  const toggleMitigation = (idx: number) => {
    setCheckedMitigations((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const allMitigationsChecked =
    conflict.recommendedActions.length > 0 &&
    conflict.recommendedActions.every((_, idx) => !!checkedMitigations[idx]);

  const handleSuspendPermit = (permit: AnyPermit) => {
    onUpdatePermitStatus(permit.id, 'Suspended');
    onClose();
  };

  const handleAuthorizeSimops = () => {
    setSimopsApproved(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const isCritical = conflict.severity === 'CRITICAL';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto animate-fade-in">
      <div className="bg-[#0c0d18] rounded-2xl shadow-2xl border border-white/15 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden backdrop-blur-2xl">
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isCritical
              ? 'bg-rose-950/30 border-rose-500/30'
              : 'bg-amber-950/30 border-amber-500/30'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-lg ${
                isCritical
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                  : 'bg-amber-500/20 border-amber-500/50 text-amber-400'
              }`}
            >
              <span className="material-symbols-outlined text-2xl font-bold animate-pulse">
                {isCritical ? 'emergency' : 'warning'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-100">{conflict.title}</h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border font-mono ${
                    isCritical
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}
                >
                  {conflict.severity}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span className="material-symbols-outlined text-xs text-cyan-400">location_on</span>
                <span>Location:</span>
                <strong className="text-slate-200">{conflict.areaLocation}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-white/[0.02] px-6">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'matrix'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-sm">hub</span>
            SIMOPS Proximity & Spatial Matrix
          </button>
          <button
            onClick={() => setActiveTab('permits')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'permits'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-sm">compare_arrows</span>
            Permit Side-by-Side Comparison ({conflict.permits.length})
          </button>
          <button
            onClick={() => setActiveTab('mitigation')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'mitigation'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-sm">verified_user</span>
            Mandatory Controls & Sign-off
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-200 flex-1">
          {activeTab === 'matrix' && (
            <div className="space-y-5">
              {/* Interactive Zone Diagram */}
              <div className="bg-black/50 border border-white/10 rounded-2xl p-5 relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-xs text-slate-200 uppercase tracking-wider">
                      Simultaneous Operations (SIMOPS) Spatial Footprint
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Calculated 10m spark boundary & overlapping hazard radius in {conflict.areaLocation}
                    </p>
                  </div>
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded border border-rose-500/30 font-mono">
                    Overlap Radius: ~15.4m
                  </span>
                </div>

                {/* Simulated Radar / Zone Map */}
                <div className="h-56 w-full rounded-xl bg-[#070810] border border-white/10 relative flex items-center justify-center overflow-hidden">
                  {/* Radar Circles */}
                  <div className="absolute w-44 h-44 rounded-full border border-white/10"></div>
                  <div className="absolute w-72 h-72 rounded-full border border-white/5"></div>
                  <div className="absolute w-full h-[1px] bg-white/5"></div>
                  <div className="absolute h-full w-[1px] bg-white/5"></div>

                  {/* Permit A Zone: e.g. Hot Work Flame Zone */}
                  <div className="absolute left-1/3 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-amber-500/20 border-2 border-dashed border-amber-400 flex items-center justify-center animate-pulse">
                    <div className="text-center p-2">
                      <span className="material-symbols-outlined text-amber-400 text-xl">local_fire_department</span>
                      <p className="text-[10px] font-bold text-amber-200 font-mono">
                        {conflict.permits[0]?.permitNumber || 'PTW-A'}
                      </p>
                      <p className="text-[9px] text-amber-300/80">10m Spark Zone</p>
                    </div>
                  </div>

                  {/* Permit B Zone: e.g. Confined Space / Excavation Zone */}
                  <div className="absolute right-1/3 top-1/2 translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-rose-500/20 border-2 border-dashed border-rose-400 flex items-center justify-center animate-pulse">
                    <div className="text-center p-2">
                      <span className="material-symbols-outlined text-rose-400 text-xl">
                        {conflict.permits[1]?.type === 'CONFINED_SPACE' ? 'meeting_room' : 'construction'}
                      </span>
                      <p className="text-[10px] font-bold text-rose-200 font-mono">
                        {conflict.permits[1]?.permitNumber || 'PTW-B'}
                      </p>
                      <p className="text-[9px] text-rose-300/80">Entry / Hazard Zone</p>
                    </div>
                  </div>

                  {/* Intersection Critical Clash Indicator */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-rose-600/90 border border-rose-400 text-white text-[10px] font-black rounded-full shadow-[0_0_20px_rgba(244,63,94,0.9)] flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">warning</span>
                    CRITICAL COLLISION AREA
                  </div>
                </div>
              </div>

              {/* Hazard Description & Explanation */}
              <div className="bg-white/[0.03] p-4 rounded-xl border border-white/10 space-y-2">
                <h5 className="font-bold text-xs text-slate-100 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-cyan-400">info</span>
                  Risk Breakdown & Potential Impact
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {conflict.description}
                </p>
                <p className="text-xs text-amber-400/90 font-arabic pt-1" dir="rtl">
                  {conflict.descriptionAr}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'permits' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {conflict.permits.map((p, idx) => (
                <div
                  key={p.id}
                  className="bg-white/[0.03] border border-white/10 rounded-xl p-4 space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm ${
                          p.type === 'HOT_WORK'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : p.type === 'CONFINED_SPACE'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        }`}
                      >
                        <span className="material-symbols-outlined text-base">
                          {p.type === 'HOT_WORK'
                            ? 'local_fire_department'
                            : p.type === 'CONFINED_SPACE'
                            ? 'meeting_room'
                            : 'build'}
                        </span>
                      </span>
                      <div>
                        <span className="font-bold text-xs text-slate-100 block">{p.title}</span>
                        <span className="font-mono text-[11px] text-cyan-300 font-bold">
                          {p.permitNumber}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        p.status === 'Active'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : p.status === 'Suspended'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Department:</span>
                      <span className="text-slate-200 font-medium">{p.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Lead Tech / PA:</span>
                      <span className="text-slate-200 font-medium">{p.author}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Contractor:</span>
                      <span className="text-slate-200 font-medium">{p.contractor || 'In-House'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Equipment:</span>
                      <span className="text-cyan-300 font-mono text-[11px]">{p.equipment || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Validity:</span>
                      <span className="text-slate-200 font-mono text-[11px]">
                        {p.validityStart?.substring(11, 16) || '08:00'} -{' '}
                        {p.validityEnd?.substring(11, 16) || '17:00'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        onClose();
                        onOpenPermit(p);
                      }}
                      className="text-xs text-cyan-300 hover:text-cyan-200 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>Open Full Permit</span>
                      <span className="material-symbols-outlined text-xs">launch</span>
                    </button>

                    {p.status === 'Active' && (
                      <button
                        onClick={() => handleSuspendPermit(p)}
                        className="px-2.5 py-1 text-[11px] font-bold text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 rounded-lg transition-colors flex items-center gap-1"
                        title="Suspend this permit to resolve SIMOPS clash immediately"
                      >
                        <span className="material-symbols-outlined text-xs">pause_circle</span>
                        Suspend Permit
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'mitigation' && (
            <div className="space-y-4">
              <div className="bg-white/[0.03] p-4 rounded-xl border border-white/10 space-y-3">
                <h5 className="font-bold text-xs text-slate-100 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-emerald-400">checklist</span>
                  Required SIMOPS Safety Verification Checklist (OSHA / ISO 45001)
                </h5>
                <p className="text-xs text-slate-400">
                  All items below must be physically verified by the Area Authority before joint activities can proceed simultaneously.
                </p>

                <div className="space-y-2.5 pt-2">
                  {conflict.recommendedActions.map((action, idx) => (
                    <label
                      key={idx}
                      onClick={() => toggleMitigation(idx)}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        checkedMitigations[idx]
                          ? 'bg-cyan-500/10 border-cyan-500/40 text-slate-100'
                          : 'bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/[0.05]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={!!checkedMitigations[idx]}
                        onChange={() => {}}
                        className="mt-0.5 rounded border-white/20 bg-black/40 text-cyan-500 focus:ring-cyan-500/40"
                      />
                      <div className="flex-1 text-xs">
                        <p className="font-semibold text-slate-200">{action}</p>
                        <p className="text-[11px] text-slate-400 font-arabic mt-0.5" dir="rtl">
                          {conflict.recommendedActionsAr[idx]}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-white/[0.02] border-t border-white/10 flex items-center justify-between flex-wrap gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base text-cyan-400">security</span>
            <span>SIMOPS Rule 14-B: Uncontrolled overlaps trigger automatic work stoppage.</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 rounded-lg border border-white/15 transition-colors"
            >
              Close Window
            </button>

            <button
              type="button"
              onClick={handleAuthorizeSimops}
              disabled={!allMitigationsChecked && !simopsApproved}
              className={`px-4 py-2 text-xs font-bold rounded-lg shadow-lg flex items-center gap-1.5 transition-all ${
                allMitigationsChecked || simopsApproved
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                  : 'bg-white/10 text-slate-500 border border-white/10 cursor-not-allowed'
              }`}
            >
              <span className="material-symbols-outlined text-sm font-bold">
                {simopsApproved ? 'done_all' : 'verified'}
              </span>
              {simopsApproved
                ? 'SIMOPS Authorized & Logged'
                : 'Authorize SIMOPS (All Checks Verified)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
