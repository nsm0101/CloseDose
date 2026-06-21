/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TeamMember } from '../types';
import { User, UserPlus, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface TeamAssignmentProps {
  teamMembers: TeamMember[];
  assignedIds: string[];
  onAssign: (id: string) => void;
  onRemove: (id: string) => void;
}

export const TeamAssignment: React.FC<TeamAssignmentProps> = ({ teamMembers, assignedIds, onAssign, onRemove }) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'attending': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/50';
      case 'fellow': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50';
      case 'resident': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50';
      case 'student': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/50';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {teamMembers.map(member => {
          const isAssigned = assignedIds.includes(member.id);
          return (
            <button
              key={member.id}
              onClick={() => isAssigned ? onRemove(member.id) : onAssign(member.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all shadow-sm",
                isAssigned 
                  ? "bg-blue-600 dark:bg-blue-700 border-blue-700 dark:border-blue-800 text-white ring-2 ring-blue-200 dark:ring-blue-900/50" 
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors",
                isAssigned ? "bg-blue-500 dark:bg-blue-600 text-white" : getRoleColor(member.role)
              )}>
                {member.initials}
              </div>
              <span>{member.firstName} {member.lastName}</span>
              {isAssigned ? <X size={14} /> : <UserPlus size={14} />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
