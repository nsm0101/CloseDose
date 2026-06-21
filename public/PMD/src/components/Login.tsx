/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { auth, googleProvider } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  createUserWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import { LogIn, UserPlus, Mail, Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Handle the result of a redirect login
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // User is signed in
          console.log('Redirect login success');
        }
      } catch (err: any) {
        console.error('Redirect login error:', err);
        setError(`Redirect Error: ${err.message}`);
      }
    };
    handleRedirectResult();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      if (err.code === 'auth/internal-error') {
        setError('Firebase Internal Error: This usually means the "Email/Password" sign-in provider is not enabled in your Firebase Console. Please enable it or use Google Login.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Sign-in provider is not enabled. Please enable it in the Firebase Console.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    
    // Detect if we should use redirect instead of popup
    // Safari in-app browsers and some mobile environments block popups
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const useRedirect = isSafari || isMobile;

    try {
      if (useRedirect) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        await signInWithPopup(auth, googleProvider);
      }
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
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-blue-600 p-8 text-white text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg overflow-hidden border-4 border-blue-500">
            <img src="/images/FlowMaster_v1.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">PEM FlowMaster</h1>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button 
              onClick={() => setIsLogin(true)}
              className={cn(
                "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
                isLogin ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"
              )}
            >
              Login
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={cn(
                "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
                !isLogin ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"
              )}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-red-600 text-xs font-medium">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase px-1">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="name@hospital.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase px-1">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-md disabled:opacity-50"
            >
              {loading ? "Processing..." : isLogin ? <><LogIn size={18} /> Login</> : <><UserPlus size={18} /> Create Account</>}
            </button>
          </form>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
            <div className="relative flex justify-center text-xs uppercase font-bold text-gray-400"><span className="bg-white px-2">Or continue with</span></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
          >
            <img src="https://www.gstatic.com/firebase/anonymous-scan.png" alt="Google" className="w-5 h-5 grayscale" />
            Sign in with Google
          </button>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-widest justify-center">
            <ShieldCheck size={12} /> Secure HIPAA-Compliant Environment (No PHI)
          </div>
        </div>
      </div>
    </div>
  );
};
