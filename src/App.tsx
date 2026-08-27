import React, { useState, useEffect, useMemo } from 'react';
import {
  AnyPermit,
  HotWorkPermitData,
  ColdWorkPermitData,
  ConfinedSpacePermitData,
  ExcavationPermitData,
  MechanicalIsolationPermitData,
  NotificationItem,
  PermitStatus,
  SimopsConflict,
} from './types';
import { INITIAL_PERMITS, INITIAL_NOTIFICATIONS } from './data/mockPermits';
import { TopNavBar } from './components/layout/TopNavBar';
import { SideNavBar, NavTab } from './components/layout/SideNavBar';
import { HotWorkPermitView } from './components/views/HotWorkPermitView';
import { ColdWorkPermitView } from './components/views/ColdWorkPermitView';
import { ConfinedSpaceCertificateView } from './components/views/ConfinedSpaceCertificateView';
import { ExcavationCertificateView } from './components/views/ExcavationCertificateView';
import { MechanicalIsolationView } from './components/views/MechanicalIsolationView';
import { DashboardReportsView } from './components/views/DashboardReportsView';
import { IssuePermitView } from './components/views/IssuePermitView';
import { ArchiveView } from './components/views/ArchiveView';
import { SafetyGuidelinesModal } from './components/modals/SafetyGuidelinesModal';
import { PrintPermitModal } from './components/modals/PrintPermitModal';
import { SimopsAlertBanner } from './components/alerts/SimopsAlertBanner';
import { SimopsConflictModal } from './components/modals/SimopsConflictModal';
import { OfflineModeBanner } from './components/alerts/OfflineModeBanner';
import { OfflineDiagnosticsModal } from './components/modals/OfflineDiagnosticsModal';
import { detectAllSimopsConflicts } from './utils/simopsConflictDetector';
import {
  registerServiceWorker,
  syncPermitsToOfflineCache,
  fetchCachedPermitsFromCache,
} from './utils/offlineServiceWorker';

