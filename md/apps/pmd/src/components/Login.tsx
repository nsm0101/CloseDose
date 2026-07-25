/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertCircle, Plus, Sparkles } from 'lucide-react';
import { BRAND } from '../lib/brand';

interface LoginProps {
  initialError?: string | null;
}

export const Login: React.FC<LoginProps> = ({ initialError }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const displayedError = error || initialError;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Redirect sign-in relies on cross-origin storage when Auth is hosted on
      // firebaseapp.com. Popup sign-in keeps this custom Pages origin working
      // in browsers that block that storage, including Safari.
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Google Login Error:", err);
      if (err.code === 'auth/internal-error') {
        try {
          const parsedMessage = JSON.parse(err.message);
          setError(`Firebase Internal Error: ${parsedMessage.error.message || err.message}`);
        } catch {
          setError(`Firebase Internal Error: ${err.message}`);
        }
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Sign-in provider is not enabled. Please enable it in the Firebase Console.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('This provider website is not authorized for Google sign-in. Please contact the PREtendingMD administrator.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Google sign-in was blocked by the browser. Allow popups for this site and try again.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800/85 overflow-hidden transition-colors">
        {/* Banner/Header — brand-forward hero: oversized sticker bear + rainbow wordmark */}
        <div className="relative overflow-hidden px-8 pt-10 pb-9 text-center bg-gradient-to-b from-slate-50 via-white to-white dark:from-slate-800/40 dark:via-slate-900 dark:to-slate-900 transition-colors">
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

          <p className="relative z-10 mt-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">PEM FlowMaster</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Authorized clinical team access
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Sign in with a verified Google account approved by the PREtendingMD administrator.
            </p>
          </div>

          {displayedError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-lg flex items-start gap-2 text-rose-600 dark:text-rose-400 text-xs font-medium">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{displayedError}</span>
            </div>
          )}

          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm disabled:opacity-50"
          >
            <span aria-hidden="true" className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600 grid place-items-center text-xs font-black">G</span>
            {loading ? 'Opening Google sign-in…' : 'Continue with Google'}
          </button>
        </div>

        <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/55">
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest justify-center text-center">
            <ShieldCheck size={12} className="shrink-0" /> Patient and operational data sync to the authorized Firebase workspace
          </div>
        </div>
      </div>
    </div>
  );
};
