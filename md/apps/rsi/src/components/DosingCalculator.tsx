/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Baby, Activity, Zap, ShieldAlert, AlertTriangle, ChevronDown, ChevronUp, RefreshCw, CheckCircle } from 'lucide-react';
import { INDUCTION_AGENTS, PARALYTICS_COMPARISON } from '../data/rsiData';

interface DosingCalculatorProps {
  weight: number;
  setWeight: (w: number) => void;
  ageGroup: 'infant' | 'toddler' | 'child' | 'adolescent';
  setAgeGroup: (group: 'infant' | 'toddler' | 'child' | 'adolescent') => void;
}

export default function DosingCalculator({
  weight,
  setWeight,
  ageGroup,
  setAgeGroup,
}: DosingCalculatorProps) {
  const [expandedDrug, setExpandedDrug] = useState<string | null>(null);
  const [customWeightInput, setCustomWeightInput] = useState<string>(weight.toString());
  const [isOlderThan12, setIsOlderThan12] = useState<boolean>(false);

  // Quick age-based weight presets (NB to 18+)
  const agePresets = [
    { label: 'NB', weight: 3.5, ageText: 'Newborn' },
    { label: '1m', weight: 4.5, ageText: '1 month' },
    { label: '3m', weight: 6.0, ageText: '3 months' },
    { label: '6m', weight: 8.0, ageText: '6 months' },
    { label: '1y', weight: 10.0, ageText: '1 year' },
    { label: '2y', weight: 12.0, ageText: '2 years' },
    { label: '4y', weight: 16.0, ageText: '4 years' },
    { label: '6y', weight: 20.0, ageText: '6 years' },
    { label: '8y', weight: 26.0, ageText: '8 years' },
    { label: '10y', weight: 32.0, ageText: '10 years' },
    { label: '12y', weight: 40.0, ageText: '12 years' },
    { label: '14y', weight: 50.0, ageText: '14 years' },
    { label: '16y', weight: 60.0, ageText: '16 years' },
    { label: '18+', weight: 70.0, ageText: 'Adult' },
  ];

  useEffect(() => {
    setCustomWeightInput(weight.toString());
    // Auto-update age category based on weight guidelines as safe starting points
    if (weight <= 5) {
      setAgeGroup('infant');
      setIsOlderThan12(false);
    } else if (weight <= 12) {
      setAgeGroup('toddler');
      setIsOlderThan12(false);
    } else if (weight <= 35) {
      setAgeGroup('child');
      setIsOlderThan12(false);
    } else {
      setAgeGroup('adolescent');
      setIsOlderThan12(weight >= 40); // Safe starting point for ≥12 yr (40 kg preset)
    }
  }, [weight, setAgeGroup]);

  const handleWeightChange = (val: string) => {
    setCustomWeightInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0 && num <= 150) {
      setWeight(num);
    }
  };

  const incrementWeight = (amount: number) => {
    const newWeight = Math.max(1, Math.min(150, Math.round((weight + amount) * 10) / 10));
    setWeight(newWeight);
    setCustomWeightInput(newWeight.toString());
  };

  const getSuccinylcholineDose = () => {
    // Succinylcholine dose varies by age:
    // ≤6 mo (infant): 3 mg/kg
    // 6 mo–2 yr (toddler): 2 mg/kg
    // >2 yr (child/adolescent): 1.5 mg/kg
    let factor = 1.5;
    let label = '1.5 mg/kg';
    if (ageGroup === 'infant') {
      factor = 3.0;
      label = '3.0 mg/kg';
    } else if (ageGroup === 'toddler') {
      factor = 2.0;
      label = '2.0 mg/kg';
    }

    const calculated = factor * weight;
    return {
      dose: calculated.toFixed(1),
      label,
      factor
    };
  };

  const getAtropineDose = () => {
    // 0.02 mg/kg. Max 0.5 mg for <12 yr, 1 mg for >=12 yr
    const raw = 0.02 * weight;
    const max = isOlderThan12 ? 1.0 : 0.5;
    const finalDose = Math.min(max, raw);
    const isCapped = raw > max;

    return {
      dose: finalDose.toFixed(3),
      rawDose: raw.toFixed(3),
      isCapped,
      max
    };
  };

  const getGlycopyrrolateDose = () => {
    // 0.004 mg/kg. Max 0.1 mg
    // Under 2 years may require up to 0.009 mg/kg. Let's provide standard and a note.
    const isUnder2 = ageGroup === 'infant' || ageGroup === 'toddler';
    const factor = isUnder2 ? 0.004 : 0.004; // standard 0.004
    const raw = factor * weight;
    const finalDose = Math.min(0.1, raw);
    const isCapped = raw > 0.1;

    return {
      dose: finalDose.toFixed(3),
      isCapped,
      isUnder2
    };
  };

  return (
    <div id="calculator-section" className="space-y-6">
      {/* 1. Quick & Precise Weight Entry */}
      <div className="bg-white border-4 border-slate-900 rounded-xl p-5 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] text-slate-900">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Single Weight Entry Box */}
          <div className="lg:col-span-4 space-y-2.5">
            <div className="flex items-center gap-2 text-slate-950 font-black text-sm uppercase tracking-wider font-display">
              <Baby className="h-5 w-5 text-blue-600 animate-pulse" />
              Patient Weight (kg)
            </div>
            
            <div className="relative flex items-center bg-slate-50 border-2 border-slate-900 rounded-lg p-1.5 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]">
              <button
                type="button"
                id="weight-decrement-btn"
                onClick={() => incrementWeight(-1)}
                className="w-10 h-10 rounded bg-white hover:bg-slate-100 border-2 border-slate-900 font-black text-lg flex items-center justify-center transition-all shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5"
                title="Decrease by 1 kg"
              >
                -
              </button>
              
              <input
                id="weight-input"
                type="number"
                value={customWeightInput}
                onChange={(e) => handleWeightChange(e.target.value)}
                min="1"
                max="150"
                step="0.1"
                className="flex-1 min-w-0 bg-transparent text-center font-mono font-black text-3xl text-blue-600 py-1 focus:outline-none"
                placeholder="Enter kg"
              />
              
              <button
                type="button"
                id="weight-increment-btn"
                onClick={() => incrementWeight(1)}
                className="w-10 h-10 rounded bg-white hover:bg-slate-100 border-2 border-slate-900 font-black text-lg flex items-center justify-center transition-all shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5"
                title="Increase by 1 kg"
              >
                +
              </button>
            </div>
            
            <p className="text-[10px] text-slate-500 font-bold italic leading-tight">
              Type weight directly or use +/- fine-tune buttons.
            </p>
          </div>

          {/* Preset Weights by Age Row */}
          <div className="lg:col-span-8 space-y-2.5">
            <span className="text-xs text-slate-500 font-black uppercase tracking-wider block font-display">
              Preset Weights by Age (NB to 18+):
            </span>
            
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {agePresets.map((preset) => {
                const isSelected = Math.abs(weight - preset.weight) < 0.05;
                return (
                  <button
                    key={preset.label}
                    id={`preset-${preset.label}`}
                    type="button"
                    onClick={() => {
                      setWeight(preset.weight);
                      setCustomWeightInput(preset.weight.toString());
                    }}
                    className={`px-1.5 py-1.5 rounded-lg border-2 border-slate-900 font-mono text-center transition-all flex flex-col items-center justify-center shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 ${
                      isSelected
                        ? 'bg-blue-600 border-slate-950 text-white shadow-none translate-y-0.5'
                        : 'bg-white text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`text-[9px] font-black uppercase ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                      {preset.label}
                    </span>
                    <span className="text-[11px] font-black mt-0.5 leading-none">
                      {preset.weight} <span className="text-[8px] font-bold">kg</span>
                    </span>
                  </button>
                );
              })}
            </div>
            
            <p className="text-[10px] text-slate-500 font-semibold leading-normal">
              Presets map to standard 50th percentile patient weights. Age classification updates automatically.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Dosing Table Display */}
      <div className="space-y-4">
        {/* Section Title */}
        <div className="flex items-center justify-between border-b-2 border-slate-300 pb-2">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            <h2 className="text-lg font-black text-slate-900 tracking-tight font-display uppercase">Real-Time Calculated Doses</h2>
          </div>
          <span className="text-xs bg-slate-900 text-white px-3 py-1 rounded font-mono font-bold border-2 border-slate-950">
            {weight} kg | {ageGroup.toUpperCase()}
          </span>
        </div>

        {/* Core RSI Medications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* INDUCTION AGENTS */}
          <div className="bg-white rounded-xl border-2 border-slate-900 p-5 space-y-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
            <h3 className="text-sm font-black text-slate-900 tracking-wider uppercase border-b-2 border-slate-100 pb-3 flex items-center justify-between font-display">
              <span>Induction Agents</span>
              <span className="text-[10px] bg-blue-100 border-2 border-blue-600 text-blue-700 px-2 py-0.5 rounded font-black uppercase">
                Select One
              </span>
            </h3>

            <div className="space-y-3">
              {INDUCTION_AGENTS.map((drug) => {
                const calculatedDose = (drug.ivDosePerKg! * weight).toFixed(1);
                const isExpanded = expandedDrug === drug.id;

                // Propofol precaution under 3 years old
                const isPropofolPrecaution = drug.id === 'propofol' && (ageGroup === 'infant' || ageGroup === 'toddler');

                return (
                  <div
                    key={drug.id}
                    id={`med-card-${drug.id}`}
                    onClick={() => setExpandedDrug(isExpanded ? null : drug.id)}
                    className={`p-4 rounded-lg transition-all cursor-pointer select-none border-2 ${
                      isExpanded
                        ? 'bg-blue-50/55 border-blue-600 shadow-[4px_4px_0px_0px_rgba(37,99,235,1)]'
                        : 'bg-white hover:bg-slate-50 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-lg text-slate-900 uppercase font-display">{drug.name}</span>
                          {isPropofolPrecaution && (
                            <span className="text-[9px] bg-red-100 border border-red-600 text-red-700 px-1.5 py-0.5 rounded font-bold uppercase">
                              FDA Caution &lt;3yr
                            </span>
                          )}
                          {drug.id === 'ketamine' && ageGroup === 'infant' && weight <= 4 && (
                            <span className="text-[9px] bg-red-100 border border-red-600 text-red-700 px-1.5 py-0.5 rounded font-bold uppercase">
                              Contraindicated &lt;3mo
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 font-semibold italic mt-0.5 block">
                          {drug.ivDosePerKg} mg/kg IV
                        </span>
                      </div>

                      <div className="text-right">
                        <div className={`font-mono text-2xl md:text-3xl font-black ${isExpanded ? 'text-blue-700' : 'text-slate-900'}`}>
                          {calculatedDose} <span className="text-sm font-bold text-slate-500">mg</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase font-mono block mt-0.5">
                          Onset: {drug.id === 'ketamine' ? '~30s' : '<1m'}
                        </span>
                      </div>
                    </div>

                    {/* Expandable detailed view */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t-2 border-dashed border-blue-200 space-y-3.5 text-xs text-slate-800 animate-fadeIn">
                        <div>
                          <strong className="text-blue-900 uppercase tracking-wider text-[10px] block mb-1">Clinical Protocol & Guidance:</strong>
                          <p className="text-slate-800 leading-relaxed bg-white p-3 rounded border-2 border-blue-250 font-semibold font-sans text-xs">
                            {drug.notes}
                          </p>
                        </div>

                        {drug.imDose && (
                          <div className="flex justify-between bg-white px-3 py-2 rounded border-2 border-blue-200 font-bold text-xs">
                            <span className="text-slate-500">IM Route Option:</span>
                            <span className="text-blue-800 font-mono">
                              {(drug.imDosePerKg! * weight).toFixed(1)} mg ({drug.imDose})
                            </span>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div className="bg-green-50 border-2 border-green-600 p-3 rounded shadow-[2px_2px_0px_0px_rgba(22,163,74,1)]">
                            <span className="text-green-800 font-black uppercase text-[10px] tracking-wider block mb-1">Advantages</span>
                            <ul className="list-disc list-inside space-y-1 text-slate-800 font-semibold">
                              {drug.advantages.slice(0, 2).map((a, i) => (
                                <li key={i}>{a}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-red-50 border-2 border-red-600 p-3 rounded shadow-[2px_2px_0px_0px_rgba(220,38,38,1)]">
                            <span className="text-red-800 font-black uppercase text-[10px] tracking-wider block mb-1">Disadvantages</span>
                            <ul className="list-disc list-inside space-y-1 text-slate-800 font-semibold">
                              {drug.disadvantages.slice(0, 2).map((d, i) => (
                                <li key={i}>{d}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-blue-900 bg-blue-100/50 p-2 rounded border border-blue-200 font-bold">
                          <Activity className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <span className="text-[11px] leading-snug">Duration: {drug.duration}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* PARALYTICS */}
          <div className="bg-white rounded-xl border-2 border-slate-900 p-5 space-y-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
            <h3 className="text-sm font-black text-slate-900 tracking-wider uppercase border-b-2 border-slate-100 pb-3 flex items-center justify-between font-display">
              <span>Paralytic Agents</span>
              <span className="text-[10px] bg-purple-100 border-2 border-purple-600 text-purple-700 px-2 py-0.5 rounded font-black uppercase">
                Check Warnings
              </span>
            </h3>

            <div className="space-y-3">
              {/* Rocuronium */}
              {(() => {
                const rocDose = (1.0 * weight).toFixed(1); // Standard 1.0 mg/kg RSI
                const sugDose = (2.0 * weight).toFixed(1); // Sugammadex 2 mg/kg
                const isRocExpanded = expandedDrug === 'rocuronium';

                return (
                  <div
                    id="med-card-rocuronium"
                    onClick={() => setExpandedDrug(isRocExpanded ? null : 'rocuronium')}
                    className={`p-4 rounded-lg transition-all cursor-pointer select-none border-2 ${
                      isRocExpanded
                        ? 'bg-purple-50/55 border-purple-600 shadow-[4px_4px_0px_0px_rgba(147,51,234,1)]'
                        : 'bg-white hover:bg-slate-50 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-lg text-slate-900 uppercase font-display">Rocuronium</span>
                          <span className="text-[9px] bg-emerald-100 border border-emerald-600 text-emerald-700 px-1.5 py-0.5 rounded font-black uppercase">
                            FIRST CHOICE
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 font-semibold italic mt-0.5 block">
                          1.0 mg/kg standard RSI IV
                        </span>
                      </div>

                      <div className="text-right">
                        <div className={`font-mono text-2xl md:text-3xl font-black ${isRocExpanded ? 'text-purple-700' : 'text-slate-900'}`}>
                          {rocDose} <span className="text-sm font-bold text-slate-500">mg</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase font-mono block mt-0.5">
                          Onset: 60–90s
                        </span>
                      </div>
                    </div>

                    {isRocExpanded && (
                      <div className="mt-4 pt-4 border-t-2 border-dashed border-purple-200 space-y-3.5 text-xs text-slate-800 animate-fadeIn">
                        <div className="bg-white p-3 rounded border-2 border-purple-200 space-y-1.5 shadow-[2px_2px_0px_0px_rgba(147,51,234,0.15)] font-semibold">
                          <div className="flex justify-between text-purple-700 font-black mb-1">
                            <span>Sugammadex Reversal:</span>
                            <span className="font-mono font-bold">{sugDose} mg IV (2 mg/kg)</span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-normal font-medium">
                            Sugammadex reverses rocuronium in birth through adolescence within 1.4 minutes.
                          </p>
                        </div>

                        <div className="bg-white p-3 rounded border-2 border-purple-200 font-semibold text-xs space-y-1.5">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Duration (Children 2-11yr):</span>
                            <span className="text-slate-800 font-bold">~53 minutes at RSI dose</span>
                          </div>
                          <div className="flex justify-between border-t border-slate-100 pt-1.5">
                            <span className="text-slate-500">Duration (Neonates):</span>
                            <span className="text-yellow-600 font-black">114.4 minutes (caution)</span>
                          </div>
                        </div>

                        <div>
                          <strong className="text-emerald-700 text-[10px] uppercase block font-black tracking-wider mb-0.5">When to choose:</strong>
                          <p className="text-[11px] leading-snug font-bold">
                            Default RSI paralytic for unknown medical histories, renal failure, hyperkalemia risk, or when Sugammadex is fully pre-staged.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Succinylcholine */}
              {(() => {
                const succDose = getSuccinylcholineDose();
                const isSuccExpanded = expandedDrug === 'succinylcholine';
                const calculatedIMDose = Math.min(150, 4 * weight); // 4 mg/kg max 150 mg

                return (
                  <div
                    id="med-card-succinylcholine"
                    onClick={() => setExpandedDrug(isSuccExpanded ? null : 'succinylcholine')}
                    className={`p-4 rounded-lg transition-all cursor-pointer select-none border-2 ${
                      isSuccExpanded
                        ? 'bg-purple-50/55 border-purple-600 shadow-[4px_4px_0px_0px_rgba(147,51,234,1)]'
                        : 'bg-white hover:bg-slate-50 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-lg text-slate-900 uppercase font-display">Succinylcholine</span>
                          <span className="text-[9px] bg-red-100 border border-red-600 text-red-700 px-1.5 py-0.5 rounded font-black uppercase animate-pulse">
                            BLACK BOX
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 font-semibold italic mt-0.5 block">
                          Age-weighted standard: {succDose.label}
                        </span>
                      </div>

                      <div className="text-right">
                        <div className={`font-mono text-2xl md:text-3xl font-black ${isSuccExpanded ? 'text-purple-700' : 'text-slate-900'}`}>
                          {succDose.dose} <span className="text-sm font-bold text-slate-500">mg</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase font-mono block mt-0.5">
                          Onset: &lt;45–60s
                        </span>
                      </div>
                    </div>

                    {isSuccExpanded && (
                      <div className="mt-4 pt-4 border-t-2 border-dashed border-purple-200 space-y-3.5 text-xs text-slate-800 animate-fadeIn">
                        <div className="bg-red-50 border-2 border-red-600 p-3 rounded shadow-[2px_2px_0px_0px_rgba(220,38,38,1)]">
                          <div className="flex gap-2 items-start">
                            <ShieldAlert className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <strong className="text-red-700 text-[10px] uppercase block tracking-wider font-black mb-0.5">Black Box Hyperkalemia Caution:</strong>
                              <p className="text-[11px] leading-snug font-bold">
                                Risk of fatal cardiac arrest in children with undiagnosed skeletal muscle myopathies (most commonly Duchenne DMD, males ≤8 yr).
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5 bg-white p-3 rounded border-2 border-purple-200 font-semibold text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-500">IM Route (No IV access):</span>
                            <span className="font-bold text-slate-800 font-mono">{calculatedIMDose.toFixed(1)} mg (max 150)</span>
                          </div>
                          <div className="flex justify-between border-t border-slate-100 pt-1.5">
                            <span className="text-slate-500">Duration:</span>
                            <span className="text-slate-800 font-bold">6–10 minutes (extremely short)</span>
                          </div>
                        </div>

                        <div>
                          <strong className="text-red-600 text-[10px] uppercase block font-black tracking-wider mb-1">Absolute Contraindications:</strong>
                          <ul className="list-disc list-inside space-y-1 text-slate-800 font-bold">
                            <li>Known skeletal muscle myopathies</li>
                            <li>History or susceptibility to Malignant Hyperthermia</li>
                            <li>Pre-existing hyperkalemia (K+ &gt; 5.5 mEq/L)</li>
                            <li>Major burns, denervation, crush injury &gt;48 hours old</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* PREMEDICATIONS & ADJUNCTS */}
        <div className="bg-white rounded-xl border-2 border-slate-900 p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
          <h3 className="text-sm font-black text-slate-900 tracking-wider uppercase border-b-2 border-slate-150 pb-3 flex items-center justify-between font-display">
            <span>Adjunct Premedications & Reversals</span>
            <span className="text-[10px] bg-emerald-100 border-2 border-emerald-600 text-emerald-700 px-2 py-0.5 rounded font-black font-mono">
              Weight: {weight}kg
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Atropine */}
            {(() => {
              const atropine = getAtropineDose();
              const isExpanded = expandedDrug === 'atropine';

              return (
                <div
                  id="med-card-atropine"
                  onClick={() => setExpandedDrug(isExpanded ? null : 'atropine')}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isExpanded ? 'bg-emerald-50/55 border-emerald-600 shadow-[3px_3px_0px_0px_rgba(5,150,105,1)]' : 'bg-white hover:bg-slate-50 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-extrabold text-slate-900 block font-display text-base">Atropine</span>
                      <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">0.02 mg/kg IV premed</span>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xl font-black text-emerald-600">
                        {atropine.dose} <span className="text-xs text-slate-400">mg</span>
                      </div>
                      {atropine.isCapped && (
                        <span className="text-[9px] bg-red-100 border border-red-600 text-red-700 px-1 rounded block font-black uppercase mt-0.5">
                          Capped Max: {atropine.max} mg
                        </span>
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t-2 border-dashed border-emerald-200 space-y-2 text-xs text-slate-700 animate-fadeIn">
                      <p className="text-[11px] leading-snug font-semibold">
                        <strong className="text-emerald-800">Indications:</strong> Infants &lt;1 year (high vagal bradycardia risk), with succinylcholine (especially second dose), or pre-existing bradycardia.
                      </p>
                      <div className="bg-white p-2 rounded border-2 border-emerald-100 text-[10px] font-mono font-bold text-slate-500">
                        Historical minimum dose of 0.1 mg has been abandoned per 2025 AHA PALS.
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Glycopyrrolate */}
            {(() => {
              const glyco = getGlycopyrrolateDose();
              const isExpanded = expandedDrug === 'glycopyrrolate';

              return (
                <div
                  id="med-card-glycopyrrolate"
                  onClick={() => setExpandedDrug(isExpanded ? null : 'glycopyrrolate')}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isExpanded ? 'bg-emerald-50/55 border-emerald-600 shadow-[3px_3px_0px_0px_rgba(5,150,105,1)]' : 'bg-white hover:bg-slate-50 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-extrabold text-slate-900 block font-display text-base">Glycopyrrolate</span>
                      <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">0.004 mg/kg IV</span>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xl font-black text-emerald-600">
                        {glyco.dose} <span className="text-xs text-slate-400">mg</span>
                      </div>
                      {glyco.isCapped && (
                        <span className="text-[9px] bg-red-100 border border-red-600 text-red-700 px-1 rounded block font-black uppercase mt-0.5">
                          Capped Max: 0.1 mg
                        </span>
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t-2 border-dashed border-emerald-200 space-y-2 text-xs text-slate-700 animate-fadeIn">
                      <p className="text-[11px] leading-snug font-semibold">
                        <strong className="text-emerald-800">Neurological Monitoring Safe:</strong> Does NOT cross BBB; does not cause pupil dilation. Smoother HR effect than atropine.
                      </p>
                      <p className="text-[11px] leading-snug text-slate-500 font-medium">
                        Excellent for secretion control when Ketamine is used. Infusion vagal blockade lasts 2-3 hours.
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
