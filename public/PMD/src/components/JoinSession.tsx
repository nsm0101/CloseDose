/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Shift } from '../types';

interface JoinSessionProps {
  onJoin: (sessionId: string) => Promise<boolean>;
  onCreate: (name: string) => void;
  shifts: Shift[];
  onSelect: (id: string) => void;
}

export const JoinSession: React.FC<JoinSessionProps> = ({ onJoin, onCreate, shifts, onSelect }) => {
  const [sessionId, setSessionId] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId) return;
    
    setIsJoining(true);
    setError(null);
    try {
      const success = await onJoin(sessionId);
      if (!success) {
        setError('Invalid Session ID. Please check and try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    onCreate(newName);
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-20 h-20 bg-blue-600 rounded-[2.5rem] flex items-center justify-center text-white mx-auto shadow-2xl shadow-blue-200 dark:shadow-none mb-6">
          <Users size={40} />
        </div>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Join a Session</h2>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Enter a session ID to join your team</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 space-y-6 transition-colors">
        {!showCreate ? (
          <form onSubmit={handleJoin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Session ID</label>
              <div className="relative">
                <input 
                  autoFocus
                  className="w-full pl-4 pr-12 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 rounded-2xl text-lg font-black tracking-widest uppercase outline-none transition-all"
                  placeholder="ABCDEF"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value.toUpperCase())}
                  maxLength={6}
                />
                <button 
                  type="submit"
                  disabled={isJoining || sessionId.length < 4}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 disabled:opacity-50 disabled:scale-95 transition-all"
                >
                  {isJoining ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold border border-red-100 dark:border-red-800/50"
              >
                <AlertCircle size={14} />
                {error}
              </motion.div>
            )}

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                <span className="bg-white dark:bg-gray-900 px-4 text-gray-400 dark:text-gray-500">Or</span>
              </div>
            </div>

            <button 
              type="button"
              onClick={() => setShowCreate(true)}
              className="w-full py-4 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border border-gray-100 dark:border-gray-700"
            >
              Start New Session
            </button>
          </form>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Session Name</label>
              <input 
                autoFocus
                className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 rounded-2xl text-lg font-black outline-none transition-all"
                placeholder="Day Shift - Pod A"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <button 
                type="button"
                onClick={() => setShowCreate(false)}
                className="flex-1 py-4 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              >
                Back
              </button>
              <button 
                type="submit"
                disabled={!newName}
                className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none disabled:opacity-50"
              >
                Create Session
              </button>
            </div>
          </form>
        )}
      </div>

      {shifts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] text-center">Recent Sessions</h3>
          <div className="grid gap-2">
            {shifts.slice(0, 3).map(shift => (
              <button
                key={shift.id}
                onClick={() => onSelect(shift.id)}
                className="w-full p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-between hover:border-blue-300 dark:hover:border-blue-800 transition-all group shadow-sm"
              >
                <div className="text-left">
                  <p className="text-sm font-black text-gray-900 dark:text-white tracking-tight">{shift.name}</p>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">ID: {shift.sessionId}</p>
                </div>
                <ArrowRight size={16} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
