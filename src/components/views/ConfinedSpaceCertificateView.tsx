import React, { useState } from 'react';
import { ConfinedSpacePermitData, DigitalSignature } from '../../types';
import { SignaturePadModal } from '../modals/SignaturePadModal';
import { SignatureCard } from '../common/SignatureCard';

interface ConfinedSpaceCertificateViewProps {
  permit: ConfinedSpacePermitData;
  onUpdatePermit: (updated: ConfinedSpacePermitData) => void;
  onPrint: () => void;
  onSubmitForApproval: () => void;
}

export const ConfinedSpaceCertificateView: React.FC<ConfinedSpaceCertificateViewProps> = ({
  permit,
  onUpdatePermit,
  onPrint,
  onSubmitForApproval,
}) => {
  const [data, setData] = useState<ConfinedSpacePermitData>(permit);
  const [isSigning, setIsSigning] = useState(false);

  const handleTextChange = (field: keyof ConfinedSpacePermitData, val: any) => {
    const updated = { ...data, [field]: val };
    setData(updated);
    onUpdatePermit(updated);
  };

  const handlePrepChange = (field: keyof ConfinedSpacePermitData['preparation'], val: 'Yes' | 'NA' | 'No') => {
    const updated = {
      ...data,
      preparation: {
        ...data.preparation,
        [field]: val,
      },
    };
    setData(updated);
    onUpdatePermit(updated);
  };

  const handleGasReadingChange = (index: number, val: string) => {
    const newTests = [...data.gasTests];
    const item = { ...newTests[index], reading: val };
    const num = parseFloat(val);

    if (!isNaN(num)) {
      if (item.minSafe !== undefined && num < item.minSafe) item.isSafe = false;
      else if (item.maxSafe !== undefined && num > item.maxSafe) item.isSafe = false;
      else item.isSafe = true;
    }

    newTests[index] = item;
    const updated = { ...data, gasTests: newTests };
    setData(updated);
    onUpdatePermit(updated);
  };

  const handlePpeToggle = (key: keyof ConfinedSpacePermitData['ppe']) => {
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
    const updated = {
      ...data,
      approverSignature: sig,
      status: sig.signed ? ('Active' as const) : data.status,
    };
    setData(updated);
    onUpdatePermit(updated);
  };

  const handleClearSignature = () => {
    const updated = {
      ...data,
      approverSignature: {
        name: '',
        title: 'HSE Confined Space Inspector',
        date: '',
        signed: false,
      },
    };
    setData(updated);
    onUpdatePermit(updated);
  };

  const allGasesSafe = data.gasTests.every((g) => g.isSafe !== false);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner Bar with HIGH RISK Badge */}
      <div className="bg-[#0c0d18]/90 border border-white/10 rounded-xl p-5 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.3)]">
            <span className="material-symbols-outlined text-2xl font-bold">warning</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-100">Confined Space Entry Certificate</h1>
              <span className="text-xs font-semibold font-arabic text-rose-400/80">(شهادة دخول مكان محصور)</span>
              <span className="font-mono text-xs bg-white/10 text-cyan-300 px-2 py-0.5 rounded border border-white/15">
                {data.permitNumber}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Valid until: <span className="font-semibold text-slate-200">{data.validityEnd || '15:00 (Today)'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 text-[11px] font-black uppercase bg-rose-500/20 border border-rose-500/50 text-rose-400 rounded-lg tracking-wider animate-pulse flex items-center gap-1 shadow-[0_0_12px_rgba(244,63,94,0.3)]">
            <span className="material-symbols-outlined text-xs">shield</span>
            HIGH RISK
          </span>
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            {data.status}
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
            className="px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 rounded-lg shadow-[0_0_15px_rgba(244,63,94,0.4)] flex items-center gap-1.5 transition-all"
          >
            <span className="material-symbols-outlined text-sm">verified_user</span>
            Submit Certificate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols Form Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Area Location & Vessel Details */}
          <div className="bg-[#0c0d18]/90 border border-white/10 rounded-xl overflow-hidden shadow-xl backdrop-blur-xl">
            <div className="bg-white/[0.04] px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <span className="font-bold text-xs text-cyan-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">apartment</span>
                1. Area Location / Vessel Details / موقع وتفاصيل الوعاء
              </span>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Plant Area / منطقة المعمل</label>
                  <input
                    type="text"
                    value={data.plantArea || ''}
                    onChange={(e) => handleTextChange('plantArea', e.target.value)}
                    className="form-input-industrial"
                    placeholder="e.g. Unit 45 - Separators"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Vessel / Tank No / رقم الخزان</label>
                  <input
                    type="text"
                    value={data.vesselNo || ''}
                    onChange={(e) => handleTextChange('vesselNo', e.target.value)}
                    className="form-input-industrial"
                    placeholder="e.g. V-102 Storage Separator"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Entry Start Time</label>
                  <input
                    type="datetime-local"
                    value={data.validityStart || ''}
                    onChange={(e) => handleTextChange('validityStart', e.target.value)}
                    className="form-input-industrial"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Entry Expiry Time</label>
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
                  Purpose of Entry & Description / سبب الدخول
                </label>
                <textarea
                  rows={2}
                  value={data.description || ''}
                  onChange={(e) => handleTextChange('description', e.target.value)}
                  className="form-input-industrial resize-none"
                  placeholder="Details of visual inspection, tray cleaning, refractory repair, or sludge removal..."
                />
              </div>
            </div>
          </div>

          {/* Section 2: Preparation Prior Entry */}
          <div className="bg-[#0c0d18]/90 border border-white/10 rounded-xl overflow-hidden shadow-xl backdrop-blur-xl">
            <div className="bg-white/[0.04] px-4 py-3 border-b border-white/10">
              <span className="font-bold text-xs text-amber-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-amber-400">checklist</span>
                2. Preparation Prior Entry / التجهيزات المسبقة قبل الدخول
              </span>
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-white/[0.03] rounded-lg border border-white/10 space-y-2">
                <span className="text-xs font-bold text-slate-200 block">LOTO Applied</span>
                <span className="text-[10px] text-slate-400 block">العزل الكهربائي والميكانيكي</span>
                <div className="flex gap-2">
                  {(['Yes', 'NA', 'No'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handlePrepChange('loto', opt)}
                      className={`flex-1 py-1 text-xs font-bold rounded-md border transition-colors ${
                        data.preparation.loto === opt
                          ? opt === 'Yes'
                            ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                            : 'bg-rose-600 text-white border-rose-500'
                          : 'bg-white/[0.05] text-slate-300 border-white/10 hover:bg-white/[0.1]'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-white/[0.03] rounded-lg border border-white/10 space-y-2">
                <span className="text-xs font-bold text-slate-200 block">Purged / Flushed</span>
                <span className="text-[10px] text-slate-400 block">غسيل وتفريغ الغازات</span>
                <div className="flex gap-2">
                  {(['Yes', 'NA', 'No'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handlePrepChange('purged', opt)}
                      className={`flex-1 py-1 text-xs font-bold rounded-md border transition-colors ${
                        data.preparation.purged === opt
                          ? opt === 'Yes'
                            ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                            : 'bg-rose-600 text-white border-rose-500'
                          : 'bg-white/[0.05] text-slate-300 border-white/10 hover:bg-white/[0.1]'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-white/[0.03] rounded-lg border border-white/10 space-y-2">
                <span className="text-xs font-bold text-slate-200 block">Mechanically Ventilated</span>
                <span className="text-[10px] text-slate-400 block">تهوية مستمرة بالمروحة</span>
                <div className="flex gap-2">
                  {(['Yes', 'NA', 'No'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handlePrepChange('mechanicallyVentilated', opt)}
                      className={`flex-1 py-1 text-xs font-bold rounded-md border transition-colors ${
                        data.preparation.mechanicallyVentilated === opt
                          ? opt === 'Yes'
                            ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                            : 'bg-rose-600 text-white border-rose-500'
                          : 'bg-white/[0.05] text-slate-300 border-white/10 hover:bg-white/[0.1]'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Gas Testing Results (Live atmospheric validation) */}
          <div className="bg-[#0c0d18]/90 border border-white/10 rounded-xl overflow-hidden shadow-xl backdrop-blur-xl">
            <div className="bg-white/[0.04] px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <span className="font-bold text-xs text-emerald-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-emerald-400">air</span>
                3. Gas Testing Results / نتائج فحص الغازات في المكان
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${allGasesSafe ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/15 border-rose-500/30 text-rose-400'}`}>
                {allGasesSafe ? '✓ All Safe for Entry' : '⚠ UNSAFE ATMOSPHERE'}
              </span>
            </div>

            <div className="p-4 space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-white/[0.04] text-slate-300 font-semibold border-b border-white/10">
                    <tr>
                      <th className="p-2.5">Gas Type / نوع الغاز</th>
                      <th className="p-2.5">Safe Range / النطاق الآمن</th>
                      <th className="p-2.5 w-28">Reading / القراءة</th>
                      <th className="p-2.5 w-24">Time / الوقت</th>
                      <th className="p-2.5">Evaluation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {data.gasTests.map((test, idx) => (
                      <tr key={idx} className={test.isSafe === false ? 'bg-rose-500/10' : 'hover:bg-white/[0.02]'}>
                        <td className="p-2.5 font-medium">
                          <span className="block text-slate-200">{test.gasType}</span>
                          <span className="text-[10px] text-slate-400 font-arabic">{test.arabicName}</span>
                        </td>
                        <td className="p-2.5 font-mono text-cyan-300 font-semibold">{test.acceptableRange}</td>
                        <td className="p-2.5">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={test.reading}
                              onChange={(e) => handleGasReadingChange(idx, e.target.value)}
                              className={`w-16 px-2 py-1 text-xs font-mono font-bold rounded-md border ${
                                test.isSafe === false
                                  ? 'border-rose-500 text-rose-300 bg-rose-500/20'
                                  : 'border-white/15 text-slate-100 bg-black/40'
                              }`}
                            />
                            <span className="text-[10px] font-mono text-slate-400">{test.unit}</span>
                          </div>
                        </td>
                        <td className="p-2.5 font-mono text-slate-400">{test.time}</td>
                        <td className="p-2.5">
                          {test.isSafe !== false ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                              <span className="material-symbols-outlined text-xs">check</span> Safe
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-bold">
                              <span className="material-symbols-outlined text-xs">close</span> Danger!
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-0.5">Certified Gas Tester Name</label>
                  <input
                    type="text"
                    value={data.gasTesterName}
                    onChange={(e) => handleTextChange('gasTesterName', e.target.value)}
                    className="form-input-industrial text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-0.5">Gas Detector Serial / Calib. No</label>
                  <input
                    type="text"
                    value={data.deviceSerialNo}
                    onChange={(e) => handleTextChange('deviceSerialNo', e.target.value)}
                    className="form-input-industrial text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Mandatory PPE & Rescue Plan */}
          <div className="bg-[#0c0d18]/90 border border-white/10 rounded-xl overflow-hidden shadow-xl backdrop-blur-xl">
            <div className="bg-white/[0.04] px-4 py-3 border-b border-white/10">
              <span className="font-bold text-xs text-rose-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-rose-400">emergency</span>
                4. Mandatory PPE & Emergency Rescue Plan / خطة الطوارئ
              </span>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'safetyHarnessLifeline', label: 'Safety Full Body Harness & Lifeline / حزام وحبل إنقاذ' },
                  { key: 'breathingApparatus', label: 'Self-Contained Breathing Apparatus (SCBA) / جهاز تنفس' },
                  { key: 'chemicalSuit', label: 'Chemical / Acid Proof Suit / بدلة كيميائية واقية' },
                  { key: 'gogglesFaceShield', label: 'Safety Goggles & Hard Hat / نظارات وخوذة' },
                ].map((item) => {
                  const isChecked = data.ppe[item.key as keyof ConfinedSpacePermitData['ppe']];
                  return (
                    <label key={item.key} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer p-1.5 rounded hover:bg-white/[0.03]">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handlePpeToggle(item.key as keyof ConfinedSpacePermitData['ppe'])}
                        className="w-4 h-4 text-rose-500 rounded accent-rose-500"
                      />
                      <span>{item.label}</span>
                    </label>
                  );
                })}
              </div>

              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs space-y-2">
                <div className="flex items-center justify-between font-bold text-rose-300">
                  <span>Standby Attendant (Hole Watch) / مراقب الفتحة</span>
                  <span className="text-emerald-400 text-[11px]">✓ Must remain at entrance</span>
                </div>
                <input
                  type="text"
                  value={data.rescuePlan.standbyPerson}
                  onChange={(e) => {
                    const updated = {
                      ...data,
                      rescuePlan: { ...data.rescuePlan, standbyPerson: e.target.value },
                    };
                    setData(updated);
                    onUpdatePermit(updated);
                  }}
                  className="form-input-industrial text-xs"
                  placeholder="Assigned attendant name"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Authorization & Digital Sign-off */}
          <div className="bg-[#0c0d18]/90 border border-white/10 rounded-xl overflow-hidden shadow-xl backdrop-blur-xl">
            <div className="bg-white/[0.04] px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <span className="font-bold text-xs text-rose-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">draw</span>
                5. Safety Authorization & Sign-off / الاعتماد والتوقيع الرقمي
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Entry Permit Controller
              </span>
            </div>

            <div className="p-4">
              <SignatureCard
                roleTitle="HSE Confined Space Inspector / Entry Controller"
                roleTitleAr="مفتش ومراقب دخول الأماكن المحصورة"
                signature={data.approverSignature}
                accentColor="rose"
                onOpenPad={() => setIsSigning(true)}
                onClear={handleClearSignature}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Confined Space Safety Card & Visual */}
        <div className="space-y-4">
          <div className="bg-[#0c0d18]/90 border border-white/10 rounded-xl p-5 shadow-xl backdrop-blur-xl">
            <h3 className="font-bold text-xs text-rose-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">crisis_alert</span>
              Confined Space Golden Rules
            </h3>

            <div className="bg-rose-950/30 border border-rose-500/30 rounded-lg p-3 text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-rose-500 text-black flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.4)]">
                <span className="material-symbols-outlined text-2xl font-bold">sensors</span>
              </div>
              <p className="font-bold text-xs text-rose-300">Continuous Gas Monitoring</p>
              <p className="text-[10px] text-slate-300 leading-tight">
                Atmospheric checks must be re-tested every 2 hours or whenever work is suspended for more than 30 minutes.
              </p>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="p-2.5 bg-white/[0.03] rounded-lg border border-white/5">
                <span className="font-bold text-cyan-400 block text-[11px]">No Entry Without Attendant</span>
                <p className="text-[10px] text-slate-400">The hole watch is forbidden from entering the space to attempt rescue.</p>
              </div>
              <div className="p-2.5 bg-white/[0.03] rounded-lg border border-white/5">
                <span className="font-bold text-cyan-400 block text-[11px]">Positive Isolation</span>
                <p className="text-[10px] text-slate-400">All process inlets and outlets must have physical spectacle blinds inserted.</p>
              </div>
            </div>

            {/* Authorization button */}
            <div className="mt-4 pt-3 border-t border-white/10">
              <button
                onClick={() => setIsSigning(true)}
                className="w-full py-2 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-black font-bold text-xs rounded-lg shadow-[0_0_15px_rgba(244,63,94,0.35)] flex items-center justify-center gap-1.5 transition-all"
              >
                <span className="material-symbols-outlined text-sm font-bold">draw</span>
                {data.approverSignature.signed ? 'Update Safety Approval / تعديل' : 'Authorize Space Entry / توقيع واعتماد'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <SignaturePadModal
        isOpen={isSigning}
        onClose={() => setIsSigning(false)}
        onSave={handleSaveSignature}
        title="Confined Space Final Authorization"
        roleName="HSE Confined Space Inspector"
        defaultName={data.approverSignature.name}
        initialSignature={data.approverSignature}
      />
    </div>
  );
};
