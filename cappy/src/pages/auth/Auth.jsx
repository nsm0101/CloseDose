import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
// Import your global styles if needed
import '../../styles.css'; 

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isLogin) {
        // Log in existing user
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Create a new user account
        await createUserWithEmailAndPassword(auth, email, password);
      }
      // On success, Firebase updates the auth state automatically.
      // Redirect back to the dashboard (App.jsx)
      navigate('/');
    } catch (err) {
      console.error("Authentication error:", err);
      // Simplify Firebase error messages for the user
      setError(err.message.replace('Firebase: ', '')); 
    }
  };

  return (
    <div className="card" style={{ maxWidth: '400px', margin: '40px auto', padding: '30px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
        {isLogin ? 'Log In to Cappy' : 'Create Cappy Account'}
      </h2>
      
      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>
        
        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>
        
        <button 
          type="submit" 
          style={{ 
            padding: '12px', 
            backgroundColor: '#24a687', 
            color: 'white', 
            border: 'none', 
            borderRadius: '12px', 
            cursor: 'pointer', 
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginTop: '10px'
          }}
        >
          {isLogin ? 'Log In' : 'Sign Up'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.95rem' }}>
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#1f8f7b', 
            cursor: 'pointer', 
            fontWeight: 'bold',
            padding: 0,
            fontSize: 'inherit'
          }}
        >
          {isLogin ? 'Sign Up' : 'Log In'}
        </button>
      </div>
    </div>
  );
};

export default Auth;
