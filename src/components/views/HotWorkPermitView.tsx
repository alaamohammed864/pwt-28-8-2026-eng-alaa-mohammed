import React, { useState } from 'react';
import { HotWorkPermitData, DigitalSignature } from '../../types';
import { SignaturePadModal } from '../modals/SignaturePadModal';
import { SignatureCard } from '../common/SignatureCard';

interface HotWorkPermitViewProps {
  permit: HotWorkPermitData;
  onUpdatePermit: (updated: HotWorkPermitData) => void;
  onPrint: () => void;
  onSubmitForApproval: () => void;
}

export const HotWorkPermitView: React.FC<HotWorkPermitViewProps> = ({
  permit,
  onUpdatePermit,
  onPrint,
  onSubmitForApproval,
}) => {
  const [data, setData] = useState<HotWorkPermitData>(permit);
  const [activeSignRole, setActiveSignRole] = useState<'requestor' | 'approver' | null>(null);

  const handleTextChange = (field: keyof HotWorkPermitData, val: any) => {
    const updated = { ...data, [field]: val };
    setData(updated);
    onUpdatePermit(updated);
  };

  const handleHazardToggle = (hazardKey: keyof HotWorkPermitData['hazards']) => {
    const updated = {
      ...data,
      hazards: {
        ...data.hazards,
        [hazardKey]: !data.hazards[hazardKey],
      },
    };
    setData(updated);
    onUpdatePermit(updated);
  };

  const handlePrecautionToggle = (key: keyof HotWorkPermitData['precautions']) => {
    const updated = {
      ...data,
      precautions: {
        ...data.precautions,
        [key]: !data.precautions[key],
      },
    };
    setData(updated);
    onUpdatePermit(updated);
  };

  const handlePpeToggle = (key: keyof HotWorkPermitData['ppe']) => {
    const updated = {
      ...data,
      ppe: {
        ...data.ppe,
        [key]: !data.ppe[key],
      },
    };
    setData(updated);
    onUpdatePermit(updated);
  };

  const handleSaveSignature = (sig: DigitalSignature) => {
    let updated = { ...data };
    if (activeSignRole === 'requestor') {
      updated.requestorSignature = sig;
    } else if (activeSignRole === 'approver') {
      updated.approverSignature = sig;
      if (sig.signed) {
        updated.status = 'Active';
      }
    }
    setData(updated);
    onUpdatePermit(updated);
  };

  const handleClearSignature = (role: 'requestor' | 'approver') => {
    let updated = { ...data };
    if (role === 'requestor') {
      updated.requestorSignature = {
        name: '',
        title: 'Performing Authority',
        date: '',
        signed: false,
      };
    } else {
      updated.approverSignature = {
        name: '',
        title: 'HSE Area Supervisor',
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
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <span className="material-symbols-outlined text-2xl font-bold">local_fire_department</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-100">Hot Work Permit</h1>
              <span className="text-xs font-semibold font-arabic text-amber-400/80">(تصريح عمل ساخن)</span>
              <span className="font-mono text-xs bg-white/10 text-cyan-300 px-2 py-0.5 rounded border border-white/15">
                {data.permitNumber}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Valid until: <span className="font-semibold text-slate-200">{data.validityEnd || '18:00 (Today)'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`px-3 py-1 text-xs font-bold rounded-full border ${
              data.status === 'Active'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : data.status === 'Pending'
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                : 'bg-white/10 border-white/15 text-slate-400'
            }`}
          >
            {data.status === 'Active' ? 'Active / ساري المفعول' : data.status === 'Pending' ? 'Pending Approval' : 'Draft / مسودة'}
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
            className="px-4 py-1.5 text-xs font-bold text-black bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.35)] flex items-center gap-1.5 transition-all"
          >
            <span className="material-symbols-outlined text-sm font-bold">send</span>
            Submit for Approval
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main 2-column Form Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Description of Work */}
          <div className="bg-[#0c0d18]/90 border border-white/10 rounded-xl overflow-hidden shadow-xl backdrop-blur-xl">
            <div className="bg-white/[0.04] px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <span className="font-bold text-xs text-cyan-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">description</span>
                1. Description of Work / توصيف العمل
              </span>
              <span className="text-[10px] text-slate-400">Form Section A</span>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Equipment / المعدات</label>
                  <input
                    type="text"
                    value={data.equipment || ''}
                    onChange={(e) => handleTextChange('equipment', e.target.value)}
                    className="form-input-industrial"
                    placeholder="e.g. Welding Set #4, Oxy-acetylene torch"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Location / الموقع</label>
                  <input
                    type="text"
                    value={data.areaLocation || ''}
                    onChange={(e) => handleTextChange('areaLocation', e.target.value)}
                    className="form-input-industrial"
                    placeholder="e.g. Sector 4B - Pipe Rack Platform"
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
                  Task Description / تفاصيل العمل المطلوب
                </label>
                <textarea
                  rows={3}
                  value={data.description || ''}
                  onChange={(e) => handleTextChange('description', e.target.value)}
                  className="form-input-industrial resize-none"
                  placeholder="Provide precise details of welding, cutting, grinding, or open-flame operations..."
                />
              </div>
            </div>
          </div>

          {/* Section 2: Hazards Identification */}
          <div className="bg-[#0c0d18]/90 border border-white/10 rounded-xl overflow-hidden shadow-xl backdrop-blur-xl">
            <div className="bg-white/[0.04] px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <span className="font-bold text-xs text-amber-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-amber-400">warning</span>
                2. Hazards Identification / تحديد المخاطر
              </span>
              <span className="text-[10px] text-amber-400/80 font-semibold">Select all that apply</span>
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                onClick={() => handleHazardToggle('flammableGas')}
                className={`p-3 rounded-lg border cursor-pointer flex items-center gap-3 transition-colors ${
                  data.hazards.flammableGas
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                    : 'bg-white/[0.03] border-white/10 text-slate-400 hover:bg-white/[0.06]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={data.hazards.flammableGas}
                  onChange={() => {}}
                  className="w-4 h-4 text-amber-400 rounded focus:ring-0 cursor-pointer accent-amber-500"
                />
                <div>
                  <span className="font-bold text-xs block text-slate-200">Flammable Gas / Vapor</span>
                  <span className="text-[10px] text-slate-400 font-arabic">غازات أو أبخرة قابلة للاشتعال</span>
                </div>
              </label>

              <label
                onClick={() => handleHazardToggle('combustibleMaterials')}
                className={`p-3 rounded-lg border cursor-pointer flex items-center gap-3 transition-colors ${
                  data.hazards.combustibleMaterials
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                    : 'bg-white/[0.03] border-white/10 text-slate-400 hover:bg-white/[0.06]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={data.hazards.combustibleMaterials}
                  onChange={() => {}}
                  className="w-4 h-4 text-amber-400 rounded focus:ring-0 cursor-pointer accent-amber-500"
                />
                <div>
                  <span className="font-bold text-xs block text-slate-200">Combustible Materials</span>
                  <span className="text-[10px] text-slate-400 font-arabic">مواد قابلة للاحتراق</span>
                </div>
              </label>

              <label
                onClick={() => handleHazardToggle('sparksSlag')}
                className={`p-3 rounded-lg border cursor-pointer flex items-center gap-3 transition-colors ${
                  data.hazards.sparksSlag
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                    : 'bg-white/[0.03] border-white/10 text-slate-400 hover:bg-white/[0.06]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={data.hazards.sparksSlag}
                  onChange={() => {}}
                  className="w-4 h-4 text-amber-400 rounded focus:ring-0 cursor-pointer accent-amber-500"
                />
                <div>
                  <span className="font-bold text-xs block text-slate-200">Sparks / Hot Slag</span>
                  <span className="text-[10px] text-slate-400 font-arabic">تطاير الشرر والخبث الساخن</span>
                </div>
              </label>

              <label
                onClick={() => handleHazardToggle('highTemperature')}
                className={`p-3 rounded-lg border cursor-pointer flex items-center gap-3 transition-colors ${
                  data.hazards.highTemperature
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                    : 'bg-white/[0.03] border-white/10 text-slate-400 hover:bg-white/[0.06]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={data.hazards.highTemperature}
                  onChange={() => {}}
                  className="w-4 h-4 text-amber-400 rounded focus:ring-0 cursor-pointer accent-amber-500"
                />
                <div>
                  <span className="font-bold text-xs block text-slate-200">High Temperature Surfaces</span>
                  <span className="text-[10px] text-slate-400 font-arabic">أسطح ومعدات ذات حرارة عالية</span>
                </div>
              </label>
            </div>
          </div>

          {/* Section 3: Safety Requirements */}
          <div className="bg-[#0c0d18]/90 border border-white/10 rounded-xl overflow-hidden shadow-xl backdrop-blur-xl">
            <div className="bg-white/[0.04] px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <span className="font-bold text-xs text-emerald-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-emerald-400">verified</span>
                3. Safety Requirements & PPE / متطلبات السلامة والوقاية
              </span>
            </div>

            <div className="p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer p-2 rounded hover:bg-white/[0.03]">
                  <input
                    type="checkbox"
                    checked={data.precautions.fireExtinguisherAtLocation}
                    onChange={() => handlePrecautionToggle('fireExtinguisherAtLocation')}
                    className="w-4 h-4 text-cyan-400 rounded accent-cyan-500"
                  />
                  <span>Fire Extinguisher at Location / طفاية حريق بالموقع</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer p-2 rounded hover:bg-white/[0.03]">
                  <input
                    type="checkbox"
                    checked={data.precautions.cleared10mRadius}
                    onChange={() => handlePrecautionToggle('cleared10mRadius')}
                    className="w-4 h-4 text-cyan-400 rounded accent-cyan-500"
                  />
                  <span>10m Radius Cleared / إخلاء نطاق 10 أمتار</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer p-2 rounded hover:bg-white/[0.03]">
                  <input
                    type="checkbox"
                    checked={data.precautions.fireWatchAppointed}
                    onChange={() => handlePrecautionToggle('fireWatchAppointed')}
                    className="w-4 h-4 text-cyan-400 rounded accent-cyan-500"
                  />
                  <span>Continuous Fire Watch / مراقب حريق مخصص</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer p-2 rounded hover:bg-white/[0.03]">
                  <input
                    type="checkbox"
                    checked={data.ppe.weldingMask}
                    onChange={() => handlePpeToggle('weldingMask')}
                    className="w-4 h-4 text-cyan-400 rounded accent-cyan-500"
                  />
                  <span>Welding Mask & Leather Gloves / قناع لحام وقفازات</span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 4: Authorizations & Signatures */}
          <div className="bg-[#0c0d18]/90 border border-white/10 rounded-xl overflow-hidden shadow-xl backdrop-blur-xl">
            <div className="bg-white/[0.04] px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <span className="font-bold text-xs text-cyan-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">draw</span>
                4. Authorizations & Digital Signatures / الاعتمادات والتواقيع الإلكترونية
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                OSHA 1910.119 PSM Compliant
              </span>
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Requestor / Performing Authority */}
              <SignatureCard
                roleTitle="Performing Authority (Requestor)"
                roleTitleAr="طالب التصريح / المنفذ المسؤول"
                signature={data.requestorSignature}
                accentColor="cyan"
                onOpenPad={() => setActiveSignRole('requestor')}
                onClear={() => handleClearSignature('requestor')}
              />

              {/* Approver / HSE Lead */}
              <SignatureCard
                roleTitle="HSE Area Supervisor (Final Approver)"
                roleTitleAr="مسؤول السلامة والمنطقة / الاعتماد النهائي"
                signature={data.approverSignature}
                accentColor="amber"
                onOpenPad={() => setActiveSignRole('approver')}
                onClear={() => handleClearSignature('approver')}
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar: Visual Reference Card Matching Screenshot */}
        <div className="space-y-4">
          <div className="bg-[#0c0d18]/90 border border-white/10 rounded-xl p-5 shadow-xl backdrop-blur-xl">
            <h3 className="font-bold text-xs text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-amber-400">emergency</span>
              Hot Work Safety Envelope
            </h3>

            {/* Visual SVG Diagram of 10m Hot Work Zone */}
            <div className="bg-black/50 border border-amber-500/30 rounded-lg p-4 text-center">
              <svg viewBox="0 0 200 160" className="w-full h-36 mx-auto">
                {/* 10m Outer Radius Circle */}
                <circle cx="100" cy="80" r="65" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 3" />
                <circle cx="100" cy="80" r="30" fill="rgba(244, 63, 94, 0.15)" stroke="#f43f5e" strokeWidth="1.5" />
                
                {/* Center Spark Element */}
                <circle cx="100" cy="80" r="8" fill="#f59e0b" className="shadow-[0_0_10px_rgba(245,158,11,1)]" />
                <text x="100" y="83" textAnchor="middle" fill="#000000" fontSize="8" fontWeight="bold">🔥</text>

                {/* Fire Watch icon position */}
                <circle cx="145" cy="55" r="9" fill="#06b6d4" />
                <text x="145" y="58" textAnchor="middle" fill="#000000" fontSize="8">👀</text>
                <text x="145" y="70" textAnchor="middle" fill="#06b6d4" fontSize="7" fontWeight="bold">Fire Watch</text>

                {/* Extinguisher icon position */}
                <circle cx="55" cy="105" r="9" fill="#f43f5e" />
                <text x="55" y="108" textAnchor="middle" fill="#ffffff" fontSize="8">🧯</text>
                <text x="55" y="120" textAnchor="middle" fill="#f43f5e" fontSize="7" fontWeight="bold">Extinguisher</text>

                {/* Distance Dimension Line */}
                <line x1="100" y1="80" x2="165" y2="80" stroke="#06b6d4" strokeWidth="1" />
                <text x="130" y="76" textAnchor="middle" fill="#06b6d4" fontSize="8" fontWeight="bold">10m Radius</text>
              </svg>

              <div className="mt-2 text-xs font-bold text-amber-300">
                10-Meter Combustible Clearance
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                All combustible materials, floor drains, and flammable tanks must be covered or isolated within 10 meters.
              </p>
            </div>

            <div className="mt-4 space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2 p-2 bg-white/[0.03] border border-white/5 rounded-lg">
                <span className="material-symbols-outlined text-sm text-cyan-400 shrink-0 mt-0.5">timer</span>
                <div>
                  <span className="font-semibold block text-slate-200">Fire Watch Duration</span>
                  <span className="text-[11px] text-slate-400">Minimum 30 minutes post-work continuous surveillance.</span>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 bg-white/[0.03] border border-white/5 rounded-lg">
                <span className="material-symbols-outlined text-sm text-cyan-400 shrink-0 mt-0.5">local_gas_station</span>
                <div>
                  <span className="font-semibold block text-slate-200">LEL Requirement</span>
                  <span className="text-[11px] text-slate-400">Gas detector must show 0% LEL prior to striking any arc.</span>
                </div>
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
        title={activeSignRole === 'requestor' ? 'Requestor Digital Sign-off' : 'HSE Supervisor Final Authorization'}
        roleName={activeSignRole === 'requestor' ? 'Performing Authority' : 'Lead HSE Officer'}
        defaultName={activeSignRole === 'requestor' ? data.requestorSignature.name : data.approverSignature.name}
        initialSignature={activeSignRole === 'requestor' ? data.requestorSignature : data.approverSignature}
      />
    </div>
  );
};
