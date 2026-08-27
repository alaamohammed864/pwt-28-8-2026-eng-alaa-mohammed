import React, { useState } from 'react';
import { NotificationItem, SimopsConflict } from '../../types';
import { OfflineStatusIndicator } from '../common/OfflineStatusIndicator';

interface TopNavBarProps {
  onSearch: (query: string) => void;
  searchQuery: string;
  notifications: NotificationItem[];
  simopsConflicts?: SimopsConflict[];
  onOpenConflictModal?: (conflict: SimopsConflict) => void;
  onOpenHelp: () => void;
  lang: 'en' | 'ar';
  onToggleLang: () => void;
  isRtl: boolean;
  onToggleRtl: () => void;
  isOnline?: boolean;
  isSimulatedOffline?: boolean;
  cachedCount?: number;
  onOpenOfflineDiagnostics?: () => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  onSearch,
  searchQuery,
  notifications,
  simopsConflicts = [],
  onOpenConflictModal,
  onOpenHelp,
  lang,
  onToggleLang,
  isRtl,
  onToggleRtl,
  isOnline = true,
  isSimulatedOffline = false,
  cachedCount = 0,
  onOpenOfflineDiagnostics,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const criticalConflicts = simopsConflicts.filter((c) => c.severity === 'CRITICAL');
  const hasConflicts = simopsConflicts.length > 0;

