import React from 'react';
import { AnyPermit } from '../../types';

interface PrintPermitModalProps {
  isOpen: boolean;
  onClose: () => void;
  permit: AnyPermit;
}

export const PrintPermitModal: React.FC<PrintPermitModalProps> = ({
  isOpen,
  onClose,
  permit,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#0c0d18] rounded-2xl shadow-2xl border border-white/15 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden backdrop-blur-2xl">
        {/* Top Control Bar (Hidden on Print) */}
        <div className="bg-white/[0.04] border-b border-white/10 text-slate-100 px-6 py-3.5 flex items-center justify-between no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">print</span>
            </div>
            <div>
              <span className="font-bold text-sm text-slate-100">Official Permit Print View / معاينة الطباعة الرسمية</span>
              <span className="ml-2 text-xs bg-white/10 text-cyan-300 px-2 py-0.5 rounded border border-white/15 font-mono">
                {permit.permitNumber}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-bold text-xs rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.35)] flex items-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-sm font-bold">print</span>
              Print Document (طـباعـة)
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        {/* Printable Paper Body */}
        <div className="p-8 overflow-y-auto bg-white text-black text-xs font-sans space-y-6">
          {/* Header Banner */}
          <div className="border-b-2 border-black pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#003b72] rounded flex items-center justify-center text-white font-bold text-lg">
                PTW
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight uppercase text-black">
                  INDUSTRIAL SAFETY & PERMIT TO WORK SYSTEM
                </h1>
                <p className="text-xs text-gray-700 font-semibold">
                  نظام تصاريح العمل والسلامة الصناعية المعتمد
                </p>
                <p className="text-[10px] text-gray-500 font-mono">
                  ISO 45001 / OSHA 1910 Compliance Standard
                </p>
              </div>
            </div>

            <div className="text-right border-l border-gray-300 pl-4">
              <div className="inline-block bg-gray-100 border border-gray-400 px-3 py-1 rounded font-mono font-bold text-sm">
                {permit.permitNumber}
              </div>
              <p className="text-[10px] text-gray-600 mt-1">STATUS: <span className="font-bold uppercase text-emerald-800">{permit.status}</span></p>
              <p className="text-[10px] text-gray-500">Date: {permit.date}</p>
            </div>
          </div>

          {/* Permit Title Bar */}
          <div className="bg-gray-100 border border-black p-2.5 flex items-center justify-between">
            <div>
              <span className="font-bold text-sm uppercase">{permit.title}</span>
              <span className="ml-2 font-bold text-xs text-gray-700 font-arabic">({permit.titleAr})</span>
            </div>
            <div className="text-xs font-mono font-semibold">
              Valid: {permit.validityStart || permit.date} → {permit.validityEnd || 'Shift End'}
            </div>
          </div>

          {/* Section 1: General Details */}
          <div className="border border-black">
            <div className="bg-gray-200 px-3 py-1 font-bold border-b border-black text-[11px] uppercase">
              1. General Information & Location / معلومات الموقع وتوصيف العمل
            </div>
            <div className="p-3 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <span className="text-gray-500 block text-[10px]">Plant / Site:</span>
                <span className="font-semibold">{permit.site || 'North Plant'}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">Area / Location:</span>
                <span className="font-semibold">{permit.areaLocation || 'Unit 44'}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">Department:</span>
                <span className="font-semibold">{permit.department}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">Applicant / Author:</span>
                <span className="font-semibold">{permit.author}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500 block text-[10px]">Equipment / Tag:</span>
                <span className="font-semibold">{permit.equipment || 'N/A'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500 block text-[10px]">Contractor / Performing Entity:</span>
                <span className="font-semibold">{permit.contractor || 'In-house Team'}</span>
              </div>
              <div className="col-span-4 bg-gray-50 p-2 border border-gray-200 rounded">
                <span className="text-gray-500 block text-[10px] mb-0.5">Description of Task / وصف العمل بالتفصيل:</span>
                <p className="font-medium text-[11px] leading-relaxed">{permit.description}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Specific Certificate Conditions */}
          {permit.type === 'HOT_WORK' && (
            <div className="border border-black">
              <div className="bg-amber-100 px-3 py-1 font-bold border-b border-black text-[11px] uppercase flex items-center justify-between">
                <span>2. Hot Work Hazards & Fire Precautions / مخاطر العمل واحتياطات الحريق</span>
                <span className="text-red-700 font-bold">10m Clear Radius Required</span>
              </div>
              <div className="p-3 grid grid-cols-2 gap-4">
                <div>
                  <span className="font-bold block text-gray-800 mb-1">Identified Hazards:</span>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                    <li>Flammable gas / vapor risk: <strong>{(permit as any).hazards?.flammableGas ? 'YES (Checked)' : 'NO'}</strong></li>
                    <li>Combustible materials present: <strong>{(permit as any).hazards?.combustibleMaterials ? 'YES' : 'NO'}</strong></li>
                    <li>Sparks, hot slag or open flame: <strong>{(permit as any).hazards?.sparksSlag ? 'YES' : 'NO'}</strong></li>
                  </ul>
                </div>
                <div>
                  <span className="font-bold block text-gray-800 mb-1">Safety Controls Verified:</span>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                    <li>Fire Extinguisher at work spot: <strong>{(permit as any).precautions?.fireExtinguisherAtLocation ? 'YES' : 'NO'}</strong></li>
                    <li>Continuous Fire Watch assigned: <strong>{(permit as any).precautions?.fireWatchAppointed ? 'YES' : 'NO'}</strong></li>
                    <li>Welding screen / Blanket deployed: <strong>{(permit as any).precautions?.cleared10mRadius ? 'YES' : 'NO'}</strong></li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {permit.type === 'CONFINED_SPACE' && (
            <div className="border border-black">
              <div className="bg-red-100 px-3 py-1 font-bold border-b border-black text-[11px] uppercase text-red-900 flex items-center justify-between">
                <span>2. Confined Space Gas Testing Log / سجل فحص الغازات في الموقع</span>
                <span className="font-bold">Entry Attendant Required</span>
              </div>
              <div className="p-3 space-y-2">
                <table className="w-full text-left border border-gray-400">
                  <thead className="bg-gray-100 border-b border-gray-400 text-[10px]">
                    <tr>
                      <th className="p-1 border-r border-gray-400">Gas Tested</th>
                      <th className="p-1 border-r border-gray-400">Acceptable Safe Limit</th>
                      <th className="p-1 border-r border-gray-400">Reading Result</th>
                      <th className="p-1 border-r border-gray-400">Time</th>
                      <th className="p-1">Safety Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {((permit as any).gasTests || []).map((gt: any, idx: number) => (
                      <tr key={idx} className="border-b border-gray-200">
                        <td className="p-1 border-r border-gray-300 font-medium">{gt.gasType}</td>
                        <td className="p-1 border-r border-gray-300 font-mono">{gt.acceptableRange}</td>
                        <td className="p-1 border-r border-gray-300 font-mono font-bold">{gt.reading} {gt.unit}</td>
                        <td className="p-1 border-r border-gray-300 font-mono">{gt.time}</td>
                        <td className="p-1 font-bold text-emerald-800">SAFE / معتمد</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="text-[10px] text-gray-600 flex justify-between">
                  <span>Gas Tester: <strong>{(permit as any).gasTesterName || 'Certified Technician'}</strong></span>
                  <span>Detector Serial: <strong>{(permit as any).deviceSerialNo || 'MX6-SN882'}</strong></span>
                </div>
              </div>
            </div>
          )}

          {permit.type === 'MECHANICAL_ISOLATION' && (
            <div className="border border-black">
              <div className="bg-purple-100 px-3 py-1 font-bold border-b border-black text-[11px] uppercase">
                2. Mechanical Isolation Points Matrix / نقاط العزل الميكانيكي
              </div>
              <div className="p-3">
                <table className="w-full text-left border border-gray-400 text-[10px]">
                  <thead className="bg-gray-100 border-b border-gray-400">
                    <tr>
                      <th className="p-1 border-r border-gray-400">Tag / Valve No</th>
                      <th className="p-1 border-r border-gray-400 text-center">LO</th>
                      <th className="p-1 border-r border-gray-400 text-center">LC</th>
                      <th className="p-1 border-r border-gray-400 text-center">SP</th>
                      <th className="p-1 border-r border-gray-400 text-center">B</th>
                      <th className="p-1 border-r border-gray-400">Isolated By</th>
                      <th className="p-1">Verified By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {((permit as any).isolationPoints || []).map((pt: any, idx: number) => (
                      <tr key={idx} className="border-b border-gray-200">
                        <td className="p-1 border-r border-gray-300 font-mono font-bold">{pt.valveTag}</td>
                        <td className="p-1 border-r border-gray-300 text-center font-bold">{pt.lo ? '✓' : '-'}</td>
                        <td className="p-1 border-r border-gray-300 text-center font-bold">{pt.lc ? '✓' : '-'}</td>
                        <td className="p-1 border-r border-gray-300 text-center font-bold">{pt.sp ? '✓' : '-'}</td>
                        <td className="p-1 border-r border-gray-300 text-center font-bold">{pt.b ? '✓' : '-'}</td>
                        <td className="p-1 border-r border-gray-300">{pt.isolatedBy}</td>
                        <td className="p-1">{pt.verifiedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 3: Official Signatures Block */}
          <div className="border border-black">
            <div className="bg-gray-200 px-3 py-1 font-bold border-b border-black text-[11px] uppercase">
              3. Approvals & Authorizations / التوقيعات والاعتمادات الرسمية
            </div>
            <div className="grid grid-cols-2 divide-x divide-black p-3">
              <div className="pr-4 space-y-2">
                <span className="font-bold text-[11px] block">Performing Authority / طالب التصريح</span>
                <div className="bg-gray-50 border border-gray-300 p-2 rounded h-20 flex flex-col justify-between">
                  <span className="font-semibold text-xs">{permit.author || 'Senior Technician'}</span>
                  <div className="flex justify-between items-end text-[10px] text-gray-500 font-mono">
                    <span>Signed digitally</span>
                    <span>Date: {permit.date}</span>
                  </div>
                </div>
              </div>

              <div className="pl-4 space-y-2">
                <span className="font-bold text-[11px] block">Area Authority / HSE Supervisor / مسؤول السلامة والمنطقة</span>
                <div className="bg-gray-50 border border-gray-300 p-2 rounded h-20 flex flex-col justify-between">
                  <span className="font-semibold text-xs">
                    {(permit as any).approverSignature?.name || (permit as any).affectedAreaAuthoritySign?.name || 'Eng. Khalid Al-Otaibi'}
                  </span>
                  <div className="flex justify-between items-end text-[10px] text-gray-500 font-mono">
                    <span className="text-emerald-800 font-bold">APPROVED & AUTHORIZED</span>
                    <span>Stamp: HSE-CERT-01</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="border-t border-dashed border-gray-400 pt-3 flex items-center justify-between text-[9px] text-gray-500">
            <span>Security Document Verification ID: {permit.id}-SEC-2024</span>
            <span>Keep this physical copy visibly posted at the work site at all times.</span>
            <span>Page 1 of 1</span>
          </div>
        </div>
      </div>
    </div>
  );
};
