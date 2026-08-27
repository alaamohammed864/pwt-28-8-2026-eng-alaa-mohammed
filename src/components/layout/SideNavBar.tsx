import React from 'react';
import { PermitType } from '../../types';

export type NavTab =
  | 'DASHBOARD'
  | 'HOT_WORK'
  | 'COLD_WORK'
  | 'CONFINED_SPACE'
  | 'EXCAVATION'
  | 'MECHANICAL_ISOLATION'
  | 'ISSUE_PERMIT'
  | 'ARCHIVE'
  | 'REPORTS';

interface SideNavBarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  counts: Record<string, number>;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const SideNavBar: React.FC<SideNavBarProps> = ({
  activeTab,
  onSelectTab,
  counts,
}) => {
  const mainPermitTypes: {
    id: NavTab;
    label: string;
    labelAr: string;
    icon: string;
    badgeCount?: number;
    color: string;
  }[] = [
    {
      id: 'DASHBOARD',
      label: 'Dashboard',
      labelAr: 'لوحة القيادة',
      icon: 'dashboard',
      color: 'text-[#003b72]',
    },
    {
      id: 'HOT_WORK',
      label: 'Hot Work',
      labelAr: 'عمل ساخن',
      icon: 'local_fire_department',
      badgeCount: counts['HOT_WORK'] || 1,
      color: 'text-[#fd8b00]',
    },
    {
      id: 'COLD_WORK',
      label: 'Cold Work',
      labelAr: 'عمل بارد',
      icon: 'ac_unit',
      badgeCount: counts['COLD_WORK'] || 1,
      color: 'text-blue-500',
    },
    {
      id: 'CONFINED_SPACE',
      label: 'Confined Space',
      labelAr: 'مكان محصور',
      icon: 'warning',
      badgeCount: counts['CONFINED_SPACE'] || 1,
      color: 'text-red-500',
    },
    {
      id: 'EXCAVATION',
      label: 'Excavation',
      labelAr: 'حفر',
      icon: 'construction',
      badgeCount: counts['EXCAVATION'] || 1,
      color: 'text-amber-700',
    },
    {
      id: 'MECHANICAL_ISOLATION',
      label: 'Mechanical',
      labelAr: 'ميكانيكي',
      icon: 'lock',
      badgeCount: counts['MECHANICAL_ISOLATION'] || 1,
      color: 'text-indigo-600',
    },
  ];

  const secondaryTabs: {
    id: NavTab;
    label: string;
    labelAr: string;
    icon: string;
  }[] = [
    {
      id: 'ARCHIVE',
      label: 'Archive',
      labelAr: 'سجل الأرشيف',
      icon: 'inventory_2',
    },
    {
      id: 'REPORTS',
      label: 'Reports',
      labelAr: 'التقارير والتحليلات',
      icon: 'bar_chart',
    },
  ];

  return (
    <aside className="w-64 bg-[#06060c] border-r border-white/10 flex flex-col justify-between shrink-0 min-h-[calc(100vh-53px)] select-none">
      <div className="p-3 space-y-3">
        {/* Header Tag */}
        <div className="px-2 pt-1 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-400 text-xl drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">shield</span>
            <div>
              <span className="font-bold text-xs text-slate-100 block tracking-wide uppercase">PTW Control</span>
              <span className="text-[10px] text-slate-400">Industrial Safety System</span>
            </div>
          </div>
        </div>

        {/* Primary CTA: Issue New Permit */}
        <button
          onClick={() => onSelectTab('ISSUE_PERMIT')}
          className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'ISSUE_PERMIT'
              ? 'bg-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.5)] ring-2 ring-amber-300'
              : 'bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-black shadow-[0_0_15px_rgba(6,182,212,0.35)]'
          }`}
        >
          <span className="material-symbols-outlined text-sm font-bold">add_circle</span>
          <span>+ Issue New Permit</span>
        </button>

        {/* Navigation Categories */}
        <div className="space-y-1">
          <p className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Permit Modules</p>
          {mainPermitTypes.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 via-cyan-500/10 to-transparent text-cyan-300 border-l-2 border-cyan-400 font-semibold shadow-[inset_0_0_12px_rgba(6,182,212,0.1)]'
                    : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`material-symbols-outlined text-lg ${
                      isActive ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]' : item.color
                    }`}
                  >
                    {item.icon}
                  </span>
                  <div className="text-left">
                    <span className="block text-xs leading-tight">{item.label}</span>
                    <span className={`block text-[10px] font-arabic ${isActive ? 'text-cyan-200/80' : 'text-slate-500'}`}>
                      {item.labelAr}
                    </span>
                  </div>
                </div>

                {item.badgeCount !== undefined && item.badgeCount > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-cyan-400 text-black font-mono'
                        : 'bg-white/10 text-slate-300 font-mono'
                    }`}
                  >
                    {item.badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Management & Analytics Section */}
        <div className="space-y-1 pt-2 border-t border-white/10">
          <p className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Management</p>
          {secondaryTabs.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 via-cyan-500/10 to-transparent text-cyan-300 border-l-2 border-cyan-400 font-semibold shadow-[inset_0_0_12px_rgba(6,182,212,0.1)]'
                    : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`material-symbols-outlined text-lg ${
                      isActive ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]' : 'text-slate-400'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <div className="text-left">
                    <span className="block text-xs leading-tight">{item.label}</span>
                    <span className={`block text-[10px] font-arabic ${isActive ? 'text-cyan-200/80' : 'text-slate-500'}`}>
                      {item.labelAr}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Safety Compliance Metric Widget at bottom */}
      <div className="p-3 m-2 bg-[#0c0d18] rounded-lg border border-white/10 shadow-xl text-xs space-y-1.5 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-200">Safety Compliance</span>
          <span className="font-bold text-emerald-400 text-xs font-mono drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]">98.5%</span>
        </div>
        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
          <div className="bg-emerald-400 h-full rounded-full w-[98.5%] shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
        </div>
        <p className="text-[9px] text-slate-400 text-center">Zero LTI Recorded: 342 Days</p>
      </div>
    </aside>
  );
};
