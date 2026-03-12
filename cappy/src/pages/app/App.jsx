
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../../styles.css";

// Firebase imports for authentication
import { auth } from '../../firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const App = () => {
  const [user, setUser] = useState(null);
  const [family, setFamily] = useState(null); // Assuming family state is managed elsewhere
  const navigate = useNavigate();

  // Effect to check user's authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        // If no user, redirect to the authentication page
        navigate('/auth');
      }
    });
    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, [navigate]);

  // Handler for signing out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/auth');
    } catch (error) {
      console.error("Error signing out: ", error);
      alert("Error signing out. Please try again.");
    }
  };
  
  // Handler for scanning
  const handleScan = () => {
    navigate('/scan');
  };

  // Handler for the new "Log" button
  const handleLog = () => {
    // This is a placeholder. We can implement functionality to show dose logs.
    alert("Dose log functionality will be added here!");
  };

  // Render a loading state while checking for user
  if (!user) {
    return <div>Loading...</div>;
  }

  // Main component render
  return (
    <div className="card">
      <div className="row space-between" style={{ alignItems: 'flex-start', marginBottom: '20px' }}>
        {/* Log button on the top-left */}
        <div>
          <button id="log" onClick={handleLog}>Log</button>
        </div>
        
        {/* Action buttons on the top-right */}
        <div className="row">
          <button id="scan" onClick={handleScan}>Scan</button>
          <button id="out" onClick={handleSignOut} style={{ marginLeft: '10px' }}>Sign out</button>
        </div>
      </div>

      <div>
        <h2>Cappy Admin</h2>
        <p><span className="badge">signed in</span> {user.email ?? "(no email)"}</p>
        <p className="muted" id="family-label">{family ? `Family: ${family.name}` : 'No family selected'}</p>
      </div>

      <div id="components" className="stack" style={{ marginTop: '20px' }}>
        {/* Placeholder content. Other components can be rendered here based on state. */}
        <p>Welcome to Cappy! Your digital medication assistant.</p>
      </div>
    </div>
  );
};

export default App;
