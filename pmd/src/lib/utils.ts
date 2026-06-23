/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Patient } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ------------------------------------------------------------------ *
 * ED-course phase — a single source of truth shared by the patient
 * card (rail / chips / steppers) and the board (department census).
 * Color = information: one dominant accent tone per clinical phase.
 * ------------------------------------------------------------------ */
export type PhaseTone = 'rose' | 'blue' | 'indigo' | 'violet' | 'emerald';

export interface ToneStyle {
  /** Solid accent — the left status rail and filled care-step dots. */
  bar: string;
  /** Pill: background / text / border, light + dark. */
  chip: string;
  /** Accent text color. */
  text: string;
  /** Emphasis ring for the whole card. */
  ring: string;
  /** Soft dot for the census strip. */
  dot: string;
}

export const PHASE_TONES: Record<PhaseTone, ToneStyle> = {
  rose: {
    bar: 'bg-rose-500',
    chip: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900/60',
    text: 'text-rose-600 dark:text-rose-400',
    ring: 'ring-rose-500/20 dark:ring-rose-400/20',
    dot: 'bg-rose-500',
  },
  blue: {
    bar: 'bg-blue-500',
    chip: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900/60',
    text: 'text-blue-600 dark:text-blue-400',
    ring: 'ring-blue-500/20 dark:ring-blue-400/20',
    dot: 'bg-blue-500',
  },
  indigo: {
    bar: 'bg-indigo-500',
    chip: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-900/60',
    text: 'text-indigo-600 dark:text-indigo-400',
    ring: 'ring-indigo-500/20 dark:ring-indigo-400/20',
    dot: 'bg-indigo-500',
  },
  violet: {
    bar: 'bg-violet-500',
    chip: 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-900/60',
    text: 'text-violet-600 dark:text-violet-400',
    ring: 'ring-violet-500/20 dark:ring-violet-400/20',
    dot: 'bg-violet-500',
  },
  emerald: {
    bar: 'bg-emerald-500',
    chip: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900/60',
    text: 'text-emerald-600 dark:text-emerald-400',
    ring: 'ring-emerald-500/25 dark:ring-emerald-400/25',
    dot: 'bg-emerald-500',
  },
};

/** The eight clinical dispo-barrier task keys. */
export const BARRIER_KEYS: (keyof Patient['tasks'])[] = [
  'labs', 'imaging', 'meds', 'consult', 'poIntake', 'painControl', 'ambulation', 'documents',
];

/** Derive the three care-phase booleans from the (legacy + flag) fields. */
export function getPatientFlags(p: Patient) {
  const seenByFellow = p.workflowFlags?.readyForAttending || p.seenState === 'Seen by Fellow' || p.seenState === 'Seen by Attending';
  const staffedToAttending = p.workflowFlags?.awaitingDispo || p.seenState === 'Seen by Attending';
  const seenByAttending = p.seenState === 'Seen by Attending';
  return { seenByFellow, staffedToAttending, seenByAttending };
}

/** Count of barriers that are flagged but not yet completed. */
export function getActiveBarrierCount(p: Patient): number {
  return BARRIER_KEYS.filter(k => {
    const v = p.tasks?.[k] || 'off';
    return v === 'pending' || v === 'ordered';
  }).length;
}

export type EdPhaseKey =
  | 'toBeSeen' | 'workup' | 'staffed' | 'attending'
  | 'obs' | 'admit' | 'discharge' | 'ready';

export interface EdPhase {
  key: EdPhaseKey;
  label: string;
  tone: PhaseTone;
}

/** Where the patient is in the ED course — the one place this is decided. */
export function getPatientPhase(p: Patient): EdPhase {
  const { seenByFellow, staffedToAttending, seenByAttending } = getPatientFlags(p);
  const isDispositioned = ['Discharge', 'Admit', 'ED Observation'].includes(p.status);
  const isBarrierFree = getActiveBarrierCount(p) === 0;
  const isGoodToGo = isDispositioned && seenByAttending && isBarrierFree;

  if (isGoodToGo) return { key: 'ready', label: 'Ready to Go', tone: 'emerald' };
  if (p.status === 'Discharge') return { key: 'discharge', label: 'Discharge', tone: 'emerald' };
  if (p.status === 'Admit') return { key: 'admit', label: 'Admit', tone: 'indigo' };
  if (p.status === 'ED Observation') return { key: 'obs', label: 'ED Obs', tone: 'violet' };
  if (seenByAttending) return { key: 'attending', label: 'Attending Seen', tone: 'violet' };
  if (staffedToAttending) return { key: 'staffed', label: 'Staffed', tone: 'indigo' };
  if (seenByFellow) return { key: 'workup', label: 'Work-up', tone: 'blue' };
  return { key: 'toBeSeen', label: 'To Be Seen', tone: 'rose' };
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'New': return 'bg-red-500 text-white';
    case 'Staff': return 'bg-yellow-400 text-black';
    case 'Work-up': return 'bg-orange-500 text-white';
    case 'ED Observation': return 'bg-blue-900 text-white';
    case 'Likely Discharge': return 'bg-green-700 text-white';
    case 'Likely Admit': return 'bg-pink-700 text-white';
    case 'Discharge': return 'bg-green-400 text-black';
    case 'Admit': return 'bg-pink-300 text-black';
    default: return 'bg-gray-200 text-black';
  }
}

export function getStatusStyle(status: string) {
  return getStatusColor(status);
}

export function getTimerColor(seconds: number) {
  const minutes = seconds / 60;
  if (minutes >= 180) return '#ef4444'; // red-500
  if (minutes >= 90) {
    // Interpolate between orange and red
    const ratio = (minutes - 90) / 90;
    return ratio > 0.5 ? '#ef4444' : '#f97316'; // Simplified for now, or use hex
  }
  if (minutes > 0) {
    // Interpolate between green and orange
    const ratio = minutes / 90;
    return ratio > 0.5 ? '#f97316' : '#22c55e'; // Simplified
  }
  return '#22c55e'; // green-500
}

export function getRoleColor(role: string) {
  switch (role) {
    case 'attending': return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
    case 'fellow': return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    case 'resident': return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
    case 'student': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
    case 'nurse': return 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
  }
}

export function getStatusGradient(status: string) {
  switch (status) {
    case 'New': return 'bg-linear-to-b from-red-500/20 to-transparent';
    case 'Staff': return 'bg-linear-to-b from-yellow-400/20 to-transparent';
    case 'Work-up': return 'bg-linear-to-b from-orange-500/20 to-transparent';
    case 'ED Observation': return 'bg-linear-to-b from-blue-900/20 to-transparent';
    case 'Likely Discharge': return 'bg-linear-to-b from-green-700/20 to-transparent';
    case 'Likely Admit': return 'bg-linear-to-b from-pink-700/20 to-transparent';
    case 'Discharge': return 'bg-linear-to-b from-green-400/20 to-transparent';
    case 'Admit': return 'bg-linear-to-b from-pink-300/20 to-transparent';
    default: return 'bg-linear-to-b from-gray-200/20 to-transparent';
  }
}

export function getSeenBorderStyle(seenState: string) {
  switch (seenState) {
    case 'To Be Seen': return 'border-dashed border-2 border-gray-400 dark:border-gray-600';
    case 'Seen by Fellow': return 'border-solid border-4 border-blue-600 dark:border-blue-500';
    case 'Seen by Attending': return 'border-double border-8 border-purple-800 dark:border-purple-600';
    default: return 'border-solid border-2 border-gray-200 dark:border-gray-800';
  }
}
