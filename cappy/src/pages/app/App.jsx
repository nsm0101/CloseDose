import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import "../../styles.css";

const App = () => {
  const [user, setUser] = useState(null);
  const [family, setFamily] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loadingDb, setLoadingDb] = useState(true);
  
  // Form states
  const [newFamilyName, setNewFamilyName] = useState('');
  const [newChildName, setNewChildName] = useState('');
  const [newChildWeight, setNewChildWeight] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchFamilyData(currentUser.uid);
      } else {
        navigate('/auth');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchFamilyData = async (uid) => {
    setLoadingDb(true);
    try {
      // 1. Look for a family owned by this user
      const familyRef = collection(db, "families");
      const q = query(familyRef, where("ownerId", "==", uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const familyDoc = querySnapshot.docs[0];
        setFamily({ id: familyDoc.id, ...familyDoc.data() });
        
        // 2. If family exists, fetch the children (patients)
        const patientsRef = collection(db, `families/${familyDoc.id}/patients`);
        const patientSnapshot = await getDocs(patientsRef);
        const patientList = patientSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPatients(patientList);
      }
    } catch (error) {
      console.error("Error fetching family data:", error);
    }
    setLoadingDb(false);
  };

  const handleCreateFamily = async (e) => {
    e.preventDefault();
    if (!newFamilyName) return;
    
    try {
      const docRef = await addDoc(collection(db, "families"), {
        name: newFamilyName,
        ownerId: user.uid,
        createdAt: new Date()
      });
      setFamily({ id: docRef.id, name: newFamilyName, ownerId: user.uid });
    } catch (error) {
      console.error("Error creating family:", error);
    }
  };

  const handleAddChild = async (e) => {
    e.preventDefault();
    if (!newChildName || !newChildWeight || !family) return;

    try {
      const patientsRef = collection(db, `families/${family.id}/patients`);
      const docRef = await addDoc(patientsRef, {
        name: newChildName,
        weightLbs: Number(newChildWeight),
        createdAt: new Date()
      });
      
      setPatients([...patients, { id: docRef.id, name: newChildName, weightLbs: Number(newChildWeight) }]);
      setNewChildName('');
      setNewChildWeight('');
    } catch (error) {
      console.error("Error adding child:", error);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/auth');
  };

  if (!user || loadingDb) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Cappy...</div>;

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '40px auto', padding: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ margin: 0, color: '#123a37' }}>Cappy Dashboard</h2>
        <button onClick={handleSignOut} style={{ padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Sign out</button>
      </div>

      {!family ? (
        <div style={{ background: '#f0faf6', padding: '20px', borderRadius: '12px', border: '2px solid #24a687' }}>
          <h3>Welcome! Let's set up your profile.</h3>
          <form onSubmit={handleCreateFamily} style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <input 
              type="text" 
              placeholder="Family Name (e.g., The Smiths)" 
              value={newFamilyName}
              onChange={(e) => setNewFamilyName(e.target.value)}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
              required
            />
            <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#24a687', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
              Create
            </button>
          </form>
        </div>
      ) : (
        <div>
          <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>{family.name} Profile</h3>
          
          <div style={{ marginTop: '20px', display: 'grid', gap: '12px' }}>
            {patients.length === 0 ? (
              <p style={{ color: '#666' }}>No children added yet.</p>
            ) : (
              patients.map(patient => (
                <div key={patient.id} style={{ display: 'flex', justifyContent: 'space-between', background: '#f8f9fa', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                  <strong>{patient.name}</strong>
                  <span style={{ color: '#1f8f7b', fontWeight: 'bold' }}>{patient.weightLbs} lbs</span>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAddChild} style={{ marginTop: '30px', background: '#fff', padding: '20px', borderRadius: '12px', border: '2px dashed #ccc' }}>
            <h4 style={{ marginTop: 0 }}>Add a Child</h4>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                placeholder="Child's Name" 
                value={newChildName}
                onChange={(e) => setNewChildName(e.target.value)}
                style={{ flex: 2, padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                required
              />
              <input 
                type="number" 
                placeholder="Weight (lbs)" 
                value={newChildWeight}
                onChange={(e) => setNewChildWeight(e.target.value)}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                required
              />
              <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#1f8f7b', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
                Add
              </button>
            </div>
          </form>

          <div style={{ marginTop: '40px', textAlign: 'center' }}>
            <button onClick={() => navigate('/scan')} style={{ padding: '16px 32px', backgroundColor: '#0f2c2a', color: 'white', border: 'none', borderRadius: '99px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', boxShadow: '0 4px 0 rgba(15, 44, 42, 0.25)' }}>
              Scan NFC Tag
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