  return (
    <header className="bg-[#06060c]/90 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30 px-4 md:px-6 py-2.5 flex items-center justify-between shadow-2xl">
      {/* Brand & Left Section */}
      <div className="flex items-center gap-3 md:gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            <span className="material-symbols-outlined text-lg">verified_user</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 text-sm tracking-tight">PTW Manager</span>
              <span className="text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.2 rounded font-mono">v3.4 PRO</span>
            </div>
            <p className="text-[11px] text-slate-400 font-arabic hidden sm:block">
              نظام تصاريح العمل والسلامة الصناعية
            </p>
          </div>
        </div>

        {/* Global Plant Status or Live SIMOPS Warning */}
        {hasConflicts ? (
          <button
            onClick={() => onOpenConflictModal && onOpenConflictModal(simopsConflicts[0])}
            className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-lg border text-[11px] font-bold transition-all shadow-lg cursor-pointer ${
              criticalConflicts.length > 0
                ? 'bg-rose-500/15 border-rose-500/50 text-rose-300 hover:bg-rose-500/25 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                : 'bg-amber-500/15 border-amber-500/50 text-amber-300 hover:bg-amber-500/25 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
            <span className="material-symbols-outlined text-sm font-bold">emergency</span>
            <span>
              SIMOPS CONFLICT: {simopsConflicts.length} Active in {simopsConflicts[0].areaLocation}
            </span>
            <span className="material-symbols-outlined text-xs">launch</span>
          </button>
        ) : (
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-400 text-[11px] font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]"></span>
            <span>Plant 4: Zone Green (Zero SIMOPS Clashes)</span>
          </div>
        )}
      </div>

      {/* Center Search Input */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search permit #, equipment, location, contractor..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-white/[0.04] border border-white/10 rounded-md text-slate-200 placeholder-slate-500 focus:bg-white/[0.08] focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {/* Offline Cache Status Badge */}
        {onOpenOfflineDiagnostics && (
          <OfflineStatusIndicator
            isOnline={isOnline}
            isSimulatedOffline={isSimulatedOffline}
            cachedCount={cachedCount}
            onOpenDiagnostics={onOpenOfflineDiagnostics}
          />
        )}

        {/* Language / RTL Switcher */}
        <button
          onClick={onToggleLang}
          className="px-2.5 py-1 text-xs font-semibold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded flex items-center gap-1 transition-colors"
          title="Toggle Language / تغيير اللغة"
        >
          <span className="material-symbols-outlined text-sm">translate</span>
          <span>{lang === 'en' ? 'العربية' : 'English'}</span>
        </button>

        {/* RTL Toggle button */}
        <button
          onClick={onToggleRtl}
          className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-white/[0.05] rounded border border-transparent hover:border-white/10 transition-colors"
          title="Toggle RTL/LTR Direction"
        >
          <span className="material-symbols-outlined text-sm">
            {isRtl ? 'format_textdirection_l_to_r' : 'format_textdirection_r_to_l'}
          </span>
        </button>

        {/* Safety Guidelines Help Button */}
        <button
          onClick={onOpenHelp}
          className="px-2.5 py-1 text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded flex items-center gap-1 transition-colors shadow-[0_0_10px_rgba(245,158,11,0.15)]"
          title="HSE Guidelines and Golden Rules"
        >
          <span className="material-symbols-outlined text-sm text-amber-400">menu_book</span>
          <span className="hidden sm:inline">HSE Guide</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-1.5 text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] rounded border border-transparent hover:border-white/10 transition-colors"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-lg">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(244,63,94,0.7)]">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#0c0d18] rounded-lg shadow-2xl border border-white/15 p-2 z-50 animate-fade-in backdrop-blur-xl">
              <div className="flex items-center justify-between pb-2 border-b border-white/10 px-2">
                <span className="font-bold text-xs text-cyan-400">Notifications & Alerts</span>
                <span className="text-[10px] text-slate-400">{notifications.length} total</span>
              </div>
              <div className="divide-y divide-white/5 max-h-72 overflow-y-auto mt-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 text-xs hover:bg-white/[0.04] transition-colors rounded ${
                      !n.read ? 'bg-cyan-500/[0.06] border-l-2 border-cyan-400' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className={`material-symbols-outlined text-sm shrink-0 mt-0.5 ${
                          n.type === 'warning'
                            ? 'text-amber-400'
                            : n.type === 'alert'
                            ? 'text-rose-400'
                            : n.type === 'success'
                            ? 'text-emerald-400'
                            : 'text-cyan-400'
                        }`}
                      >
                        {n.type === 'warning' ? 'warning' : n.type === 'alert' ? 'error' : n.type === 'success' ? 'check_circle' : 'info'}
                      </span>
                      <div>
                        <p className="font-bold text-slate-200 text-[11px]">{n.title}</p>
                        <p className="text-slate-400 text-[10px] leading-tight mt-0.5">{n.message}</p>
                        <span className="text-[9px] text-slate-500 mt-1 block">{n.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded hover:bg-white/[0.05] border border-transparent hover:border-white/10 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center text-xs font-bold font-mono">
              TM
            </div>
            <div className="hidden lg:block text-left text-xs">
              <span className="font-bold text-slate-200 block leading-tight">Tariq M.</span>
              <span className="text-[10px] text-slate-400">Lead HSE Officer</span>
            </div>
            <span className="material-symbols-outlined text-xs text-slate-400">expand_more</span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-[#0c0d18] rounded-lg shadow-2xl border border-white/15 p-1.5 z-50 text-xs backdrop-blur-xl">
              <div className="p-2 border-b border-white/10 mb-1">
                <p className="font-bold text-cyan-400">Tariq Al-Mansoor</p>
                <p className="text-[10px] text-slate-400">HSE Department — Zone 4</p>
                <span className="inline-block mt-1 text-[9px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-1.5 py-0.2 rounded font-semibold">
                  Authorized Signatory (Level 3)
                </span>
              </div>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onOpenHelp();
                }}
                className="w-full text-left px-2 py-1.5 hover:bg-white/[0.05] rounded flex items-center gap-2 text-slate-300"
              >
                <span className="material-symbols-outlined text-sm text-cyan-400">verified</span>
                <span>HSE Credentials & Badges</span>
              </button>
              <button
                onClick={() => setShowUserMenu(false)}
                className="w-full text-left px-2 py-1.5 hover:bg-white/[0.05] rounded flex items-center gap-2 text-slate-300"
              >
                <span className="material-symbols-outlined text-sm text-slate-400">tune</span>
                <span>Audit & System Logs</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
