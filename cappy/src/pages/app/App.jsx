
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../../styles.css";
import { requireAuth, signOut } from "../../authService";
import { supabase } from "../../supabaseClient";
import { createFamilySettings } from "../../components/FamilySettings";
import { createFamilyMembers } from "../../components/FamilyMembers";
import { createPatients } from "../../components/Patients";
import { createMedications } from "../../components/Medications";
import { createNFCTags } from "../../components/NFCTags";
import { createDoseEvents } from "../../components/DoseEvents";
import { createPatientWeights } from "../../components/PatientWeights";
import { showToast } from "../../lib/toast";

const App = () => {
  const [user, setUser] = useState(null);
  const [familyId, setFamilyId] = useState(localStorage.getItem("cappy_family_id"));
  const [familyRole, setFamilyRole] = useState("member");
  const [family, setFamily] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const authedUser = await requireAuth({ nextUrl: window.location.pathname + window.location.search });
      if (!authedUser) {
        navigate('/auth');
      } else {
        setUser(authedUser);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };
  
  const handleScan = () => {
    navigate('/scan');
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="card">
      <div className="row space-between">
        <div>
          <h2>Cappy Admin</h2>
          <p><span className="badge">signed in</span> {user.email ?? "(no email)"}</p>
          <p className="muted" id="family-label">{family ? `Family: ${family.name}` : 'No family selected'}</p>
        </div>
        <div className="row">
          <button id="scan" onClick={handleScan}>Scan</button>
          <button id="out" onClick={handleSignOut}>Sign out</button>
        </div>
      </div>
      <div id="components" className="stack">
        {/* Components will be rendered here */}
      </div>
    </div>
  );
};

export default App;
