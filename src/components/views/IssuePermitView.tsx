import React, { useState } from 'react';
import { AnyPermit, PermitType } from '../../types';
import { checkPermitConflicts } from '../../utils/simopsConflictDetector';

interface IssuePermitViewProps {
  existingPermits?: AnyPermit[];
  onSaveNewPermit: (newPermit: AnyPermit) => void;
  onCancel: () => void;
}

export const IssuePermitView: React.FC<IssuePermitViewProps> = ({
  existingPermits = [],
  onSaveNewPermit,
  onCancel,
}) => {
  const [permitType, setPermitType] = useState<PermitType>('HOT_WORK');
  const [department, setDepartment] = useState('Maintenance (Mech)');
  const [site, setSite] = useState('North Plant');
  const [location, setLocation] = useState('Unit 44 - Process Deck');
  const [author, setAuthor] = useState('Tariq Al-Mansoor');
  const [contractor, setContractor] = useState('Apex Heavy Engineering');
  const [equipment, setEquipment] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().substring(0, 16));
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 8 * 3600 * 1000).toISOString().substring(0, 16)
  );

  // Live real-time SIMOPS conflict check
  const liveConflicts = checkPermitConflicts(
    {
      areaLocation: location,
      type: permitType,
      status: 'Active',
    },
    existingPermits
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const prefix =
      permitType === 'HOT_WORK'
        ? 'PTW-HW-'
        : permitType === 'COLD_WORK'
        ? 'PTW-CW-'
        : permitType === 'CONFINED_SPACE'
        ? 'CS-'
        : permitType === 'EXCAVATION'
        ? 'EX-'
        : permitType === 'MECHANICAL_ISOLATION'
        ? 'MEC-'
        : 'PTW-GEN-';

    const ptwNumber = `${prefix}${randomNum}`;
    const today = new Date().toISOString().split('T')[0];

    let base: any = {
      id: `ptw-${Date.now()}`,
      permitNumber: ptwNumber,
      type: permitType,
      title:
        permitType === 'HOT_WORK'
          ? 'Hot Work Permit'
          : permitType === 'COLD_WORK'
          ? 'Cold Work Permit'
          : permitType === 'CONFINED_SPACE'
          ? 'Confined Space Entry Certificate'
          : permitType === 'EXCAVATION'
          ? 'Excavation Certificate'
          : permitType === 'MECHANICAL_ISOLATION'
          ? 'Mechanical Isolation Certificate'
          : 'General Work Permit',
      titleAr:
        permitType === 'HOT_WORK'
          ? 'تصريح عمل ساخن'
          : permitType === 'COLD_WORK'
          ? 'تصريح عمل بارد'
          : permitType === 'CONFINED_SPACE'
          ? 'شهادة دخول مكان محصور'
          : permitType === 'EXCAVATION'
          ? 'شهادة حفر وأعمال أرضية'
          : permitType === 'MECHANICAL_ISOLATION'
          ? 'شهادة العزل الميكانيكي'
          : 'تصريح عمل عام',
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: author,
      department: department,
      site: site,
      areaLocation: location,
      date: today,
      validityStart: startDate,
      validityEnd: endDate,
      description: description || 'Routine maintenance and inspection according to approved method statement.',
      equipment: equipment || 'Standard Hand Tools',
      contractor: contractor,
    };

    if (permitType === 'HOT_WORK') {
      base = {
        ...base,
        hazards: {
          flammableGas: true,
          combustibleMaterials: true,
          sparksSlag: true,
          highTemperature: true,
        },
        ppe: {
          weldingMask: true,
          fireRetardantSuit: true,
          leatherGloves: true,
          faceShield: true,
        },
        precautions: {
          fireExtinguisherAtLocation: true,
          cleared10mRadius: true,
          fireWatchAppointed: true,
        },
        requestorSignature: {
          name: author,
          title: 'Authorized Technician',
          date: today,
          signed: true,
        },
        approverSignature: {
          name: 'Eng. Khalid Al-Otaibi',
          title: 'HSE Supervisor',
          date: today,
          signed: false,
        },
      };
    } else if (permitType === 'COLD_WORK') {
      base = {
        ...base,
        hazards: {
          liquidGasPressure: false,
          toxicMaterials: false,
          flyingParticles: true,
          electricity: true,
          rotatingMachinery: false,
          dangerOfFalling: false,
        },
        hseRequirements: {
          protectiveClothing: true,
          gogglesFaceShield: true,
          handsProtection: true,
          dustMask: false,
          barriersWarningSigns: true,
        },
        performingAuthoritySign: {
          name: author,
          title: 'Performing Authority',
          date: today,
          signed: true,
        },
        affectedAreaAuthoritySign: {
          name: 'Sami Al-Ghamdi',
          title: 'Area Operator',
          date: today,
          signed: false,
        },
      };
    } else if (permitType === 'CONFINED_SPACE') {
      base = {
        ...base,
        plantArea: location,
        vesselNo: equipment || 'V-102',
        preparation: {
          loto: 'Yes',
          purged: 'Yes',
          mechanicallyVentilated: 'Yes',
        },
        gasTests: [
          {
            gasType: 'Oxygen (O2)',
            arabicName: 'الأكسجين',
            acceptableRange: '19.5% - 23.5%',
            unit: '%',
            minSafe: 19.5,
            maxSafe: 23.5,
            reading: '20.9',
            time: '08:00',
            isSafe: true,
          },
          {
            gasType: 'Flammable (LEL)',
            arabicName: 'الغازات القابلة للاشتعال',
            acceptableRange: '< 5%',
            unit: '%',
            maxSafe: 5,
            reading: '0.0',
            time: '08:01',
            isSafe: true,
          },
        ],
        gasTesterName: 'Yousef Al-Khatib',
        deviceSerialNo: 'MX6-SN-44102',
        ppe: {
          safetyHarnessLifeline: true,
          breathingApparatus: true,
          chemicalSuit: false,
          gogglesFaceShield: true,
        },
        rescuePlan: {
          standbyPerson: 'Mansoor Qasim (Hole Watch)',
          communicationMethod: 'Two-way Radio',
          rescueTeamNotified: true,
        },
        approverSignature: {
          name: 'Lead Safety Inspector',
          title: 'HSE Space Inspector',
          date: today,
          signed: false,
        },
      };
    } else if (permitType === 'EXCAVATION') {
      base = {
        ...base,
        permitNumberReference: `PTW-${randomNum}`,
        purpose: description || 'Trench digging for underground utility piping',
        expectedDepth: 1.8,
        excavationMethod: 'Mixed / مختلط',
        undergroundServices: {
          electrical: true,
          telecom: true,
          pipingWaterGas: false,
        },
        shoringRequired: true,
        gasTestingRequired: false,
        requestorSignature: {
          name: author,
          title: 'Civil Contractor',
          date: today,
          signed: true,
        },
        safetyEngineerSignature: {
          name: 'Eng. Feras Naim',
          title: 'Geotechnical Safety Officer',
          date: today,
          signed: false,
        },
      };
    } else if (permitType === 'MECHANICAL_ISOLATION') {
      base = {
        ...base,
        tagNo: equipment || 'V-101 / K-101',
        reasonsForIsolation: description || 'Mechanical overhaul & valve replacement',
        natureOfWork: 'LOTO and positive mechanical isolation',
        performerSign: { name: author, date: today, signed: true },
        performingAuthoritySign: { name: 'Hassan Al-Dosari', date: today, signed: false },
        areaAuthoritySign: { name: 'Ibrahim Al-Binali', date: today, signed: false },
        isolationPoints: [
          {
            id: 'iso-1',
            valveTag: 'XV-1042',
            lo: false,
            lc: true,
            sp: false,
            b: false,
            di: false,
            isolatedBy: author,
            isolatedDate: today,
            verifiedBy: 'Area Authority',
            verifiedDate: today,
          },
        ],
        temporaryDeIsolation: { reason: '', requestedBy: '', approvedBy: '', status: 'None' },
        clearanceReinstatement: {
          declaredReady: false,
          performerSign: { name: '', date: '', signed: false },
          isolationAuthoritySign: { name: '', date: '', signed: false },
        },
      };
    }

    onSaveNewPermit(base);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-[#0c0d18]/90 border border-white/10 rounded-xl p-5 shadow-2xl backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <span className="material-symbols-outlined text-2xl font-bold">add_task</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100">Issue New Safety Permit / Certificate</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              إصدار تصريح عمل جديد وفق معايير السلامة الصناعية وإجراءات OSHA
            </p>
          </div>
        </div>

        <button
          onClick={onCancel}
          className="text-xs font-semibold text-slate-300 hover:text-white px-3.5 py-1.5 rounded-lg border border-white/15 hover:bg-white/[0.08] transition-colors"
        >
          Cancel
        </button>
      </div>

      {/* Form Wizard */}
      <form onSubmit={handleSubmit} className="bg-[#0c0d18]/90 border border-white/10 rounded-xl p-6 shadow-2xl backdrop-blur-xl space-y-6">
        {/* Select Permit Type */}
        <div>
          <label className="block text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3">
            1. Select Permit Category / اختر نوع التصريح
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              {
                id: 'HOT_WORK',
                name: 'Hot Work Permit',
                nameAr: 'تصريح عمل ساخن',
                icon: 'local_fire_department',
                accent: 'text-amber-400',
              },
              {
                id: 'COLD_WORK',
                name: 'Cold Work Permit',
                nameAr: 'تصريح عمل بارد',
                icon: 'ac_unit',
                accent: 'text-cyan-400',
              },
              {
                id: 'CONFINED_SPACE',
                name: 'Confined Space Certificate',
                nameAr: 'شهادة دخول مكان محصور',
                icon: 'warning',
                accent: 'text-rose-400',
              },
              {
                id: 'EXCAVATION',
                name: 'Excavation Certificate',
                nameAr: 'شهادة حفر وأعمال أرضية',
                icon: 'construction',
                accent: 'text-amber-500',
              },
              {
                id: 'MECHANICAL_ISOLATION',
                name: 'Mechanical Isolation',
                nameAr: 'شهادة العزل الميكانيكي',
                icon: 'lock',
                accent: 'text-indigo-400',
              },
              {
                id: 'GENERAL_PTW',
                name: 'General PTW',
                nameAr: 'تصريح عمل عام',
                icon: 'assignment',
                accent: 'text-slate-300',
              },
            ].map((t) => {
              const isSelected = permitType === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setPermitType(t.id as PermitType)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-cyan-500/10 border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/40'
                      : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]'
                  }`}
                >
                  <span className={`material-symbols-outlined text-2xl ${isSelected ? 'text-cyan-300' : t.accent} shrink-0 mt-0.5`}>
                    {t.icon}
                  </span>
                  <div>
                    <span className={`font-bold text-xs block ${isSelected ? 'text-cyan-200' : 'text-slate-200'}`}>{t.name}</span>
                    <span className="text-[10px] text-slate-400 font-arabic">{t.nameAr}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* General Details Form */}
        <div className="border-t border-white/10 pt-5 space-y-4">
          <label className="block text-xs font-bold text-cyan-400 uppercase tracking-wider">
            2. General & Operational Information / المعلومات العامة للموقع
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Department / القسم</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="form-input-industrial"
              >
                <option value="Maintenance (Mech)">Maintenance (Mech)</option>
                <option value="Electrical">Electrical</option>
                <option value="Instrumentation">Instrumentation</option>
                <option value="Civil & Infrastructure">Civil & Infrastructure</option>
                <option value="Process Operations">Process Operations</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Site / Facility</label>
              <select
                value={site}
                onChange={(e) => setSite(e.target.value)}
                className="form-input-industrial"
              >
                <option value="North Plant">North Plant</option>
                <option value="South Processing Unit">South Processing Unit</option>
                <option value="East Tank Farm">East Tank Farm</option>
                <option value="Offsite Utilities">Offsite Utilities</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Area / Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="form-input-industrial"
                placeholder="e.g. Unit 44 - Flare Deck"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Applicant Name / اسم مقدم الطلب</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="form-input-industrial"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Performing Contractor / المقاول</label>
              <input
                type="text"
                value={contractor}
                onChange={(e) => setContractor(e.target.value)}
                className="form-input-industrial"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Equipment / Tag Number</label>
              <input
                type="text"
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                className="form-input-industrial font-mono"
                placeholder="e.g. Pump P-101A, Vessel V-102"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Start Date & Time</label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="form-input-industrial"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">End Date & Time</label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="form-input-industrial"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Detailed Scope of Work / تفاصيل العمل والمنهجية
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input-industrial resize-none"
              placeholder="Provide complete details of work, equipment used, isolation boundaries, and personnel counts..."
              required
            />
          </div>
        </div>

        {/* Real-time SIMOPS Conflict Detection Warning */}
        {liveConflicts.length > 0 && (
          <div className="rounded-xl border p-4 bg-rose-950/40 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.2)] animate-fade-in space-y-2">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
              <span className="material-symbols-outlined text-base animate-pulse">emergency</span>
              <span>LIVE SIMOPS WARNING: Active Permit Overlap Detected in this Area!</span>
            </div>
            <p className="text-xs text-slate-300">
              There {liveConflicts.length === 1 ? 'is an existing active permit' : `are ${liveConflicts.length} active permits`} in{' '}
              <strong className="text-cyan-300">{location}</strong> that may present a severe simultaneous operations collision.
            </p>
            <div className="space-y-1.5 pt-1">
              {liveConflicts.map((c, i) => (
                <div key={i} className="text-xs bg-black/40 p-2.5 rounded-lg border border-white/10 flex items-start gap-2">
                  <span className="text-rose-400 font-bold font-mono">[{c.severity}]</span>
                  <div className="flex-1 text-slate-300">
                    <p className="font-semibold text-slate-200">{c.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{c.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-amber-400 font-semibold pt-1">
              ⚠️ Note: You can still submit this draft, but Area Authority joint SIMOPS sign-off will be strictly mandated before activation.
            </p>
          </div>
        )}

        {/* Submit Actions */}
        <div className="border-t border-white/10 pt-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.08] rounded-lg border border-white/15 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 text-xs font-bold text-black bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.35)] flex items-center gap-1.5 transition-all"
          >
            <span className="material-symbols-outlined text-sm font-bold">check_circle</span>
            Generate & Submit Permit / إنشاء التصريح
          </button>
        </div>
      </form>
    </div>
  );
};
