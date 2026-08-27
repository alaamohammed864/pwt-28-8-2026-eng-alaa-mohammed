import React, { useState } from 'react';
import { ColdWorkPermitData, DigitalSignature } from '../../types';
import { SignaturePadModal } from '../modals/SignaturePadModal';
import { SignatureCard } from '../common/SignatureCard';

interface ColdWorkPermitViewProps {
  permit: ColdWorkPermitData;
  onUpdatePermit: (updated: ColdWorkPermitData) => void;
  onPrint: () => void;
  onSubmitForApproval: () => void;
}

export const ColdWorkPermitView: React.FC<ColdWorkPermitViewProps> = ({
  permit,
  onUpdatePermit,
  onPrint,
  onSubmitForApproval,
}) => {
  const [data, setData] = useState<ColdWorkPermitData>(permit);
  const [activeSignRole, setActiveSignRole] = useState<'performing' | 'affected' | null>(null);

  const handleTextChange = (field: keyof ColdWorkPermitData, val: any) => {
    const updated = { ...data, [field]: val };
    setData(updated);
    onUpdatePermit(updated);
  };

  const handleHazardToggle = (key: keyof ColdWorkPermitData['hazards']) => {
    const updated = {
      ...data,
      hazards: {
        ...data.hazards,
        [key]: !data.hazards[key],
      },
    };
    setData(updated);
    onUpdatePermit(updated);
  };

  const handleHseToggle = (key: keyof ColdWorkPermitData['hseRequirements']) => {
    const updated = {
      ...data,
      hseRequirements: {
        ...data.hseRequirements,
        [key]: !data.hseRequirements[key],
      },
    };
    setData(updated);
    onUpdatePermit(updated);
  };

  const handleSaveSignature = (sig: DigitalSignature) => {
    let updated = { ...data };
    if (activeSignRole === 'performing') {
      updated.performingAuthoritySign = sig;
    } else if (activeSignRole === 'affected') {
      updated.affectedAreaAuthoritySign = sig;
      if (sig.signed) {
        updated.status = 'Active';
      }
    }
    setData(updated);
    onUpdatePermit(updated);
  };

  const handleClearSignature = (role: 'performing' | 'affected') => {
    let updated = { ...data };
    if (role === 'performing') {
      updated.performingAuthoritySign = {
        name: '',
        title: 'Performing Authority',
        date: '',
        signed: false,
      };
    } else {
      updated.affectedAreaAuthoritySign = {
        name: '',
        title: 'Area Authority',
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
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/40 text-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <span className="material-symbols-outlined text-2xl font-bold">ac_unit</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-100">Cold Work Permit</h1>
              <span className="text-xs font-semibold font-arabic text-cyan-400/80">(تصريح العمل البارد)</span>
              <span className="font-mono text-xs bg-white/10 text-cyan-300 px-2 py-0.5 rounded border border-white/15">
                {data.permitNumber}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Valid until: <span className="font-semibold text-slate-200">{data.validityEnd || '17:00 (Today)'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`px-3 py-1 text-xs font-bold rounded-full border ${
              data.status === 'Active'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : 'bg-white/10 border-white/15 text-slate-400'
            }`}
          >
            {data.status === 'Active' ? 'Active / ساري المفعول' : 'Draft / مسودة'}
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
            Submit for Approval
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Description of Work */}
          <div className="bg-[#0c0d18]/90 border border-white/10 rounded-xl overflow-hidden shadow-xl backdrop-blur-xl">
            <div className="bg-white/[0.04] px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <span className="font-bold text-xs text-cyan-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">description</span>
                1. Description of Work / توصيف العمل
              </span>
              <span className="text-[10px] text-slate-400">Section A</span>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Equipment / المعدة</label>
                  <input
                    type="text"
                    value={data.equipment || ''}
                    onChange={(e) => handleTextChange('equipment', e.target.value)}
                    className="form-input-industrial"
                    placeholder="e.g. Cooling Water Pump CWP-02A"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Location / الموقع</label>
                  <input
                    type="text"
                    value={data.areaLocation || ''}
                    onChange={(e) => handleTextChange('areaLocation', e.target.value)}
                    className="form-input-industrial"
                    placeholder="e.g. Sector 4B - Utility Area"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Start Date / Time</label>
                  <input
                    type="datetime-local"
                    value={data.validityStart || ''}
                    onChange={(e) => handleTextChange('validityStart', e.target.value)}
                    className="form-input-industrial"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">End Date / Time</label>
                  <input
                    type="datetime-local"
                    value={data.validityEnd || ''}
                    onChange={(e) => handleTextChange('validityEnd', e.target.value)}
                    className="form-input-industrial"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Task Description / تفاصيل العمل
                </label>
                <textarea
                  rows={3}
                  value={data.description || ''}
                  onChange={(e) => handleTextChange('description', e.target.value)}
                  className="form-input-industrial resize-none"
                  placeholder="Describe mechanical repairs, filter changes, scaffolding, inspection..."
                />
              </div>
            </div>
          </div>

          {/* Section 2: Hazards Identification */}
          <div className="bg-[#0c0d18]/90 border border-white/10 rounded-xl overflow-hidden shadow-xl backdrop-blur-xl">
            <div className="bg-white/[0.04] px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <span className="font-bold text-xs text-cyan-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-cyan-400">warning</span>
                2. Hazards Identification / تحديد المخاطر
              </span>
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'liquidGasPressure', label: 'Liquid / Gas Under Pressure', labelAr: 'سوائل أو غازات تحت ضغط' },
                { key: 'toxicMaterials', label: 'Toxic / Harmful Materials', labelAr: 'مواد سامة أو خطرة' },
                { key: 'flyingParticles', label: 'Flying Particles / Debris', labelAr: 'تطاير الشظايا والجسيمات' },
                { key: 'electricity', label: 'Electricity / Electrical Shock', labelAr: 'مخاطر كهربائية' },
                { key: 'rotatingMachinery', label: 'Rotating Machinery', labelAr: 'معدات وآلات دوارة' },
                { key: 'dangerOfFalling', label: 'Danger of Falling / Height', labelAr: 'مخاطر السقوط من ارتفاع' },
              ].map((h) => {
                const isChecked = data.hazards[h.key as keyof ColdWorkPermitData['hazards']];
                return (
                  <label
                    key={h.key}
                    onClick={() => handleHazardToggle(h.key as keyof ColdWorkPermitData['hazards'])}
                    className={`p-3 rounded-lg border cursor-pointer flex items-center gap-3 transition-colors ${
                      isChecked
                        ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                        : 'bg-white/[0.03] border-white/10 text-slate-400 hover:bg-white/[0.06]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="w-4 h-4 text-cyan-400 rounded focus:ring-0 cursor-pointer accent-cyan-500"
                    />
                    <div>
                      <span className="font-bold text-xs block text-slate-200">{h.label}</span>
                      <span className="text-[10px] text-slate-400 font-arabic">{h.labelAr}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 3: HSE Requirements */}
          <div className="bg-[#0c0d18]/90 border border-white/10 rounded-xl overflow-hidden shadow-xl backdrop-blur-xl">
            <div className="bg-white/[0.04] px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <span className="font-bold text-xs text-emerald-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-emerald-400">health_and_safety</span>
                3. HSE Precautions & PPE / متطلبات السلامة
              </span>
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'protectiveClothing', label: 'Protective Clothing / ملابس واقية' },
                { key: 'gogglesFaceShield', label: 'Goggles / Face Shield / نظارات وواقي وجه' },
                { key: 'handsProtection', label: 'Hand Protection / قفازات مناسبة' },
                { key: 'dustMask', label: 'Dust Mask / كمامة غبار' },
                { key: 'barriersWarningSigns', label: 'Barriers & Signs / حواجز ولافتات تحذير' },
              ].map((p) => {
                const isChecked = data.hseRequirements[p.key as keyof ColdWorkPermitData['hseRequirements']];
                return (
                  <label
                    key={p.key}
                    onClick={() => handleHseToggle(p.key as keyof ColdWorkPermitData['hseRequirements'])}
                    className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer p-2 rounded hover:bg-white/[0.03]"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="w-4 h-4 text-cyan-400 rounded accent-cyan-500"
                    />
                    <span>{p.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 4: Signatures */}
          <div className="bg-[#0c0d18]/90 border border-white/10 rounded-xl overflow-hidden shadow-xl backdrop-blur-xl">
            <div className="bg-white/[0.04] px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <span className="font-bold text-xs text-cyan-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">draw</span>
                4. Signatures & Approvals / التواقيع والاعتمادات الإلكترونية
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Verified Zero Energy State
              </span>
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SignatureCard
                roleTitle="Performing Authority (Lead Technician)"
                roleTitleAr="طالب التصريح / المنفذ الفني"
                signature={data.performingAuthoritySign}
                accentColor="cyan"
                onOpenPad={() => setActiveSignRole('performing')}
                onClear={() => handleClearSignature('performing')}
              />

              <SignatureCard
                roleTitle="Affected Area Authority (Operations)"
                roleTitleAr="مسؤول المنطقة والتشغيل / الاعتماد"
                signature={data.affectedAreaAuthoritySign}
                accentColor="emerald"
                onOpenPad={() => setActiveSignRole('affected')}
                onClear={() => handleClearSignature('affected')}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Visual Reference & Equipment Specs */}
        <div className="space-y-4">
          <div className="bg-[#0c0d18]/90 border border-white/10 rounded-xl p-5 shadow-xl backdrop-blur-xl">
            <h3 className="font-bold text-xs text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-cyan-400">tune</span>
              Cold Work Safety Reference
            </h3>

            <div className="bg-cyan-950/40 border border-cyan-500/30 rounded-lg p-3 text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-cyan-500 text-black flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                <span className="material-symbols-outlined text-2xl font-bold">build</span>
              </div>
              <p className="font-bold text-xs text-cyan-300">Mechanical Pump Isolations</p>
              <p className="text-[10px] text-slate-300 leading-tight">
                Verify zero energy state, depressurize discharge line, lock out suction valve, and drain casing prior to unbolting seal housing.
              </p>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="p-2.5 bg-white/[0.03] rounded-lg border border-white/5">
                <span className="font-bold text-cyan-400 block text-[11px]">Non-Sparking Hand Tools</span>
                <p className="text-[10px] text-slate-400">Beryllium-copper or bronze tools recommended when working near hydrocarbon flanges.</p>
              </div>
              <div className="p-2.5 bg-white/[0.03] rounded-lg border border-white/5">
                <span className="font-bold text-cyan-400 block text-[11px]">Pressure Relief & Drain</span>
                <p className="text-[10px] text-slate-400">Bleeder valve must be kept cracked open to catch any residual thermal expansion.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Signature Modal */}
      <SignaturePadModal
        isOpen={activeSignRole !== null}
        onClose={() => setActiveSignRole(null)}
        onSave={handleSaveSignature}
        title={activeSignRole === 'performing' ? 'Performing Authority Signature' : 'Area Authority Sign-off'}
        roleName={activeSignRole === 'performing' ? 'Performing Authority' : 'Area Authority'}
        defaultName={activeSignRole === 'performing' ? data.performingAuthoritySign.name : data.affectedAreaAuthoritySign.name}
        initialSignature={activeSignRole === 'performing' ? data.performingAuthoritySign : data.affectedAreaAuthoritySign}
      />
    </div>
  );
};
