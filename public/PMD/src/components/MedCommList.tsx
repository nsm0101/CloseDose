/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MedCommCall } from '../types';
import { Phone, MapPin, Activity, User, Clock, AlertTriangle, ArrowRight, CheckCircle2, XCircle, Trash2, Edit2, Siren, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../lib/utils';

interface MedCommListProps {
  calls: MedCommCall[];
  onConvertToPatient: (call: MedCommCall) => void;
  onUpdateStatus: (id: string, status: MedCommCall['status']) => void;
  onDelete: (id: string) => void;
  onEdit: (call: MedCommCall) => void;
}

export const MedCommList: React.FC<MedCommListProps> = ({ calls, onConvertToPatient, onUpdateStatus, onDelete, onEdit }) => {
  const getStatusColor = (status: MedCommCall['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 border-yellow-200 dark:border-yellow-800/50';
      case 'accepted': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50';
      case 'arrived': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50';
      case 'canceled': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <div className="space-y-3">
      {calls.map(call => (
        <div 
          key={call.id} 
          className={cn(
            "bg-white dark:bg-gray-900 rounded-xl shadow-sm border p-4 transition-all hover:shadow-md",
            call.urgencyFlag 
              ? "border-red-300 dark:border-red-800 ring-1 ring-red-50 dark:ring-red-900/20 ring-inset" 
              : "border-gray-100 dark:border-gray-800"
          )}
        >
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            {/* Left: Basic Info */}
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center justify-center min-w-[60px] bg-gray-50 dark:bg-gray-800 rounded-lg p-2 border border-gray-100 dark:border-gray-700 transition-colors">
                <span className="text-xl font-bold text-gray-900 dark:text-white">{call.initials}</span>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{call.age}y {call.sex}</span>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border transition-colors", getStatusColor(call.status))}>
                    {call.status}
                  </span>
                  {call.urgencyFlag && (
                    <span className="bg-red-600 dark:bg-red-700 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1">
                      <AlertTriangle size={10} /> URGENT
                    </span>
                  )}
                  {call.traumaActivation && call.traumaActivation !== 'none' && (
                    <span className="bg-orange-600 dark:bg-orange-700 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1">
                      <Siren size={10} /> TRAUMA {call.traumaActivation}
                    </span>
                  )}
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium flex items-center gap-1">
                    <Clock size={10} /> {formatDistanceToNow(call.callTime.toMillis())} ago
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} className="text-gray-400 dark:text-gray-500" /> 
                    {call.referredFrom === 'Other' ? call.referredFromOtherLocation || 'Other' : call.referredFrom}
                  </span>
                  <span className="flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400"><Clock size={12} /> ETA: {call.eta}</span>
                  <span className="flex items-center gap-1"><User size={12} className="text-gray-400 dark:text-gray-500" /> {call.takenBy}</span>
                </div>
                {call.consultantsToNotify && (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase">
                    <Bell size={10} /> Notify: {call.consultantsToNotify}
                  </div>
                )}
              </div>
            </div>

            {/* Middle: Vitals & Notes */}
            <div className="flex-1 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-100/50 dark:border-gray-700/50 transition-colors">
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-2">
                {Object.entries(call.vitals).map(([key, value]) => (
                  <div key={key} className="flex flex-col items-center">
                    <span className="text-[8px] font-bold text-gray-400 dark:text-gray-500 uppercase">{key}</span>
                    <span className="text-[10px] font-bold text-gray-700 dark:text-gray-200">{value || '-'}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 italic">
                {call.notes || "No clinical notes provided."}
              </p>
            </div>

            {/* Right: Actions */}
            <div className="flex flex-row md:flex-col gap-2 justify-end">
              <div className="flex gap-1">
                <button 
                  onClick={() => onEdit(call)}
                  className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Edit"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => onUpdateStatus(call.id, 'accepted')}
                  className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                  title="Accept"
                >
                  <CheckCircle2 size={18} />
                </button>
                <button 
                  onClick={() => onUpdateStatus(call.id, 'canceled')}
                  className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 transition-colors"
                  title="Cancel"
                >
                  <XCircle size={18} />
                </button>
                <button 
                  onClick={() => onDelete(call.id)}
                  className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              
              {!call.convertedToPatientId && (
                <button 
                  onClick={() => onConvertToPatient(call)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <ArrowRight size={14} /> Convert to Patient
                </button>
              )}
              {call.convertedToPatientId && (
                <div className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-bold border border-green-200 dark:border-green-800/50 transition-colors">
                  <CheckCircle2 size={14} /> Converted
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      {calls.length === 0 && (
        <div className="py-12 text-center text-gray-400 dark:text-gray-500 italic text-sm border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl transition-colors">
          No active MedComm calls for this shift.
        </div>
      )}
    </div>
  );
};
