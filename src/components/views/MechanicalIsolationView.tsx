import React, { useState } from 'react';
import { MechanicalIsolationPermitData, IsolationPoint, DigitalSignature } from '../../types';
import { SignaturePadModal } from '../modals/SignaturePadModal';
import { SignatureCard } from '../common/SignatureCard';

interface MechanicalIsolationViewProps {
  permit: MechanicalIsolationPermitData;
  onUpdatePermit: (updated: MechanicalIsolationPermitData) => void;
  onPrint: () => void;
  onSubmitForApproval: () => void;
}

export const MechanicalIsolationView: React.FC<MechanicalIsolationViewProps> = ({
  permit,
  onUpdatePermit,
  onPrint,
  onSubmitForApproval,
}) => {
  const [data, setData] = useState<MechanicalIsolationPermitData>(permit);
  const [activeSignRole, setActiveSignRole] = useState<'performer' | 'pa' | 'aa' | null>(null);

  const handleTextChange = (field: keyof MechanicalIsolationPermitData, val: any) => {
    const updated = { ...data, [field]: val };
    setData(updated);
    onUpdatePermit(updated);
  };

  const handleAddPoint = () => {
    const newPoint: IsolationPoint = {
      id: 'iso-' + (data.isolationPoints.length + 1),
      valveTag: 'XV-' + (1000 + data.isolationPoints.length * 10),
      lo: false,
      lc: true,
      sp: false,
      b: false,
      di: false,
      isolatedBy: data.performerSign.name || 'Technician',
      isolatedDate: new Date().toISOString().split('T')[0],
      verifiedBy: data.areaAuthoritySign.name || 'Area Auth',
      verifiedDate: new Date().toISOString().split('T')[0],
    };

    const updated = {
      ...data,
      isolationPoints: [...data.isolationPoints, newPoint],
    };
    setData(updated);
    onUpdatePermit(updated);
  };

  const handleRemovePoint = (index: number) => {
    const updatedPoints = data.isolationPoints.filter((_, i) => i !== index);
    const updated = { ...data, isolationPoints: updatedPoints };
    setData(updated);
    onUpdatePermit(updated);
  };

  const handleTogglePointFlag = (
    index: number,
    field: 'lo' | 'lc' | 'sp' | 'b' | 'di'
  ) => {
    const updatedPoints = [...data.isolationPoints];
    updatedPoints[index] = {
      ...updatedPoints[index],
      [field]: !updatedPoints[index][field],
    };
    const updated = { ...data, isolationPoints: updatedPoints };
    setData(updated);
    onUpdatePermit(updated);
  };

  const handleUpdatePointText = (index: number, field: keyof IsolationPoint, val: string) => {
    const updatedPoints = [...data.isolationPoints];
    updatedPoints[index] = {
      ...updatedPoints[index],
      [field]: val,
    };
    const updated = { ...data, isolationPoints: updatedPoints };
    setData(updated);
    onUpdatePermit(updated);
  };

  const handleSaveSignature = (sig: DigitalSignature) => {
    let updated = { ...data };
    if (activeSignRole === 'performer') updated.performerSign = sig;
    else if (activeSignRole === 'pa') updated.performingAuthoritySign = sig;
    else if (activeSignRole === 'aa') updated.areaAuthoritySign = sig;
    setData(updated);
    onUpdatePermit(updated);
  };

  const handleClearSignature = (role: 'performer' | 'pa' | 'aa') => {
    let updated = { ...data };
    if (role === 'performer') {
      updated.performerSign = {
        name: '',
        title: 'Senior Technician',
        date: '',
        signed: false,
      };
    } else if (role === 'pa') {
      updated.performingAuthoritySign = {
        name: '',
        title: 'Performing Authority',
        date: '',
        signed: false,
      };
    } else if (role === 'aa') {
      updated.areaAuthoritySign = {
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
          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.25)]">
            <span className="material-symbols-outlined text-2xl font-bold">lock</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-100">Mechanical & Process Isolation Certificate</h1>
              <span className="text-xs font-semibold font-arabic text-indigo-400/80">(شهادة العزل الميكانيكي)</span>
              <span className="font-mono text-xs bg-white/10 text-cyan-300 px-2 py-0.5 rounded border border-white/15">
                {data.permitNumber}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Equipment Tag: <span className="font-bold text-cyan-300 font-mono">{data.tagNo || 'V-101 / K-101'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            {data.status} (Verified Safe)
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
            <span className="material-symbols-outlined text-sm font-bold">lock_reset</span>
            Confirm Isolation
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Isolation Request & Plant Location */}
          <div className="bg-[#0c0d18]/90 border border-white/10 rounded-xl overflow-hidden shadow-xl backdrop-blur-xl">
            <div className="bg-white/[0.04] px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <span className="font-bold text-xs text-cyan-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">precision_manufacturing</span>
                1. Isolation Request Details / بيانات المعدة والعزل
              </span>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Equipment Description</label>
                  <input
                    type="text"
                    value={data.equipment || ''}
                    onChange={(e) => handleTextChange('equipment', e.target.value)}
                    className="form-input-industrial"
                    placeholder="e.g. Centrifugal Compressor K-101"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tag / Plant No</label>
                  <input
                    type="text"
                    value={data.tagNo}
                    onChange={(e) => handleTextChange('tagNo', e.target.value)}
                    className="form-input-industrial font-mono"
                    placeholder="V-101 / K-101"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Plant Location Area</label>
                  <input
                    type="text"
                    value={data.areaLocation || ''}
                    onChange={(e) => handleTextChange('areaLocation', e.target.value)}
                    className="form-input-industrial"
                    placeholder="Unit 44 - Compression"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Reasons for Isolation / أسباب العزل
                </label>
                <textarea
                  rows={2}
                  value={data.reasonsForIsolation || ''}
                  onChange={(e) => handleTextChange('reasonsForIsolation', e.target.value)}
                  className="form-input-industrial resize-none"
                  placeholder="e.g. Suction strainer replacement and line depressurization..."
                />
              </div>
            </div>
          </div>

          {/* Section 2: Isolation Points Matrix Table */}
          <div className="bg-[#0c0d18]/90 border border-white/10 rounded-xl overflow-hidden shadow-xl backdrop-blur-xl">
            <div className="bg-white/[0.04] px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <span className="font-bold text-xs text-cyan-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">checklist_rtl</span>
                2. Isolation Points Detail Matrix / جدول نقاط العزل
              </span>
              <button
                onClick={handleAddPoint}
                className="px-2.5 py-1 text-xs font-bold text-black bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 rounded-md flex items-center gap-1 shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all"
              >
                <span className="material-symbols-outlined text-sm font-bold">add</span>
                Add Point
              </button>
            </div>

            <div className="p-4 space-y-2">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-white/[0.04] text-slate-300 font-semibold border-b border-white/10">
                    <tr>
                      <th className="p-2.5">Valve / Tag No</th>
                      <th className="p-2.5 text-center" title="Locked Open">LO</th>
                      <th className="p-2.5 text-center" title="Locked Closed">LC</th>
                      <th className="p-2.5 text-center" title="Spade">SP</th>
                      <th className="p-2.5 text-center" title="Blind Flange">B</th>
                      <th className="p-2.5 text-center" title="Disconnect Instrument">DI</th>
                      <th className="p-2.5">Isolated By</th>
                      <th className="p-2.5">Verified By</th>
                      <th className="p-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {data.isolationPoints.map((pt, idx) => (
                      <tr key={pt.id} className="hover:bg-white/[0.02]">
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={pt.valveTag}
                            onChange={(e) => handleUpdatePointText(idx, 'valveTag', e.target.value)}
                            className="form-input-industrial font-mono font-semibold text-xs py-1"
                          />
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleTogglePointFlag(idx, 'lo')}
                            className={`w-6 h-6 rounded text-xs font-bold transition-colors ${
                              pt.lo ? 'bg-amber-500 text-black shadow-[0_0_8px_rgba(245,158,11,0.4)]' : 'bg-white/[0.05] text-slate-500 hover:bg-white/[0.1]'
                            }`}
                          >
                            {pt.lo ? '✓' : '-'}
                          </button>
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleTogglePointFlag(idx, 'lc')}
                            className={`w-6 h-6 rounded text-xs font-bold transition-colors ${
                              pt.lc ? 'bg-rose-500 text-white shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 'bg-white/[0.05] text-slate-500 hover:bg-white/[0.1]'
                            }`}
                          >
                            {pt.lc ? '✓' : '-'}
                          </button>
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleTogglePointFlag(idx, 'sp')}
                            className={`w-6 h-6 rounded text-xs font-bold transition-colors ${
                              pt.sp ? 'bg-indigo-500 text-white shadow-[0_0_8px_rgba(99,102,241,0.4)]' : 'bg-white/[0.05] text-slate-500 hover:bg-white/[0.1]'
                            }`}
                          >
                            {pt.sp ? '✓' : '-'}
                          </button>
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleTogglePointFlag(idx, 'b')}
                            className={`w-6 h-6 rounded text-xs font-bold transition-colors ${
                              pt.b ? 'bg-purple-500 text-white shadow-[0_0_8px_rgba(168,85,247,0.4)]' : 'bg-white/[0.05] text-slate-500 hover:bg-white/[0.1]'
                            }`}
                          >
                            {pt.b ? '✓' : '-'}
                          </button>
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleTogglePointFlag(idx, 'di')}
                            className={`w-6 h-6 rounded text-xs font-bold transition-colors ${
                              pt.di ? 'bg-cyan-500 text-black shadow-[0_0_8px_rgba(6,182,212,0.4)]' : 'bg-white/[0.05] text-slate-500 hover:bg-white/[0.1]'
                            }`}
                          >
                            {pt.di ? '✓' : '-'}
                          </button>
                        </td>
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={pt.isolatedBy}
                            onChange={(e) => handleUpdatePointText(idx, 'isolatedBy', e.target.value)}
                            className="form-input-industrial text-xs py-1"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={pt.verifiedBy}
                            onChange={(e) => handleUpdatePointText(idx, 'verifiedBy', e.target.value)}
                            className="form-input-industrial text-xs py-1"
                          />
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            onClick={() => handleRemovePoint(idx)}
                            className="text-rose-400 hover:text-rose-300 p-1 transition-colors"
                            title="Delete point"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center gap-4 text-[10px] text-slate-400 pt-1 flex-wrap">
                <span><strong className="text-amber-400">LO:</strong> Locked Open</span>
                <span><strong className="text-rose-400">LC:</strong> Locked Closed</span>
                <span><strong className="text-indigo-400">SP:</strong> Spade Inserted</span>
                <span><strong className="text-purple-400">B:</strong> Blind Flange</span>
                <span><strong className="text-cyan-400">DI:</strong> Disconnect Instruments</span>
              </div>
            </div>
          </div>

          {/* Section 3: Authorizations 3 Sign-offs */}
          <div className="bg-[#0c0d18]/90 border border-white/10 rounded-xl overflow-hidden shadow-xl backdrop-blur-xl">
            <div className="bg-white/[0.04] px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <span className="font-bold text-xs text-indigo-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">verified</span>
                3. Approvals & Verified Lockout / اعتماد وتوثيق العزل الميكانيكي
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                LOTO Zero-Energy Certified
              </span>
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <SignatureCard
                roleTitle="Isolation Performer"
                roleTitleAr="فني العزل الميداني"
                signature={data.performerSign}
                accentColor="cyan"
                onOpenPad={() => setActiveSignRole('performer')}
                onClear={() => handleClearSignature('performer')}
              />

              <SignatureCard
                roleTitle="Performing Authority"
                roleTitleAr="مسؤول الجهة المنفذة"
                signature={data.performingAuthoritySign}
                accentColor="emerald"
                onOpenPad={() => setActiveSignRole('pa')}
                onClear={() => handleClearSignature('pa')}
              />

              <SignatureCard
                roleTitle="Area Operations Authority"
                roleTitleAr="مسؤول منطقة العمليات"
                signature={data.areaAuthoritySign}
                accentColor="indigo"
                onOpenPad={() => setActiveSignRole('aa')}
                onClear={() => handleClearSignature('aa')}
              />
            </div>
          </div>
        </div>

        {/* Right Column: LOTO Tag & Security Procedure */}
        <div className="space-y-4">
          <div className="bg-[#0c0d18]/90 border border-white/10 rounded-xl p-5 shadow-xl backdrop-blur-xl">
            <h3 className="font-bold text-xs text-rose-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-rose-400">lock</span>
              LOTO Tagout Specimen
            </h3>

            {/* Visual Danger Tag */}
            <div className="border-2 border-rose-500 rounded-lg bg-rose-950/20 p-3 text-center space-y-2 shadow-[0_0_15px_rgba(244,63,94,0.2)] relative">
              <div className="w-5 h-5 mx-auto rounded-full border-2 border-slate-500 bg-slate-800 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-slate-400"></div>
              </div>
              <div className="bg-rose-600 text-white font-black text-xs py-1 rounded tracking-wider uppercase shadow-[0_0_10px_rgba(244,63,94,0.4)]">
                DANGER - DO NOT OPERATE
              </div>
              <div className="text-[11px] font-bold text-slate-200">
                THIS VALVE IS LOCKED OUT
              </div>
              <div className="text-[10px] text-slate-300 text-left bg-black/40 p-2.5 rounded-md border border-white/10 space-y-1 font-mono">
                <p><strong className="text-cyan-300">Tag No:</strong> {data.tagNo}</p>
                <p><strong className="text-cyan-300">Isolated By:</strong> {data.performerSign.name}</p>
                <p><strong className="text-cyan-300">Lock Box ID:</strong> LB-44-09</p>
                <p><strong className="text-cyan-300">Zero Energy Verified:</strong> Yes (Bleeders Open)</p>
              </div>
              <div className="text-[9px] text-rose-400 font-bold uppercase">
                Removal of this tag without authorization is a safety violation.
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="p-2.5 bg-white/[0.03] rounded-lg border border-white/5">
                <span className="font-bold text-cyan-400 block text-[11px]">Positive Blind Spectacle</span>
                <p className="text-[10px] text-slate-400">Double block and bleed or rated physical slip blind required on hydrocarbon lines.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SignaturePadModal
        isOpen={activeSignRole !== null}
        onClose={() => setActiveSignRole(null)}
        onSave={handleSaveSignature}
        title={
          activeSignRole === 'performer'
            ? 'Isolation Performer Sign-off'
            : activeSignRole === 'pa'
            ? 'Performing Authority Sign-off'
            : 'Area Operations Authority Final Authorization'
        }
        roleName={
          activeSignRole === 'performer'
            ? 'Senior Isolation Technician'
            : activeSignRole === 'pa'
            ? 'Performing Authority'
            : 'Area Operations Authority'
        }
        defaultName={
          activeSignRole === 'performer'
            ? data.performerSign.name
            : activeSignRole === 'pa'
            ? data.performingAuthoritySign.name
            : data.areaAuthoritySign.name
        }
        initialSignature={
          activeSignRole === 'performer'
            ? data.performerSign
            : activeSignRole === 'pa'
            ? data.performingAuthoritySign
            : data.areaAuthoritySign
        }
      />
    </div>
  );
};
