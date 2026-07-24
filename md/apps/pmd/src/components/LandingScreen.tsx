/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, Loader2, Star, Award, Plus, Sparkles } from 'lucide-react';
import { auth } from '../firebase';
import { signInAnonymously } from 'firebase/auth';
import { cn } from '../lib/utils';
import { BRAND } from '../lib/brand';

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
      setError('Please select your role (attending or fellow).');
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
    <div className="pmd pmd-playful-shell min-h-[100dvh] flex items-center justify-center p-4 transition-colors" data-pmd-theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-md w-full pmd-card-surface rounded-[2.5rem] border overflow-hidden transition-colors"
      >
        {/* Banner/Header — brand-forward hero: oversized sticker bear + rainbow wordmark */}
        <div className="relative overflow-hidden px-8 pt-10 pb-9 text-center bg-[linear-gradient(180deg,var(--pmd-sky),var(--pmd-surface))] transition-colors">
          {/* Soft rainbow glow echoes the wordmark and spotlights the bear (replaces the old hard circle) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-2 h-56 w-56 -translate-x-1/2 rounded-full blur-3xl opacity-40 dark:opacity-25 bg-[conic-gradient(from_135deg,#fca5a5,#fdba74,#fde047,#86efac,#7dd3fc,#c4b5fd,#fca5a5)]"
          />

          {/* Playful medical + sparkle motifs add hand-drawn texture without competing with the logo */}
          <Plus aria-hidden="true" strokeWidth={3} className="pointer-events-none absolute left-6 top-7 h-4 w-4 text-sky-300 dark:text-sky-700/70" />
          <Sparkles aria-hidden="true" className="pointer-events-none absolute right-7 top-6 h-4 w-4 text-amber-300 dark:text-amber-500/60" />
          <Plus aria-hidden="true" strokeWidth={3} className="pointer-events-none absolute bottom-8 right-9 h-3.5 w-3.5 text-rose-300 dark:text-rose-700/60" />
          <Sparkles aria-hidden="true" className="pointer-events-none absolute bottom-9 left-9 h-3 w-3 text-violet-300 dark:text-violet-700/60" />

          {/* Enlarged sticker bear — no circle, gentle hover to bring the mascot to life */}
          <motion.img
            src={BRAND.mascot}
            alt="PREtendingMD bear mascot"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, y: [0, -7, 0] }}
            transition={{
              scale: { type: 'spring', stiffness: 200, damping: 15 },
              opacity: { duration: 0.4 },
              y: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' },
            }}
            className="relative z-10 mx-auto mb-4 block h-40 w-40 object-contain drop-shadow-[0_14px_18px_rgba(15,23,42,0.20)] dark:drop-shadow-[0_16px_24px_rgba(0,0,0,0.55)]"
          />

          {/* Wordmark replaces the plain-text title */}
          <h1 className="relative z-10">
            <img src={BRAND.wordmark} alt="PREtendingMD" className="mx-auto block h-10 w-auto" />
          </h1>

          <p className="relative z-10 mt-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Pediatric emergency medicine co-pilot</p>
        </div>

        {/* Form Body */}
        <div className="p-8 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight">Introduce yourself</h2>
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
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">First name</label>
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
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Last name</label>
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
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 block">Your shift role</label>
              
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
              className="w-full py-4 pmd-primary-action text-white rounded-2xl font-black uppercase tracking-wider text-xs shadow-xl shadow-blue-200 dark:shadow-none flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSubmitting || loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  Enter shift board
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>
        </div>

        {/* Bottom PII Notice */}
        <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/55 text-center">
          <div className="inline-flex items-center gap-1 text-slate-400 dark:text-slate-500 text-[9px] font-bold uppercase tracking-widest leading-none text-center">
            <ShieldCheck size={12} className="text-emerald-500 shrink-0" /> Authenticated workspace · shift data sync enabled
          </div>
        </div>
      </motion.div>
    </div>
  );
};
