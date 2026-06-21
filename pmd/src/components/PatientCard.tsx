/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Patient, TaskState, PatientStatus, TeamMember } from '../types';
import { cn, getStatusStyle, getSeenBorderStyle, getStatusGradient, getTimerColor, getRoleColor } from '../lib/utils';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Users, 
  ChevronDown, 
  ChevronUp, 
  Pin, 
  Plus,
  Trash2,
  FlaskConical,
  Image as ImageIcon,
  Pill,
  Stethoscope,
  GlassWater,
  Heart,
  Footprints,
  FileText,
  Check,
  UserPlus,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PatientCardProps {
  patient: Patient;
  onUpdate: (id: string, updates: Partial<Patient>) => void;
  onResetTimer: (id: string) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
  compactMode?: boolean;
  teamMembers?: TeamMember[];
  darkMode?: boolean;
}

export const PatientCard: React.FC<PatientCardProps> = ({ 
  patient, 
  onUpdate, 
  onResetTimer, 
  onDelete,
  onComplete,
  compactMode = false,
  teamMembers = [],
  darkMode = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [elapsed, setElapsed] = useState<number>(0);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);

  // Sync elapsed timer
  useEffect(() => {
    const tick = () => {
      if (patient.lastAssessmentAt) {
        const seconds = Math.floor((Date.now() - patient.lastAssessmentAt.toMillis()) / 1000);
        setElapsed(seconds >= 0 ? seconds : 0);
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [patient.lastAssessmentAt]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Convert workflowFlags or seenState safely
  const seenByFellow = patient.workflowFlags?.readyForAttending || patient.seenState === 'Seen by Fellow' || patient.seenState === 'Seen by Attending';
  const staffedToAttending = patient.workflowFlags?.awaitingDispo || patient.seenState === 'Seen by Attending';
  const seenByAttending = patient.seenState === 'Seen by Attending';

  // Toggle Care Phases
  const handleToggleFellowSeen = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextSeen = !seenByFellow;
    let nextState: Patient['seenState'] = 'To Be Seen';
    if (seenByAttending) {
      nextState = 'Seen by Attending';
    } else if (nextSeen) {
      nextState = 'Seen by Fellow';
    }
    
    onUpdate(patient.id, {
      seenState: nextState,
      workflowFlags: {
        ...patient.workflowFlags,
        readyForAttending: nextSeen
      }
    });
  };

  const handleToggleStaffed = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStaffed = !staffedToAttending;
    
    onUpdate(patient.id, {
      workflowFlags: {
        ...patient.workflowFlags,
        awaitingDispo: nextStaffed,
        readyForAttending: nextStaffed ? true : seenByFellow // Staffed implies seen by fellow
      }
    });
  };

  const handleToggleAttendingSeen = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextSeen = !seenByAttending;
    const nextState: Patient['seenState'] = nextSeen ? 'Seen by Attending' : (seenByFellow ? 'Seen by Fellow' : 'To Be Seen');
    
    onUpdate(patient.id, {
      seenState: nextState,
      workflowFlags: {
        ...patient.workflowFlags,
        awaitingDispo: nextSeen ? true : staffedToAttending // Attending seen implies staffed
      }
    });
  };

  // 8 Core clinical barriers setup
  const barriers = [
    { key: 'labs', label: 'Labs / Bloods', icon: <FlaskConical size={18} /> },
    { key: 'imaging', label: 'X-Ray / Scan', icon: <ImageIcon size={18} /> },
    { key: 'meds', label: 'Medications', icon: <Pill size={18} /> },
    { key: 'consult', label: 'Consultants', icon: <Stethoscope size={18} /> },
    { key: 'poIntake', label: 'PO Fluids', icon: <GlassWater size={18} /> },
    { key: 'painControl', label: 'Pain Control', icon: <Heart size={18} /> },
    { key: 'ambulation', label: 'Ambulation', icon: <Footprints size={18} /> },
    { key: 'documents', label: 'Chart Docs', icon: <FileText size={18} /> },
  ] as const;

  // Toggle dynamic barriers cyclical: off -> ordered/pending -> complete -> off
  const handleToggleBarrier = (key: keyof Patient['tasks'], e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.vibrate) navigator.vibrate(8);
    const current = patient.tasks[key] || 'off';
    let next: TaskState = 'off';

    if (current === 'off') {
      next = 'pending'; // ordered / pending attention
    } else if (current === 'pending' || current === 'ordered') {
      next = 'complete'; // completed
    } else {
      next = 'off'; // turned off / not needed
    }

    onUpdate(patient.id, {
      tasks: {
        ...patient.tasks,
        [key]: next
      }
    });
  };

  // Determine if patient has any outstanding barriers (flagged but not completed)
  const activeBarriers = barriers.filter(b => {
    const val = patient.tasks[b.key] || 'off';
    return val === 'pending' || val === 'ordered';
  });

  const completedBarriers = barriers.filter(b => {
    const val = patient.tasks[b.key] || 'off';
    return val === 'complete';
  });

  const isBarrierFree = activeBarriers.length === 0;

  // Check if patient is resolved for discharge or admission
  const isDispositioned = ['Discharge', 'Admit', 'ED Observation'].includes(patient.status);
  const isGoodToGo = isDispositioned && seenByAttending && isBarrierFree;

  // Get assigned teammates details
  const assignees = teamMembers.filter(m => patient.assignedTeam?.includes(m.id));

  const toggleAssignee = (memberId: string) => {
    const current = patient.assignedTeam || [];
    let next: string[];
    if (current.includes(memberId)) {
      next = current.filter(id => id !== memberId);
    } else {
      next = [...current, memberId];
    }
    onUpdate(patient.id, { assignedTeam: next });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "rounded-[2rem] border-2 bg-white dark:bg-slate-900 shadow-xl overflow-hidden relative transition-all duration-300",
        isGoodToGo 
          ? "border-emerald-500 ring-4 ring-emerald-500/10 dark:ring-emerald-400/20" 
          : "border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700",
        patient.isPinned && "ring-2 ring-amber-400 dark:ring-amber-500"
      )}
    >
      {/* Top Banner Accent colored by status */}
      <div className={cn(
        "h-2.5 w-full",
        patient.status === 'New' && "bg-rose-500",
        patient.status === 'Staff' && "bg-amber-400",
        patient.status === 'Work-up' && "bg-blue-500",
        patient.status === 'ED Observation' && "bg-indigo-600",
        patient.status === 'Discharge' && "bg-emerald-500",
        patient.status === 'Admit' && "bg-indigo-500",
        !patient.status && "bg-slate-300"
      )} />

      {/* Floating Pin */}
      <button 
        onClick={(e) => { e.stopPropagation(); onUpdate(patient.id, { isPinned: !patient.isPinned }); }}
        className={cn(
          "absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10",
          patient.isPinned 
            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 scale-110" 
            : "bg-slate-50 text-slate-300 hover:text-slate-500 dark:bg-slate-800"
        )}
      >
        <Pin size={14} className={cn(patient.isPinned && "fill-current")} />
      </button>

      {/* Main Face Panel */}
      <div className="p-6 md:p-8 space-y-6">
        
        {/* Core demographic metadata */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 shrink-0">
            {/* Visual Tactile Room Selector */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl px-4 py-3 border border-slate-100 dark:border-slate-700 text-center min-w-[70px] shadow-inner">
              <span className="block text-[8px] font-black uppercase text-slate-400 dark:text-slate-500 mb-0.5">ROOM</span>
              <input 
                value={patient.room}
                onChange={(e) => onUpdate(patient.id, { room: e.target.value })}
                className="w-12 text-center font-black text-xl text-slate-900 dark:text-white bg-transparent outline-none focus:ring-0 border-none p-0 leading-none uppercase"
                placeholder="?"
                maxLength={4}
              />
            </div>

            {/* Initials and Demographics */}
            <div>
              <div className="flex items-center gap-2">
                <input 
                  value={patient.initials}
                  onChange={(e) => onUpdate(patient.id, { initials: e.target.value.toUpperCase().slice(0, 4) })}
                  className="w-20 font-black text-2xl tracking-tight text-slate-900 dark:text-white bg-transparent outline-none border-none p-0 focus:ring-0"
                  placeholder="INITIALS"
                  maxLength={4}
                />
              </div>
              
              <div className="flex items-center gap-1.5 mt-1">
                {/* Age entry fields */}
                <input 
                  value={patient.age.replace(/[^0-9]/g, '')}
                  onChange={(e) => {
                    const number = e.target.value.replace(/[^0-9]/g, '');
                    const unit = patient.age.replace(/[0-9]/g, '') || 'y';
                    onUpdate(patient.id, { age: `${number}${unit}` });
                  }}
                  className="w-7 font-extrabold text-xs text-slate-500 dark:text-slate-400 bg-transparent border-none p-0 focus:ring-0 text-right outline-none"
                  placeholder="0"
                />
                <select 
                  value={patient.age.replace(/[0-9]/g, '') || 'y'}
                  onChange={(e) => {
                    const number = patient.age.replace(/[^0-9]/g, '') || '0';
                    onUpdate(patient.id, { age: `${number}${e.target.value}` });
                  }}
                  className="text-xs font-bold text-slate-400 dark:text-slate-500 bg-transparent border-none p-0 focus:ring-0 outline-none cursor-pointer"
                >
                  <option value="y">y/o</option>
                  <option value="m">m/o</option>
                  <option value="d">d/o</option>
                </select>

                <span className="text-slate-200 dark:text-slate-700 font-bold">|</span>

                {/* Sex Trigger Pill */}
                <select 
                  value={patient.sex}
                  onChange={(e) => onUpdate(patient.id, { sex: e.target.value as any })}
                  className={cn(
                    "text-xs font-black bg-transparent border-none p-0 focus:ring-0 outline-none cursor-pointer uppercase",
                    patient.sex === 'M' ? "text-blue-500" : patient.sex === 'F' ? "text-pink-500" : "text-purple-500"
                  )}
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Chief Complaint description */}
          <div className="flex-1 md:max-w-md">
            <span className="block text-[8px] font-black uppercase text-slate-400 dark:text-slate-500 mb-1">CHIEF COMPLAINT & PRESENTATION</span>
            <textarea 
              rows={2}
              value={patient.chiefComplaint}
              onChange={(e) => onUpdate(patient.id, { chiefComplaint: e.target.value })}
              className="w-full text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl p-2.5 focus:bg-white resize-none outline-none leading-snug focus:ring-2 focus:ring-blue-500"
              placeholder="Describe clinical presentation details..."
            />
          </div>

          {/* Countdown / Assessment timer */}
          <div className="flex items-center gap-3 self-end md:self-center shrink-0">
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl px-4 py-3 border border-slate-100 dark:border-slate-700 flex items-center gap-2.5 shadow-sm">
              <Clock size={16} style={{ color: getTimerColor(elapsed) }} className="animate-pulse" />
              <div className="text-right">
                <span className="block text-[8px] font-black uppercase text-slate-400 dark:text-slate-500 leading-none mb-1">ON BOARD</span>
                <span className="text-sm font-black tabular-nums tracking-wider leading-none" style={{ color: getTimerColor(elapsed) }}>
                  {formatTime(elapsed)}
                </span>
              </div>
            </div>

            {/* Timer Reset button */}
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => onResetTimer(patient.id)}
              className="p-3.5 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 transition-colors"
              title="Reset Timer"
            >
              <Activity size={14} className="animate-spin" style={{ animationDuration: '6s' }} />
            </motion.button>
          </div>
        </div>

        {/* Dynamic Provider (Resident/APP) Assignee selector - Easy tap */}
        <div className="border-t border-slate-50 dark:border-slate-800/80 pt-4 flex flex-wrap items-center justify-between gap-3 relative">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-slate-400 dark:text-slate-500" />
            <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Assigned Provider:</span>
            <div className="flex flex-wrap gap-1.5 items-center">
              {assignees.map(member => (
                <span 
                  key={member.id} 
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border",
                    getRoleColor(member.role)
                  )}
                >
                  {member.firstName} {member.lastName[0]}. ({member.role.toUpperCase()})
                </span>
              ))}
              {assignees.length === 0 && (
                <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold italic">Unassigned</span>
              )}
            </div>
          </div>

          <button 
            onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
            className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5"
          >
            <UserPlus size={12} />
            Assign Team
          </button>

          {/* Quick tactile Assignee Dropdown */}
          <AnimatePresence>
            {showAssigneeDropdown && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowAssigneeDropdown(false)} />
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-full mt-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-2xl shadow-xl p-3 z-40 w-64 space-y-1.5"
                >
                  <h4 className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2.5 py-1">Shift Crew List</h4>
                  <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                    {teamMembers.map(member => {
                      const isAssigned = patient.assignedTeam?.includes(member.id);
                      return (
                        <button
                          key={member.id}
                          onClick={() => toggleAssignee(member.id)}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors",
                            isAssigned 
                              ? "bg-blue-50/70 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400" 
                              : "hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400"
                          )}
                        >
                          <span>{member.firstName} {member.lastName}</span>
                          <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                            {member.role === 'attending' ? 'MD' : member.role === 'fellow' ? 'Fellow' : member.role === 'resident' ? 'Res' : 'APP'}
                          </span>
                        </button>
                      );
                    })}
                    {teamMembers.length === 0 && (
                      <p className="text-center text-[10px] text-slate-400 py-4 italic">No team registered yet.</p>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Core Care Phases ( tactile Progress steps ) */}
        <div className="grid grid-cols-3 gap-3 border-t border-slate-50 dark:border-slate-800/80 pt-5">
          {/* Phase 1: Seen by Fellow */}
          <button
            onClick={handleToggleFellowSeen}
            className={cn(
              "p-4 rounded-2xl border-2 text-center transition-all duration-300 flex flex-col items-center justify-center gap-1 min-h-[70px] cursor-pointer outline-none relative",
              seenByFellow 
                ? "border-blue-500 bg-blue-500 text-white shadow-md shadow-blue-500/10" 
                : "border-slate-100 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-900"
            )}
          >
            {seenByFellow && <CheckCircle2 size={14} className="absolute top-2 right-2 text-white" />}
            <span className="text-[10px] font-black uppercase tracking-wider block">1. Seen by Fellow</span>
            <span className="text-[8px] opacity-80 block">{seenByFellow ? "Completed" : "Tap once seen"}</span>
          </button>

          {/* Phase 2: Staffed to Attending */}
          <button
            onClick={handleToggleStaffed}
            className={cn(
              "p-4 rounded-2xl border-2 text-center transition-all duration-300 flex flex-col items-center justify-center gap-1 min-h-[70px] cursor-pointer outline-none relative",
              staffedToAttending 
                ? "border-indigo-500 bg-indigo-500 text-white shadow-md shadow-indigo-500/10" 
                : "border-slate-100 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-900"
            )}
          >
            {staffedToAttending && <CheckCircle2 size={14} className="absolute top-2 right-2 text-white" />}
            <span className="text-[10px] font-black uppercase tracking-wider block">2. Staffed</span>
            <span className="text-[8px] opacity-80 block">{staffedToAttending ? "Staffed to Attending" : "Tap when staffed"}</span>
          </button>

          {/* Phase 3: Seen by Attending */}
          <button
            onClick={handleToggleAttendingSeen}
            className={cn(
              "p-4 rounded-2xl border-2 text-center transition-all duration-300 flex flex-col items-center justify-center gap-1 min-h-[70px] cursor-pointer outline-none relative",
              seenByAttending 
                ? "border-violet-500 bg-violet-500 text-white shadow-md shadow-violet-500/10" 
                : "border-slate-100 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-900"
            )}
          >
            {seenByAttending && <CheckCircle2 size={14} className="absolute top-2 right-2 text-white" />}
            <span className="text-[10px] font-black uppercase tracking-wider block">3. Attending Seen</span>
            <span className="text-[8px] opacity-80 block">{seenByAttending ? "Attending Reviewed" : "Tap once seen"}</span>
          </button>
        </div>

        {/* ----------------- DISPOSITION & FLAGGEDS PANEL ----------------- */}
        <div className="bg-slate-50/70 dark:bg-slate-900/60 rounded-3xl p-5 border border-slate-100/30 dark:border-slate-800/50 space-y-4">
          
          {/* Attending Decision Bank */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="block text-[8px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest leading-none mb-1">ATTENDING DISPOSITION DECISION</span>
              <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Set primary route of care</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(['Discharge', 'Admit', 'ED Observation'] as const).map((status) => {
                const isActive = patient.status === status;
                return (
                  <button
                    key={status}
                    onClick={() => {
                      onUpdate(patient.id, { status });
                      // Trigger attending seen if they click dispo decision
                      if (!seenByAttending) {
                        onUpdate(patient.id, { status, seenState: 'Seen by Attending' });
                      }
                    }}
                    className={cn(
                      "px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide border-2 transition-all cursor-pointer",
                      isActive 
                        ? status === 'Discharge' ? "bg-emerald-500 border-emerald-500 text-white shadow" :
                          status === 'Admit' ? "bg-indigo-600 border-indigo-600 text-white shadow" :
                          "bg-purple-600 border-purple-600 text-white shadow"
                        : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 hover:border-slate-200 dark:border-slate-700"
                    )}
                  >
                    {status === 'ED Observation' ? 'ED Obs' : status}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 8 Check-steps Block */}
          <div className="space-y-2">
            <div>
              <span className="block text-[8px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest leading-none mb-1">DISPO BARRIERS & RESOLUTIONS (TAP TO CYCLE)</span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-3">
                Flag any outstanding tasks to address sebelum completing disposition choice.
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {barriers.map((barrier) => {
                const state = patient.tasks[barrier.key] || 'off';
                
                return (
                  <button
                    key={barrier.key}
                    onClick={(e) => handleToggleBarrier(barrier.key, e)}
                    className={cn(
                      "p-3 rounded-2xl border-2 flex items-center gap-2.5 text-left transition-all duration-200 cursor-pointer relative",
                      state === 'off' && "border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900 text-slate-400 dark:text-slate-500",
                      (state === 'pending' || state === 'ordered') && "border-amber-400 bg-amber-50/70 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-700 animate-pulse",
                      state === 'complete' && "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
                    )}
                  >
                    {/* Icon */}
                    <div className={cn(
                      "p-1.5 rounded-lg shrink-0",
                      state === 'off' && "bg-slate-50 text-slate-400 dark:bg-slate-800",
                      (state === 'pending' || state === 'ordered') && "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
                      state === 'complete' && "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300"
                    )}>
                      {barrier.icon}
                    </div>

                    <div className="min-w-0 flex-1 leading-none">
                      <span className="block text-[10px] font-black truncate uppercase tracking-tight">{barrier.label}</span>
                      <span className="text-[8px] font-bold opacity-80 block mt-0.5">
                        {state === 'off' ? 'Not Required' : state === 'complete' ? 'Completed' : 'FLAGGED'}
                      </span>
                    </div>

                    {/* Status badges */}
                    {(state === 'pending' || state === 'ordered') && (
                      <AlertCircle size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-amber-500" />
                    )}
                    {state === 'complete' && (
                      <CheckCircle2 size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Giant visual stamp indicating "GOOD TO GO!" */}
        <AnimatePresence>
          {isGoodToGo && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="border-4 border-dashed border-emerald-500 rounded-[2.5rem] p-6 text-center bg-emerald-500/10 flex flex-col items-center justify-center gap-1 font-black"
            >
              <Check className="text-emerald-500" size={36} />
              <span className="text-emerald-500 text-2xl uppercase tracking-tighter">GOOD TO GO!</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-extrabold mt-0.5">
                Staffed & cleared of all outstanding barriers!
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lower Expandable bar for Clinical Notes and plan */}
        <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800/80 pt-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-black text-slate-400">PLAN AND LOGS</span>
            {patient.operationalNotes && (
              <span className="text-[9px] bg-slate-50 dark:bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-black truncate max-w-[150px]">
                {patient.operationalNotes}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl text-[10px] font-black uppercase transition-all"
            >
              Clinical Notes
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            <button
              onClick={() => {
                if (confirm('Verify remove patient document?')) onDelete(patient.id);
              }}
              className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
              title="Delete Patient Record"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Expanded Management Area */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/90"
            >
              <div className="space-y-1.5">
                <span className="block text-[8px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">CLINICAL PLAN & OUTCOMES</span>
                <textarea 
                  rows={4}
                  value={patient.operationalNotes}
                  onChange={(e) => onUpdate(patient.id, { operationalNotes: e.target.value })}
                  className="w-full text-xs font-semibold p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 outline-none focus:bg-white resize-none shadow-inner"
                  placeholder="Insert primary detailed medical coordination summaries or handover plans..."
                />
              </div>

              {/* Gestational Age selector for infants */}
              <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl">
                <div>
                  <span className="block text-[8px] font-black uppercase text-slate-400 dark:text-slate-500 leading-none mb-1">GESTATIONAL AGE (Neonates)</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 leading-none">Ex-Gestational age tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <input 
                      type="number" 
                      min={20} 
                      max={45}
                      value={patient.gestationalAge?.weeks || ''}
                      onChange={(e) => onUpdate(patient.id, { gestationalAge: { ...patient.gestationalAge, weeks: parseInt(e.target.value) || 0, days: patient.gestationalAge?.days || 0 } })}
                      className="w-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg p-1.5 text-xs font-black text-center"
                      placeholder="Wk"
                    />
                    <span className="text-xs font-black text-slate-400">w</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <select
                      value={patient.gestationalAge?.days || 0}
                      onChange={(e) => onUpdate(patient.id, { gestationalAge: { ...patient.gestationalAge, weeks: patient.gestationalAge?.weeks || 0, days: parseInt(e.target.value) || 0 } })}
                      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg p-1.5 text-xs font-black text-center"
                    >
                      {[0,1,2,3,4,5,6].map(d => <option key={d} value={d}>{d}d</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
