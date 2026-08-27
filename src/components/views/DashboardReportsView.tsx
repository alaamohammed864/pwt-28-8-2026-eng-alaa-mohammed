import React, { useState } from 'react';
import { DEPARTMENT_METRICS } from '../../data/mockPermits';
import { AnyPermit, SimopsConflict } from '../../types';

interface DashboardReportsViewProps {
  permits: AnyPermit[];
  simopsConflicts?: SimopsConflict[];
  onOpenPermit: (permit: AnyPermit) => void;
  onNavigateToIssue: () => void;
  onOpenConflictModal?: (conflict: SimopsConflict) => void;
}

export const DashboardReportsView: React.FC<DashboardReportsViewProps> = ({
  permits,
  simopsConflicts = [],
  onOpenPermit,
  onNavigateToIssue,
  onOpenConflictModal,
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'quarter' | 'year'>('30d');
  const [selectedDept, setSelectedDept] = useState<string>('all');

  const totalPermits = 1248;
  const complianceRate = 98.5;
  const avgApprovalTime = '42m';
  const incidentFreeDays = 342;

  // 30-day Trend simulated data points
  const trendData = [
    { day: 'Day 1', count: 24, safe: 24 },
    { day: 'Day 5', count: 32, safe: 32 },
    { day: 'Day 10', count: 28, safe: 28 },
    { day: 'Day 15', count: 45, safe: 44 },
    { day: 'Day 20', count: 38, safe: 38 },
    { day: 'Day 25', count: 52, safe: 51 },
    { day: 'Day 30', count: 48, safe: 48 },
  ];

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportExcel = () => {
    // Generate CSV export
    const headers = ['Permit No', 'Type', 'Title', 'Department', 'Location', 'Status', 'Date'];
    const rows = permits.map((p) => [
      p.permitNumber,
      p.type,
      p.title,
      p.department,
      p.areaLocation,
      p.status,
      p.date,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PTW_Safety_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header & Filter Controls matching screenshot */}
      <div className="bg-[#0c0d18]/90 border border-white/10 rounded-xl p-5 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span className="text-cyan-400">HSE Safety Analytics</span> & PTW Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time compliance monitoring, incident metrics, and permit issuance telemetry
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Time range toggle */}
          <div className="bg-white/[0.04] p-0.5 border border-white/10 rounded-lg flex text-xs font-semibold">
            {(['7d', '30d', 'quarter', 'year'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  timeRange === r
                    ? 'bg-cyan-500 text-black font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r === '7d' ? '7D' : r === '30d' ? '30D' : r === 'quarter' ? 'Quarter' : 'YTD'}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportExcel}
            className="px-3 py-1.5 text-xs font-semibold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">table_view</span>
            Export CSV / Excel
          </button>

          <button
            onClick={handleExportPDF}
            className="px-3 py-1.5 text-xs font-bold text-black bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.35)] flex items-center gap-1.5 transition-all"
          >
            <span className="material-symbols-outlined text-sm font-bold">picture_as_pdf</span>
            Print Executive Summary
          </button>
        </div>
      </div>

      {/* 4 Top KPI Cards matching screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Permits */}
        <div className="bg-[#0c0d18]/90 border border-white/10 rounded-xl p-4 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Permits Issued</span>
            <span className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.2)]">
              <span className="material-symbols-outlined text-lg">assignment</span>
            </span>
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono tracking-tight">{totalPermits.toLocaleString()}</div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
            <span className="material-symbols-outlined text-xs">trending_up</span>
            <span>+12.4% vs previous period</span>
          </div>
        </div>

        {/* Card 2: Safety Compliance */}
        <div className="bg-[#0c0d18]/90 border border-white/10 rounded-xl p-4 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Safety Compliance</span>
            <span className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              <span className="material-symbols-outlined text-lg">verified</span>
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono tracking-tight drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]">{complianceRate}%</div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
            <span className="material-symbols-outlined text-xs">arrow_upward</span>
            <span>+0.5% audit target achieved</span>
          </div>
        </div>

        {/* Card 3: Avg Approval Time */}
        <div className="bg-[#0c0d18]/90 border border-white/10 rounded-xl p-4 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Approval Time</span>
            <span className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.2)]">
              <span className="material-symbols-outlined text-lg">timer</span>
            </span>
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono tracking-tight drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">{avgApprovalTime}</div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
            <span className="material-symbols-outlined text-xs">bolt</span>
            <span>15m faster with digital sign</span>
          </div>
        </div>

        {/* Card 4: Incident-Free Days */}
        <div className="bg-[#0c0d18]/90 border border-white/10 rounded-xl p-4 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Incident-Free Days</span>
            <span className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.2)]">
              <span className="material-symbols-outlined text-lg">shield</span>
            </span>
          </div>
          <div className="text-2xl font-black text-purple-300 font-mono tracking-tight drop-shadow-[0_0_8px_rgba(192,132,252,0.4)]">{incidentFreeDays} <span className="text-xs font-normal text-slate-500">Days</span></div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-purple-400 font-semibold">
            <span className="material-symbols-outlined text-xs">military_tech</span>
            <span>Target: 365 Days (1 Year)</span>
          </div>
        </div>
      </div>

      {/* Middle Grid: Trend Chart & Status Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 30-Day Trend Chart */}
        <div className="lg:col-span-2 bg-[#0c0d18]/90 border border-white/10 rounded-xl p-5 shadow-xl backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-100">Permit Activity & Compliance Trend</h3>
              <p className="text-xs text-slate-400">Daily permits issued vs. verified closed with zero violations</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]"></span>
                <span className="text-slate-300 font-medium">Permits Issued</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span>
                <span className="text-slate-300 font-medium">Safety Passed</span>
              </div>
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="relative h-56 w-full pt-4">
            <svg viewBox="0 0 500 180" className="w-full h-full overflow-visible">
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="#1e293b" strokeWidth="1" />
              <line x1="40" y1="60" x2="480" y2="60" stroke="#1e293b" strokeWidth="1" />
              <line x1="40" y1="100" x2="480" y2="100" stroke="#1e293b" strokeWidth="1" />
              <line x1="40" y1="140" x2="480" y2="140" stroke="#1e293b" strokeWidth="1" />

              {/* Y Axis Labels */}
              <text x="30" y="24" textAnchor="end" fontSize="10" fill="#64748b">60</text>
              <text x="30" y="64" textAnchor="end" fontSize="10" fill="#64748b">45</text>
              <text x="30" y="104" textAnchor="end" fontSize="10" fill="#64748b">30</text>
              <text x="30" y="144" textAnchor="end" fontSize="10" fill="#64748b">15</text>

              {/* Area Gradient Fill */}
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area Path */}
              <polygon
                points="40,140 40,110 100,90 170,105 240,60 310,80 380,40 450,55 450,140"
                fill="url(#chartGrad)"
              />

              {/* Line Path */}
              <polyline
                points="40,110 100,90 170,105 240,60 310,80 380,40 450,55"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
              />

              {/* Points */}
              {[
                { x: 40, y: 110, val: 24, l: 'Day 1' },
                { x: 100, y: 90, val: 32, l: 'Day 5' },
                { x: 170, y: 105, val: 28, l: 'Day 10' },
                { x: 240, y: 60, val: 45, l: 'Day 15' },
                { x: 310, y: 80, val: 38, l: 'Day 20' },
                { x: 380, y: 40, val: 52, l: 'Day 25' },
                { x: 450, y: 55, val: 48, l: 'Day 30' },
              ].map((pt, i) => (
                <g key={i}>
                  <circle cx={pt.x} cy={pt.y} r="5" fill="#06b6d4" stroke="#050508" strokeWidth="2" className="drop-shadow-[0_0_6px_rgba(6,182,212,1)]" />
                  <text x={pt.x} y="160" textAnchor="middle" fontSize="10" fill="#94a3b8">{pt.l}</text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Right 1 Col: Status Donut / Breakdown */}
        <div className="bg-[#0c0d18]/90 border border-white/10 rounded-xl p-5 shadow-xl backdrop-blur-xl space-y-4">
          <h3 className="font-bold text-sm text-slate-100">Permit Status Breakdown</h3>
          
          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"></span> Active (45%)
                </span>
                <span className="font-mono text-slate-200">562 Permits</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full w-[45%] shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-cyan-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]"></span> Closed (30%)
                </span>
                <span className="font-mono text-slate-200">374 Permits</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-cyan-400 h-full w-[30%] shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-amber-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]"></span> Pending HSE Review (15%)
                </span>
                <span className="font-mono text-slate-200">187 Permits</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full w-[15%] shadow-[0_0_8px_rgba(251,191,36,0.8)]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-purple-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_6px_rgba(192,132,252,0.8)]"></span> Archived (10%)
                </span>
                <span className="font-mono text-slate-200">125 Permits</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-400 h-full w-[10%] shadow-[0_0_8px_rgba(192,132,252,0.8)]"></div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-white/[0.04] border border-white/10 rounded-lg text-xs space-y-1 mt-4">
            <span className="font-bold text-cyan-400 block">Continuous Safety Audit</span>
            <p className="text-[11px] text-slate-400">
              100% of high-risk permits underwent mandatory physical site walk-through before spark/entry execution.
            </p>
          </div>
        </div>
      </div>

      {/* Live SIMOPS & Area Conflict Telemetry */}
      <div className="bg-[#0c0d18]/90 border border-white/10 rounded-xl p-5 shadow-xl backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shadow-[0_0_12px_rgba(244,63,94,0.3)]">
              <span className="material-symbols-outlined text-lg">emergency</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                Simultaneous Operations (SIMOPS) Live Spatial Safety Engine
                {simopsConflicts.length > 0 ? (
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full font-mono font-bold">
                    {simopsConflicts.length} Active Hazard Overlap
                  </span>
                ) : (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono font-bold">
                    Zero Conflicts Detected
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400">
                Automated multi-activity boundary scanning (Hot Work spark buffer, Confined Space entry, Excavation proximity)
              </p>
            </div>
          </div>
        </div>

        {simopsConflicts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            {simopsConflicts.map((c) => (
              <div
                key={c.id}
                className="bg-black/40 border border-rose-500/30 rounded-xl p-4 space-y-3 relative overflow-hidden group hover:border-rose-500/60 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      {c.severity} RISK
                    </span>
                    <h4 className="font-bold text-xs text-slate-100 mt-1.5">{c.title}</h4>
                    <p className="text-[11px] text-cyan-300 flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-xs">location_on</span>
                      {c.areaLocation}
                    </p>
                  </div>
                  {onOpenConflictModal && (
                    <button
                      onClick={() => onOpenConflictModal(c)}
                      className="px-2.5 py-1 text-xs font-bold text-black bg-rose-400 hover:bg-rose-300 rounded shadow transition-all shrink-0"
                    >
                      Resolve
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{c.description}</p>

                <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-white/10 text-[11px]">
                  <span className="text-slate-400 font-semibold">Overlapping:</span>
                  {c.permits.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => onOpenPermit(p)}
                      className="px-2 py-0.5 rounded bg-white/[0.06] hover:bg-white/15 border border-white/10 text-cyan-300 font-mono font-bold transition-colors"
                    >
                      {p.permitNumber}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-emerald-400 text-2xl">verified_user</span>
              <div>
                <p className="text-xs font-bold text-emerald-300">All Plant Zones Clear of SIMOPS Clashes</p>
                <p className="text-[11px] text-slate-400">
                  No overlapping high-risk permits detected in the same physical zone coordinates.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Table: Department Performance Ranking */}
      <div className="bg-[#0c0d18]/90 border border-white/10 rounded-xl overflow-hidden shadow-xl backdrop-blur-xl">
        <div className="bg-white/[0.04] px-5 py-3 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-100">Department Safety & Permit Compliance Ranking</h3>
            <p className="text-[11px] text-slate-400">Audited metrics across plant engineering and maintenance divisions</p>
          </div>
          <button
            onClick={onNavigateToIssue}
            className="px-3 py-1.5 text-xs font-bold text-black bg-cyan-400 hover:bg-cyan-300 rounded-lg flex items-center gap-1 shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all"
          >
            <span className="material-symbols-outlined text-sm font-bold">add</span>
            Issue New Permit
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-white/[0.02] text-slate-400 font-semibold border-b border-white/10">
              <tr>
                <th className="p-3">Rank</th>
                <th className="p-3">Department / Division</th>
                <th className="p-3">Compliance Rate</th>
                <th className="p-3">Total Permits</th>
                <th className="p-3">Open Violations</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {DEPARTMENT_METRICS.map((dept, index) => (
                <tr key={dept.department} className="hover:bg-white/[0.04] transition-colors">
                  <td className="p-3 font-mono font-bold text-slate-500">#{index + 1}</td>
                  <td className="p-3 font-bold text-slate-200">{dept.department}</td>
                  <td className="p-3 font-mono font-semibold text-emerald-400">
                    <div className="flex items-center gap-2">
                      <span>{dept.compliance}%</span>
                      <div className="w-16 bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-400 h-full shadow-[0_0_6px_rgba(52,211,153,0.8)]" style={{ width: `${dept.compliance}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-mono text-slate-300">{dept.permits}</td>
                  <td className="p-3 font-mono font-bold text-emerald-400">0</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                      Grade A+ (Compliant)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