export const App: React.FC = () => {
  // Persistence state
  const [permits, setPermits] = useState<AnyPermit[]>(() => {
    try {
      const saved = localStorage.getItem('ptw_permits_data');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read from local storage', e);
    }
    return INITIAL_PERMITS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('ptw_notifications_data');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read notifications from local storage', e);
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [activeTab, setActiveTab] = useState<NavTab>('DASHBOARD');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [isRtl, setIsRtl] = useState<boolean>(false);

  // Offline Service Worker & Connectivity State
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => {
    try {
      return localStorage.getItem('ptw_last_offline_sync') || null;
    } catch (_) {
      return null;
    }
  });
  const [showOfflineModal, setShowOfflineModal] = useState<boolean>(false);

  // Modals state
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [printPermit, setPrintPermit] = useState<AnyPermit | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeConflictForModal, setActiveConflictForModal] = useState<SimopsConflict | null>(null);

  // Register Service Worker on initial startup & hydrate from offline cache if needed
  useEffect(() => {
    registerServiceWorker();

    // Check if we can recover permits from CacheStorage if localStorage was wiped
    if (permits.length === 0) {
      fetchCachedPermitsFromCache().then((cached) => {
        if (cached && cached.length > 0) {
          setPermits(cached);
          showToast(`Restored ${cached.length} permits from offline Service Worker cache.`);
        }
      });
    }

    const handleOnline = () => {
      setIsOnline(true);
      showToast('Network restored. Live synchronization reconnected.');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('Connection lost. Operating in Service Worker Offline Cache mode.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Proactively sync permits to Service Worker CacheStorage whenever permits change
  useEffect(() => {
    syncPermitsToOfflineCache(permits).then((res) => {
      if (res.success) {
        setLastSyncTime(res.timestamp);
      }
    });
  }, [permits]);

  // Real-time SIMOPS conflict calculation
  const simopsConflicts = useMemo(() => {
    return detectAllSimopsConflicts(permits);
  }, [permits]);

  // Sync notifications with detected conflicts if new critical conflicts appear
  useEffect(() => {
    if (simopsConflicts.length > 0) {
      const primary = simopsConflicts[0];
      const notifId = `simops-notif-${primary.id}`;
      
      setNotifications((prev) => {
        if (prev.some((n) => n.id === notifId)) return prev;
        const newNotif: NotificationItem = {
          id: notifId,
          title: `⚠️ ${primary.title}`,
          message: primary.description,
          time: 'Active Now',
          type: primary.severity === 'CRITICAL' ? 'alert' : 'warning',
          read: false,
        };
        return [newNotif, ...prev];
      });
    }
  }, [simopsConflicts]);

  // Save to localStorage whenever permits change
  useEffect(() => {
    try {
      localStorage.setItem('ptw_permits_data', JSON.stringify(permits));
    } catch (e) {
      console.error(e);
    }
  }, [permits]);

  useEffect(() => {
    try {
      localStorage.setItem('ptw_notifications_data', JSON.stringify(notifications));
    } catch (e) {
      console.error(e);
    }
  }, [notifications]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleForceCacheSync = async () => {
    const res = await syncPermitsToOfflineCache(permits);
    if (res.success) {
      setLastSyncTime(res.timestamp);
      showToast(`Synchronized ${res.count} permits to Service Worker CacheStorage.`);
    }
  };

  const handleUpdatePermit = (updated: AnyPermit) => {
    setPermits((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    showToast(`Updated permit ${updated.permitNumber}`);
  };

  const handleSaveNewPermit = (newPermit: AnyPermit) => {
    setPermits((prev) => [newPermit, ...prev]);
    showToast(`Successfully issued permit ${newPermit.permitNumber}`);
    
    // Add notification
    const newNotif: NotificationItem = {
      id: 'notif-' + Date.now(),
      title: `New Permit Issued: ${newPermit.permitNumber}`,
      message: `${newPermit.title} created for ${newPermit.areaLocation}`,
      time: 'Just now',
      type: 'info',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Navigate to respective category
    setActiveTab(newPermit.type as NavTab);
  };

  const handleStatusChange = (id: string, newStatus: PermitStatus) => {
    setPermits((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );
    showToast(`Permit status changed to ${newStatus}`);
  };

  const handleOpenPermitFromArchive = (permit: AnyPermit) => {
    setActiveTab(permit.type as NavTab);
  };

  // Find active permit object for the current tab
  const getActivePermitForType = (type: string) => {
    return permits.find((p) => p.type === type) || permits[0];
  };

  // Counts for sidebar badges
  const counts: Record<string, number> = {
    HOT_WORK: permits.filter((p) => p.type === 'HOT_WORK' && p.status !== 'Closed').length,
    COLD_WORK: permits.filter((p) => p.type === 'COLD_WORK' && p.status !== 'Closed').length,
    CONFINED_SPACE: permits.filter((p) => p.type === 'CONFINED_SPACE' && p.status !== 'Closed').length,
    EXCAVATION: permits.filter((p) => p.type === 'EXCAVATION' && p.status !== 'Closed').length,
    MECHANICAL_ISOLATION: permits.filter((p) => p.type === 'MECHANICAL_ISOLATION' && p.status !== 'Closed').length,
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#050508] text-slate-200 flex flex-col font-sans antialiased selection:bg-cyan-500 selection:text-black relative overflow-x-hidden"
    >
      {/* Background Ambient Neon Glow Orbs */}
      <div className="fixed -top-32 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="fixed -bottom-32 -left-32 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none z-0"></div>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0c0d18]/95 backdrop-blur-md text-slate-100 px-4 py-2.5 rounded-lg shadow-2xl border border-cyan-500/40 flex items-center gap-2 animate-bounce text-xs font-semibold glow-cyan">
          <span className="material-symbols-outlined text-base text-cyan-400">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <TopNavBar
        searchQuery={searchQuery}
        onSearch={(q) => {
          setSearchQuery(q);
          if (q.trim()) setActiveTab('ARCHIVE');
        }}
        notifications={notifications}
        simopsConflicts={simopsConflicts}
        onOpenConflictModal={(c) => setActiveConflictForModal(c)}
        onOpenHelp={() => setShowHelpModal(true)}
        lang={lang}
        onToggleLang={() => {
          const next = lang === 'en' ? 'ar' : 'en';
          setLang(next);
          setIsRtl(next === 'ar');
        }}
        isRtl={isRtl}
        onToggleRtl={() => setIsRtl(!isRtl)}
        isOnline={isOnline}
        isSimulatedOffline={isSimulatedOffline}
        cachedCount={permits.length}
        onOpenOfflineDiagnostics={() => setShowOfflineModal(true)}
      />

      {/* Offline Mode Banner for Remote Field Contexts */}
      <OfflineModeBanner
        isOnline={isOnline}
        isSimulatedOffline={isSimulatedOffline}
        cachedPermitsCount={permits.length}
        lastSyncTime={lastSyncTime}
        onOpenDiagnostics={() => setShowOfflineModal(true)}
        onDisableSimulation={() => setIsSimulatedOffline(false)}
      />

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Sidebar */}
        <SideNavBar
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          counts={counts}
        />

        {/* Dynamic Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-[#050508]/60 backdrop-blur-xs">
          {/* SIMOPS Conflict Alert Banner at the top of the workspace */}
          <SimopsAlertBanner
            conflicts={simopsConflicts}
            onOpenConflictModal={(conflict) => setActiveConflictForModal(conflict)}
            onOpenPermit={(p) => setActiveTab(p.type as NavTab)}
          />

          {activeTab === 'DASHBOARD' && (
            <DashboardReportsView
              permits={permits}
              simopsConflicts={simopsConflicts}
              onOpenConflictModal={(c) => setActiveConflictForModal(c)}
              onOpenPermit={(p) => {
                setActiveTab(p.type as NavTab);
              }}
              onNavigateToIssue={() => setActiveTab('ISSUE_PERMIT')}
            />
          )}

          {activeTab === 'HOT_WORK' && (
            <HotWorkPermitView
              permit={getActivePermitForType('HOT_WORK') as HotWorkPermitData}
              onUpdatePermit={handleUpdatePermit}
              onPrint={() => setPrintPermit(getActivePermitForType('HOT_WORK'))}
              onSubmitForApproval={() => {
                handleStatusChange(getActivePermitForType('HOT_WORK').id, 'Pending');
                showToast('Hot Work Permit submitted to HSE Inspector for authorization.');
              }}
            />
          )}

          {activeTab === 'COLD_WORK' && (
            <ColdWorkPermitView
              permit={getActivePermitForType('COLD_WORK') as ColdWorkPermitData}
              onUpdatePermit={handleUpdatePermit}
              onPrint={() => setPrintPermit(getActivePermitForType('COLD_WORK'))}
              onSubmitForApproval={() => {
                handleStatusChange(getActivePermitForType('COLD_WORK').id, 'Pending');
                showToast('Cold Work Permit submitted for Area Authority review.');
              }}
            />
          )}

          {activeTab === 'CONFINED_SPACE' && (
            <ConfinedSpaceCertificateView
              permit={getActivePermitForType('CONFINED_SPACE') as ConfinedSpacePermitData}
              onUpdatePermit={handleUpdatePermit}
              onPrint={() => setPrintPermit(getActivePermitForType('CONFINED_SPACE'))}
              onSubmitForApproval={() => {
                handleStatusChange(getActivePermitForType('CONFINED_SPACE').id, 'Active');
                showToast('Confined Space entry authorized with continuous gas monitoring.');
              }}
            />
          )}

          {activeTab === 'EXCAVATION' && (
            <ExcavationCertificateView
              permit={getActivePermitForType('EXCAVATION') as ExcavationPermitData}
              onUpdatePermit={handleUpdatePermit}
              onPrint={() => setPrintPermit(getActivePermitForType('EXCAVATION'))}
              onSubmitForApproval={() => {
                handleStatusChange(getActivePermitForType('EXCAVATION').id, 'Active');
                showToast('Excavation Certificate authorized with approved trench shoring.');
              }}
            />
          )}

          {activeTab === 'MECHANICAL_ISOLATION' && (
            <MechanicalIsolationView
              permit={getActivePermitForType('MECHANICAL_ISOLATION') as MechanicalIsolationPermitData}
              onUpdatePermit={handleUpdatePermit}
              onPrint={() => setPrintPermit(getActivePermitForType('MECHANICAL_ISOLATION'))}
              onSubmitForApproval={() => {
                handleStatusChange(getActivePermitForType('MECHANICAL_ISOLATION').id, 'Active');
                showToast('Mechanical & Process Isolation locked out and verified safe.');
              }}
            />
          )}

          {activeTab === 'ISSUE_PERMIT' && (
            <IssuePermitView
              existingPermits={permits}
              onSaveNewPermit={handleSaveNewPermit}
              onCancel={() => setActiveTab('DASHBOARD')}
            />
          )}

          {activeTab === 'ARCHIVE' && (
            <ArchiveView
              permits={permits}
              onOpenPermit={handleOpenPermitFromArchive}
              onPrintPermit={(p) => setPrintPermit(p)}
              onStatusChange={handleStatusChange}
            />
          )}

          {activeTab === 'REPORTS' && (
            <DashboardReportsView
              permits={permits}
              simopsConflicts={simopsConflicts}
              onOpenConflictModal={(c) => setActiveConflictForModal(c)}
              onOpenPermit={(p) => setActiveTab(p.type as NavTab)}
              onNavigateToIssue={() => setActiveTab('ISSUE_PERMIT')}
            />
          )}
        </main>
      </div>

      {/* Offline Storage Diagnostics Modal */}
      <OfflineDiagnosticsModal
        isOpen={showOfflineModal}
        onClose={() => setShowOfflineModal(false)}
        permits={permits}
        isOnline={isOnline}
        onForceSync={handleForceCacheSync}
        isSimulatedOffline={isSimulatedOffline}
        onToggleSimulatedOffline={() => setIsSimulatedOffline(!isSimulatedOffline)}
      />

      {/* Safety Guidelines Modal */}
      <SafetyGuidelinesModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

      {/* SIMOPS Safety Conflict Modal */}
      <SimopsConflictModal
        conflict={activeConflictForModal}
        isOpen={!!activeConflictForModal}
        onClose={() => setActiveConflictForModal(null)}
        onOpenPermit={(p) => {
          setActiveConflictForModal(null);
          setActiveTab(p.type as NavTab);
        }}
        onUpdatePermitStatus={handleStatusChange}
      />

      {/* Print Permit Document Modal */}
      {printPermit && (
        <PrintPermitModal
          isOpen={true}
          onClose={() => setPrintPermit(null)}
          permit={printPermit}
        />
      )}
    </div>
  );
};

export default App;
