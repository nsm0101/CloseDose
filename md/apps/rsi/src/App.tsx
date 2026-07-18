/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Activity, ShieldAlert, Award, FileText, Settings, RefreshCw, Zap, Truck, Timer, Heart, Baby, BookOpen } from 'lucide-react';
import DosingCalculator from './components/DosingCalculator';
import ScenarioGuide from './components/ScenarioGuide';
import SedationReference from './components/SedationReference';
import TransportKit from './components/TransportKit';
import ProgressionTracker from './components/ProgressionTracker';

type ActiveTab = 'calculator' | 'scenarios' | 'sedation' | 'tracker' | 'transport';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('calculator');
  const [weight, setWeight] = useState<number>(10.0); // Default 10 kg
  const [ageGroup, setAgeGroup] = useState<'infant' | 'toddler' | 'child' | 'adolescent'>('toddler');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Clinician Physiological Monitor Header */}
      <header className="bg-slate-900 text-white px-6 py-4.5 border-b-4 border-slate-950 flex flex-col lg:flex-row items-center justify-between gap-4 flex-shrink-0 shadow-[0_4px_12px_rgba(15,23,42,0.1)]">
        {/* Logo & Title */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded bg-red-600 flex items-center justify-center text-white border-2 border-slate-950 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] animate-pulse">
            <Activity className="h-7 w-7 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tighter uppercase font-display text-white">
              Critical Airway Utility
            </h1>
            <p className="text-[10px] md:text-xs text-red-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
              <span>PEDIATRIC EMERGENCY RSI REFERENCE v4.2</span>
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              <span className="text-slate-400 font-semibold capitalize">Emergency Department</span>
            </p>
          </div>
        </div>

        {/* Core physiological metrics quick readout */}
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Patient Weight</span>
              <div className="flex items-center gap-1.5">
                <span className="text-3xl md:text-4xl font-mono font-bold text-blue-400">{weight.toFixed(1)}</span>
                <span className="text-sm font-bold text-slate-500">KG</span>
              </div>
            </div>

            <div className="h-10 w-px bg-slate-700 mx-1"></div>

            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Age Category</span>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl md:text-3xl font-mono font-bold text-purple-400 capitalize">{ageGroup}</span>
              </div>
            </div>
          </div>

          <div className="h-10 w-px bg-slate-700 hidden sm:block"></div>

          <div className="flex items-center gap-2 bg-slate-950 border-2 border-slate-800 px-3 py-1.5 rounded text-[11px] font-mono text-emerald-400 font-bold uppercase shadow-inner">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
            SYS ONLINE
          </div>
        </div>
      </header>

      {/* Main Tab Controller Bar */}
      <nav className="bg-slate-200 border-b-2 border-slate-350 px-4 py-3.5 sticky top-0 z-50 overflow-x-auto shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center gap-2.5 md:gap-4">
          {/* Tab 1: Calculator */}
          <button
            id="tab-btn-calculator"
            onClick={() => setActiveTab('calculator')}
            className={`px-4 py-2.5 rounded text-xs font-black uppercase tracking-wide transition-all flex items-center gap-2 whitespace-nowrap border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 ${
              activeTab === 'calculator'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Zap className="h-4 w-4" />
            1. Dosing Calculator
          </button>

          {/* Tab 2: Scenarios */}
          <button
            id="tab-btn-scenarios"
            onClick={() => setActiveTab('scenarios')}
            className={`px-4 py-2.5 rounded text-xs font-black uppercase tracking-wide transition-all flex items-center gap-2 whitespace-nowrap border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 ${
              activeTab === 'scenarios'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            2. Scenario Guide
          </button>

          {/* Tab 3: Sedation */}
          <button
            id="tab-btn-sedation"
            onClick={() => setActiveTab('sedation')}
            className={`px-4 py-2.5 rounded text-xs font-black uppercase tracking-wide transition-all flex items-center gap-2 whitespace-nowrap border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 ${
              activeTab === 'sedation'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Activity className="h-4 w-4" />
            3. Post-Sedation
          </button>

          {/* Tab 4: Milestones/Tracker */}
          <button
            id="tab-btn-tracker"
            onClick={() => setActiveTab('tracker')}
            className={`px-4 py-2.5 rounded text-xs font-black uppercase tracking-wide transition-all flex items-center gap-2 whitespace-nowrap border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 ${
              activeTab === 'tracker'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Timer className="h-4 w-4" />
            4. Progression Tracker
          </button>

          {/* Tab 5: Transport */}
          <button
            id="tab-btn-transport"
            onClick={() => setActiveTab('transport')}
            className={`px-4 py-2.5 rounded text-xs font-black uppercase tracking-wide transition-all flex items-center gap-2 whitespace-nowrap border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 ${
              activeTab === 'transport'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Truck className="h-4 w-4" />
            5. Transport Kit
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-7xl w-full mx-auto">
        {activeTab === 'calculator' && (
          <DosingCalculator
            weight={weight}
            setWeight={setWeight}
            ageGroup={ageGroup}
            setAgeGroup={setAgeGroup}
          />
        )}

        {activeTab === 'scenarios' && (
          <ScenarioGuide weight={weight} />
        )}

        {activeTab === 'sedation' && (
          <SedationReference weight={weight} ageGroup={ageGroup} />
        )}

        {activeTab === 'tracker' && (
          <ProgressionTracker weight={weight} />
        )}

        {activeTab === 'transport' && (
          <TransportKit weight={weight} />
        )}
      </main>

      {/* Clinician footer safety declaration */}
      <footer className="bg-slate-900 border-t-2 border-slate-950 px-6 py-4.5 text-slate-400 text-center text-xs flex-shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-medium text-slate-400">
            © 2026 Pediatric Emergency Department Airway Utility. Standard clinical confirmation required.
          </span>
          <span className="flex items-center gap-2 text-red-400 font-bold uppercase tracking-wider">
            <ShieldAlert className="h-4.5 w-4.5 text-red-500 animate-pulse" />
            Designed for high-stress emergency scenarios. Verify with Broselow Tape.
          </span>
        </div>
      </footer>
    </div>
  );
}
