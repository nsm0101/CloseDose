/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SCENARIOS, INDUCTION_AGENTS, PARALYTICS_COMPARISON } from '../data/rsiData';
import { AlertTriangle, CheckCircle, ShieldAlert, BookOpen, AlertOctagon, HelpCircle } from 'lucide-react';

interface ScenarioGuideProps {
  weight: number;
}

export default function ScenarioGuide({ weight }: ScenarioGuideProps) {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('sepsis');
  
  // Interactive Patient-Specific Contraindications state
  const [contraindications, setContraindications] = useState({
    sepsisShock: false,
    hyperkalemia: false,
    myopathy: false,
    burnsCrush: false,
    asthma: false,
    seizures: false,
    mitochondrial: false,
    neonatalInfant: false,
  });

  const activeScenario = SCENARIOS.find((s) => s.id === selectedScenarioId) || SCENARIOS[0];

  const toggleContraindication = (key: keyof typeof contraindications) => {
    setContraindications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Compute dynamic warning flags based on selected clinical contraindications
  const getDrugContraindicationStatus = (drugId: string) => {
    const alerts: string[] = [];
    const isAvoid = false;

    if (drugId === 'ketamine') {
      if (contraindications.neonatalInfant) {
        alerts.push('Procedural sedation contraindicated in infants <3 months; use with extreme caution if <3 months in crash intubation.');
      }
    }

    if (drugId === 'etomidate') {
      if (contraindications.sepsisShock) {
        alerts.push('ABSOLUTELY AVOID IN SEPSIS: Strongly associated with adrenal suppression (inhibits 11β-hydroxylase) and higher sepsis mortality (pooled OR 4.51).');
      }
    }

    if (drugId === 'propofol') {
      if (contraindications.sepsisShock || contraindications.burnsCrush) {
        alerts.push('HIGH HYPOTENSION RISK: Severe vasodilation and cardiac depression, 4× more likely to cause severe hypotension than etomidate.');
      }
      if (contraindications.mitochondrial) {
        alerts.push('CONTRAINDICATED IN MITOCHONDRIAL DISEASE: High risk of trigger and metabolic crisis.');
      }
    }

    if (drugId === 'succinylcholine') {
      if (contraindications.myopathy) {
        alerts.push('FATAL HYPERKALEMIA BLACK BOX: High risk of massive, fatal hyperkalemic spikes (5–10 mEq/L) in pediatric patients with undiagnosed myopathies (e.g., Duchenne DMD).');
      }
      if (contraindications.hyperkalemia) {
        alerts.push('CONTRAINDICATED: Directly increases serum potassium by 0.3–1.0 mEq/L normally; can cause extreme spikes in pre-existing hyperkalemia.');
      }
      if (contraindications.burnsCrush) {
        alerts.push('CONTRAINDICATED: Major burns, denervation, crush injuries, or severe sepsis older than 48 hours increase risk of hyperkalemic cardiac arrest.');
      }
    }

    return alerts;
  };

  return (
    <div id="scenarios-section" className="space-y-6">
      {/* Clinician's Interactive Emergency Contraindications Triage */}
      <div className="bg-white border-4 border-slate-900 rounded-xl p-5 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] text-slate-900">
        <div className="flex items-center gap-2 text-slate-950 font-extrabold text-sm uppercase tracking-wide font-display">
          <ShieldAlert className="h-5 w-5 text-red-600 animate-pulse" />
          Patient-Specific Contraindications Triage
        </div>
        <p className="text-xs text-slate-500 mt-1 font-semibold">
          Select any active patient conditions below to instantly run automated drug contraindication warnings.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
          <button
            id="contra-sepsis"
            onClick={() => toggleContraindication('sepsisShock')}
            className={`px-3 py-2.5 rounded text-left text-xs font-black border-2 transition-all flex items-center justify-between shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 ${
              contraindications.sepsisShock
                ? 'bg-red-50 border-red-600 text-red-900 translate-y-0.5 shadow-none'
                : 'bg-white border-slate-900 text-slate-800 hover:bg-slate-50'
            }`}
          >
            <span>Septic Shock / Sepsis</span>
            <span className={`w-2.5 h-2.5 rounded-full ${contraindications.sepsisShock ? 'bg-red-600' : 'bg-slate-300'}`}></span>
          </button>

          <button
            id="contra-hyperkalemia"
            onClick={() => toggleContraindication('hyperkalemia')}
            className={`px-3 py-2.5 rounded text-left text-xs font-black border-2 transition-all flex items-center justify-between shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 ${
              contraindications.hyperkalemia
                ? 'bg-red-50 border-red-600 text-red-900 translate-y-0.5 shadow-none'
                : 'bg-white border-slate-900 text-slate-800 hover:bg-slate-50'
            }`}
          >
            <span>Hyperkalemia (K+ &gt; 5.5)</span>
            <span className={`w-2.5 h-2.5 rounded-full ${contraindications.hyperkalemia ? 'bg-red-600' : 'bg-slate-300'}`}></span>
          </button>

          <button
            id="contra-myopathy"
            onClick={() => toggleContraindication('myopathy')}
            className={`px-3 py-2.5 rounded text-left text-xs font-black border-2 transition-all flex items-center justify-between shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 ${
              contraindications.myopathy
                ? 'bg-red-50 border-red-600 text-red-900 translate-y-0.5 shadow-none'
                : 'bg-white border-slate-900 text-slate-800 hover:bg-slate-50'
            }`}
          >
            <span>Myopathy / DMD Suspect</span>
            <span className={`w-2.5 h-2.5 rounded-full ${contraindications.myopathy ? 'bg-red-600' : 'bg-slate-300'}`}></span>
          </button>

          <button
            id="contra-burns"
            onClick={() => toggleContraindication('burnsCrush')}
            className={`px-3 py-2.5 rounded text-left text-xs font-black border-2 transition-all flex items-center justify-between shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 ${
              contraindications.burnsCrush
                ? 'bg-red-50 border-red-600 text-red-900 translate-y-0.5 shadow-none'
                : 'bg-white border-slate-900 text-slate-800 hover:bg-slate-50'
            }`}
          >
            <span>Burn / Crush / Sepsis &gt;48h</span>
            <span className={`w-2.5 h-2.5 rounded-full ${contraindications.burnsCrush ? 'bg-red-600' : 'bg-slate-300'}`}></span>
          </button>

          <button
            id="contra-asthma"
            onClick={() => toggleContraindication('asthma')}
            className={`px-3 py-2.5 rounded text-left text-xs font-black border-2 transition-all flex items-center justify-between shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 ${
              contraindications.asthma
                ? 'bg-blue-50 border-blue-600 text-blue-900 translate-y-0.5 shadow-none'
                : 'bg-white border-slate-900 text-slate-800 hover:bg-slate-50'
            }`}
          >
            <span>Severe Asthma / Spasm</span>
            <span className={`w-2.5 h-2.5 rounded-full ${contraindications.asthma ? 'bg-blue-600' : 'bg-slate-300'}`}></span>
          </button>

          <button
            id="contra-seizures"
            onClick={() => toggleContraindication('seizures')}
            className={`px-3 py-2.5 rounded text-left text-xs font-black border-2 transition-all flex items-center justify-between shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 ${
              contraindications.seizures
                ? 'bg-purple-50 border-purple-600 text-purple-900 translate-y-0.5 shadow-none'
                : 'bg-white border-slate-900 text-slate-800 hover:bg-slate-50'
            }`}
          >
            <span>Status Epilepticus</span>
            <span className={`w-2.5 h-2.5 rounded-full ${contraindications.seizures ? 'bg-purple-600' : 'bg-slate-300'}`}></span>
          </button>

          <button
            id="contra-mitochondrial"
            onClick={() => toggleContraindication('mitochondrial')}
            className={`px-3 py-2.5 rounded text-left text-xs font-black border-2 transition-all flex items-center justify-between shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 ${
              contraindications.mitochondrial
                ? 'bg-red-50 border-red-600 text-red-900 translate-y-0.5 shadow-none'
                : 'bg-white border-slate-900 text-slate-800 hover:bg-slate-50'
            }`}
          >
            <span>Mitochondrial Disease</span>
            <span className={`w-2.5 h-2.5 rounded-full ${contraindications.mitochondrial ? 'bg-red-600' : 'bg-slate-300'}`}></span>
          </button>

          <button
            id="contra-infant"
            onClick={() => toggleContraindication('neonatalInfant')}
            className={`px-3 py-2.5 rounded text-left text-xs font-black border-2 transition-all flex items-center justify-between shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 ${
              contraindications.neonatalInfant
                ? 'bg-yellow-50 border-yellow-600 text-yellow-900 translate-y-0.5 shadow-none'
                : 'bg-white border-slate-900 text-slate-800 hover:bg-slate-50'
            }`}
          >
            <span>Infant &lt;3 months</span>
            <span className={`w-2.5 h-2.5 rounded-full ${contraindications.neonatalInfant ? 'bg-yellow-600' : 'bg-slate-300'}`}></span>
          </button>
        </div>

        {/* Dynamic Warning Banner */}
        {Object.values(contraindications).some(Boolean) && (
          <div className="mt-4 p-3.5 bg-red-50 border-2 border-red-600 rounded-lg space-y-2 animate-fadeIn shadow-[3px_3px_0px_0px_rgba(220,38,38,1)]">
            <span className="text-xs font-black text-red-700 flex items-center gap-1.5 uppercase font-display">
              <AlertOctagon className="h-4.5 w-4.5 text-red-600" />
              CRITICAL CONTRAINDICATION ALERT:
            </span>
            <div className="space-y-2.5 max-h-48 overflow-y-auto">
              {['ketamine', 'etomidate', 'propofol', 'succinylcholine'].map((drugId) => {
                const alerts = getDrugContraindicationStatus(drugId);
                if (alerts.length === 0) return null;
                const name = drugId.charAt(0).toUpperCase() + drugId.slice(1);
                return (
                  <div key={drugId} className="text-xs text-slate-800 border-l-4 border-red-600 pl-3">
                    <strong className="text-red-700 uppercase tracking-tight text-[10.5px] block font-black">{name}:</strong>
                    {alerts.map((alert, i) => (
                      <p key={i} className="mt-0.5 text-slate-800 leading-snug font-bold">{alert}</p>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Case-Based Protocol Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scenario Menu */}
        <div className="lg:col-span-4 bg-white rounded-xl border-2 border-slate-900 p-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-500 border-b-2 border-slate-100 pb-3 mb-3 font-display">
            <BookOpen className="h-4 w-4 text-blue-600" />
            Clinical Scenario Selection
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {SCENARIOS.map((s) => {
              const isActive = selectedScenarioId === s.id;
              return (
                <button
                  key={s.id}
                  id={`scenario-btn-${s.id}`}
                  onClick={() => setSelectedScenarioId(s.id)}
                  className={`w-full text-left px-3.5 py-3 rounded-lg text-xs font-black transition-all border-2 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 ${
                    isActive
                      ? 'bg-blue-50 border-blue-600 text-blue-900 translate-y-0.5 shadow-none'
                      : 'bg-white border-slate-900 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{s.name}</span>
                    {isActive && <CheckCircle className="h-4.5 w-4.5 text-blue-600" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Scenario Details & Rationales */}
        <div className="lg:col-span-8 bg-white rounded-xl border-2 border-slate-900 p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] space-y-4 text-slate-900">
          <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 font-display uppercase">
              <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
              {activeScenario.name} Protocol
            </h3>
            <span className="text-[10px] bg-slate-900 text-white px-2.5 py-1 rounded font-mono font-bold border-2 border-slate-950">
              Reference Guide
            </span>
          </div>

          {/* Rationale and Evidence Analysis */}
          <div className="bg-slate-50 p-4 rounded-lg border-2 border-slate-900 text-xs text-slate-800 space-y-1.5 shadow-[2px_2px_0px_0px_rgba(15,23,42,0.1)]">
            <span className="text-slate-500 font-black uppercase text-[9px] tracking-wider block font-display">Clinical Selection Evidence:</span>
            <p className="leading-relaxed text-slate-800 font-semibold text-xs">
              {activeScenario.rationale}
            </p>
          </div>

          {/* Induction Preferences Grid */}
          <div className="space-y-3">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wide block">
              Induction Agent Classification for {activeScenario.name}:
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Preferred Agents */}
              <div className="bg-green-50 border-2 border-green-600 rounded-lg p-3.5 space-y-2.5 shadow-[3px_3px_0px_0px_rgba(22,163,74,1)]">
                <span className="text-[10px] font-black text-green-700 flex items-center gap-1 uppercase tracking-wider font-display">
                  <CheckCircle className="h-4.5 w-4.5 text-green-600" />
                  First Line
                </span>
                {activeScenario.preferredInduction.length > 0 ? (
                  <div className="space-y-1.5">
                    {activeScenario.preferredInduction.map((id) => {
                      const drug = INDUCTION_AGENTS.find((d) => d.id === id);
                      return (
                        <div key={id} className="text-xs bg-white border-2 border-green-600 text-slate-900 px-2.5 py-2 rounded font-black">
                          {drug?.name} <span className="text-[10px] text-green-700 font-mono block mt-0.5">{(drug?.ivDosePerKg! * weight).toFixed(1)} mg ({(drug?.ivDosePerKg)} mg/kg)</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic font-bold block">None specified first-line</span>
                )}
              </div>

              {/* Alternative Agents */}
              <div className="bg-yellow-50 border-2 border-yellow-600 rounded-lg p-3.5 space-y-2.5 shadow-[3px_3px_0px_0px_rgba(202,138,4,1)]">
                <span className="text-[10px] font-black text-yellow-700 flex items-center gap-1 uppercase tracking-wider font-display">
                  <AlertTriangle className="h-4.5 w-4.5 text-yellow-600" />
                  Alternative
                </span>
                {activeScenario.alternativeInduction.length > 0 ? (
                  <div className="space-y-1.5">
                    {activeScenario.alternativeInduction.map((id) => {
                      const drug = INDUCTION_AGENTS.find((d) => d.id === id);
                      return (
                        <div key={id} className="text-xs bg-white border-2 border-yellow-600 text-slate-900 px-2.5 py-2 rounded font-black">
                          {drug?.name} <span className="text-[10px] text-yellow-700 font-mono block mt-0.5">{(drug?.ivDosePerKg! * weight).toFixed(1)} mg</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic font-bold block">None specified alternative</span>
                )}
              </div>

              {/* Avoid Agents */}
              <div className="bg-red-50 border-2 border-red-600 rounded-lg p-3.5 space-y-2.5 shadow-[3px_3px_0px_0px_rgba(220,38,38,1)]">
                <span className="text-[10px] font-black text-red-700 flex items-center gap-1 uppercase tracking-wider font-display">
                  <AlertOctagon className="h-4.5 w-4.5 text-red-600" />
                  Avoid / Warning
                </span>
                {activeScenario.avoidInduction.length > 0 ? (
                  <div className="space-y-1.5">
                    {activeScenario.avoidInduction.map((id) => {
                      const drug = INDUCTION_AGENTS.find((d) => d.id === id);
                      return (
                        <div key={id} className="text-xs bg-white border-2 border-red-600 text-red-950 px-2.5 py-2 rounded font-black">
                          {drug?.name}
                          <span className="text-[9px] text-red-700 block font-bold leading-tight mt-1 uppercase">
                            {id === 'etomidate' && 'Adrenal suppression'}
                            {id === 'propofol' && 'Severe hypotension'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic font-bold block">None explicitly avoided</span>
                )}
              </div>
            </div>
          </div>

          {/* Paralytic Selection for Scenario */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Preferred Paralytics */}
            <div className="bg-white p-4 rounded-lg border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(147,51,234,1)] space-y-2">
              <span className="text-[9px] font-black text-purple-700 uppercase tracking-wider block font-display">Recommended Paralytic:</span>
              {activeScenario.recommendedParalytic ? (
                <div className="flex flex-wrap gap-1.5">
                  {activeScenario.recommendedParalytic.map((id) => {
                    const paralytic = PARALYTICS_COMPARISON.find((p) => p.id === id);
                    return (
                      <span key={id} className="text-xs bg-purple-50 border-2 border-purple-600 text-purple-900 px-3 py-1.5 rounded font-black uppercase">
                        {paralytic?.name.split(' ')[0]}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <span className="text-xs text-slate-400 italic font-bold">No specific recommendation</span>
              )}
            </div>

            {/* Avoided Paralytics */}
            <div className="bg-white p-4 rounded-lg border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(220,38,38,1)] space-y-2">
              <span className="text-[9px] font-black text-red-700 uppercase tracking-wider block font-display">Avoid Paralytic:</span>
              {activeScenario.avoidParalytic && activeScenario.avoidParalytic.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {activeScenario.avoidParalytic.map((id) => {
                    const paralytic = PARALYTICS_COMPARISON.find((p) => p.id === id);
                    return (
                      <span key={id} className="text-xs bg-red-50 border-2 border-red-600 text-red-900 px-3 py-1.5 rounded font-black uppercase">
                        {paralytic?.name.split(' ')[0]}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <span className="text-xs text-slate-400 italic font-bold">None explicitly avoided</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
