/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, ShieldCheck, ArrowRight, Loader2, Star, Stethoscope, Award } from 'lucide-react';
import { auth } from '../firebase';
import { signInAnonymously } from 'firebase/auth';
import { cn } from '../lib/utils';

interface LandingScreenProps {
  onComplete: (firstName: string, lastName: string, role: 'attending' | 'fellow') => void;
  loading?: boolean;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onComplete, loading = false }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<'attending' | 'fellow' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter your first and last name.');
      return;
    }
    if (!role) {
      setError('Please select your role (Attending or Fellow).');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Bypasses login complexity by signing in anonymously in the background
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }
      onComplete(firstName.trim(), lastName.trim(), role);
    } catch (err: any) {
      console.error('Anonymous sign in failed:', err);
      setError('Connection failed. Please check your internet connection.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800/85 overflow-hidden transition-colors"
      >
        {/* Banner/Header */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-900 p-8 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent)] pointer-none" />
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-lg"
          >
            <Stethoscope size={40} className="text-white animate-pulse" />
          </motion.div>
          
          <h1 className="text-2xl font-black tracking-tight uppercase">PREtendingMD</h1>
          <p className="text-xs text-blue-100/80 uppercase tracking-widest font-bold mt-1">Pediatric Emergency Medicine Co-Pilot</p>
        </div>

        {/* Form Body */}
        <div className="p-8 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight">Introduce Yourself</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Quick entry for real-time collaboration with your shift partner</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl text-xs font-bold leading-relaxed"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">First Name</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Sarah"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Last Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Miller"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Role Cards (Extremely visual & easy to tap) */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 block">Your Shift Role</label>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Attending Card */}
                <button
                  type="button"
                  onClick={() => { setRole('attending'); setError(null); if (navigator.vibrate) navigator.vibrate(5); }}
                  className={cn(
                    "p-5 rounded-3xl border-2 text-center transition-all flex flex-col items-center justify-center gap-2 outline-none cursor-pointer select-none",
                    role === 'attending'
                      ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20 shadow-md scale-[1.02]"
                      : "border-slate-100 dark:border-slate-800 bg-slate-50/35 dark:bg-slate-800/20 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  )}
                >
                  <Award size={28} className={cn(role === 'attending' ? "text-blue-500" : "opacity-60")} />
                  <span className="text-sm font-extrabold uppercase tracking-wide">Attending</span>
                  <span className="text-[9px] font-medium opacity-80 leading-snug">Sign off & dispo patients</span>
                </button>

                {/* Fellow Card */}
                <button
                  type="button"
                  onClick={() => { setRole('fellow'); setError(null); if (navigator.vibrate) navigator.vibrate(5); }}
                  className={cn(
                    "p-5 rounded-3xl border-2 text-center transition-all flex flex-col items-center justify-center gap-2 outline-none cursor-pointer select-none",
                    role === 'fellow'
                      ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20 shadow-md scale-[1.02]"
                      : "border-slate-100 dark:border-slate-800 bg-slate-50/35 dark:bg-slate-800/20 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  )}
                >
                  <Star size={28} className={cn(role === 'fellow' ? "text-blue-500" : "opacity-60")} />
                  <span className="text-sm font-extrabold uppercase tracking-wide">Fellow</span>
                  <span className="text-[9px] font-medium opacity-80 leading-snug">Add & staff patient workups</span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-wider text-xs shadow-xl shadow-blue-200 dark:shadow-none flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSubmitting || loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  Enter Shift board
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>
        </div>

        {/* Bottom PII Notice */}
        <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/55 text-center">
          <div className="inline-flex items-center gap-1 text-slate-400 dark:text-slate-500 text-[9px] font-bold uppercase tracking-widest leading-none">
            <ShieldCheck size={12} className="text-emerald-500" /> Secure HIPAA-Compliant Co-Pilot · No PHI
          </div>
        </div>
      </motion.div>
    </div>
  );
};
