/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Patient, TeamMember } from '../types';
import { PatientCard } from './PatientCard';
import { SyncStatus, SyncState } from './SyncStatus';
import { Search, Filter, SortAsc, SortDesc, Users, Plus, X } from 'lucide-react';
import { cn, getRoleColor, getPatientPhase, PHASE_TONES, type EdPhaseKey } from '../lib/utils';
import { DndContext, DragOverlay, useDraggable, useDroppable, DragEndEvent, TouchSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';

interface PatientBoardProps {
  patients: Patient[];
  teamMembers: TeamMember[];
  onUpdatePatient: (id: string, updates: Partial<Patient>) => void;
  onDeletePatient: (id: string) => void;
  onCompletePatient: (id: string) => void;
  onResetTimer: (id: string) => void;
  onAddPatient: () => void;
  onAddTeamMember?: (member: Partial<TeamMember>) => void;
  compactMode?: boolean;
  twoColumnMode?: boolean;
  syncState?: SyncState;
  darkMode?: boolean;
  /** Patient the current user just added — its card auto-focuses the name. */
  focusPatientId?: string | null;
  onFocusConsumed?: () => void;
}

const DraggableTeamMember = ({ member, onFilter }: { member: TeamMember, onFilter?: (id: string) => void }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `member-${member.id}`,
    data: { member }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        if (!isDragging && onFilter) {
          onFilter(member.id);
        }
      }}
      className={cn(
        "w-10 h-10 rounded-full border-2 flex flex-col items-center justify-center text-xs font-black cursor-grab active:cursor-grabbing transition-all shadow-sm shrink-0 relative group touch-none",
        getRoleColor(member.role),
        isDragging && "opacity-0 scale-110 shadow-lg"
      )}
      title={`${member.firstName} ${member.lastName} (${member.role})`}
    >
      {member.avatarUrl || member.emoji ? (
        <div className="w-full h-full flex items-center justify-center bg-white dark:bg-gray-800">
          {member.avatarUrl ? (
            <img src={member.avatarUrl} alt={member.initials} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl">{member.emoji}</span>
          )}
        </div>
      ) : (
        member.initials
      )}
      {(member.avatarUrl || member.emoji) && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[6px] text-white font-black py-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-center">
          {member.initials}
        </div>
      )}
    </div>
  );
};

