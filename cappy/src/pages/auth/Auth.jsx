
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebaseConfig'; // Using Firebase
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { clearNextUrl, getNextUrl, setNextUrl } from '../../authService';
import '../../styles.css';

const Auth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextParam = params.get('next');
    if (nextParam) {
      setNextUrl(nextParam);
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const next = getNextUrl('/dashboard.html');
        clearNextUrl();
        navigate(next);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle the redirect
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      alert("Failed to sign in with Google. Please check the console for details.");
    }
  };

  return (
    <div className="auth-container">
      <h1>Cappy</h1>
      <p>Your AI-powered coding assistant.</p>
      <button onClick={signInWithGoogle} className="login-button google-login">
        Sign in with Google
      </button>
    </div>
  );
};

export default Auth;
