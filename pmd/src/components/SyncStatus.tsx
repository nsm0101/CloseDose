/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { cn } from '../lib/utils';

export type SyncState = 'connecting' | 'live' | 'offline';

interface SyncStatusProps {
  state: SyncState;
  /** `full` shows a labelled pill; `dot` shows a compact dot + short label. */
  variant?: 'full' | 'dot';
  className?: string;
}

const CONFIG: Record<SyncState, { dot: string; ring: string; label: string; help: string; text: string }> = {
  live: {
    dot: 'bg-emerald-500',
    ring: 'bg-emerald-500/40',
    label: 'Live · Synced',
    help: 'Everyone on this session sees changes instantly.',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  connecting: {
    dot: 'bg-amber-400',
    ring: 'bg-amber-400/40',
    label: 'Reconnecting…',
    help: 'Syncing with the team. Your edits are saved.',
    text: 'text-amber-600 dark:text-amber-400',
  },
  offline: {
    dot: 'bg-rose-500',
    ring: 'bg-rose-500/40',
    label: 'Offline · Saved on device',
    help: 'No connection. Changes save here and sync when you are back online.',
    text: 'text-rose-600 dark:text-rose-400',
  },
};

/**
 * Trust signal for the real-time board: tells every user, at a glance, whether
 * they are seeing live shared data. Designed to be legible to non-technical
 * users — plain words, not jargon.
 */
export const SyncStatus: React.FC<SyncStatusProps> = ({ state, variant = 'full', className }) => {
  const c = CONFIG[state];

  if (variant === 'dot') {
    return (
      <div className={cn('flex items-center gap-1.5', className)} title={c.help} aria-label={c.label}>
        <span className="relative flex h-2 w-2">
          {state === 'live' && (
            <span className={cn('absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping', c.ring)} />
          )}
          <span className={cn('relative inline-flex h-2 w-2 rounded-full', c.dot)} />
        </span>
        <span className={cn('col-header opacity-70', c.text)}>{state === 'live' ? 'Live' : state === 'offline' ? 'Offline' : 'Sync'}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border bg-white/80 dark:bg-slate-900/70 backdrop-blur transition-colors',
        state === 'live' && 'border-emerald-100 dark:border-emerald-900/40',
        state === 'connecting' && 'border-amber-100 dark:border-amber-900/40',
        state === 'offline' && 'border-rose-100 dark:border-rose-900/40',
        className,
      )}
      title={c.help}
      role="status"
      aria-live="polite"
    >
      <span className="relative flex h-2.5 w-2.5">
        {state === 'live' && (
          <span className={cn('absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping', c.ring)} />
        )}
        <span className={cn('relative inline-flex h-2.5 w-2.5 rounded-full', c.dot)} />
      </span>
      <span className={cn('text-[10px] font-black uppercase tracking-wider', c.text)}>{c.label}</span>
    </div>
  );
};
