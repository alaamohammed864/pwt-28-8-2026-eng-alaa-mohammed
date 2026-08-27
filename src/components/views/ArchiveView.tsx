import React, { useState } from 'react';
import { AnyPermit, PermitType, PermitStatus } from '../../types';

interface ArchiveViewProps {
  permits: AnyPermit[];
  onOpenPermit: (permit: AnyPermit) => void;
  onPrintPermit: (permit: AnyPermit) => void;
  onStatusChange: (id: string, newStatus: PermitStatus) => void;
}

export const ArchiveView: React.FC<ArchiveViewProps> = ({
  permits,
  onOpenPermit,
  onPrintPermit,
  onStatusChange,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [localSearch, setLocalSearch] = useState<string>('');

  const filtered = permits.filter((p) => {
    if (filterType !== 'ALL' && p.type !== filterType) return false;
    if (filterStatus !== 'ALL' && p.status !== filterStatus) return false;
    if (localSearch.trim()) {
      const q = localSearch.toLowerCase();
      const matchNo = p.permitNumber.toLowerCase().includes(q);
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchLocation = (p.areaLocation || '').toLowerCase().includes(q);
      const matchAuthor = (p.author || '').toLowerCase().includes(q);
      const matchEquipment = (p.equipment || '').toLowerCase().includes(q);
      return matchNo || matchTitle || matchLocation || matchAuthor || matchEquipment;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header & Filter Controls */}
      <div className="bg-[#0c0d18]/90 border border-white/10 rounded-xl p-5 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
            <span className="material-symbols-outlined text-cyan-400">inventory_2</span>
            Permit Master Registry & Archive
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            سجل التصاريح والشهادات المؤرشفة والنشطة لكافة وحدات المعمل
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Search box */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">
              search
            </span>
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search registry..."
              className="pl-8 pr-3 py-1.5 text-xs bg-white/[0.05] border border-white/15 rounded-lg text-slate-200 placeholder-slate-500 focus:bg-white/[0.08] focus:border-cyan-500/50 focus:outline-none transition-colors"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="form-input-industrial text-xs py-1.5 w-auto"
          >
            <option value="ALL">All Permit Types</option>
            <option value="HOT_WORK">Hot Work</option>
            <option value="COLD_WORK">Cold Work</option>
            <option value="CONFINED_SPACE">Confined Space</option>
            <option value="EXCAVATION">Excavation</option>
            <option value="MECHANICAL_ISOLATION">Mechanical</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="form-input-industrial text-xs py-1.5 w-auto"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Closed">Closed</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Table of Permits */}
      <div className="bg-[#0c0d18]/90 border border-white/10 rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-white/[0.04] text-slate-300 font-semibold border-b border-white/10">
              <tr>
                <th className="p-3.5">Permit Number</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Location & Equipment</th>
                <th className="p-3.5">Applicant / PA</th>
                <th className="p-3.5">Validity</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    <span className="material-symbols-outlined text-4xl mb-2 text-slate-600 block">inventory_2</span>
                    No permits match the selected criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3.5">
                      <button
                        onClick={() => onOpenPermit(p)}
                        className="font-mono font-bold text-cyan-300 hover:text-cyan-200 hover:underline text-xs flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-xs text-slate-400">launch</span>
                        {p.permitNumber}
                      </button>
                      <span className="text-[10px] text-slate-500 block font-mono">{p.date}</span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`material-symbols-outlined text-base ${
                            p.type === 'HOT_WORK'
                              ? 'text-amber-400'
                              : p.type === 'COLD_WORK'
                              ? 'text-cyan-400'
                              : p.type === 'CONFINED_SPACE'
                              ? 'text-rose-400'
                              : p.type === 'EXCAVATION'
                              ? 'text-amber-500'
                              : 'text-indigo-400'
                          }`}
                        >
                          {p.type === 'HOT_WORK'
                            ? 'local_fire_department'
                            : p.type === 'COLD_WORK'
                            ? 'ac_unit'
                            : p.type === 'CONFINED_SPACE'
                            ? 'warning'
                            : p.type === 'EXCAVATION'
                            ? 'construction'
                            : 'lock'}
                        </span>
                        <div>
                          <span className="font-semibold text-slate-200 block">{p.title}</span>
                          <span className="text-[10px] text-slate-400 font-arabic">{p.titleAr}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-slate-200 block">{p.areaLocation}</span>
                      <span className="text-[10px] text-cyan-300 font-mono">{p.equipment || 'General Site'}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-medium text-slate-200 block">{p.author}</span>
                      <span className="text-[10px] text-slate-400">{p.department}</span>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-400">
                      {p.validityStart ? p.validityStart.replace('T', ' ') : p.date}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === 'Active'
                            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                            : p.status === 'Pending'
                            ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                            : p.status === 'Closed'
                            ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-400'
                            : 'bg-white/10 border border-white/15 text-slate-300'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenPermit(p)}
                          className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-white/[0.08] rounded-lg transition-colors"
                          title="Open / Edit"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button
                          onClick={() => onPrintPermit(p)}
                          className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-white/[0.08] rounded-lg transition-colors"
                          title="Print Document"
                        >
                          <span className="material-symbols-outlined text-sm">print</span>
                        </button>
                        {p.status === 'Active' && (
                          <button
                            onClick={() => onStatusChange(p.id, 'Closed')}
                            className="px-2.5 py-1 text-[10px] font-bold text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/40 rounded-lg transition-colors"
                            title="Close permit upon job completion"
                          >
                            Close Job
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
