/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
