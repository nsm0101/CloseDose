/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Timestamp } from 'firebase/firestore';

export type Role = 'attending' | 'fellow' | 'resident' | 'student' | 'nurse' | 'other';

export type PatientStatus = 
  | 'New' 
  | 'Staff' 
  | 'Work-up' 
  | 'ED Observation' 
  | 'Likely Discharge' 
  | 'Likely Admit' 
  | 'Discharge' 
  | 'Admit';

export type SeenState = 'To Be Seen' | 'Seen by Fellow' | 'Seen by Attending';

export type TaskState = 'off' | 'ordered' | 'pending' | 'complete' | 'none';
export type MedsConsultState = 'off' | 'ordered' | 'pending' | 'complete' | 'none';

export interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  initials: string;
  role: Role;
  avatarUrl?: string;
  emoji?: string;
}

export interface Patient {
  id: string;
  /** Derived/legacy short identifier (e.g. first + last initial). Kept for
   *  search and back-compat with records created before named fields. */
  initials: string;
  /** Patient first name (limited identifier for at-a-glance recognition). */
  firstName?: string;
  /** Patient last initial only — never the full surname. */
  lastInitial?: string;
  age: string;
  sex: 'M' | 'F' | 'Other';
  room: string;
  chiefComplaint: string;
  status: PatientStatus;
  seenState: SeenState;
  assignedTeam: string[]; // IDs of team members
  tasks: {
    labs: TaskState;
    imaging: TaskState;
    meds: TaskState;
    consult: TaskState;
    poIntake: TaskState;
    painControl: TaskState;
    ambulation: TaskState;
    documents: TaskState;
  };
  dischargeTasks?: {
    instructions: TaskState;
    rx: 'off' | 'home' | 'facility' | 'none';
    followUp: TaskState;
    notes: TaskState;
  };
  admitTasks?: {
    familyUpdate: TaskState;
    page: TaskState;
    handoff: TaskState;
    secureChat: TaskState;
  };
  obsTasks?: {
    obsAdmitNote: TaskState;
    obsDCNote: TaskState;
  };
  workflowFlags: {
    readyForAttending: boolean;
    familyUpdated: boolean;
    awaitingDispo: boolean;
    readyForDischargePaperwork: boolean;
    boarding: boolean;
  };
  operationalNotes: string;
  gestationalAge?: {
    weeks: number;
    days: number;
  };
  lastAssessmentAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isPinned?: boolean;
  isCompleted?: boolean;
}

export interface MedCommCall {
  id: string;
  initials: string;
  age: string;
  chiefComplaint: string;
  sex: 'M' | 'F' | 'Other';
  callTime: Timestamp;
  takenBy: string;
  referringProvider: string;
  referringPhone: string;
  referredFrom: 'TMH' | 'Newport' | 'Anderson' | 'Other';
  referredFromOtherLocation?: string;
  vitals: {
    weight: string;
    hr: string;
    rr: string;
    bp: string;
    o2: string;
    temp: string;
  };
  interventions: string;
  labs: string;
  imaging: string;
  transportMode: 'private' | 'BLS' | 'ALS' | 'team';
  eta: string;
  notes: string;
  status: 'pending' | 'accepted' | 'arrived' | 'canceled';
  urgencyFlag: boolean;
  traumaActivation?: 'none' | 'A' | 'B' | 'C';
  consultantsToNotify?: string;
  convertedToPatientId?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface Shift {
  id: string;
  name: string;
  sessionId: string;
  startTime: Timestamp;
  endTime?: Timestamp;
  isActive: boolean;
  createdBy: string;
}
