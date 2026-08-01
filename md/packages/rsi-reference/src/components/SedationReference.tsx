/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldAlert, Info, CheckCircle, AlertTriangle, Activity } from 'lucide-react';
import { POST_SEDATION_AGENTS } from '../data/rsiData';

interface SedationReferenceProps {
  weight: number;
  ageGroup: 'infant' | 'toddler' | 'child' | 'adolescent';
}

export default function SedationReference({ weight, ageGroup }: SedationReferenceProps) {
  const [expandedAgent, setExpandedAgent] = useState<string | null>('dexmedetomidine');

  return (
    <div id="sedation-section" className="space-y-6">
      {/* Clinician SCCM Guidance Banner */}
      <div className="bg-white border-4 border-slate-900 rounded-xl p-5 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] text-slate-900">
        <div className="flex items-center gap-2 text-slate-950 font-extrabold text-sm uppercase tracking-wider font-display">
          <ShieldAlert className="h-5 w-5 text-blue-600 animate-pulse" />
          SCCM Pediatric Sedation Guidelines (2022)
        </div>
        <p className="text-xs text-slate-600 mt-2.5 leading-relaxed font-semibold">
          The 2022 SCCM Clinical Practice Guidelines establish a clear hierarchy: 
          <strong className="text-blue-700"> Alpha-2 agonists (Dexmedetomidine)</strong> are preferred as the primary sedative class over benzodiazepines (Midazolam) for mechanically ventilated pediatric patients. Use <strong className="text-blue-700">IV opioids (Fentanyl)</strong> as the primary analgesic for moderate-to-severe pain.
        </p>
      </div>

      {/* Interactive calculated sedation list */}
      <div className="space-y-4 text-slate-900">
        <div className="flex items-center justify-between border-b-2 border-slate-300 pb-2">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-black text-slate-900 tracking-tight font-display uppercase">Post-Intubation Sedation & Analgesia</h2>
          </div>
          <span className="text-xs bg-slate-900 text-white px-3 py-1 rounded font-mono font-bold border-2 border-slate-950">
            {weight} kg
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {POST_SEDATION_AGENTS.map((agent) => {
            const isExpanded = expandedAgent === agent.id;

            // Real-time loading calculations
            let calculatedLoading = 'N/A';
            if (agent.loadingDosePerKg) {
              const loadingVal = agent.loadingDosePerKg * weight;
              if (agent.id === 'dexmedetomidine' || agent.id === 'fentanyl') {
                calculatedLoading = `${loadingVal.toFixed(1)} mcg IV`;
              } else {
                calculatedLoading = `${loadingVal.toFixed(1)} mg IV`;
              }
            }

            // Real-time infusion calculations
            let calculatedInfusion = 'N/A';
            if (agent.id === 'dexmedetomidine') {
              calculatedInfusion = `${(0.4 * weight).toFixed(1)} to ${(0.8 * weight).toFixed(1)} mcg/hr (standard range)`;
            } else if (agent.id === 'fentanyl') {
              calculatedInfusion = `${(1 * weight).toFixed(1)} to ${(3 * weight).toFixed(1)} mcg/hr`;
            } else if (agent.id === 'ketamine_sedation') {
              calculatedInfusion = `${(0.3 * weight).toFixed(1)} to ${(0.9 * weight).toFixed(1)} mg/hr (${(5 * weight).toFixed(0)} to ${(15 * weight).toFixed(0)} mcg/min)`;
            } else if (agent.id === 'midazolam_sedation') {
              calculatedInfusion = `${(0.06 * weight).toFixed(2)} to ${(0.12 * weight).toFixed(2)} mg/hr (${(1 * weight).toFixed(0)} to ${(2 * weight).toFixed(0)} mcg/min)`;
            } else if (agent.id === 'propofol_sedation') {
              calculatedInfusion = `${(5 * weight).toFixed(0)} to ${(50 * weight).toFixed(0)} mcg/min (keep <67 mcg/min)`;
            }

            const isPrimary = agent.id === 'dexmedetomidine' || agent.id === 'fentanyl';

            return (
              <div
                key={agent.id}
                id={`sedation-card-${agent.id}`}
                onClick={() => setExpandedAgent(isExpanded ? null : agent.id)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer select-none ${
                  isExpanded
                    ? 'bg-blue-50/55 border-blue-600 shadow-[4px_4px_0px_0px_rgba(37,99,235,1)]'
                    : 'bg-white hover:bg-slate-50 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base text-slate-900 uppercase font-display">{agent.name}</h3>
                      {isPrimary ? (
                        <span className="text-[9px] bg-green-100 border-2 border-green-600 text-green-700 px-2 py-0.5 rounded font-black uppercase">
                          First Line
                        </span>
                      ) : (
                        <span className="text-[9px] bg-slate-100 border-2 border-slate-900 text-slate-700 px-2 py-0.5 rounded font-black uppercase">
                          Adjunct
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 font-semibold">
                      SCCM Role: <span className="text-slate-800">{agent.sccmRole}</span>
                    </p>
                  </div>

                  <div className="text-left sm:text-right flex-shrink-0">
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block mb-1">Real-time Infusion Rate:</span>
                    <span className="font-mono text-sm md:text-base font-black text-blue-700 leading-none">
                      {calculatedInfusion}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t-2 border-dashed border-blue-200 space-y-3.5 text-xs text-slate-800 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="bg-white p-3.5 rounded-lg border-2 border-blue-200 shadow-[2px_2px_0px_0px_rgba(15,23,42,0.05)] font-semibold">
                        <strong className="text-[10px] text-blue-900 block uppercase font-black tracking-wider mb-1">Calculated Loading Bolus:</strong>
                        <span className="font-mono text-sm font-black text-blue-700">{calculatedLoading}</span>
                        <p className="text-[10px] text-slate-500 mt-0.5">({agent.loadingDose})</p>
                      </div>

                      <div className="bg-white p-3.5 rounded-lg border-2 border-blue-200 shadow-[2px_2px_0px_0px_rgba(15,23,42,0.05)] font-semibold">
                        <strong className="text-[10px] text-blue-900 block uppercase font-black tracking-wider mb-1">Neonatal Adjustments:</strong>
                        <p className="text-[10.5px] text-yellow-700 font-bold leading-normal">{agent.neonatalAdjustment}</p>
                      </div>
                    </div>

                    {/* Pros and Cons assessment */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-green-50 border-2 border-green-600 rounded-lg p-3.5 shadow-[3px_3px_0px_0px_rgba(22,163,74,1)]">
                        <span className="text-[10px] font-black text-green-700 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                          <CheckCircle className="h-4.5 w-4.5 text-green-600" />
                          Key Clinical Advantages
                        </span>
                        <ul className="list-disc list-inside space-y-1.5 text-slate-800 font-semibold leading-snug">
                          {agent.advantages.map((adv, i) => (
                            <li key={i}>{adv}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-red-50 border-2 border-red-600 rounded-lg p-3.5 shadow-[3px_3px_0px_0px_rgba(220,38,38,1)]">
                        <span className="text-[10px] font-black text-red-700 uppercase tracking-wider block mb-1.5 flex items-center gap-1 font-display">
                          <AlertTriangle className="h-4.5 w-4.5 text-red-600" />
                          Clinical Risks & Disadvantages
                        </span>
                        <ul className="list-disc list-inside space-y-1.5 text-slate-800 font-semibold leading-snug">
                          {agent.disadvantages.map((dis, i) => (
                            <li key={i}>{dis}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
