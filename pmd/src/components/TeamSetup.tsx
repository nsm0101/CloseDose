/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TeamMember, Role } from '../types';
import { UserPlus, Trash2, User, Users, ShieldCheck, GraduationCap, Stethoscope } from 'lucide-react';
import { cn } from '../lib/utils';

interface TeamSetupProps {
  teamMembers: TeamMember[];
  onAdd: (member: Partial<TeamMember>) => void;
  onRemove: (id: string) => void;
}

export const TeamSetup: React.FC<TeamSetupProps> = ({ teamMembers, onAdd, onRemove }) => {
  const [formData, setFormData] = useState<Partial<TeamMember>>({
    firstName: '',
    lastName: '',
    initials: '',
    role: 'resident'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.firstName && formData.lastName && formData.initials) {
      onAdd(formData);
      setFormData({ firstName: '', lastName: '', initials: '', role: 'resident' });
    }
  };

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case 'attending': return <ShieldCheck size={16} className="text-purple-600" />;
      case 'fellow': return <Stethoscope size={16} className="text-blue-600" />;
      case 'resident': return <GraduationCap size={16} className="text-green-600" />;
      case 'student': return <User size={16} className="text-yellow-600" />;
      default: return <User size={16} className="text-gray-600" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 space-y-6 transition-colors">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800 dark:text-gray-200">
          <Users size={20} className="text-blue-600 dark:text-blue-400" /> Team Setup
        </h2>
        <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          {teamMembers.length} Members
        </span>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 transition-colors">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase px-1">First Name</label>
          <input 
            className="w-full p-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            placeholder="John"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase px-1">Last Name</label>
          <input 
            className="w-full p-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            placeholder="Doe"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase px-1">Initials</label>
          <input 
            className="w-full p-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            placeholder="JD"
            maxLength={3}
            value={formData.initials}
            onChange={(e) => setFormData({ ...formData, initials: e.target.value.toUpperCase() })}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase px-1">Role</label>
          <div className="flex gap-2">
            <select 
              className="flex-1 p-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
            >
              <option value="attending">Attending</option>
              <option value="fellow">Fellow</option>
              <option value="resident">Resident</option>
              <option value="student">Student</option>
              <option value="nurse">Nurse</option>
              <option value="other">Other</option>
            </select>
            <button 
              type="submit"
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <UserPlus size={20} />
            </button>
          </div>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {teamMembers.map(member => (
          <div 
            key={member.id} 
            className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm hover:border-gray-200 dark:hover:border-gray-600 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm border border-blue-100 dark:border-blue-800/50">
                {member.initials}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{member.firstName} {member.lastName}</span>
                <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {getRoleIcon(member.role)}
                  {member.role}
                </div>
              </div>
            </div>
            <button 
              onClick={() => onRemove(member.id)}
              className="p-2 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        {teamMembers.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400 dark:text-gray-500 italic text-sm border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl">
            No team members added yet. Add your shift team above.
          </div>
        )}
      </div>
    </div>
  );
};