export const PatientBoard: React.FC<PatientBoardProps> = ({ 
  patients, 
  teamMembers, 
  onUpdatePatient, 
  onDeletePatient,
  onCompletePatient,
  onResetTimer,
  onAddPatient,
  onAddTeamMember,
  compactMode = false,
  twoColumnMode = false,
  syncState = 'connecting',
  darkMode = false,
  focusPatientId = null,
  onFocusConsumed,
}) => {
  const [search, setSearch] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'room' | 'status' | 'age' | 'timer' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPhase, setFilterPhase] = useState<EdPhaseKey | 'all'>('all');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddData, setQuickAddData] = useState({ firstName: '', lastName: '', initials: '', role: 'resident' as any });

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickAddData.firstName && quickAddData.lastName && quickAddData.initials && onAddTeamMember) {
      onAddTeamMember(quickAddData);
      setQuickAddData({ firstName: '', lastName: '', initials: '', role: 'resident' });
      setIsQuickAddOpen(false);
    }
  };

  const filteredAndSortedPatients = useMemo(() => {
    let result = [...patients];

    // Search
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(p =>
        p.initials.toLowerCase().includes(s) ||
        (p.firstName || '').toLowerCase().includes(s) ||
        p.room.toLowerCase().includes(s) ||
        p.chiefComplaint.toLowerCase().includes(s)
      );
    }

    // Filter Provider
    if (filterProvider !== 'all') {
      result = result.filter(p => p.assignedTeam.includes(filterProvider));
    }

    // Filter Status
    if (filterStatus !== 'all') {
      result = result.filter(p => p.status === filterStatus);
    }

    // Filter ED phase — the department census strip taps into this.
    if (filterPhase !== 'all') {
      result = result.filter(p => getPatientPhase(p).key === filterPhase);
    }

    // Sort
    result.sort((a, b) => {
      // 1. Completion status (Active first)
      if (!a.isCompleted && b.isCompleted) return -1;
      if (a.isCompleted && !b.isCompleted) return 1;

      // 2. Pinning status
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      // 3. New Patients (Always at the top, newest first)
      if (a.status === 'New' && b.status !== 'New') return -1;
      if (a.status !== 'New' && b.status === 'New') return 1;
      if (a.status === 'New' && b.status === 'New') {
        const aTime = a.createdAt ? a.createdAt.toMillis() : 0;
        const bTime = b.createdAt ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      }

      // If sorting by room, we might want unassigned at the bottom
      if (sortBy === 'room') {
        const isUnassigned = (room: string) => !room || room === '?' || room === 'TBD' || room === 'WAIT';
        const aUnassigned = isUnassigned(a.room);
        const bUnassigned = isUnassigned(b.room);
        if (!aUnassigned && bUnassigned) return -1;
        if (aUnassigned && !bUnassigned) return 1;
      }

      let comparison = 0;
      if (sortBy === 'room') {
        comparison = a.room.localeCompare(b.room, undefined, { numeric: true });
      } else if (sortBy === 'createdAt') {
        const aTime = a.createdAt ? a.createdAt.toMillis() : 0;
        const bTime = b.createdAt ? b.createdAt.toMillis() : 0;
        comparison = aTime - bTime;
      } else if (sortBy === 'status') {
        comparison = a.status.localeCompare(b.status);
      } else if (sortBy === 'age') {
        comparison = parseInt(a.age) - parseInt(b.age);
      } else if (sortBy === 'timer') {
        comparison = a.lastAssessmentAt.toMillis() - b.lastAssessmentAt.toMillis();
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [patients, search, sortBy, sortOrder, filterProvider, filterStatus, filterPhase]);

  // Department census — live counts per ED-course phase, grouped into the
  // buckets that matter on rounds. Drives the tappable overview strip.
  const census = useMemo(() => {
    const counts: Record<string, number> = {};
    patients.forEach(p => {
      const key = getPatientPhase(p).key;
      counts[key] = (counts[key] || 0) + 1;
    });
    const dispoCount = (counts.discharge || 0) + (counts.admit || 0) + (counts.obs || 0);
    return [
      { key: 'toBeSeen' as const, label: 'To Be Seen', tone: 'rose' as const, count: counts.toBeSeen || 0 },
      { key: 'workup' as const, label: 'Work-up', tone: 'blue' as const, count: counts.workup || 0 },
      { key: 'staffed' as const, label: 'Staffed', tone: 'indigo' as const, count: counts.staffed || 0 },
      { key: 'attending' as const, label: 'Attending', tone: 'violet' as const, count: counts.attending || 0 },
      { key: 'dispo' as const, label: 'Dispo', tone: 'indigo' as const, count: dispoCount },
      { key: 'ready' as const, label: 'Ready', tone: 'emerald' as const, count: counts.ready || 0 },
    ];
  }, [patients]);

  // The "Dispo" census chip rolls up three terminal phases.
  const phaseFilterKeys = (key: string): EdPhaseKey[] =>
    key === 'dispo' ? ['discharge', 'admit', 'obs'] : [key as EdPhaseKey];

  const isPhaseChipActive = (key: string) =>
    key === 'dispo'
      ? (['discharge', 'admit', 'obs'] as EdPhaseKey[]).includes(filterPhase as EdPhaseKey)
      : filterPhase === key;

  const togglePhaseFilter = (key: string) => {
    if (navigator.vibrate) navigator.vibrate(5);
    const keys = phaseFilterKeys(key);
    setFilterPhase(prev => (keys.includes(prev as EdPhaseKey) ? 'all' : keys[0]));
  };

  const groupedPatients = useMemo(() => {
    if (filterProvider === 'all') return { all: filteredAndSortedPatients };
    
    const groups: Record<string, Patient[]> = {};
    filteredAndSortedPatients.forEach(p => {
      if (p.assignedTeam.length === 0) {
        if (!groups['unassigned']) groups['unassigned'] = [];
        groups['unassigned'].push(p);
      } else {
        p.assignedTeam.forEach(providerId => {
          if (!groups[providerId]) groups[providerId] = [];
          if (!groups[providerId].find(existing => existing.id === p.id)) {
             groups[providerId].push(p);
          }
        });
      }
    });
    return groups;
  }, [filteredAndSortedPatients, filterProvider]);

  const teamWorkload = useMemo(() => {
    const workload: Record<string, number> = {};
    patients.forEach(p => {
      p.assignedTeam.forEach(id => {
        workload[id] = (workload[id] || 0) + 1;
      });
    });
    return workload;
  }, [patients]);

  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 10,
      },
    })
  );

  const [activeMember, setActiveMember] = useState<TeamMember | null>(null);

  const handleDragStart = (event: any) => {
    const { active } = event;
    if (active.data.current?.member) {
      setActiveMember(active.data.current.member);
      if (navigator.vibrate) navigator.vibrate(10);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveMember(null);
    const { active, over } = event;
    if (over && active.data.current) {
      const memberId = active.data.current.member.id;
      const patientId = over.id as string;
      const patient = patients.find(p => p.id === patientId);
      
      if (patient && !patient.assignedTeam.includes(memberId)) {
        onUpdatePatient(patientId, {
          assignedTeam: [...patient.assignedTeam, memberId]
        });
      }
    }
  };

  useEffect(() => {
    if (activeMember) {
      document.body.style.overflow = 'hidden';
      // Prevent touch move to avoid scrolling during drag
      const preventDefault = (e: TouchEvent) => e.preventDefault();
      document.addEventListener('touchmove', preventDefault, { passive: false });
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('touchmove', preventDefault);
      };
    }
  }, [activeMember]);

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {/* Quick Add Modal */}
      {isQuickAddOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4 animate-in zoom-in-95 duration-200 transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Quick Add Team</h3>
              <button onClick={() => setIsQuickAddOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <X size={20} className="text-gray-400 dark:text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleQuickAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">First Name</label>
                  <input 
                    autoFocus
                    required
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                    placeholder="First"
                    value={quickAddData.firstName}
                    onChange={(e) => setQuickAddData({ ...quickAddData, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Last Name</label>
                  <input 
                    required
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                    placeholder="Last"
                    value={quickAddData.lastName}
                    onChange={(e) => setQuickAddData({ ...quickAddData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Initials</label>
                  <input 
                    required
                    maxLength={3}
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none uppercase transition-colors"
                    placeholder="JD"
                    value={quickAddData.initials}
                    onChange={(e) => setQuickAddData({ ...quickAddData, initials: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Role</label>
                  <select 
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                    value={quickAddData.role}
                    onChange={(e) => setQuickAddData({ ...quickAddData, role: e.target.value as any })}
                  >
                    <option value="attending">Attending</option>
                    <option value="fellow">Fellow</option>
                    <option value="resident">Resident</option>
                    <option value="student">Student</option>
                    <option value="nurse">Nurse</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none active:scale-95"
              >
                Add Member
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Team Bar - Scrolling with patients */}
        <div className="sticky top-12 md:top-14 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md py-2 border-b border-gray-100 dark:border-gray-800 -mx-4 px-4 shadow-sm flex items-center gap-3 transition-colors overflow-y-hidden">
          <div className="flex items-center gap-1.5 shrink-0 opacity-60">
            <Users size={14} className="text-gray-400 dark:text-gray-500" />
            <span className="col-header whitespace-nowrap">Team</span>
          </div>

          <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar py-1 scroll-touch snap-x-mandatory">
            {teamMembers.map(m => (
              <div key={m.id} className="snap-center relative">
                <DraggableTeamMember 
                  member={m} 
                  onFilter={(id) => setFilterProvider(id === filterProvider ? 'all' : id)} 
                />
                {teamWorkload[m.id] > 0 && (
                  <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex flex-wrap justify-center gap-0.5 z-10 w-8 pointer-events-none">
                    {Array.from({ length: Math.min(teamWorkload[m.id], 4) }).map((_, i) => (
                      <div key={i} className="w-1 h-1 rounded-full bg-blue-500 border border-white dark:border-gray-900 shadow-sm" />
                    ))}
                    {teamWorkload[m.id] > 4 && (
                      <div className="w-1 h-1 rounded-full bg-blue-600 border border-white dark:border-gray-900 shadow-sm flex items-center justify-center">
                        <span className="text-[4px] text-white font-bold">+</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div className="snap-center">
              <button
                onClick={() => setIsQuickAddOpen(true)}
                className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-600 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all shrink-0"
                title="Quick Add Team Member"
              >
                <Plus size={16} />
              </button>
            </div>
            {teamMembers.length === 0 && (
              <span className="text-[10px] text-gray-400 dark:text-gray-600 font-medium italic whitespace-nowrap">No team members active</span>
            )}
          </div>
        </div>

        {/* Department census + Add Patient — the board's command row.
            Census counts are live and tappable: each filters the board to that
            ED-course phase so the whole department can be triaged at a glance.
            Add Patient now lives here (not the team bar) as the mainstay action. */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -my-0.5">
            <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gray-100 dark:bg-slate-900 border border-gray-200/60 dark:border-gray-800">
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Census</span>
              <span className="text-sm font-black tabular-nums text-gray-900 dark:text-white leading-none">{patients.length}</span>
            </span>
            {census.map(c => {
              const active = isPhaseChipActive(c.key);
              const t = PHASE_TONES[c.tone];
              return (
                <button
                  key={c.key}
                  onClick={() => togglePhaseFilter(c.key)}
                  aria-pressed={active}
                  title={`${c.count} ${c.label}${active ? ' — tap to clear filter' : ' — tap to filter'}`}
                  className={cn(
                    "shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wide transition-all active:scale-95",
                    active
                      ? cn(t.chip, "ring-2", t.ring)
                      : "bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700"
                  )}
                >
                  <span className={cn("w-1.5 h-1.5 rounded-full", t.dot)} />
                  {c.label}
                  <span className="tabular-nums opacity-90">{c.count}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={onAddPatient}
            className="shrink-0 inline-flex items-center gap-1.5 pl-3 pr-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-wide text-[11px] shadow-md shadow-blue-200/70 dark:shadow-none active:scale-95 transition-all"
            title="Add a new patient to the board"
          >
            <Plus size={16} /> Add Patient
          </button>
        </div>

        {/* Quick-Sort Bar for Attending/Fellow Board Rounds */}
        <div className="flex gap-2 p-1.5 bg-gray-100 dark:bg-slate-900 rounded-2xl w-full max-w-sm border border-gray-200/50 dark:border-gray-800 shadow-sm">
          <button
            onClick={() => {
              setSortBy('createdAt');
              setSortOrder('asc');
              if (navigator.vibrate) navigator.vibrate(5);
            }}
            className={cn(
              "flex-1 py-2.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all outline-none",
              sortBy === 'createdAt' && sortOrder === 'asc'
                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            ⏱️ Next Up Queue
          </button>
          <button
            onClick={() => {
              setSortBy('room');
              setSortOrder('asc');
              if (navigator.vibrate) navigator.vibrate(5);
            }}
            className={cn(
              "flex-1 py-2.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all outline-none",
              sortBy === 'room'
                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            🏥 Room Order
          </button>
        </div>

        {/* Board Controls */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-6">
              {isSearchOpen ? (
                <div className="relative animate-in slide-in-from-left-2 duration-200 min-w-[200px]">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input 
                    autoFocus
                    className="w-full pl-9 pr-8 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-colors font-mono"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button 
                    onClick={() => { setSearch(''); setIsSearchOpen(false); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsSearchOpen(true)}
                  className="col-header opacity-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  SEARCH
                </button>
              )}
              
              <button 
                onClick={() => {
                  setIsFilterOpen(!isFilterOpen);
                  setIsSortOpen(false);
                }}
                className={cn(
                  "col-header opacity-100 transition-all",
                  isFilterOpen ? "text-blue-600 dark:text-blue-400 opacity-100" : "hover:text-blue-600 dark:hover:text-blue-400"
                )}
              >
                FILTER
              </button>

              <button 
                onClick={() => {
                  setIsSortOpen(!isSortOpen);
                  setIsFilterOpen(false);
                }}
                className={cn(
                  "col-header opacity-100 transition-all",
                  isSortOpen ? "text-blue-600 dark:text-blue-400 opacity-100" : "hover:text-blue-600 dark:hover:text-blue-400"
                )}
              >
                SORT
              </button>
            </div>
            
            <SyncStatus state={syncState} variant="dot" />
          </div>

          <AnimatePresence>
            {isSortOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap items-center gap-2 p-3 glass rounded-2xl shadow-sm transition-colors mb-2">
                  <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg px-2 py-1 transition-colors">
                    <SortAsc size={14} className="text-gray-400 dark:text-gray-500" />
                    <select 
                      className="text-xs font-bold text-gray-600 dark:text-gray-300 bg-transparent outline-none font-mono"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                    >
                      <option value="createdAt">To-do (Time Added)</option>
                      <option value="room">Room</option>
                      <option value="status">Status</option>
                      <option value="age">Age</option>
                      <option value="timer">Timer</option>
                    </select>
                    <button 
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-400 dark:text-gray-500 transition-colors"
                    >
                      {sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {isFilterOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap items-center gap-2 p-3 glass rounded-2xl shadow-sm transition-colors mb-2">
                  <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg px-2 py-1 transition-colors">
                    <Users size={14} className="text-gray-400 dark:text-gray-500" />
                    <select 
                      className="text-xs font-bold text-gray-600 dark:text-gray-300 bg-transparent outline-none max-w-[100px]"
                      value={filterProvider}
                      onChange={(e) => setFilterProvider(e.target.value)}
                    >
                      <option value="all">All Providers</option>
                      {teamMembers.map(m => (
                        <option key={m.id} value={m.id}>{m.initials} - {m.lastName}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg px-2 py-1 transition-colors">
                    <Filter size={14} className="text-gray-400 dark:text-gray-500" />
                    <select 
                      className="text-xs font-bold text-gray-600 dark:text-gray-300 bg-transparent outline-none max-w-[100px]"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      {['New', 'Staff', 'Work-up', 'ED Observation', 'Likely Discharge', 'Likely Admit', 'Discharge', 'Admit'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Patient List */}
        {filterProvider === 'all' ? (
          <div className={cn(
            "grid gap-2", 
            twoColumnMode ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
          )}>
            {filteredAndSortedPatients.map(patient => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onUpdate={onUpdatePatient}
                onDelete={onDeletePatient}
                onComplete={onCompletePatient}
                onResetTimer={onResetTimer}
                compactMode={compactMode}
                teamMembers={teamMembers}
                darkMode={darkMode}
                focusOnMount={patient.id === focusPatientId}
                onFocusConsumed={onFocusConsumed}
              />
            ))}
            {filteredAndSortedPatients.length === 0 && (
              <div className="py-16 flex flex-col items-center justify-center gap-4 text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-gray-50/50 dark:bg-gray-900/50 transition-colors">
                <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-700">
                  <Search size={24} className="opacity-20" />
                </div>
                {patients.length === 0 ? (
                  <>
                    <div className="text-center space-y-1">
                      <p className="font-serif italic text-lg">No patients on the board yet</p>
                      <p className="text-[10px] uppercase tracking-widest opacity-60">Add your first patient to start tracking</p>
                    </div>
                    <button
                      onClick={onAddPatient}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-[11px] font-black uppercase tracking-widest shadow-md shadow-blue-200/70 dark:shadow-none active:scale-95 transition-all"
                    >
                      <Plus size={16} /> Add Patient
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-center space-y-1">
                      <p className="font-serif italic text-lg">No patients found</p>
                      <p className="text-[10px] uppercase tracking-widest opacity-60">Try adjusting your filters or search terms</p>
                    </div>
                    <button
                      onClick={() => { setSearch(''); setFilterProvider('all'); setFilterStatus('all'); setFilterPhase('all'); }}
                      className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm active:scale-95"
                    >
                      Clear All Filters
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-800/50 transition-colors">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-bold text-blue-900 dark:text-blue-100">
                  Filtered by: {teamMembers.find(m => m.id === filterProvider)?.lastName || 'Unknown'}
                </span>
              </div>
              <button 
                onClick={() => setFilterProvider('all')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg shadow-sm transition-colors"
              >
                Clear Filter (All Providers)
              </button>
            </div>
            
            {Object.entries(groupedPatients).filter(([groupId]) => groupId === filterProvider).map(([groupId, groupPatients]) => {
              const provider = teamMembers.find(m => m.id === groupId);
              const isCollapsed = collapsedGroups[groupId];
              
              return (
                <div key={groupId} className="space-y-2">
                  <button 
                    onClick={() => toggleGroup(groupId)}
                    className="w-full flex items-center justify-between p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white",
                        provider ? getRoleColor(provider.role) : "bg-gray-400 dark:bg-gray-600"
                      )}>
                        {provider?.initials || '?'}
                      </div>
                      <span className="font-bold text-gray-800 dark:text-gray-200">
                        {provider ? `${provider.firstName} ${provider.lastName}` : 'Unassigned'}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs font-bold transition-colors">
                        {groupPatients.length}
                      </span>
                    </div>
                    <div className={cn("transition-transform duration-200", isCollapsed ? "rotate-180" : "")}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 dark:text-gray-500"><path d="m18 15-6-6-6 6"/></svg>
                    </div>
                  </button>
                  
                  {!isCollapsed && (
                    <div className={cn(
                      "grid gap-2 pl-2 md:pl-4 border-l-2 border-gray-100 dark:border-gray-800 transition-colors", 
                      twoColumnMode ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
                    )}>
                      {groupPatients.map(patient => (
                        <PatientCard
                          key={patient.id}
                          patient={patient}
                          onUpdate={onUpdatePatient}
                          onDelete={onDeletePatient}
                          onComplete={onCompletePatient}
                          onResetTimer={onResetTimer}
                          compactMode={compactMode}
                          teamMembers={teamMembers}
                          darkMode={darkMode}
                          focusOnMount={patient.id === focusPatientId}
                          onFocusConsumed={onFocusConsumed}
                        />
                      ))}
                      {groupPatients.length === 0 && (
                        <div className="py-8 text-center text-gray-400 dark:text-gray-500 italic text-sm">
                          No patients assigned.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Add Patient — mobile only. Patients are added constantly in
          real time, so keep the action within thumb reach while scrolling.
          The inline command-row button covers desktop. */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onAddPatient}
        className="md:hidden fixed right-4 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white shadow-xl shadow-blue-500/30 active:bg-blue-700"
        style={{ bottom: 'calc(4.75rem + env(safe-area-inset-bottom))' }}
        aria-label="Add patient"
        title="Add patient"
      >
        <Plus size={26} />
      </motion.button>

      <DragOverlay dropAnimation={null}>
        {activeMember ? (
          <div className={cn(
            "w-12 h-12 rounded-full border-2 flex flex-col items-center justify-center text-xs font-black shadow-2xl scale-110 opacity-90",
            getRoleColor(activeMember.role)
          )}>
            {activeMember.avatarUrl || activeMember.emoji ? (
              <div className="w-full h-full flex items-center justify-center bg-white dark:bg-gray-800 rounded-full overflow-hidden">
                {activeMember.avatarUrl ? (
                  <img src={activeMember.avatarUrl} alt={activeMember.initials} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">{activeMember.emoji}</span>
                )}
              </div>
            ) : (
              activeMember.initials
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
