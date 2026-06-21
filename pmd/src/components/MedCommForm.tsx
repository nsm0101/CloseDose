/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MedCommCall } from '../types';
import { Timestamp } from 'firebase/firestore';
import { Phone, MapPin, Activity, User, Clock, AlertTriangle, Save, PlusCircle, Calendar, Siren, Bell } from 'lucide-react';
import { cn } from '../lib/utils';

interface MedCommFormProps {
  onSubmit: (call: Partial<MedCommCall>) => void;
  onCancel: () => void;
  initialData?: Partial<MedCommCall>;
}

export const MedCommForm: React.FC<MedCommFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState<Partial<MedCommCall>>(initialData || {
    initials: '',
    age: '',
    sex: 'M',
    referredFrom: 'TMH',
    referredFromOtherLocation: '',
    vitals: { weight: '', hr: '', rr: '', bp: '', o2: '', temp: '' },
    transportMode: 'private',
    status: 'pending',
    urgencyFlag: false,
    notes: '',
    interventions: '',
    labs: '',
    imaging: '',
    eta: '',
    referringProvider: '',
    referringPhone: '',
    takenBy: '',
    traumaActivation: 'none',
    consultantsToNotify: ''
  });

  const [callDate, setCallDate] = useState(
    initialData?.callTime 
      ? new Date(initialData.callTime.toMillis()).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0]
  );
  const [callTime, setCallTime] = useState(
    initialData?.callTime 
      ? new Date(initialData.callTime.toMillis()).toTimeString().slice(0, 5) 
      : new Date().toTimeString().slice(0, 5)
  );

  const handleChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...((prev as any)[parent] || {}), [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const combinedDateTime = new Date(`${callDate}T${callTime}`);
    onSubmit({
      ...formData,
      callTime: Timestamp.fromDate(combinedDateTime),
      createdAt: formData.createdAt || Timestamp.now()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden max-w-2xl mx-auto transition-colors">
      <div className="bg-blue-600 dark:bg-blue-700 p-4 text-white flex items-center justify-between transition-colors">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Phone size={20} /> {initialData ? 'Edit MedComm Call' : 'New MedComm Call'}
        </h2>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 cursor-pointer bg-blue-700 dark:bg-blue-800 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-blue-800 dark:hover:bg-blue-900 transition-colors">
            <input 
              type="checkbox" 
              checked={formData.urgencyFlag}
              onChange={(e) => handleChange('urgencyFlag', e.target.checked)}
              className="w-4 h-4 rounded border-white dark:border-gray-600 text-red-500 focus:ring-red-500"
            />
            <AlertTriangle size={14} className={formData.urgencyFlag ? "text-red-400" : "text-white"} />
            URGENT
          </label>
        </div>
      </div>

      <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
        {/* Basic Info */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Initials</label>
            <input 
              required
              className="w-full p-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-lg font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              placeholder="AB"
              value={formData.initials}
              onChange={(e) => handleChange('initials', e.target.value.toUpperCase())}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Age</label>
            <input 
              required
              className="w-full p-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-lg font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              placeholder="5"
              value={formData.age}
              onChange={(e) => handleChange('age', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Sex</label>
            <select 
              className="w-full p-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-lg font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              value={formData.sex}
              onChange={(e) => handleChange('sex', e.target.value)}
            >
              <option value="M">M</option>
              <option value="F">F</option>
              <option value="Other">O</option>
            </select>
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-1">
              <Calendar size={12} /> Date
            </label>
            <input 
              type="date"
              className="w-full p-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              value={callDate}
              onChange={(e) => setCallDate(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-1">
              <Clock size={12} /> Time
            </label>
            <input 
              type="time"
              className="w-full p-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              value={callTime}
              onChange={(e) => setCallTime(e.target.value)}
            />
          </div>
        </div>

        {/* Source */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-1">
            <MapPin size={12} /> Referred From
          </label>
          <div className="flex flex-wrap gap-2">
            {['TMH', 'Newport', 'Anderson', 'Other'].map(source => (
              <button
                key={source}
                type="button"
                onClick={() => handleChange('referredFrom', source)}
                className={cn(
                  "flex-1 p-2 rounded-lg border text-sm font-semibold transition-all",
                  formData.referredFrom === source 
                    ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-400 shadow-sm" 
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
              >
                {source}
              </button>
            ))}
          </div>
          {formData.referredFrom === 'Other' && (
            <input 
              className="w-full mt-2 p-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none animate-in slide-in-from-top-2 transition-colors"
              placeholder="Enter location name..."
              value={formData.referredFromOtherLocation}
              onChange={(e) => handleChange('referredFromOtherLocation', e.target.value)}
            />
          )}
        </div>

        {/* Provider & Phone */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-1">
            <User size={12} /> Provider & Phone
          </label>
          <div className="flex gap-2">
            <input 
              className="flex-1 p-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              placeholder="Dr. Smith"
              value={formData.referringProvider}
              onChange={(e) => handleChange('referringProvider', e.target.value)}
            />
            <input 
              className="w-32 p-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              placeholder="555-0123"
              value={formData.referringPhone}
              onChange={(e) => handleChange('referringPhone', e.target.value)}
            />
          </div>
        </div>

        {/* Clinical Notes */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Clinical Notes</label>
          <p className="text-[10px] text-red-500 dark:text-red-400 font-bold mb-1 uppercase">⚠️ No PHI beyond initials/age</p>
          <textarea 
            className="w-full p-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-900 dark:text-white h-24 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            placeholder="Brief summary of presentation..."
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
          />
        </div>

        {/* Vitals */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-1">
            <Activity size={12} /> Vitals
          </label>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {[
              { label: 'Wt', field: 'vitals.weight', placeholder: '20kg' },
              { label: 'HR', field: 'vitals.hr', placeholder: '110' },
              { label: 'RR', field: 'vitals.rr', placeholder: '24' },
              { label: 'BP', field: 'vitals.bp', placeholder: '100/60' },
              { label: 'O2', field: 'vitals.o2', placeholder: '98%' },
              { label: 'T', field: 'vitals.temp', placeholder: '38.5' },
            ].map(v => (
              <div key={v.field} className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 block text-center">{v.label}</span>
                <input 
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-md text-xs text-gray-900 dark:text-white text-center focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                  placeholder={v.placeholder}
                  value={(formData.vitals as any)[v.field.split('.')[1]]}
                  onChange={(e) => handleChange(v.field, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Trauma Activation */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-1">
            <Siren size={12} /> Trauma Activation
          </label>
          <div className="flex gap-2">
            {['none', 'A', 'B', 'C'].map(level => (
              <button
                key={level}
                type="button"
                onClick={() => handleChange('traumaActivation', level)}
                className={cn(
                  "flex-1 p-2 rounded-lg border text-sm font-bold uppercase transition-all",
                  formData.traumaActivation === level 
                    ? level === 'none' 
                      ? "bg-gray-100 dark:bg-gray-800 border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-300" 
                      : "bg-red-50 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-400 shadow-sm"
                    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
              >
                {level === 'none' ? 'None' : `Level ${level}`}
              </button>
            ))}
          </div>
        </div>

        {/* Consultants */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-1">
            <Bell size={12} /> Consultants to notify
          </label>
          <input 
            className="w-full p-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            placeholder="Surgery, Ortho, etc..."
            value={formData.consultantsToNotify}
            onChange={(e) => handleChange('consultantsToNotify', e.target.value)}
          />
        </div>

        {/* Interventions / Labs / Imaging */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Interventions / Labs / Imaging</label>
          <textarea 
            className="w-full p-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-900 dark:text-white h-20 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            placeholder="IV, fluids, labs sent..."
            value={formData.interventions}
            onChange={(e) => handleChange('interventions', e.target.value)}
          />
        </div>

        {/* Transport & ETA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Transport Mode</label>
            <div className="flex flex-wrap gap-2">
              {['private', 'BLS', 'ALS', 'team'].map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => handleChange('transportMode', mode)}
                  className={cn(
                    "flex-1 p-2 rounded-lg border text-xs font-bold uppercase transition-all",
                    formData.transportMode === mode 
                      ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-400" 
                      : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-1">
              <Clock size={12} /> ETA
            </label>
            <input 
              className="w-full p-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              placeholder="15 mins / 14:30"
              value={formData.eta}
              onChange={(e) => handleChange('eta', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex gap-3 transition-colors">
        <button 
          type="button"
          onClick={onCancel}
          className="flex-1 p-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button 
          type="submit"
          className="flex-[2] p-3 rounded-xl bg-blue-600 dark:bg-blue-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors shadow-md"
        >
          <Save size={18} /> Save Call Record
        </button>
      </div>
    </form>
  );
};
