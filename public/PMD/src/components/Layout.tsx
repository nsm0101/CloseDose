/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LogOut, User, LayoutDashboard, PhoneCall, Settings, Users, Clock, UserPlus, X, Share2, Check } from 'lucide-react';
import { cn, getTimerColor } from '../lib/utils';
import { TeamMember, Role } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'board' | 'medcomm' | 'team' | 'settings' | 'handoff';
  setActiveTab: (tab: 'board' | 'medcomm' | 'team' | 'settings' | 'handoff') => void;
  user: any;
  onLogout: () => void;
  onAddTeamMember?: (member: Partial<TeamMember>) => void;
  activeShiftId?: string | null;
}

import { motion } from 'framer-motion';

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, user, onLogout, onAddTeamMember, activeShiftId }) => {
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
    <div className="min-h-[100dvh] bg-gray-50 dark:bg-gray-950 flex flex-col transition-colors overflow-x-hidden">
      {/* Top Navigation - Hidden on Mobile */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-sm md:block transition-colors">
        <div className="max-w-7xl mx-auto px-4 h-12 md:h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('board')}>
            <img src="/images/FlowMaster_v1.png" alt="Logo" className="w-7 h-7 md:w-9 md:h-9 object-contain" />
            <h1 className="text-sm md:text-base font-black text-gray-900 dark:text-white tracking-tight">PRE<span className="text-blue-600 dark:text-blue-400">tendingMD</span></h1>
          </div>

          <motion.div 
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-full border border-gray-100 dark:border-gray-700 shadow-xs cursor-pointer select-none transition-transform"
            onContextMenu={(e) => { e.preventDefault(); handleTimerReset(); }}
            onTouchStart={startHold}
            onTouchEnd={endHold}
            onMouseDown={startHold}
            onMouseUp={endHold}
            onMouseLeave={endHold}
            title="Right click or hold to reset"
          >
            <span className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-wider">RTL:</span>
            <span className="text-xs md:text-sm font-black tabular-nums" style={{ color: getTimerColor(rtlSeconds) }}>
              {formatTime(rtlSeconds)}
            </span>
          </motion.div>

          <div className="flex items-center gap-2 md:gap-4">
            {activeShiftId && (
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-800 hover:bg-blue-100 transition-colors"
                title="Share Session"
              >
                {isCopied ? <Check size={16} /> : <Share2 size={16} />}
                <span className="text-[10px] font-black uppercase tracking-tighter hidden sm:inline">
                  {isCopied ? 'Copied!' : 'Share'}
                </span>
              </motion.button>
            )}

            <div 
              className="flex items-center gap-2 px-2 py-1 md:px-3 md:py-1.5 bg-gray-50 dark:bg-gray-800 rounded-full border border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setActiveTab('settings')}
            >
              <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 overflow-hidden">
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
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 pt-0 pb-28 md:pb-4 scroll-touch">
        {children}
      </main>

      {/* Bottom Navigation (Mobile Friendly) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 pt-1 pb-[calc(4px+env(safe-area-inset-bottom))] z-30 md:relative md:border-t-0 md:bg-transparent md:max-w-7xl md:mx-auto md:w-full md:px-4 md:py-4">
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
                "flex flex-col md:flex-row items-center gap-0.5 md:gap-3 px-4 py-1.5 rounded-2xl transition-all",
                activeTab === tab.id 
                  ? "text-blue-600 bg-blue-50 dark:bg-blue-900/30 md:bg-blue-600 md:text-white md:shadow-lg" 
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
