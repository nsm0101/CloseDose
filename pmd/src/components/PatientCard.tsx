/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Patient, TaskState, TeamMember } from '../types';
import {
  cn,
  getTimerColor,
  getRoleColor,
  getPatientPhase,
  getPatientFlags,
  PHASE_TONES,
  type PhaseTone,
} from '../lib/utils';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  ChevronDown,
  ChevronUp,
  Pin,
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
  RotateCcw,
  AlertTriangle,
  BedDouble,
  Home,
  Eye,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ------------------------------------------------------------------ *
 * Color = information. A single accent tone per clinical phase drives
 * the status rail, the phase chip and the care-step dots, so the card
 * reads the same way whether it's a row on a phone or a tile in the
 * desktop hub. One dominant hue per state — no competing warm colors.
 * The tone map + phase logic live in lib/utils so the board census and
 * the card always agree on where a patient is in their ED course.
 * ------------------------------------------------------------------ */
const TONES = PHASE_TONES;

interface PatientCardProps {
  patient: Patient;
  onUpdate: (id: string, updates: Partial<Patient>) => void;
  onResetTimer: (id: string) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
  compactMode?: boolean;
  teamMembers?: TeamMember[];
  darkMode?: boolean;
  /** When this matches the patient id, the card auto-expands and focuses
   *  the name field — used right after the current user adds a patient. */
  focusOnMount?: boolean;
  /** Called once the card has consumed the focus request. */
  onFocusConsumed?: () => void;
}

