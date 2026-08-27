import React, { useState } from 'react';
import { ExcavationPermitData, DigitalSignature } from '../../types';
import { SignaturePadModal } from '../modals/SignaturePadModal';
import { SignatureCard } from '../common/SignatureCard';

interface ExcavationCertificateViewProps {
  permit: ExcavationPermitData;
  onUpdatePermit: (updated: ExcavationPermitData) => void;
  onPrint: () => void;
  onSubmitForApproval: () => void;
}

export const ExcavationCertificateView: React.FC<ExcavationCertificateViewProps> = ({
  permit,
  onUpdatePermit,
  onPrint,
  onSubmitForApproval,
}) => {
  const [data, setData] = useState<ExcavationPermitData>(permit);
  const [activeSignRole, setActiveSignRole] = useState<'requestor' | 'safety' | null>(null);

  const handleTextChange = (field: keyof ExcavationPermitData, val: any) => {
    const updated = { ...data, [field]: val };
    setData(updated);
    onUpdatePermit(updated);
  };

  const handleServiceToggle = (key: keyof ExcavationPermitData['undergroundServices']) => {
    const updated = {
      ...data,
      undergroundServices: {
        ...data.undergroundServices,
        [key]: !data.undergroundServices[key],
      },
    };
    setData(updated);
    onUpdatePermit(updated);
  };

  const handleSaveSignature = (sig: DigitalSignature) => {
    let updated = { ...data };
    if (activeSignRole === 'requestor') {
      updated.requestorSignature = sig;
    } else if (activeSignRole === 'safety') {
      updated.safetyEngineerSignature = sig;
      if (sig.signed) {
        updated.status = 'Active';
      }
    }
    setData(updated);
    onUpdatePermit(updated);
  };

  const handleClearSignature = (role: 'requestor' | 'safety') => {
    let updated = { ...data };
    if (role === 'requestor') {
      updated.requestorSignature = {
        name: '',
        title: 'Civil Lead',
        date: '',
        signed: false,
      };
    } else {
      updated.safetyEngineerSignature = {
        name: '',
        title: 'HSE Geotechnical Engineer',
        date: '',
        signed: false,
      };
    }
    setData(updated);
    onUpdatePermit(updated);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner Bar */}
      <div className="bg-[#0c0d18]/90 border border-white/10 rounded-xl p-5 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.25)]">
            <span className="material-symbols-outlined text-2xl font-bold">construction</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-100">Excavation Certificate</h1>
              <span className="text-xs font-semibold font-arabic text-amber-400/80">(شهادة حفر وأعمال أرضية)</span>
              <span className="font-mono text-xs bg-white/10 text-cyan-300 px-2 py-0.5 rounded border border-white/15">
                {data.permitNumber}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Reference PTW: <span className="font-semibold text-slate-200">{data.permitNumberReference || 'PTW-2023-441'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`px-3 py-1 text-xs font-bold rounded-full border ${
              data.status === 'Active'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
            }`}
          >
            {data.status === 'Active' ? 'Active / معتمد' : 'Pending Approval / قيد المراجعة'}
          </span>
          <button
            onClick={onPrint}
            className="px-3 py-1.5 text-xs font-semibold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">print</span>
            Print
          </button>
          <button
            onClick={onSubmitForApproval}
            className="px-4 py-1.5 text-xs font-bold text-black bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.35)] flex items-center gap-1.5 transition-all"
          >
            <span className="material-symbols-outlined text-sm font-bold">send</span>
            Submit for Review
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Excavation Description */}
          <div className="bg-[#0c0d18]/90 border border-white/10 rounded-xl overflow-hidden shadow-xl backdrop-blur-xl">
            <div className="bg-white/[0.04] px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <span className="font-bold text-xs text-cyan-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">terrain</span>
                1. Excavation Description / بيانات وتفاصيل الحفر
              </span>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Location / الموقع</label>
                  <input
                    type="text"
                    value={data.areaLocation || ''}
                    onChange={(e) => handleTextChange('areaLocation', e.target.value)}
                    className="form-input-industrial"
                    placeholder="e.g. South Trench Plot 12B"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Expected Depth (Meters) / العمق</label>
                  <input
                    type="number"
                    step="0.1"
                    value={data.expectedDepth}
                    onChange={(e) => handleTextChange('expectedDepth', parseFloat(e.target.value) || 0)}
                    className="form-input-industrial font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Excavation Method / طريقة الحفر</label>
                  <select
                    value={data.excavationMethod}
                    onChange={(e) => handleTextChange('excavationMethod', e.target.value as any)}
                    className="form-input-industrial"
                  >
                    <option value="Manual / يدوي">Manual / يدوي (Hand digging only)</option>
                    <option value="Mechanical / ميكانيكي">Mechanical / ميكانيكي (Excavator / Backhoe)</option>
                    <option value="Mixed / مختلط">Mixed / مختلط (Hand trial holes first)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Civil Contractor</label>
                  <input
                    type="text"
                    value={data.contractor || 'In-House Civil Team'}
                    onChange={(e) => handleTextChange('contractor', e.target.value)}
                    className="form-input-industrial"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Purpose of Excavation / الغرض من أعمال الحفر
                </label>
                <textarea
                  rows={2}
                  value={data.purpose || ''}
                  onChange={(e) => handleTextChange('purpose', e.target.value)}
                  className="form-input-industrial resize-none"
                  placeholder="e.g. Trenching for 33kV high-voltage power cables and storm drainage pipe replacement..."
                />
              </div>
            </div>
          </div>

          {/* Section 2: Underground Services Identification */}
          <div className="bg-[#0c0d18]/90 border border-white/10 rounded-xl overflow-hidden shadow-xl backdrop-blur-xl">
            <div className="bg-white/[0.04] px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <span className="font-bold text-xs text-amber-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-amber-400">cable</span>
                2. Underground Services Identification / فحص الخدمات المدفونة
              </span>
              <span className="text-[10px] text-cyan-300 font-mono bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">Cable Detector / CAT Scan</span>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label
                  onClick={() => handleServiceToggle('electrical')}
                  className={`p-3 rounded-lg border cursor-pointer flex items-center gap-3 transition-colors ${
                    data.undergroundServices.electrical
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                      : 'bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/[0.05]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={data.undergroundServices.electrical}
                    onChange={() => {}}
                    className="w-4 h-4 text-amber-500 rounded accent-amber-500"
                  />
                  <div>
                    <span className="font-bold text-xs block text-slate-200">Electrical Cables</span>
                    <span className="text-[10px] text-slate-400 font-arabic">كابلات كهرباء</span>
                  </div>
                </label>

                <label
                  onClick={() => handleServiceToggle('telecom')}
                  className={`p-3 rounded-lg border cursor-pointer flex items-center gap-3 transition-colors ${
                    data.undergroundServices.telecom
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                      : 'bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/[0.05]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={data.undergroundServices.telecom}
                    onChange={() => {}}
                    className="w-4 h-4 text-amber-500 rounded accent-amber-500"
                  />
                  <div>
                    <span className="font-bold text-xs block text-slate-200">Telecom & Fiber</span>
                    <span className="text-[10px] text-slate-400 font-arabic">ألياف واتصالات</span>
                  </div>
                </label>

                <label
                  onClick={() => handleServiceToggle('pipingWaterGas')}
                  className={`p-3 rounded-lg border cursor-pointer flex items-center gap-3 transition-colors ${
                    data.undergroundServices.pipingWaterGas
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                      : 'bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/[0.05]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={data.undergroundServices.pipingWaterGas}
                    onChange={() => {}}
                    className="w-4 h-4 text-amber-500 rounded accent-amber-500"
                  />
                  <div>
                    <span className="font-bold text-xs block text-slate-200">Piping (Water/Gas)</span>
                    <span className="text-[10px] text-slate-400 font-arabic">أنابيب مياه أو غاز</span>
                  </div>
                </label>
              </div>

              {/* Shoring & Safety check boxes */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-white/10">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer p-1.5 rounded hover:bg-white/[0.03]">
                  <input
                    type="checkbox"
                    checked={data.shoringRequired}
                    onChange={() => handleTextChange('shoringRequired', !data.shoringRequired)}
                    className="w-4 h-4 text-cyan-400 rounded accent-cyan-400"
                  />
                  <span className="font-medium">
                    Trench Shoring / Benching Required (دعامات حماية الحفر)
                  </span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer p-1.5 rounded hover:bg-white/[0.03]">
                  <input
                    type="checkbox"
                    checked={data.gasTestingRequired}
                    onChange={() => handleTextChange('gasTestingRequired', !data.gasTestingRequired)}
                    className="w-4 h-4 text-cyan-400 rounded accent-cyan-400"
                  />
                  <span className="font-medium">
                    Continuous Gas Testing in Trench (فحص غازات بالحفرة)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Authorizations */}
          <div className="bg-[#0c0d18]/90 border border-white/10 rounded-xl overflow-hidden shadow-xl backdrop-blur-xl">
            <div className="bg-white/[0.04] px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <span className="font-bold text-xs text-cyan-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">draw</span>
                3. Authorizations & Digital Sign-off / التواقيع والاعتمادات الإلكترونية
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Underground Scan Clearance
              </span>
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SignatureCard
                roleTitle="Civil Requestor / Contractor Lead"
                roleTitleAr="المنفذ المدني / مقاول الحفريات"
                signature={data.requestorSignature}
                accentColor="cyan"
                onOpenPad={() => setActiveSignRole('requestor')}
                onClear={() => handleClearSignature('requestor')}
              />

              <SignatureCard
                roleTitle="HSE Geotechnical Safety Engineer"
                roleTitleAr="مهندس السلامة الجيوتقنية والمسح الأرضي"
                signature={data.safetyEngineerSignature}
                accentColor="amber"
                onOpenPad={() => setActiveSignRole('safety')}
                onClear={() => handleClearSignature('safety')}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Shoring Profile Graphic */}
        <div className="space-y-4">
          <div className="bg-[#0c0d18]/90 border border-white/10 rounded-xl p-5 shadow-xl backdrop-blur-xl">
            <h3 className="font-bold text-xs text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-amber-400">view_sidebar</span>
              Shoring & Trench Profile
            </h3>

            {/* Trench Diagram */}
            <div className="bg-black/40 border border-amber-500/20 rounded-lg p-3 text-center">
              <svg viewBox="0 0 200 150" className="w-full h-36 mx-auto">
                {/* Ground Line */}
                <line x1="10" y1="40" x2="60" y2="40" stroke="#b45309" strokeWidth="3" />
                <line x1="140" y1="40" x2="190" y2="40" stroke="#b45309" strokeWidth="3" />

                {/* Spoil pile > 1.0m away */}
                <polygon points="150,40 165,20 180,40" fill="#f59e0b" />
                <text x="165" y="16" textAnchor="middle" fill="#f59e0b" fontSize="7" fontWeight="bold">Spoil Pile (&gt;1m)</text>

                {/* Trench Walls */}
                <line x1="60" y1="40" x2="60" y2="130" stroke="#06b6d4" strokeWidth="4" />
                <line x1="140" y1="40" x2="140" y2="130" stroke="#06b6d4" strokeWidth="4" />
                
                {/* Trench Floor */}
                <line x1="60" y1="130" x2="140" y2="130" stroke="#b45309" strokeWidth="3" />

                {/* Shoring Struts */}
                <line x1="60" y1="70" x2="140" y2="70" stroke="#fbbf24" strokeWidth="3" />
                <line x1="60" y1="105" x2="140" y2="105" stroke="#fbbf24" strokeWidth="3" />
                <text x="100" y="67" textAnchor="middle" fill="#38bdf8" fontSize="7" fontWeight="bold">Hydraulic Strut</text>

                {/* Ladder inside */}
                <line x1="75" y1="30" x2="85" y2="130" stroke="#94a3b8" strokeWidth="2" />
                <line x1="79" y1="30" x2="89" y2="130" stroke="#94a3b8" strokeWidth="2" />

                {/* Depth dimension */}
                <line x1="45" y1="40" x2="45" y2="130" stroke="#f43f5e" strokeWidth="1" />
                <text x="35" y="85" textAnchor="middle" fill="#f43f5e" fontSize="8" fontWeight="bold">2.8m</text>
              </svg>

              <div className="mt-2 text-xs font-bold text-amber-400">
                OSHA Trench Safety Standard
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Any trench exceeding 1.2m depth requires engineered shoring or 45° sloping.
              </p>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="p-2.5 bg-white/[0.03] rounded-lg border border-white/5">
                <span className="font-bold text-cyan-400 block text-[11px]">Safe Egress Ladder</span>
                <p className="text-[10px] text-slate-400">Ladders must extend 1 meter above ground level every 7.5m along the trench.</p>
              </div>
              <div className="p-2.5 bg-white/[0.03] rounded-lg border border-white/5">
                <span className="font-bold text-cyan-400 block text-[11px]">Daily Inspection</span>
                <p className="text-[10px] text-slate-400">Competent person must inspect trench daily and after every rain event.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SignaturePadModal
        isOpen={activeSignRole !== null}
        onClose={() => setActiveSignRole(null)}
        onSave={handleSaveSignature}
        title={activeSignRole === 'requestor' ? 'Civil Requestor Sign-off' : 'Geotechnical Safety Engineer Sign-off'}
        roleName={activeSignRole === 'requestor' ? 'Civil Contractor Lead' : 'HSE Geotechnical Engineer'}
        defaultName={activeSignRole === 'requestor' ? data.requestorSignature.name : data.safetyEngineerSignature.name}
        initialSignature={activeSignRole === 'requestor' ? data.requestorSignature : data.safetyEngineerSignature}
      />
    </div>
  );
};
