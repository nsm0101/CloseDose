/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useLayoutEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  where, 
  Timestamp, 
  setDoc,
  getDoc,
  getDocs,
  writeBatch,
  arrayUnion
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './lib/firebaseUtils';
import { Patient, TeamMember, MedCommCall, Shift } from './types';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { PatientBoard } from './components/PatientBoard';
import { MedCommList } from './components/MedCommList';
import { MedCommForm } from './components/MedCommForm';
import { TeamSetup } from './components/TeamSetup';
import { ShiftSelector } from './components/ShiftSelector';
import { Settings } from './components/Settings';
import { JoinSession } from './components/JoinSession';
import { LandingScreen } from './components/LandingScreen';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { updateProfile } from 'firebase/auth';
import { BRAND } from './lib/brand';
import {
  isApprovedWorkspaceProfile,
  selectAuthorizedShiftId
} from './lib/authorizedShift';
import { createSessionId, INVITE_TTL_MS } from './lib/sessionInvite';

const PRIMARY_ADMIN_EMAIL = 'nickolas.mancini@gmail.com';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{ firstName: string; lastName: string; role: 'attending' | 'fellow' } | null>(() => {
    const firstName = localStorage.getItem('userFirstName');
    const lastName = localStorage.getItem('userLastName');
    const role = localStorage.getItem('userRole') as 'attending' | 'fellow' | null;
    if (firstName && lastName && role) {
      return { firstName, lastName, role };
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'board' | 'medcomm' | 'team' | 'settings' | 'handoff'>('board');
  
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [activeShiftId, setActiveShiftId] = useState<string | null>(null);
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(() => {
    const sessionId = new URLSearchParams(window.location.search).get('sessionId');
    return sessionId ? sessionId.toUpperCase() : null;
  });
  const [pendingLegacyShiftId, setPendingLegacyShiftId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.has('sessionId') ? null : params.get('shiftId');
  });
  const [sharedLinkError, setSharedLinkError] = useState<string | null>(null);
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [medCommCalls, setMedCommCalls] = useState<MedCommCall[]>([]);
  
  const [showMedCommForm, setShowMedCommForm] = useState(false);
  const [editingMedCommCall, setEditingMedCommCall] = useState<MedCommCall | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [compactMode, setCompactMode] = useState<boolean>(localStorage.getItem('compactMode') === 'true');
  const [twoColumnMode, setTwoColumnMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('twoColumnMode');
    if (saved !== null) return saved === 'true';
    // First run: default to the multi-column "information hub" on desktop, and
    // the single-column "quick reference" on phones — so it just works on the
    // device you happen to open it on.
    return typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches;
  });
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system';
  });
  const [undoAction, setUndoAction] = useState<{ id: string, previousData: Partial<Patient>, message: string, timeoutId?: NodeJS.Timeout } | null>(null);
  // Patient the current user just added — the board auto-focuses its name field.
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  // Real-time connection state surfaced to users so they can trust the board
  // is live. Driven by Firestore snapshot metadata + the browser online state.
  const [syncState, setSyncState] = useState<'connecting' | 'live' | 'offline'>('connecting');

  const clearAuthorizedData = () => {
    setActiveShiftId(null);
    setShifts([]);
    setPatients([]);
    setTeamMembers([]);
    setMedCommCalls([]);
    localStorage.removeItem('activeShiftId');
  };

  // Track the browser's online/offline state.
  useEffect(() => {
    const goOffline = () => setSyncState('offline');
    const goOnline = () => setSyncState(s => (s === 'offline' ? 'connecting' : s));
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    if (typeof navigator !== 'undefined' && !navigator.onLine) setSyncState('offline');
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('compactMode', compactMode.toString());
  }, [compactMode]);

  useEffect(() => {
    localStorage.setItem('twoColumnMode', twoColumnMode.toString());
  }, [twoColumnMode]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const root = window.document.documentElement;
    
    const applyTheme = (t: 'light' | 'dark' | 'system') => {
      if (t === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.toggle('dark', systemTheme === 'dark');
        root.style.colorScheme = systemTheme;
      } else {
        root.classList.toggle('dark', t === 'dark');
        root.style.colorScheme = t;
      }
    };

    applyTheme(theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  // Auth State
  useEffect(() => {
    // Safety timeout to prevent infinite loading if Firebase hangs
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
      console.warn("Auth initialization timed out, proceeding to login screen.");
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      clearTimeout(safetyTimeout);
      if (!u) {
        setUser(null);
        setIsAdminUser(false);
        setUserProfile(null);
        localStorage.removeItem('userFirstName');
        localStorage.removeItem('userLastName');
        localStorage.removeItem('userRole');
        clearAuthorizedData();
        setLoading(false);
      } else {
        const email = u.email?.trim().toLowerCase() ?? '';
        const isPrimaryAdmin = email === PRIMARY_ADMIN_EMAIL;

        if (u.isAnonymous || !u.emailVerified || !email) {
          setAuthError('A verified, administrator-approved Google account is required.');
          setUser(null);
          setIsAdminUser(false);
          setLoading(false);
          await signOut(auth);
          return;
        }

        const userRef = doc(db, 'users', u.uid);
        try {
          const profile = await getDoc(userRef);
          const profileData = profile.data();
          const approved =
            isPrimaryAdmin ||
            (
              profile.exists() &&
              isApprovedWorkspaceProfile(profileData, email)
            );

          if (!profile.exists()) {
            await setDoc(userRef, {
              email,
              displayName: u.displayName ?? '',
              lastLogin: Timestamp.now(),
              approved: isPrimaryAdmin,
              role: isPrimaryAdmin ? 'admin' : 'user'
            });
          } else if (isPrimaryAdmin) {
            await setDoc(userRef, {
              email,
              displayName: u.displayName ?? profileData?.displayName ?? '',
              lastLogin: Timestamp.now(),
              approved: true,
              role: 'admin'
            }, { merge: true });
          }

          if (!approved) {
            setAuthError('This verified account is not approved for the PREtendingMD workspace. Contact the administrator for access.');
            setUser(null);
            setIsAdminUser(false);
            setLoading(false);
            await signOut(auth);
            return;
          }

          if (!isPrimaryAdmin) {
            await updateDoc(userRef, { lastLogin: Timestamp.now() });
          }

          setAuthError(null);
          setUser(u);
          setIsAdminUser(isPrimaryAdmin);
          setLoading(false);
        } catch (error) {
          console.error('Failed to verify workspace access:', error);
          setAuthError('Workspace access could not be verified. Please try again or contact the administrator.');
          setUser(null);
          setIsAdminUser(false);
          setLoading(false);
          await signOut(auth);
          return;
        }
      }
      
      // Hide splash screen
      const splash = document.getElementById('splash');
      if (splash) {
        splash.style.opacity = '0';
        setTimeout(() => splash.remove(), 500);
      }
    });
    return () => {
      unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, []);

  // Revoke access immediately when an administrator disables this profile.
  useEffect(() => {
    if (!user || isAdminUser) return;
    const email = user.email?.trim().toLowerCase() ?? '';
    const profileRef = doc(db, 'users', user.uid);
    let revocationHandled = false;

    const revokeSession = (message: string) => {
      if (revocationHandled) return;
      revocationHandled = true;
      setAuthError(message);
      clearAuthorizedData();
      setUser(null);
      setIsAdminUser(false);
      void signOut(auth);
    };

    const unsubscribe = onSnapshot(profileRef, (snapshot) => {
      if (
        !snapshot.exists() ||
        !isApprovedWorkspaceProfile(snapshot.data(), email)
      ) {
        revokeSession(
          'This account is no longer approved for the PREtendingMD workspace.'
        );
      }
    }, () => {
      revokeSession(
        'Workspace access could not be revalidated. Sign in again or contact the administrator.'
      );
    });

    return () => unsubscribe();
  }, [user?.uid, user?.email, isAdminUser]);

  // Shifts Listener
  useEffect(() => {
    if (!user) return;
    const q = isAdminUser
      ? query(collection(db, 'shifts'), orderBy('startTime', 'desc'))
      : query(collection(db, 'shifts'), where('memberUids', 'array-contains', user.uid));
    const unsubscribe = onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
      const s = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Shift))
        .sort((a, b) => b.startTime.toMillis() - a.startTime.toMillis());
      setShifts(s);
      const linkedLegacyShift = pendingLegacyShiftId
        ? s.find(shift => shift.id === pendingLegacyShiftId)
        : undefined;
      const shouldResolveLegacyLink =
        Boolean(pendingLegacyShiftId) &&
        (Boolean(linkedLegacyShift) || !snapshot.metadata.fromCache);
      if (shouldResolveLegacyLink) {
        setPendingLegacyShiftId(null);
        window.history.replaceState({}, document.title, window.location.pathname);
        setSharedLinkError(
          linkedLegacyShift
            ? null
            : 'This legacy shift link is not available to this account. Ask a current shift member for a new session link.'
        );
      }
      setActiveShiftId(current => {
        const next = selectAuthorizedShiftId({
          authorizedShiftIds: s.map(shift => shift.id),
          currentShiftId: current,
          savedShiftId: localStorage.getItem('activeShiftId'),
          requestedLegacyShiftId: linkedLegacyShift?.id ?? null
        });
        if (next) {
          localStorage.setItem('activeShiftId', next);
        } else {
          localStorage.removeItem('activeShiftId');
        }
        return next;
      });
      setSyncState(snapshot.metadata.fromCache ? (navigator.onLine ? 'connecting' : 'offline') : 'live');
    }, (error) => {
      setSyncState(navigator.onLine ? 'connecting' : 'offline');
      if (error.code === 'permission-denied') {
        clearAuthorizedData();
      }
      handleFirestoreError(error, OperationType.LIST, 'shifts');
    });
    return () => unsubscribe();
  }, [user, isAdminUser, pendingLegacyShiftId]);

  // Active Shift Data Listeners
  useLayoutEffect(() => {
    setPatients([]);
    setTeamMembers([]);
    setMedCommCalls([]);

    if (!user || !activeShiftId) {
      return;
    }

    localStorage.setItem('activeShiftId', activeShiftId);

    const unsubPatients = onSnapshot(query(collection(db, `shifts/${activeShiftId}/patients`), orderBy('createdAt', 'desc')), { includeMetadataChanges: true }, (snapshot) => {
      setPatients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient)));
      setSyncState(snapshot.metadata.fromCache ? (navigator.onLine ? 'connecting' : 'offline') : 'live');
    }, (error) => {
      setSyncState(navigator.onLine ? 'connecting' : 'offline');
      handleFirestoreError(error, OperationType.LIST, `shifts/${activeShiftId}/patients`);
    });

    const unsubTeam = onSnapshot(collection(db, `shifts/${activeShiftId}/teamMembers`), (snapshot) => {
      setTeamMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamMember)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `shifts/${activeShiftId}/teamMembers`);
    });

    const unsubMedComm = onSnapshot(collection(db, `shifts/${activeShiftId}/medCommCalls`), (snapshot) => {
      setMedCommCalls(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MedCommCall)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `shifts/${activeShiftId}/medCommCalls`);
    });

    return () => {
      unsubPatients();
      unsubTeam();
      unsubMedComm();
    };
  }, [user?.uid, activeShiftId]);

  const handleLogout = async () => {
    localStorage.removeItem('userFirstName');
    localStorage.removeItem('userLastName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('activeShiftId');
    setUserProfile(null);
    setActiveShiftId(null);
    setShifts([]);
    await signOut(auth);
  };

  const handleLandingComplete = async (firstName: string, lastName: string, role: 'attending' | 'fellow') => {
    localStorage.setItem('userFirstName', firstName);
    localStorage.setItem('userLastName', lastName);
    localStorage.setItem('userRole', role);
    setUserProfile({ firstName, lastName, role });
    if (auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, {
          displayName: `${firstName} ${lastName}`
        });
      } catch (err) {
        console.warn("Could not update auth profile displayName", err);
      }
    }
  };

  // Auto-register team member on shift load
  useEffect(() => {
    if (user && userProfile && activeShiftId) {
      const initials = `${userProfile.firstName[0]}${userProfile.lastName[0]}`.toUpperCase();
      const memberId = user.uid;
      const ref = doc(db, `shifts/${activeShiftId}/teamMembers`, memberId);
      setDoc(ref, {
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        initials,
        role: userProfile.role
      }, { merge: true }).catch(err => {
        console.error("Could not register user as a team member on shift:", err);
      });
    }
  }, [user, userProfile, activeShiftId]);

  const createShift = async (name: string) => {
    if (!user) return;
    const sessionId = createSessionId();
    const shiftRef = doc(collection(db, 'shifts'));
    const createdAt = Timestamp.now();
    const newShift = {
      name,
      sessionId,
      startTime: createdAt,
      isActive: true,
      createdBy: user.uid,
      memberUids: [user.uid]
    };
    try {
      const batch = writeBatch(db);
      batch.set(shiftRef, newShift);
      batch.set(doc(db, 'shiftInvites', sessionId), {
        shiftId: shiftRef.id,
        createdBy: user.uid,
        createdAt,
        expiresAt: Timestamp.fromMillis(createdAt.toMillis() + INVITE_TTL_MS),
        revoked: false
      });
      await batch.commit();
      setActiveShiftId(shiftRef.id);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'shifts');
    }
  };

  const joinSession = async (sessionId: string): Promise<boolean> => {
    if (!user) return false;
    const normalizedSessionId = sessionId.trim().toUpperCase();
    const invite = await getDoc(doc(db, 'shiftInvites', normalizedSessionId));
    if (!invite.exists()) return false;

    const shiftId = invite.data().shiftId;
    if (typeof shiftId !== 'string' || !shiftId) return false;

    await updateDoc(doc(db, 'shifts', shiftId), {
      memberUids: arrayUnion(user.uid)
    });
    setActiveShiftId(shiftId);
    localStorage.setItem('activeShiftId', shiftId);
    setPendingSessionId(null);
    window.history.replaceState({}, document.title, window.location.pathname);
    return true;
  };

  useEffect(() => {
    if (!user || !pendingSessionId) return;
    joinSession(pendingSessionId).catch((error) => {
      console.error('Could not join shared shift:', error);
      setPendingSessionId(null);
      window.history.replaceState({}, document.title, window.location.pathname);
    });
  }, [user, pendingSessionId]);

  const handleUpdateProfile = async (updates: { displayName?: string, photoURL?: string }) => {
    if (!user) return;
    try {
      await updateProfile(user, updates);
      // Force re-render by updating user state
      setUser({ ...user, ...updates } as User);
      
      // Also update firestore user doc
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const deleteShift = async (id: string) => {
    try {
      const shift = shifts.find(candidate => candidate.id === id);
      const batch = writeBatch(db);
      batch.delete(doc(db, 'shifts', id));
      if (shift?.sessionId) {
        batch.delete(doc(db, 'shiftInvites', shift.sessionId));
      }
      await batch.commit();
      if (activeShiftId === id) {
        setActiveShiftId(null);
        localStorage.removeItem('activeShiftId');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `shifts/${id}`);
    }
  };

  const addPatient = async () => {
    if (!activeShiftId) return;
    const newPatient: Partial<Patient> = {
      initials: 'NEW',
      firstName: '',
      lastInitial: '',
      age: '0',
      sex: 'M',
      room: '?',
      chiefComplaint: 'New Patient',
      status: 'New',
      seenState: 'To Be Seen',
      assignedTeam: [],
      tasks: { 
        labs: 'off', 
        imaging: 'off', 
        meds: 'off', 
        consult: 'off',
        poIntake: 'off',
        painControl: 'off',
        ambulation: 'off',
        documents: 'off'
      },
      dischargeTasks: { instructions: 'off', rx: 'off', followUp: 'off', notes: 'off' },
      workflowFlags: {
        readyForAttending: false,
        familyUpdated: false,
        awaitingDispo: false,
        readyForDischargePaperwork: false,
        boarding: false
      },
      operationalNotes: '',
      lastAssessmentAt: Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    try {
      const ref = await addDoc(collection(db, `shifts/${activeShiftId}/patients`), newPatient);
      setLastAddedId(ref.id);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `shifts/${activeShiftId}/patients`);
    }
  };

  const updatePatient = async (id: string, updates: Partial<Patient>) => {
    if (!activeShiftId) return;
    
    try {
      await updateDoc(doc(db, `shifts/${activeShiftId}/patients`, id), {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `shifts/${activeShiftId}/patients/${id}`);
    }
  };

  const handleUndo = async () => {
    if (!undoAction || !activeShiftId) return;
    try {
      await updateDoc(doc(db, `shifts/${activeShiftId}/patients`, undoAction.id), {
        ...undoAction.previousData,
        updatedAt: Timestamp.now()
      });
      if (undoAction.timeoutId) clearTimeout(undoAction.timeoutId);
      setUndoAction(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `shifts/${activeShiftId}/patients/${undoAction.id}`);
    }
  };

  const deletePatient = async (id: string) => {
    if (!activeShiftId) return;
    try {
      await deleteDoc(doc(db, `shifts/${activeShiftId}/patients`, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `shifts/${activeShiftId}/patients/${id}`);
    }
  };

  const completePatient = async (id: string) => {
    if (!activeShiftId) return;
    const patient = patients.find(p => p.id === id);
    if (!patient) return;
    
    try {
      await updateDoc(doc(db, `shifts/${activeShiftId}/patients`, id), {
        isCompleted: !patient.isCompleted,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `shifts/${activeShiftId}/patients/${id}`);
    }
  };

  const resetPatientTimer = async (id: string) => {
    if (!activeShiftId) return;
    try {
      await updateDoc(doc(db, `shifts/${activeShiftId}/patients`, id), {
        lastAssessmentAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `shifts/${activeShiftId}/patients/${id}`);
    }
  };

  const addTeamMember = async (member: Partial<TeamMember>) => {
    if (!activeShiftId) return;
    try {
      await addDoc(collection(db, `shifts/${activeShiftId}/teamMembers`), member);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `shifts/${activeShiftId}/teamMembers`);
    }
  };

  const removeTeamMember = async (id: string) => {
    if (!activeShiftId) return;
    try {
      await deleteDoc(doc(db, `shifts/${activeShiftId}/teamMembers`, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `shifts/${activeShiftId}/teamMembers/${id}`);
    }
  };

  const addMedCommCall = async (call: Partial<MedCommCall>) => {
    if (!activeShiftId) return;
    try {
      await addDoc(collection(db, `shifts/${activeShiftId}/medCommCalls`), {
        ...call,
        callTime: Timestamp.now(),
        createdAt: Timestamp.now()
      });
      setShowMedCommForm(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `shifts/${activeShiftId}/medCommCalls`);
    }
  };

  const updateMedCommCall = async (id: string, updates: Partial<MedCommCall>) => {
    if (!activeShiftId) return;
    try {
      await updateDoc(doc(db, `shifts/${activeShiftId}/medCommCalls`, id), {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `shifts/${activeShiftId}/medCommCalls/${id}`);
    }
  };

  const updateMedCommStatus = async (id: string, status: MedCommCall['status']) => {
    if (!activeShiftId) return;
    try {
      await updateDoc(doc(db, `shifts/${activeShiftId}/medCommCalls`, id), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `shifts/${activeShiftId}/medCommCalls/${id}`);
    }
  };

  const deleteMedCommCall = async (id: string) => {
    if (!activeShiftId) return;
    try {
      await deleteDoc(doc(db, `shifts/${activeShiftId}/medCommCalls`, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `shifts/${activeShiftId}/medCommCalls/${id}`);
    }
  };

  const convertToPatient = async (call: MedCommCall) => {
    if (!activeShiftId) return;
    const newPatient: Partial<Patient> = {
      initials: call.initials,
      age: call.age,
      room: 'TBD',
      chiefComplaint: call.chiefComplaint || 'MedComm Transfer',
      status: 'New',
      seenState: 'To Be Seen',
      assignedTeam: [],
      tasks: { 
        labs: 'off', 
        imaging: 'off', 
        meds: 'off', 
        consult: 'off',
        poIntake: 'off',
        painControl: 'off',
        ambulation: 'off',
        documents: 'off'
      },
      dischargeTasks: { instructions: 'off', rx: 'off', followUp: 'off', notes: 'off' },
      workflowFlags: {
        readyForAttending: false,
        familyUpdated: false,
        awaitingDispo: false,
        readyForDischargePaperwork: false,
        boarding: false
      },
      operationalNotes: `MedComm: ${call.notes}${call.traumaActivation && call.traumaActivation !== 'none' ? ` | TRAUMA ${call.traumaActivation}` : ''}${call.consultantsToNotify ? ` | Notify: ${call.consultantsToNotify}` : ''}`,
      lastAssessmentAt: Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    try {
      const patientRef = await addDoc(collection(db, `shifts/${activeShiftId}/patients`), newPatient);
      await updateDoc(doc(db, `shifts/${activeShiftId}/medCommCalls`, call.id), { 
        convertedToPatientId: patientRef.id,
        status: 'arrived'
      });
      setActiveTab('board');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `shifts/${activeShiftId}`);
    }
  };

  const seedDemoData = async () => {
    if (!activeShiftId) return;
    setIsActionLoading(true);
    try {
      const batch = writeBatch(db);
      
      // Add Team Members
      const team = [
        { firstName: 'Sarah', lastName: 'Miller', initials: 'SM', role: 'attending' },
        { firstName: 'James', lastName: 'Chen', initials: 'JC', role: 'fellow' },
        { firstName: 'Elena', lastName: 'Rodriguez', initials: 'ER', role: 'resident' },
        { firstName: 'Kevin', lastName: 'Park', initials: 'KP', role: 'student' }
      ];
      
      for (const m of team) {
        const ref = doc(collection(db, `shifts/${activeShiftId}/teamMembers`));
        batch.set(ref, m);
      }

      // Add patients
      const patientsData = [
        { initials: 'JD', firstName: 'Jordan', lastInitial: 'D', age: '4', room: '12', status: 'Work-up', seenState: 'Seen by Fellow', tasks: { labs: 'pending', imaging: 'ordered', meds: 'off', consult: 'off', poIntake: 'off', painControl: 'off', ambulation: 'off', documents: 'off' } },
        { initials: 'MK', firstName: 'Mia', lastInitial: 'K', age: '12', room: '05', status: 'New', seenState: 'To Be Seen', tasks: { labs: 'off', imaging: 'off', meds: 'off', consult: 'off', poIntake: 'off', painControl: 'off', ambulation: 'off', documents: 'off' } },
        { initials: 'RL', firstName: 'Riley', lastInitial: 'L', age: '8', room: '18', status: 'Likely Discharge', seenState: 'Seen by Attending', tasks: { labs: 'complete', imaging: 'complete', meds: 'complete', consult: 'off', poIntake: 'complete', painControl: 'complete', ambulation: 'off', documents: 'off' } }
      ];

      for (const p of patientsData) {
        const ref = doc(collection(db, `shifts/${activeShiftId}/patients`));
        batch.set(ref, {
          ...p,
          assignedTeam: [],
          workflowFlags: { readyForAttending: false, familyUpdated: true, awaitingDispo: false, readyForDischargePaperwork: false, boarding: false },
          operationalNotes: 'Demo patient seeded.',
          lastAssessmentAt: Timestamp.now(),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      }

      await batch.commit();
    } finally {
      setIsActionLoading(false);
    }
  };

  const clearShiftData = async () => {
    if (!activeShiftId) return;
    setIsActionLoading(true);
    try {
      const collections = ['patients', 'teamMembers', 'medCommCalls'];
      for (const coll of collections) {
        const q = collection(db, `shifts/${activeShiftId}/${coll}`);
        const snapshot = await getDocs(q);
        const batch = writeBatch(db);
        snapshot.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pmd pmd-playful-shell min-h-screen flex flex-col items-center justify-center gap-5 transition-colors" data-pmd-theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}>
        <img src={BRAND.mascot} alt="PREtendingMD bear mascot" className="w-24 h-24 object-contain animate-bounce drop-shadow-md" />
        <img src={BRAND.wordmark} alt="PREtendingMD" className="h-7 w-auto" />
        <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
          <Loader2 size={16} className="animate-spin" />
          <p className="text-sm font-bold uppercase tracking-widest">Initializing workflow...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login initialError={authError} />;
  }

  if (!userProfile) {
    return <LandingScreen onComplete={handleLandingComplete} />;
  }

  return (
    <Layout
      user={user}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onLogout={handleLogout}
      onAddTeamMember={addTeamMember}
      activeShiftId={activeShiftId}
      activeSessionId={shifts.find(shift => shift.id === activeShiftId)?.sessionId}
      syncState={syncState}
    >
      <div className="space-y-6">
        {sharedLinkError && (
          <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
            {sharedLinkError}
          </div>
        )}
        {/* Shift Selector visible if no shift active */}
        {!activeShiftId && (
          <ShiftSelector 
            shifts={shifts} 
            activeShiftId={activeShiftId} 
            onSelect={setActiveShiftId} 
            onCreate={createShift} 
            onDelete={deleteShift}
          />
        )}

        {!activeShiftId ? (
          <JoinSession 
            onJoin={joinSession} 
            onCreate={createShift}
            shifts={shifts}
            onSelect={setActiveShiftId}
          />
        ) : (
          <>
            {activeTab === 'board' && (
              <PatientBoard
                patients={patients}
                teamMembers={teamMembers}
                onUpdatePatient={updatePatient}
                onDeletePatient={deletePatient}
                onCompletePatient={completePatient}
                onResetTimer={resetPatientTimer}
                onAddPatient={addPatient}
                onAddTeamMember={addTeamMember}
                compactMode={compactMode}
                twoColumnMode={twoColumnMode}
                syncState={syncState}
                darkMode={theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)}
                focusPatientId={lastAddedId}
                onFocusConsumed={() => setLastAddedId(null)}
              />
            )}

            {activeTab === 'medcomm' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-gray-900 tracking-tight">MedComm Calls</h2>
                  <button 
                    onClick={() => {
                      setEditingMedCommCall(null);
                      setShowMedCommForm(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md"
                  >
                    <Plus size={18} /> New Call
                  </button>
                </div>

                {showMedCommForm ? (
                  <MedCommForm 
                    initialData={editingMedCommCall || undefined}
                    onSubmit={async (callData) => {
                      if (editingMedCommCall) {
                        await updateMedCommCall(editingMedCommCall.id, callData);
                      } else {
                        await addMedCommCall(callData);
                      }
                      setShowMedCommForm(false);
                      setEditingMedCommCall(null);
                    }} 
                    onCancel={() => {
                      setShowMedCommForm(false);
                      setEditingMedCommCall(null);
                    }} 
                  />
                ) : (
                  <MedCommList 
                    calls={medCommCalls} 
                    onConvertToPatient={convertToPatient}
                    onUpdateStatus={updateMedCommStatus}
                    onDelete={deleteMedCommCall}
                    onEdit={(call) => {
                      setEditingMedCommCall(call);
                      setShowMedCommForm(true);
                    }}
                  />
                )}
              </div>
            )}

            {activeTab === 'team' && (
              <TeamSetup 
                teamMembers={teamMembers} 
                onAdd={addTeamMember} 
                onRemove={removeTeamMember} 
              />
            )}

            {activeTab === 'handoff' && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 transition-colors">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Shift handoff</h2>
                    <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">Review and sign-out active patients</p>
                  </div>
                  <button 
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-bold transition-colors print:hidden"
                  >
                    Print handoff
                  </button>
                </div>
                
                <div className="space-y-8">
                  {['Staff', 'Work-up', 'ED Observation', 'Likely Admit', 'Likely Discharge', 'New'].map(status => {
                    const statusPatients = patients.filter(p => p.status === status && !p.isCompleted);
                    if (statusPatients.length === 0) return null;
                    
                    return (
                      <div key={status} className="space-y-3">
                        <h3 className="text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 pb-2">
                          {status} ({statusPatients.length})
                        </h3>
                        <div className="grid gap-3">
                          {statusPatients.map(patient => (
                            <div key={patient.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-4 transition-colors">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-black text-lg text-gray-900 dark:text-white">{patient.room}</span>
                                  <span className="text-gray-400 dark:text-gray-600 font-bold">·</span>
                                  <span className="font-bold text-gray-700 dark:text-gray-300">
                                    {patient.firstName || patient.lastInitial
                                      ? `${patient.firstName ?? ''}${patient.lastInitial ? ` ${patient.lastInitial}.` : ''}`.trim()
                                      : patient.initials}
                                  </span>
                                  <span className="text-gray-400 dark:text-gray-600 font-bold">·</span>
                                  <span className="text-sm text-gray-500 dark:text-gray-400">{patient.age}{patient.sex}</span>
                                </div>
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200"><span className="text-gray-400 dark:text-gray-500">CC:</span> {patient.chiefComplaint}</p>
                              </div>
                              <div className="flex-1 space-y-2">
                                <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pending tasks</div>
                                <div className="flex flex-wrap gap-2">
                                  {Object.entries(patient.tasks).filter(([_, v]) => v === 'pending').map(([k]) => (
                                    <span key={k} className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-500 rounded-md text-xs font-bold capitalize">
                                      {k}
                                    </span>
                                  ))}
                                  {Object.entries(patient.tasks).filter(([_, v]) => v === 'pending').length === 0 && (
                                    <span className="text-sm text-gray-400 dark:text-gray-500 italic">None</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <Settings 
                onSeedData={seedDemoData} 
                onClearData={clearShiftData} 
                isLoading={isActionLoading}
                compactMode={compactMode}
                onToggleCompactMode={setCompactMode}
                twoColumnMode={twoColumnMode}
                onToggleTwoColumnMode={setTwoColumnMode}
                theme={theme}
                onThemeChange={setTheme}
                onLogout={handleLogout}
                user={user}
                onUpdateProfile={handleUpdateProfile}
                teamMembers={teamMembers}
                onAddTeamMember={addTeamMember}
                onRemoveTeamMember={removeTeamMember}
                shifts={shifts}
                activeShiftId={activeShiftId}
                onSelectShift={setActiveShiftId}
                onCreateShift={createShift}
                onDeleteShift={deleteShift}
              />
            )}
          </>
        )}
      </div>

      {/* Undo Toast */}
      {undoAction && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-gray-900 dark:bg-gray-800 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-5">
          <span className="text-sm font-medium">{undoAction.message}</span>
          <button 
            onClick={handleUndo}
            className="text-blue-400 hover:text-blue-300 font-bold text-sm uppercase tracking-wider bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
          >
            Undo
          </button>
        </div>
      )}
    </Layout>
  );
}
