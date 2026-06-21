/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Settings as SettingsIcon, ShieldAlert, Database, Trash2, RefreshCw, Info, Eye, LogOut, User, Users, Calendar, Sun, Moon, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { TeamMember, Shift } from '../types';
import { TeamSetup } from './TeamSetup';
import { ShiftSelector } from './ShiftSelector';

interface SettingsProps {
  onSeedData: () => void;
  onClearData: () => void;
  isLoading: boolean;
  compactMode: boolean;
  onToggleCompactMode: (enabled: boolean) => void;
  twoColumnMode: boolean;
  onToggleTwoColumnMode: (enabled: boolean) => void;
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
  onLogout: () => void;
  user: any;
  onUpdateProfile: (updates: { displayName?: string, photoURL?: string }) => void;
  teamMembers: TeamMember[];
  onAddTeamMember: (member: Partial<TeamMember>) => void;
  onRemoveTeamMember: (id: string) => void;
  shifts: Shift[];
  activeShiftId: string | null;
  onSelectShift: (id: string) => void;
  onCreateShift: (name: string) => void;
  onDeleteShift: (id: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({ 
  onSeedData, 
  onClearData, 
  isLoading, 
  compactMode, 
  onToggleCompactMode,
  twoColumnMode,
  onToggleTwoColumnMode,
  theme,
  onThemeChange,
  onLogout,
  user,
  onUpdateProfile,
  teamMembers,
  onAddTeamMember,
  onRemoveTeamMember,
  shifts,
  activeShiftId,
  onSelectShift,
  onCreateShift,
  onDeleteShift
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 md:p-8 space-y-8 transition-colors">
        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
            <SettingsIcon size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">System Settings</h2>
            <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">Manage your ED workflow environment</p>
          </div>
        </div>

        {/* Shift Management */}
        <div className="space-y-4">
          <ShiftSelector 
            shifts={shifts}
            activeShiftId={activeShiftId}
            onSelect={onSelectShift}
            onCreate={onCreateShift}
            onDelete={onDeleteShift}
          />
        </div>

        {/* Team Setup */}
        <div className="space-y-4">
          <TeamSetup 
            teamMembers={teamMembers}
            onAdd={onAddTeamMember}
            onRemove={onRemoveTeamMember}
          />
        </div>

        {/* Accessibility & Display */}
        <div className="space-y-4 pt-4">
          <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <Eye size={14} /> Display & Accessibility
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl flex items-center justify-between transition-colors">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Compact Mode</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Condense patient cards for more info</p>
              </div>
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => onToggleCompactMode(!compactMode)}
                className={cn(
                  "w-12 h-6 rounded-full transition-all relative flex items-center px-1 shadow-inner",
                  compactMode ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                )}
              >
                <motion.div 
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={cn(
                    "w-4 h-4 bg-white rounded-full shadow-md",
                    compactMode ? "ml-auto" : "ml-0"
                  )}
                />
              </motion.button>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl flex items-center justify-between transition-colors">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Multi-Column Layout</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Grid view for large screens</p>
              </div>
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => onToggleTwoColumnMode(!twoColumnMode)}
                className={cn(
                  "w-12 h-6 rounded-full transition-all relative flex items-center px-1 shadow-inner",
                  twoColumnMode ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                )}
              >
                <motion.div 
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={cn(
                    "w-4 h-4 bg-white rounded-full shadow-md",
                    twoColumnMode ? "ml-auto" : "ml-0"
                  )}
                />
              </motion.button>
            </div>

            <div className="md:col-span-2 p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl space-y-3 transition-colors">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Theme Preference</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Choose your preferred visual style</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['light', 'dark', 'system'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => onThemeChange(t)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all relative overflow-hidden",
                      theme === t 
                        ? t === 'light'
                          ? "bg-amber-50 border-amber-500 text-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                          : t === 'dark'
                            ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-600 text-indigo-600 dark:text-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.2)]"
                            : "bg-blue-50 dark:bg-blue-900/30 border-blue-600 text-blue-600 dark:text-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.2)]"
                        : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-400 hover:border-gray-200 dark:hover:border-gray-700"
                    )}
                  >
                    {theme === t && (
                      <motion.div 
                        layoutId="activeTheme"
                        className={cn(
                          "absolute inset-0 opacity-10",
                          t === 'light' ? "bg-amber-400" : t === 'dark' ? "bg-indigo-400" : "bg-blue-400"
                        )}
                      />
                    )}
                    {t === 'light' && <Sun size={18} className={cn(theme === t && "animate-pulse")} />}
                    {t === 'dark' && <Moon size={18} />}
                    {t === 'system' && <Monitor size={18} />}
                    <span className="text-[10px] font-black uppercase tracking-widest relative z-10">{t}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <Database size={14} /> Data Management
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-2xl space-y-3 transition-colors">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-sm">
                <RefreshCw size={16} /> Seed Demo Data
              </div>
              <button 
                onClick={onSeedData}
                disabled={isLoading}
                className="w-full py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50"
              >
                {isLoading ? "Seeding..." : "Seed Shift Data"}
              </button>
            </div>

            <div className="p-4 bg-red-50/50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-2xl space-y-3 transition-colors">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold text-sm">
                <Trash2 size={16} /> Clear Shift Data
              </div>
              <button 
                onClick={onClearData}
                disabled={isLoading}
                className="w-full py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-all shadow-sm disabled:opacity-50"
              >
                {isLoading ? "Clearing..." : "Clear Current Shift"}
              </button>
            </div>
          </div>
        </div>

        {/* Account Section */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <User size={14} /> Account Details
          </h3>
          <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl space-y-6 transition-colors">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl">
                  {user?.photoURL ? (
                    user.photoURL.length < 4 ? (
                      <span className="text-4xl">{user.photoURL}</span>
                    ) : (
                      <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                    )
                  ) : (
                    <User size={40} />
                  )}
                </div>
                <div className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all scale-90 group-hover:scale-100">
                  <SettingsIcon size={14} />
                </div>
              </div>
              
              <div className="flex-1 space-y-4 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Display Name</label>
                    <input 
                      className="w-full p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                      value={user?.displayName || ''}
                      placeholder="Enter name"
                      onChange={(e) => onUpdateProfile({ displayName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Avatar URL / Emoji</label>
                    <input 
                      className="w-full p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                      value={user?.photoURL || ''}
                      placeholder="URL or Emoji"
                      onChange={(e) => onUpdateProfile({ photoURL: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <ShieldAlert size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Email Address</p>
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{user?.email}</p>
                </div>
              </div>
              <button 
                onClick={onLogout}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 rounded-xl text-xs font-black hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center gap-2 shadow-sm"
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          </div>
        </div>

        {/* Security & Compliance */}
        <div className="space-y-4 pt-4">
          <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <ShieldAlert size={14} /> Security & Compliance
          </h3>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800/50 rounded-2xl flex gap-3 transition-colors">
            <Info size={20} className="text-yellow-600 dark:text-yellow-500 shrink-0" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-yellow-800 dark:text-yellow-400">HIPAA Guardrails</p>
              <p className="text-[10px] text-yellow-700 dark:text-yellow-500/80 leading-relaxed font-medium">
                This application is designed as a side-car workflow tool. 
                <strong> DO NOT enter Protected Health Information (PHI)</strong>. 
                Use only initials, age, and room numbers.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 dark:border-gray-800 text-center transition-colors">
          <p className="text-[10px] text-gray-300 dark:text-gray-600 font-bold uppercase tracking-widest">
            PEM FlowMaster v1.0.0 • Built for Pediatric Emergency Departments
          </p>
        </div>
      </div>
    </div>
  );
};
