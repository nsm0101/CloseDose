/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shift } from '../types';
import { Calendar, Plus, Clock, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

interface ShiftSelectorProps {
  shifts: Shift[];
  activeShiftId: string | null;
  onSelect: (id: string) => void;
  onCreate: (name: string) => void;
  onDelete: (id: string) => void;
}

import { motion } from 'framer-motion';

export const ShiftSelector: React.FC<ShiftSelectorProps> = ({ shifts, activeShiftId, onSelect, onCreate, onDelete }) => {
  const [newShiftName, setNewShiftName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newShiftName.trim()) {
      onCreate(newShiftName.trim());
      setNewShiftName('');
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-5 space-y-5 transition-colors">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black flex items-center gap-3 text-gray-800 dark:text-gray-200 tracking-tight">
          <Calendar size={24} className="text-blue-600 dark:text-blue-400" /> Shift Management
        </h2>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsCreating(!isCreating)}
          className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors shadow-sm"
        >
          <Plus size={24} />
        </motion.button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="flex gap-3 animate-in slide-in-from-top-2">
          <input 
            autoFocus
            className="flex-1 p-3.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-colors shadow-inner"
            placeholder="Shift Name (e.g., Night Shift 04/02)"
            value={newShiftName}
            onChange={(e) => setNewShiftName(e.target.value)}
          />
          <motion.button 
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="px-6 py-3.5 bg-blue-600 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-md"
          >
            Create
          </motion.button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shifts.map(shift => (
          <div key={shift.id} className="relative group">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(shift.id)}
              className={cn(
                "w-full p-5 rounded-2xl border text-left transition-all overflow-hidden relative",
                activeShiftId === shift.id 
                  ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-500/50 ring-2 ring-blue-100 dark:ring-blue-900/50 shadow-md" 
                  : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 shadow-sm"
              )}
            >
              <div className="flex flex-col gap-2">
                <span className={cn(
                  "text-base font-black tracking-tight",
                  activeShiftId === shift.id ? "text-blue-700 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
                )}>
                  {shift.name}
                </span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">
                    <Clock size={14} />
                    {format(shift.startTime.toMillis(), 'MMM d, HH:mm')}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-blue-500 dark:text-blue-400 font-black uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">
                    ID: {shift.sessionId}
                  </div>
                </div>
              </div>
              {activeShiftId === shift.id && (
                <div className="absolute top-5 right-5 text-blue-600 dark:text-blue-400">
                  <CheckCircle2 size={20} />
                </div>
              )}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Are you sure you want to delete this shift? This action cannot be undone.')) {
                  onDelete(shift.id);
                }
              }}
              className="absolute top-3 right-3 p-2.5 text-gray-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl md:opacity-0 group-hover:opacity-100 transition-all z-10"
              title="Delete Shift"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
            </motion.button>
          </div>
        ))}
        {shifts.length === 0 && !isCreating && (
          <div className="col-span-full py-12 text-center text-gray-400 dark:text-gray-600 italic text-sm font-medium">
            No shifts found. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
};
