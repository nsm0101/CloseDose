import React from 'react';
import { firebaseAuth } from '../lib/firebaseClient';
import { GoogleAuthProvider, signInWithPopup, OAuthProvider } from 'firebase/auth';

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(firebaseAuth, provider);
  } catch (error) {
    console.error('Google OAuth error:', error.message);
    alert('Google sign-in failed. Please try again.');
  }
}

export async function signInWithApple() {
  const provider = new OAuthProvider('apple.com');
  try {
    await signInWithPopup(firebaseAuth, provider);
  } catch (error) {
    console.error('Apple OAuth error:', error.message);
    alert('Apple sign-in failed. Please try again.');
  }
}

export default function Login() {
  return (
    <div>
      <button type="button" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
      <button type="button" onClick={signInWithApple}>
        Sign in with Apple
      </button>
    </div>
  );
}