export const PatientCard: React.FC<PatientCardProps> = ({
  patient,
  onUpdate,
  onResetTimer,
  onDelete,
  onComplete,
  compactMode = false,
  teamMembers = [],
  darkMode = false,
  focusOnMount = false,
  onFocusConsumed,
}) => {
  const [expanded, setExpanded] = useState(!compactMode);
  const [showNotes, setShowNotes] = useState(false);
  const [elapsed, setElapsed] = useState<number>(0);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // The board-level "Compact Mode" preference collapses every card to its
  // condensed summary; flipping it acts as expand-all / collapse-all while
  // each card can still be toggled individually.
  useEffect(() => { setExpanded(!compactMode); }, [compactMode]);

  // Just added by *this* user: open the card and drop the cursor straight in
  // the name field so they can start typing without hunting. Only fires for
  // the local add — never when a teammate adds a patient to the shared board.
  const hasAutoFocusedRef = useRef(false);
  useEffect(() => {
    if (!focusOnMount || hasAutoFocusedRef.current) return;
    hasAutoFocusedRef.current = true;
    setExpanded(true);
    const t = setTimeout(() => {
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstNameRef.current?.focus();
      onFocusConsumed?.();
    }, 120);
    return () => clearTimeout(t);
  }, [focusOnMount, onFocusConsumed]);

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

  // Live seconds under an hour ("12:04"); stable "2h 41m" beyond, so a long
  // boarder reads as hours at a glance instead of a runaway "161:24".
  const formatTime = (totalSeconds: number) => {
    const s = Math.max(0, totalSeconds);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m`;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const LONG_STAY = 3 * 60 * 60; // 3h — surfaces a long-stay warning

  // Convert workflowFlags or seenState safely (shared with the board census).
  const { seenByFellow, staffedToAttending, seenByAttending } = getPatientFlags(patient);

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

  // Keep the legacy `initials` field in sync with the named fields so search,
  // handoff and older records all keep working. Never returns empty — the
  // Firestore rules require initials.size() >= 1.
  const deriveInitials = (first?: string, last?: string): string => {
    const d = `${(first ?? '').trim().charAt(0)}${(last ?? '').trim().charAt(0)}`.toUpperCase();
    return d || patient.initials || 'NEW';
  };

  // ---- Single source of truth: where the patient is in the ED course ----
  const phase = getPatientPhase(patient);
  const tone = TONES[phase.tone];

  // Fellow → Staffed → Attending — meaningful to both roles at a glance, and
  // the same three steps power the big tappable buttons when expanded.
  const careSteps = [
    { key: 'F', n: 1, label: 'Fellow', sub: 'Seen by Fellow', tone: 'blue' as PhaseTone, done: seenByFellow, onClick: handleToggleFellowSeen },
    { key: 'S', n: 2, label: 'Staffed', sub: 'Staffed to Attending', tone: 'indigo' as PhaseTone, done: staffedToAttending, onClick: handleToggleStaffed },
    { key: 'A', n: 3, label: 'Attending', sub: 'Seen by Attending', tone: 'violet' as PhaseTone, done: seenByAttending, onClick: handleToggleAttendingSeen },
  ];

  // Disposition options — shared by the compact quick-bar and the expanded
  // decision row. Tapping the active one clears it back to active work-up.
  const dispositions = [
    { status: 'Discharge' as const, icon: <Home size={14} />, tone: 'emerald' as PhaseTone, label: 'Discharge', short: 'D/C' },
    { status: 'Admit' as const, icon: <BedDouble size={14} />, tone: 'indigo' as PhaseTone, label: 'Admit', short: 'Admit' },
    { status: 'ED Observation' as const, icon: <Eye size={14} />, tone: 'violet' as PhaseTone, label: 'ED Obs', short: 'Obs' },
  ];

  const setDisposition = (status: Patient['status'], e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (navigator.vibrate) navigator.vibrate(8);
    if (patient.status === status) {
      // Toggle off — return to active work-up without losing who's seen them.
      onUpdate(patient.id, { status: 'Work-up' });
      return;
    }
    // Choosing a disposition implies the attending has seen the patient.
    onUpdate(patient.id, seenByAttending ? { status } : { status, seenState: 'Seen by Attending' });
  };

  const phaseChip = (
    <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wide whitespace-nowrap", tone.chip)}>
      {phase.key === 'ready' && <Check size={11} />}
      {phase.label}
    </span>
  );

  // Tappable Fellow→Staffed→Attending segmented control for the compact row —
  // advance a patient through their ED course without opening the card.
  const quickStepper = (
    <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0">
      {careSteps.map((s, i) => (
        <button
          key={s.key}
          onClick={(e) => { if (navigator.vibrate) navigator.vibrate(8); s.onClick(e); }}
          aria-pressed={s.done}
          aria-label={`${s.sub}${s.done ? ' — done, tap to undo' : ' — tap to mark done'}`}
          title={s.sub}
          className={cn(
            "flex items-center gap-1 px-2 py-1.5 text-[10px] font-black uppercase tracking-wide transition-colors active:scale-95",
            i > 0 && "border-l border-slate-200 dark:border-slate-700",
            s.done
              ? cn(TONES[s.tone].bar, "text-white")
              : "bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
          )}
        >
          <span className={cn(
            "w-3.5 h-3.5 rounded-full grid place-items-center text-[8px]",
            s.done ? "bg-white/25" : "bg-slate-100 dark:bg-slate-800"
          )}>
            {s.done ? <Check size={10} /> : s.n}
          </span>
          <span className="hidden @[23rem]:inline">{s.label}</span>
        </button>
      ))}
    </div>
  );

  // Tappable Discharge / Admit / Obs segmented control for the compact row.
  const quickDispo = (
    <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0">
      {dispositions.map((d, i) => {
        const active = patient.status === d.status;
        return (
          <button
            key={d.status}
            onClick={(e) => setDisposition(d.status, e)}
            aria-pressed={active}
            aria-label={`Disposition ${d.label}${active ? ' — selected, tap to clear' : ''}`}
            title={d.label}
            className={cn(
              "flex items-center gap-1 px-2 py-1.5 text-[10px] font-black uppercase tracking-wide transition-colors active:scale-95",
              i > 0 && "border-l border-slate-200 dark:border-slate-700",
              active
                ? cn(TONES[d.tone].bar, "text-white")
                : "bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
            )}
          >
            {d.icon}
            <span className="hidden @[28rem]:inline">{d.short}</span>
          </button>
        );
      })}
    </div>
  );

  // Outstanding-work summary: amber count when flagged, emerald "clear" once
  // something's been worked and nothing's outstanding.
  const barrierPill = activeBarriers.length > 0 ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60">
      <AlertCircle size={11} /> {activeBarriers.length}
    </span>
  ) : completedBarriers.length > 0 ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60">
      <CheckCircle2 size={11} /> Clear
    </span>
  ) : null;

  const timerColor = getTimerColor(elapsed);
  const sectionLabel = "text-[10px] @md:text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500";

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        // `@container` lets the card respond to its OWN width — so the same
        // component adapts whether it's full-width on a phone or a narrow tile
        // in the desktop grid hub.
        "@container relative rounded-3xl border bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-all duration-300",
        patient.isCompleted && "opacity-60",
        isGoodToGo
          ? cn("border-emerald-300 dark:border-emerald-800/70 ring-2", tone.ring)
          : patient.isPinned
            ? "border-amber-300 dark:border-amber-700/70 ring-2 ring-amber-400/30"
            : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
      )}
    >
      {/* Left status rail — the dominant, scannable phase indicator */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", tone.bar)} aria-hidden="true" />

      {/* ============================ COMPACT ROW ============================ */}
      {/* Collapsed quick-reference + quick-advance: a one-tap control panel so
          the whole department can be moved through its course from the board. */}
      {!expanded && (
        <div className="relative">
          {/* Header: room · who · phase · timer */}
          <div className="flex items-center gap-3 pl-4 pr-3 pt-3 pb-2">
            {/* Room — large, tap to expand */}
            <button
              onClick={() => setExpanded(true)}
              aria-label="Expand patient card"
              className="shrink-0 w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center"
            >
              <span className="block text-[8px] font-black uppercase text-slate-400 dark:text-slate-500 leading-none">Room</span>
              <span className="block font-black text-xl leading-tight text-slate-900 dark:text-white uppercase truncate max-w-[3rem]">{patient.room || '—'}</span>
            </button>

            {/* Identity + complaint — tap to expand */}
            <div onClick={() => setExpanded(true)} className="min-w-0 flex-1 cursor-pointer space-y-0.5">
              <div className="flex items-baseline gap-2 min-w-0">
                <span className="font-black text-base @sm:text-lg text-slate-900 dark:text-white truncate">
                  {patient.firstName || 'New patient'}{patient.lastInitial ? ` ${patient.lastInitial}.` : ''}
                </span>
                <span className="shrink-0 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                  {patient.age || '0'} · {patient.sex}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate leading-tight">
                {patient.chiefComplaint || 'No chief complaint logged yet'}
              </p>
            </div>

            {/* Phase, barriers, timer and controls */}
            <div className="shrink-0 flex flex-col items-end gap-1.5">
              <div className="flex items-center gap-1.5">
                {barrierPill && (
                  <button
                    onClick={() => setExpanded(true)}
                    className="active:scale-95 transition-transform"
                    aria-label={activeBarriers.length > 0 ? `${activeBarriers.length} barriers flagged — tap to manage` : 'Barriers clear — tap to manage'}
                  >
                    {barrierPill}
                  </button>
                )}
                {phaseChip}
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-black tabular-nums" style={{ color: timerColor }}>
                {elapsed >= LONG_STAY && <AlertTriangle size={12} />}
                <Clock size={12} /> {formatTime(elapsed)}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); onUpdate(patient.id, { isPinned: !patient.isPinned }); }}
                  className={cn(
                    "w-8 h-8 rounded-full grid place-items-center transition-all",
                    patient.isPinned ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400"
                  )}
                  aria-label={patient.isPinned ? 'Unpin patient' : 'Pin patient'}
                >
                  <Pin size={13} className={cn(patient.isPinned && "fill-current")} />
                </button>
                <button
                  onClick={() => setExpanded(true)}
                  className="w-8 h-8 rounded-full grid place-items-center bg-slate-100 text-slate-400 hover:text-slate-600 dark:bg-slate-800 dark:text-slate-300 transition-colors"
                  aria-label="Expand"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Quick-advance action bar — tap to move the patient through their
              ED course (care phase + disposition) without expanding. */}
          <div className="flex flex-wrap items-center gap-1.5 pl-4 pr-3 pb-3 pt-0.5">
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-600 self-center mr-0.5">Advance</span>
            {quickStepper}
            {quickDispo}
          </div>
        </div>
      )}

      {/* =========================== EXPANDED VIEW =========================== */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="max-h-[80dvh] overflow-y-auto scroll-touch">
              <div className="p-3 @md:p-4 space-y-3.5">

                {/* Top bar: collapse · phase · timer · pin */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExpanded(false)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                  >
                    <ChevronUp size={14} /> Collapse
                  </button>
                  {phaseChip}
                  <span className="inline-flex items-center gap-1 text-[11px] font-black tabular-nums" style={{ color: timerColor }} title="Time on board">
                    {elapsed >= LONG_STAY && <AlertTriangle size={12} />}
                    <Clock size={12} /> {formatTime(elapsed)}
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onResetTimer(patient.id)}
                    className="w-7 h-7 rounded-lg grid place-items-center bg-slate-100 hover:bg-blue-50 text-slate-400 hover:text-blue-600 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                    title="Reset on-board timer"
                    aria-label="Reset on-board timer"
                  >
                    <RotateCcw size={13} />
                  </motion.button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onUpdate(patient.id, { isPinned: !patient.isPinned }); }}
                    className={cn(
                      "ml-auto w-8 h-8 rounded-full grid place-items-center transition-all",
                      patient.isPinned
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        : "bg-slate-100 text-slate-300 hover:text-slate-500 dark:bg-slate-800 dark:text-slate-500"
                    )}
                    aria-label={patient.isPinned ? 'Unpin patient' : 'Pin patient'}
                  >
                    <Pin size={14} className={cn(patient.isPinned && "fill-current")} />
                  </button>
                </div>

                {/* Identity header: room · name/age/sex */}
                <div className="flex items-center gap-2.5">
                  {/* Room */}
                  <div className="shrink-0 w-14 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-1.5 text-center">
                    <span className="block text-[8px] font-black uppercase text-slate-400 dark:text-slate-500 leading-none mb-0.5">Room</span>
                    <input
                      value={patient.room}
                      onChange={(e) => onUpdate(patient.id, { room: e.target.value })}
                      className="w-full text-center font-black text-lg text-slate-900 dark:text-white bg-transparent outline-none border-none p-0 leading-none uppercase placeholder:text-slate-300 dark:placeholder:text-slate-600"
                      placeholder="?"
                      maxLength={4}
                      aria-label="Room"
                    />
                  </div>

                  {/* Name + demographics */}
                  <div className="min-w-0">
                    <span className="block text-[8px] font-black uppercase text-slate-400 dark:text-slate-500 mb-0.5">Patient · name + initial</span>
                    <div className="flex items-baseline gap-1.5">
                      <input
                        ref={firstNameRef}
                        value={patient.firstName ?? ''}
                        onChange={(e) => {
                          const firstName = e.target.value.replace(/[^a-zA-Z'’\- ]/g, '');
                          onUpdate(patient.id, { firstName, initials: deriveInitials(firstName, patient.lastInitial) });
                        }}
                        className="w-28 @sm:w-32 font-black text-xl tracking-tight text-slate-900 dark:text-white bg-transparent outline-none border-none p-0 focus:ring-0 capitalize placeholder:text-slate-300 dark:placeholder:text-slate-600 placeholder:font-bold placeholder:text-lg"
                        placeholder="First name"
                        autoCapitalize="words"
                        autoComplete="off"
                        maxLength={20}
                        aria-label="Patient first name"
                      />
                      <input
                        value={patient.lastInitial ?? ''}
                        onChange={(e) => {
                          const lastInitial = e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 1);
                          onUpdate(patient.id, { lastInitial, initials: deriveInitials(patient.firstName, lastInitial) });
                        }}
                        className="w-7 font-black text-xl tracking-tight text-slate-400 dark:text-slate-500 bg-transparent outline-none border-none p-0 focus:ring-0 text-center uppercase placeholder:text-slate-300 dark:placeholder:text-slate-600 placeholder:font-bold placeholder:text-lg"
                        placeholder="L."
                        maxLength={1}
                        aria-label="Patient last initial"
                      />
                      {patient.lastInitial && <span className="text-xl font-black text-slate-400 dark:text-slate-500 -ml-1.5">.</span>}
                    </div>

                    <div className="flex items-center gap-1.5 mt-0.5">
                        <input
                          value={patient.age.replace(/[^0-9]/g, '')}
                          onChange={(e) => {
                            const number = e.target.value.replace(/[^0-9]/g, '');
                            const unit = patient.age.replace(/[0-9]/g, '') || 'y';
                            onUpdate(patient.id, { age: `${number}${unit}` });
                          }}
                          className="w-7 font-extrabold text-xs text-slate-500 dark:text-slate-400 bg-transparent border-none p-0 focus:ring-0 text-right outline-none"
                          placeholder="0"
                          aria-label="Age"
                        />
                        <select
                          value={patient.age.replace(/[0-9]/g, '') || 'y'}
                          onChange={(e) => {
                            const number = patient.age.replace(/[^0-9]/g, '') || '0';
                            onUpdate(patient.id, { age: `${number}${e.target.value}` });
                          }}
                          className="text-xs font-bold text-slate-400 dark:text-slate-500 bg-transparent border-none p-0 focus:ring-0 outline-none cursor-pointer"
                          aria-label="Age unit"
                        >
                          <option value="y">y/o</option>
                          <option value="m">m/o</option>
                          <option value="d">d/o</option>
                        </select>

                        <span className="text-slate-200 dark:text-slate-700 font-bold">|</span>

                        <select
                          value={patient.sex}
                          onChange={(e) => onUpdate(patient.id, { sex: e.target.value as any })}
                          className={cn(
                            "text-xs font-black bg-transparent border-none p-0 focus:ring-0 outline-none cursor-pointer uppercase",
                            patient.sex === 'M' ? "text-blue-500" : patient.sex === 'F' ? "text-pink-500" : "text-purple-500"
                          )}
                          aria-label="Sex"
                        >
                          <option value="M">Male</option>
                          <option value="F">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                </div>

                {/* Chief complaint */}
                <div>
                  <span className={cn(sectionLabel, "block mb-1")}>Chief complaint &amp; presentation</span>
                  <textarea
                    rows={2}
                    value={patient.chiefComplaint}
                    onChange={(e) => onUpdate(patient.id, { chiefComplaint: e.target.value })}
                    className="w-full text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 focus:bg-white dark:focus:bg-slate-800 resize-none outline-none leading-snug focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="Describe clinical presentation details…"
                  />
                </div>

                {/* Care phase — tappable Fellow → Staffed → Attending (compact) */}
                <div>
                  <span className={cn(sectionLabel, "block mb-1.5")}>Care phase · tap to update</span>
                  <div className="grid grid-cols-3 gap-2">
                    {careSteps.map((s) => (
                      <button
                        key={s.key}
                        onClick={s.onClick}
                        className={cn(
                          "rounded-xl border-2 px-2 py-2 flex items-center justify-center gap-1.5 min-h-[44px] transition-all duration-200 outline-none active:scale-95",
                          s.done
                            ? cn(TONES[s.tone].bar, "border-transparent text-white shadow-sm")
                            : "border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
                        )}
                        aria-pressed={s.done}
                      >
                        <span
                          className={cn(
                            "w-5 h-5 rounded-full grid place-items-center text-[10px] font-black shrink-0",
                            s.done ? "bg-white/25 text-white" : "bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"
                          )}
                        >
                          {s.done ? <Check size={12} /> : s.n}
                        </span>
                        <span className="text-[11px] font-black uppercase tracking-wide leading-none">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Disposition + barriers */}
                <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-3 border border-slate-100 dark:border-slate-800/70 space-y-3">
                  {/* Attending disposition decision */}
                  <div className="flex flex-col @sm:flex-row @sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200/70 dark:border-slate-800">
                    <span className={sectionLabel}>Disposition decision</span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {dispositions.map(({ status, icon, tone: t, label }) => {
                        const isActive = patient.status === status;
                        return (
                          <button
                            key={status}
                            onClick={(e) => setDisposition(status, e)}
                            className={cn(
                              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide border-2 transition-all active:scale-95",
                              isActive
                                ? cn(TONES[t].bar, "border-transparent text-white shadow")
                                : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 hover:border-slate-300 dark:border-slate-700"
                            )}
                          >
                            {icon}
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Barriers */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={sectionLabel}>Dispo barriers · tap to cycle</span>
                      {activeBarriers.length > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60">
                          <AlertCircle size={11} /> {activeBarriers.length} flagged
                        </span>
                      ) : completedBarriers.length > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60">
                          <CheckCircle2 size={11} /> All clear
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">None flagged</span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 @sm:grid-cols-3 @md:grid-cols-4 gap-2">
                      {barriers.map((barrier) => {
                        const state = patient.tasks[barrier.key] || 'off';
                        const flagged = state === 'pending' || state === 'ordered';
                        return (
                          <button
                            key={barrier.key}
                            onClick={(e) => handleToggleBarrier(barrier.key, e)}
                            className={cn(
                              "p-2 rounded-xl border-2 flex items-center gap-1.5 text-left transition-all duration-200 relative min-h-[44px] active:scale-95",
                              state === 'off' && "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-slate-400 dark:text-slate-500",
                              flagged && "border-amber-400 bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-700/70",
                              state === 'complete' && "border-emerald-400 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-700/70"
                            )}
                            aria-label={`${barrier.label}: ${state === 'off' ? 'not required' : state === 'complete' ? 'completed' : 'flagged'}`}
                            title={state === 'off' ? 'Not required' : state === 'complete' ? 'Completed' : 'Flagged'}
                          >
                            <div className={cn(
                              "p-1 rounded-md shrink-0",
                              state === 'off' && "bg-slate-100 text-slate-400 dark:bg-slate-800",
                              flagged && "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
                              state === 'complete' && "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300"
                            )}>
                              {barrier.icon}
                            </div>
                            <span className="min-w-0 flex-1 block text-[10px] font-black truncate uppercase tracking-tight leading-tight">{barrier.label}</span>
                            {flagged && <AlertCircle size={12} className="shrink-0 text-amber-500" />}
                            {state === 'complete' && <CheckCircle2 size={12} className="shrink-0 text-emerald-500" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* GOOD TO GO stamp */}
                <AnimatePresence>
                  {isGoodToGo && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="border-2 border-dashed border-emerald-500 rounded-2xl px-4 py-2.5 text-center bg-emerald-500/10 flex items-center justify-center gap-2"
                    >
                      <Check className="text-emerald-500 shrink-0" size={20} />
                      <span className="text-emerald-600 dark:text-emerald-400 text-base font-black uppercase tracking-tight">Good to go!</span>
                      <span className="text-[9px] text-emerald-600/80 dark:text-emerald-400/80 uppercase tracking-widest font-extrabold hidden @sm:inline">
                        Staffed &amp; cleared
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Assigned provider */}
                <div className="relative flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Users size={16} className="text-slate-400 dark:text-slate-500 shrink-0" />
                    <span className={sectionLabel}>Provider:</span>
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {assignees.map(member => (
                        <span
                          key={member.id}
                          className={cn("px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border", getRoleColor(member.role))}
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
                    Assign
                  </button>

                  <AnimatePresence>
                    {showAssigneeDropdown && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setShowAssigneeDropdown(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 top-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-xl p-3 z-40 w-64 space-y-1.5"
                        >
                          <h4 className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2.5 py-1">Shift crew</h4>
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
                                      ? "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
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

                {/* Plan & notes toggle */}
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={sectionLabel}>Plan &amp; notes</span>
                    {patient.operationalNotes && !showNotes && (
                      <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-black truncate max-w-[150px]">
                        {patient.operationalNotes}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowNotes(!showNotes)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl text-[10px] font-black uppercase transition-all"
                    >
                      {showNotes ? 'Hide' : 'Notes'}
                      {showNotes ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {/* Sign-out / complete — drives the board's isCompleted sort. */}
                    <button
                      onClick={() => onComplete(patient.id)}
                      aria-pressed={!!patient.isCompleted}
                      title={patient.isCompleted ? 'Reopen patient' : 'Mark signed out / complete'}
                      className={cn(
                        "flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all",
                        patient.isCompleted
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                      )}
                    >
                      {patient.isCompleted ? <><RotateCcw size={13} /> Reopen</> : <><Check size={14} /> Sign out</>}
                    </button>

                    <button
                      onClick={() => { if (confirm('Remove this patient record?')) onDelete(patient.id); }}
                      className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                      title="Delete patient record"
                      aria-label="Delete patient record"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Notes & gestational age */}
                <AnimatePresence>
                  {showNotes && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-4 pt-1"
                    >
                      <div className="space-y-1.5">
                        <span className={cn(sectionLabel, "block")}>Clinical plan &amp; outcomes</span>
                        <textarea
                          rows={4}
                          value={patient.operationalNotes}
                          onChange={(e) => onUpdate(patient.id, { operationalNotes: e.target.value })}
                          className="w-full text-sm font-medium p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500 resize-none transition-colors"
                          placeholder="Primary coordination summary or handover plan…"
                        />
                      </div>

                      <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/60">
                        <div className="flex-1">
                          <span className="block text-[8px] font-black uppercase text-slate-400 dark:text-slate-500 leading-none mb-1">Gestational age (neonates)</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 leading-none">Ex-gestational age tracking</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min={20}
                              max={45}
                              value={patient.gestationalAge?.weeks || ''}
                              onChange={(e) => onUpdate(patient.id, { gestationalAge: { ...patient.gestationalAge, weeks: parseInt(e.target.value) || 0, days: patient.gestationalAge?.days || 0 } })}
                              className="w-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs font-black text-center"
                              placeholder="Wk"
                            />
                            <span className="text-xs font-black text-slate-400">w</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <select
                              value={patient.gestationalAge?.days || 0}
                              onChange={(e) => onUpdate(patient.id, { gestationalAge: { ...patient.gestationalAge, weeks: patient.gestationalAge?.weeks || 0, days: parseInt(e.target.value) || 0 } })}
                              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs font-black text-center"
                            >
                              {[0, 1, 2, 3, 4, 5, 6].map(d => <option key={d} value={d}>{d}d</option>)}
                            </select>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
