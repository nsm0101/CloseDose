/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PatientStatus } from '../types';
import { getStatusColor, cn } from '../lib/utils';
import { Home, Bed, Users, FlaskConical, AlertCircle, Eye, Check, X, ArrowRight } from 'lucide-react';

interface RadialStatusMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (status: PatientStatus) => void;
  currentStatus: PatientStatus;
  centerX: number;
  centerY: number;
  darkMode?: boolean;
}

const STATUS_OPTIONS: { status: PatientStatus; icon: any; angle: number; label: string }[] = [
  { status: 'Staff', icon: Users, angle: 0, label: 'Staff' },
  { status: 'Work-up', icon: FlaskConical, angle: 45, label: 'Work-up' },
  { status: 'Admit', icon: Bed, angle: 90, label: 'Admit' },
  { status: 'Likely Admit', icon: Bed, angle: 135, label: 'Likely Admit' },
  { status: 'ED Observation', icon: Eye, angle: 180, label: 'ED Obs' },
  { status: 'Likely Discharge', icon: Home, angle: 225, label: 'Likely DC' },
  { status: 'Discharge', icon: Home, angle: 270, label: 'Discharge' },
  { status: 'New', icon: AlertCircle, angle: 315, label: 'New' },
];

export const RadialStatusMenu: React.FC<RadialStatusMenuProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentStatus,
  centerX,
  centerY,
  darkMode = false
}) => {
  const [touchPos, setTouchPos] = useState({ x: centerX, y: centerY });
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  useEffect(() => {
    if (!isOpen) {
      setSelectedIndex(-1);
      return;
    }

    const handleMove = (e: PointerEvent) => {
      setTouchPos({ x: e.clientX, y: e.clientY });
      
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 30) {
        setSelectedIndex(-1);
        return;
      }

      // Calculate angle in degrees (0 is top, clockwise)
      // atan2 returns radians from -PI to PI, where 0 is right.
      // We want 0 to be top.
      let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      if (angle < 0) angle += 360;

      // Find closest segment (each is 45 degrees)
      const index = Math.round(angle / 45) % 8;
      
      if (index !== selectedIndex) {
        if (navigator.vibrate) navigator.vibrate(5);
        setSelectedIndex(index);
      }
    };

    const handleUp = () => {
      if (selectedIndex !== -1) {
        onSelect(STATUS_OPTIONS[selectedIndex].status);
      }
      onClose();
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [isOpen, centerX, centerY, selectedIndex, onSelect, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
        {/* Backdrop Blur */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-2xl pointer-events-auto"
          onClick={onClose}
        />

        {/* Menu Center Indicator */}
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute w-3 h-3 bg-white rounded-full shadow-lg border-2 border-blue-500 z-10"
          style={{ left: centerX - 6, top: centerY - 6 }}
        />

        {/* Drag Line */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <motion.line 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            x1={centerX} 
            y1={centerY} 
            x2={touchPos.x} 
            y2={touchPos.y} 
            stroke="white" 
            strokeWidth="2" 
            strokeDasharray="4 4"
          />
        </svg>

        {/* Radial Segments */}
        <div className="absolute" style={{ left: centerX, top: centerY }}>
          {STATUS_OPTIONS.map((opt, i) => {
            const isSelected = selectedIndex === i;
            const isCurrent = currentStatus === opt.status;
            
            // Calculate position for each segment
            const radius = isSelected ? 85 : 70;
            const rad = (opt.angle - 90) * (Math.PI / 180);
            const x = Math.cos(rad) * radius;
            const y = Math.sin(rad) * radius;

            const Icon = opt.icon;

            return (
              <motion.div
                key={opt.status}
                initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
                animate={{ 
                  scale: isSelected ? 1.1 : 1, 
                  x, 
                  y, 
                  opacity: 1,
                  transition: { type: "spring", stiffness: 400, damping: 25 }
                }}
                className={cn(
                  "absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center gap-0.5 transition-all",
                  isSelected ? "z-20" : "z-10"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center shadow-xl border-2 transition-all",
                  isSelected 
                    ? "scale-110 border-white ring-4 ring-white/30" 
                    : "border-transparent opacity-80",
                  getStatusColor(opt.status),
                  isCurrent && !isSelected && "ring-2 ring-white ring-offset-2 ring-offset-black/40"
                )}>
                  <Icon size={20} />
                  {isCurrent && !isSelected && (
                    <div className="absolute -top-1 -right-1 bg-white text-blue-600 rounded-full p-0.5 shadow-sm">
                      <Check size={8} />
                    </div>
                  )}
                </div>
                <span className={cn(
                  "text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full shadow-sm whitespace-nowrap transition-all",
                  isSelected 
                    ? "bg-white text-gray-900 scale-110" 
                    : "bg-black/40 text-white opacity-60"
                )}>
                  {opt.label}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Center Label */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-1/2 -translate-x-1/2 bottom-24 flex flex-col items-center gap-2"
        >
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-3 flex items-center gap-4 shadow-2xl">
            <div className="flex flex-col items-center">
              <span className="text-[8px] font-black text-white/50 uppercase tracking-widest">Current</span>
              <span className={cn("text-xs font-black uppercase px-2 py-0.5 rounded-md", getStatusColor(currentStatus))}>
                {currentStatus}
              </span>
            </div>
            <ArrowRight className="text-white/30" size={16} />
            <div className="flex flex-col items-center min-w-[80px]">
              <span className="text-[8px] font-black text-white/50 uppercase tracking-widest">Target</span>
              <span className={cn(
                "text-xs font-black uppercase px-2 py-0.5 rounded-md transition-all",
                selectedIndex !== -1 ? getStatusColor(STATUS_OPTIONS[selectedIndex].status) : "bg-white/5 text-white/20"
              )}>
                {selectedIndex !== -1 ? STATUS_OPTIONS[selectedIndex].status : 'Drag to Select'}
              </span>
            </div>
          </div>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Release to confirm status change</p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
