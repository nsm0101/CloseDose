/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LogOut, User, LayoutDashboard, PhoneCall, Settings, Users, Clock, UserPlus, X, Share2, Check } from 'lucide-react';
import { cn, getTimerColor } from '../lib/utils';
import { TeamMember, Role } from '../types';
import { BRAND } from '../lib/brand';
import { SyncStatus, SyncState } from './SyncStatus';
import { nativeDS } from '../lib/nativeDesignSystem';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'board' | 'medcomm' | 'team' | 'settings' | 'handoff';
  setActiveTab: (tab: 'board' | 'medcomm' | 'team' | 'settings' | 'handoff') => void;
  user: any;
  onLogout: () => void;
  onAddTeamMember?: (member: Partial<TeamMember>) => void;
  activeShiftId?: string | null;
  syncState?: SyncState;
}

import { motion } from 'framer-motion';

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, user, onLogout, onAddTeamMember, activeShiftId, syncState = 'connecting' }) => {
  const pmdTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  const tabs = [
    { id: 'board', label: 'Board', icon: <LayoutDashboard size={20} /> },
    { id: 'handoff', label: 'Handoff', icon: <Users size={20} /> },
    { id: 'medcomm', label: 'MedComm', icon: <PhoneCall size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ] as const;

  const [isAtBottom, setIsAtBottom] = React.useState(false);
  const [rtlSeconds, setRtlSeconds] = React.useState(0);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleTimerReset = () => {
    setRtlSeconds(0);
  };

  const startHold = () => {
    timerRef.current = setTimeout(handleTimerReset, 1000);
  };

  const endHold = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  React.useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      setIsAtBottom(scrollTop + windowHeight >= documentHeight - 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setRtlSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const [isCopied, setIsCopied] = React.useState(false);

  const handleShare = () => {
    if (!activeShiftId) return;
    const url = new URL(window.location.href);
    url.searchParams.set('shiftId', activeShiftId);
    navigator.clipboard.writeText(url.toString());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="pmd pmd-app-shell min-h-[100dvh] flex flex-col transition-colors overflow-x-hidden"
      style={{ ['--pmd-native-max-width' as any]: `${nativeDS.board.maxContentWidth}px` }} data-pmd-theme={pmdTheme}>
      {/* Top Navigation - Hidden on Mobile */}
      <header className="pmd-glass-header sticky top-0 z-50 border-b shadow-sm md:block transition-colors">
        <div className="max-w-[var(--pmd-native-max-width)] mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('board')}>
            <img src={BRAND.bearHead} alt="PREtendingMD bear mascot" className="w-7 h-7 md:w-9 md:h-9 object-contain" />
            <h1 className="pmd-brand text-sm md:text-base font-black tracking-tight text-[var(--pmd-ink)]">PRE<span className="text-[var(--pmd-family)]">tendingMD</span></h1>
          </div>

          <motion.div 
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 pmd-control-surface rounded-full min-h-11 border shadow-xs cursor-pointer select-none transition-transform"
            onContextMenu={(e) => { e.preventDefault(); handleTimerReset(); }}
            onTouchStart={startHold}
            onTouchEnd={endHold}
            onMouseDown={startHold}
            onMouseUp={endHold}
            onMouseLeave={endHold}
            title="Right click or hold to reset"
          >
            <span className="text-[10px] md:text-xs font-black pmd-muted-text uppercase tracking-wider">RTL:</span>
            <span className="text-xs md:text-sm font-black tabular-nums" style={{ color: getTimerColor(rtlSeconds) }}>
              {formatTime(rtlSeconds)}
            </span>
          </motion.div>

          <div className="flex items-center gap-2 md:gap-4">
            {activeShiftId && <SyncStatus state={syncState} variant="full" className="hidden sm:inline-flex" />}

            {activeShiftId && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--pmd-family-soft)] text-[var(--pmd-family-ink)] rounded-full border border-[var(--pmd-family-line)] hover:bg-[var(--pmd-family-line)] transition-colors"
                title="Share session"
              >
                {isCopied ? <Check size={16} /> : <Share2 size={16} />}
                <span className="text-[10px] font-black uppercase tracking-tighter hidden sm:inline">
                  {isCopied ? 'Copied!' : 'Share'}
                </span>
              </motion.button>
            )}

            <div 
              className="flex items-center gap-2 px-2 py-1 md:px-3 md:py-1.5 pmd-control-surface rounded-full border cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setActiveTab('settings')}
            >
              <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-[var(--pmd-family-soft)] flex items-center justify-center text-[var(--pmd-family-ink)] overflow-hidden">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={12} />
                )}
              </div>
              <span className="text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300 hidden sm:block">{user?.displayName || user?.email?.split('@')[0]}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[var(--pmd-native-max-width)] mx-auto w-full px-3 sm:px-4 pt-0 pb-28 md:pb-5 scroll-touch">
        {children}
      </main>

      {/* Bottom Navigation (Mobile Friendly) */}
      <nav className="pmd-glass-header fixed bottom-0 left-0 right-0 border-t px-4 pt-1 pb-[calc(4px+env(safe-area-inset-bottom))] z-30 md:relative md:border-t-0 md:bg-transparent md:max-w-[var(--pmd-native-max-width)] md:mx-auto md:w-full md:px-4 md:py-4">
        <div className="flex items-center justify-around md:justify-start md:gap-6 max-w-lg mx-auto md:mx-0">
          {tabs.map(tab => (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(5);
                setActiveTab(tab.id);
              }}
              className={cn(
                "flex flex-col md:flex-row items-center gap-0.5 md:gap-3 px-4 py-2 rounded-2xl min-h-11 transition-all",
                activeTab === tab.id 
                  ? "text-[var(--pmd-family-ink)] bg-[var(--pmd-family-soft)] md:pmd-primary-action md:text-white md:shadow-lg" 
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              )}
            >
              <div className={cn("transition-all duration-300", !isAtBottom && "md:block")}>
                {tab.icon}
              </div>
              <span className="text-[9px] md:text-sm font-black uppercase tracking-widest">{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </nav>
    </div>
  );
};
