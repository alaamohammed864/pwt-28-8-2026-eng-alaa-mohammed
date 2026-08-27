import React from 'react';

interface SafetyGuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyGuidelinesModal: React.FC<SafetyGuidelinesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto animate-fade-in">
      <div className="bg-[#0c0d18] rounded-2xl shadow-2xl border border-white/15 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden backdrop-blur-2xl">
        {/* Header */}
        <div className="bg-white/[0.04] border-b border-white/10 text-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">local_fire_department</span>
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">HSE Safety Rules & PTW Standard Procedures</h3>
              <p className="text-xs text-amber-400/80 font-arabic">إرشادات ومعايير السلامة المهنية لتصاريح العمل</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-200">
          {/* Golden Rules */}
          <div>
            <h4 className="font-bold text-slate-100 flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
              <span className="material-symbols-outlined text-lg text-amber-400">shield</span>
              1. The 5 Life Saving Safety Rules (القواعد الذهبية)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 bg-white/[0.03] rounded-xl border border-white/10 flex items-start gap-2.5">
                <span className="font-bold text-cyan-400 bg-cyan-500/20 border border-cyan-500/30 rounded-lg w-6 h-6 flex items-center justify-center shrink-0">1</span>
                <div>
                  <p className="font-semibold text-slate-100">Work with a Valid PTW</p>
                  <p className="text-slate-400 mt-0.5">Never start any hazardous work without a signed active permit.</p>
                </div>
              </div>
              <div className="p-3 bg-white/[0.03] rounded-xl border border-white/10 flex items-start gap-2.5">
                <span className="font-bold text-cyan-400 bg-cyan-500/20 border border-cyan-500/30 rounded-lg w-6 h-6 flex items-center justify-center shrink-0">2</span>
                <div>
                  <p className="font-semibold text-slate-100">Verify Energy Isolation (LOTO)</p>
                  <p className="text-slate-400 mt-0.5">Test zero energy state before working on pressurized/electrical lines.</p>
                </div>
              </div>
              <div className="p-3 bg-white/[0.03] rounded-xl border border-white/10 flex items-start gap-2.5">
                <span className="font-bold text-cyan-400 bg-cyan-500/20 border border-cyan-500/30 rounded-lg w-6 h-6 flex items-center justify-center shrink-0">3</span>
                <div>
                  <p className="font-semibold text-slate-100">Gas Testing Prior to Entry</p>
                  <p className="text-slate-400 mt-0.5">Oxygen must be 19.5% - 23.5% & LEL &lt; 5% before entering confined spaces.</p>
                </div>
              </div>
              <div className="p-3 bg-white/[0.03] rounded-xl border border-white/10 flex items-start gap-2.5">
                <span className="font-bold text-cyan-400 bg-cyan-500/20 border border-cyan-500/30 rounded-lg w-6 h-6 flex items-center justify-center shrink-0">4</span>
                <div>
                  <p className="font-semibold text-slate-100">Excavation & Shoring Inspection</p>
                  <p className="text-slate-400 mt-0.5">Trench depth &gt; 1.2m requires shoring, benching, or safe sloping.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Gas limits table */}
          <div>
            <h4 className="font-bold text-slate-100 flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
              <span className="material-symbols-outlined text-lg text-emerald-400">air</span>
              2. Confined Space Atmospheric Limits
            </h4>
            <div className="overflow-x-auto border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-white/[0.04] text-slate-300 font-semibold border-b border-white/10">
                  <tr>
                    <th className="p-2.5">Gas Type</th>
                    <th className="p-2.5">Safe Range (Standard)</th>
                    <th className="p-2.5">Alarm Threshold</th>
                    <th className="p-2.5">Hazard Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr className="hover:bg-white/[0.02]">
                    <td className="p-2.5 font-medium text-slate-200">Oxygen (O₂)</td>
                    <td className="p-2.5 text-emerald-400 font-mono font-semibold">19.5% – 23.5%</td>
                    <td className="p-2.5 text-slate-400 font-mono">&lt; 19.5% or &gt; 23.5%</td>
                    <td className="p-2.5 text-rose-400 font-medium">Asphyxiation / Enriched fire risk</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02]">
                    <td className="p-2.5 font-medium text-slate-200">Flammable (LEL)</td>
                    <td className="p-2.5 text-emerald-400 font-mono font-semibold">&lt; 5% LEL</td>
                    <td className="p-2.5 text-slate-400 font-mono">≥ 10% LEL (Stop work)</td>
                    <td className="p-2.5 text-rose-400 font-medium">Explosion / Flash fire</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02]">
                    <td className="p-2.5 font-medium text-slate-200">Hydrogen Sulfide (H₂S)</td>
                    <td className="p-2.5 text-emerald-400 font-mono font-semibold">&lt; 5 ppm</td>
                    <td className="p-2.5 text-slate-400 font-mono">≥ 10 ppm (Evacuate)</td>
                    <td className="p-2.5 text-rose-400 font-medium">Highly toxic neurological poison</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02]">
                    <td className="p-2.5 font-medium text-slate-200">Carbon Monoxide (CO)</td>
                    <td className="p-2.5 text-emerald-400 font-mono font-semibold">&lt; 25 ppm</td>
                    <td className="p-2.5 text-slate-400 font-mono">≥ 35 ppm</td>
                    <td className="p-2.5 text-rose-400 font-medium">Toxic asphyxiant</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Hot Work Spark Radius */}
          <div>
            <h4 className="font-bold text-slate-100 flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
              <span className="material-symbols-outlined text-lg text-amber-400">warning</span>
              3. Hot Work Safety Clearance Zone
            </h4>
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs space-y-2 text-amber-200/90">
              <p className="font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
                Maintain a clear <strong>10-meter (35-foot) radius</strong> free of all combustible and flammable substances.
              </p>
              <p className="font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
                Dedicated fire watch must remain on site during work and for at least <strong>30 minutes</strong> after completion.
              </p>
              <p className="font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
                Cover all open drains, sewers, and combustible floor surfaces with flame-retardant blankets.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white/[0.02] border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-black bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.35)] transition-all"
          >
            I Understand / فهمت الإرشادات
          </button>
        </div>
      </div>
    </div>
  );
};
