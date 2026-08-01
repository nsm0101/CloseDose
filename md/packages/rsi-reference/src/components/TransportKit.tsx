/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Truck, CheckCircle2, AlertTriangle, FileText, Settings, Heart, Zap } from 'lucide-react';
import { TRANSPORT_KITS, TRANSPORT_EQUIPMENT_CHECKLIST, TRANSPORT_PRINCIPLES } from '../data/rsiData';

interface TransportKitProps {
  weight: number;
}

export default function TransportKit({ weight }: TransportKitProps) {
  const [activeCategory, setActiveCategory] = useState<'Resuscitation' | 'Vasoactive' | 'Sedation'>('Resuscitation');
  const [checkedEquipment, setCheckedEquipment] = useState<Record<string, boolean>>({});

  const toggleEquipment = (name: string) => {
    setCheckedEquipment((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const filteredMeds = TRANSPORT_KITS.filter((m) => m.category === activeCategory);

  return (
    <div id="transport-section" className="space-y-6">
      {/* Top Banner & Key Principles */}
      <div className="bg-white border-4 border-slate-900 rounded-xl p-5 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] text-slate-900">
        <div className="flex items-center gap-2 text-slate-950 font-extrabold text-sm uppercase tracking-wider font-display">
          <Truck className="h-5 w-5 text-teal-600 animate-pulse" />
          Critical PICU Transport Reference
        </div>
        <p className="text-xs text-slate-500 mt-1 font-semibold">
          Calculate medications and verify crucial equipment checklist before departure.
        </p>

        {/* Highlight transport stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t-2 border-slate-100 text-xs text-slate-800">
          <div className="bg-slate-50 p-3 rounded-lg border-2 border-slate-200 space-y-1 shadow-[2px_2px_0px_0px_rgba(15,23,42,0.05)] font-semibold">
            <span className="text-teal-700 font-black block text-[10px] uppercase font-display">Safety Data Profile:</span>
            <p className="leading-snug text-[11px] text-slate-700">
              In-transit events occur in ~12.3% of pediatric transports (hypotension, tachycardia, bradycardia most common). Airway issues are the most frequent and preventable adverse events.
            </p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border-2 border-slate-200 space-y-1 shadow-[2px_2px_0px_0px_rgba(15,23,42,0.05)] font-semibold">
            <span className="text-teal-700 font-black block text-[10px] uppercase font-display">Vasopressor Infusion Rule:</span>
            <p className="leading-snug text-[11px] text-slate-700">
              Vasoactive drips can be safely initiated via peripheral IV or IO access. Do NOT delay life-saving vasopressor therapy to wait for central access.
            </p>
          </div>
        </div>
      </div>

      {/* Medication Kit Calculator */}
      <div className="bg-white border-2 border-slate-900 rounded-xl p-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] text-slate-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b-2 border-slate-100 pb-3 mb-4 gap-3">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-teal-600" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide font-display">Transport Medication Kit</h3>
          </div>

          {/* Category Tabs */}
          <div className="flex rounded-lg bg-slate-100 p-1 border-2 border-slate-900 text-xs self-start">
            {(['Resuscitation', 'Vasoactive', 'Sedation'] as const).map((cat) => (
              <button
                key={cat}
                id={`tab-${cat.toLowerCase()}`}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded transition-all font-bold capitalize ${
                  activeCategory === cat ? 'bg-teal-600 border border-teal-700 text-white shadow-[1px_1px_0px_0px_rgba(13,148,136,1)]' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat === 'Resuscitation' && 'A. Code / Arrest'}
                {cat === 'Vasoactive' && 'B. Vasopressors'}
                {cat === 'Sedation' && 'C. Drips / Sedatives'}
              </button>
            ))}
          </div>
        </div>

        {/* Medication Dosing List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMeds.map((med, index) => {
            // Live calculated dose values
            let calculatedText = 'N/A';
            if (med.dosePerKg) {
              const baseValue = med.dosePerKg * weight;
              if (med.name.includes('Epinephrine (0.1 mg/mL)')) {
                calculatedText = `${baseValue.toFixed(2)} mg (${(baseValue * 10).toFixed(1)} mL of 0.1 mg/mL)`;
              } else if (med.name.includes('Atropine')) {
                const max = weight >= 45 ? 1.0 : 0.5;
                const dose = Math.min(max, baseValue);
                calculatedText = `${dose.toFixed(2)} mg IV/IO`;
              } else if (med.name.includes('Adenosine')) {
                calculatedText = `1st: ${baseValue.toFixed(1)} mg (0.1 mg/kg) | 2nd: ${(baseValue * 2).toFixed(1)} mg (0.2 mg/kg)`;
              } else if (med.name.includes('Bicarbonate')) {
                calculatedText = `${baseValue.toFixed(1)} mEq IV`;
              } else if (med.name.includes('Calcium Chloride')) {
                calculatedText = `${baseValue.toFixed(0)} mg (${(baseValue / 100).toFixed(1)} mL of 10% solution)`;
              } else if (med.name.includes('Dextrose')) {
                calculatedText = `${baseValue.toFixed(1)} g (D10W: ${(baseValue * 10).toFixed(1)} mL)`;
              } else if (med.name.includes('Infusion')) {
                calculatedText = `Titrate: {med.doseFormula.replace('(titrate)', '')}`;
                calculatedText = `Titrate: ${med.doseFormula.replace('(titrate)', '')}`;
              } else if (med.name.includes('Push-Dose')) {
                calculatedText = `${(1 * weight).toFixed(0)} to ${(10 * weight).toFixed(0)} mcg IV`;
              } else {
                calculatedText = `${baseValue.toFixed(1)} units/hr or titrate`;
              }
            }

            return (
              <div
                key={index}
                id={`transport-med-${index}`}
                className="bg-white p-3.5 rounded-lg border-2 border-slate-900 flex flex-col justify-between hover:bg-slate-50 transition-all shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">{med.name}</h4>
                    <span className="text-[9px] bg-slate-100 border-2 border-slate-900 text-slate-700 px-1.5 py-0.5 rounded font-mono font-bold mt-1 inline-block">
                      Route: {med.route}
                    </span>
                  </div>
                  <span className="text-[10px] text-teal-800 font-bold font-mono bg-teal-50 border-2 border-teal-600 px-2 py-0.5 rounded">
                    Calculated
                  </span>
                </div>

                <div className="bg-teal-50 px-2.5 py-2 rounded-lg border-2 border-teal-600 mb-2.5">
                  <span className="text-[9px] text-teal-800 block font-black uppercase tracking-wide">Emergency Calculated Dose:</span>
                  <div className="font-mono text-xs md:text-sm font-black text-teal-950 mt-0.5 leading-snug">
                    {calculatedText}
                  </div>
                </div>

                <div className="text-[10px] text-slate-600 space-y-1 font-semibold">
                  <p><strong>Formula:</strong> {med.doseFormula}</p>
                  {med.notes && (
                    <p className="text-[9.5px] text-slate-500 border-t-2 border-dashed border-slate-200 pt-1 leading-normal">
                      <strong>Clinical Pearls:</strong> {med.notes}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Equipment Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border-2 border-slate-900 rounded-xl p-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] text-slate-900">
          <div className="flex items-center gap-1.5 border-b-2 border-slate-100 pb-2.5 mb-3">
            <Settings className="h-5 w-5 text-teal-600 animate-spin-slow" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide font-display">Transport Equipment Checklist</h3>
          </div>

          <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
            {TRANSPORT_EQUIPMENT_CHECKLIST.map((section, sIndex) => (
              <div key={sIndex} className="space-y-2">
                <span className="text-[10px] font-black text-teal-800 tracking-wider uppercase block bg-teal-50 border border-teal-200 px-2.5 py-1 rounded font-display">
                  {section.category}
                </span>

                <div className="space-y-1.5">
                  {section.items.map((item, iIndex) => {
                    const isChecked = !!checkedEquipment[item.name];
                    return (
                      <div
                        key={iIndex}
                        onClick={() => toggleEquipment(item.name)}
                        className={`p-2.5 rounded border-2 cursor-pointer select-none transition-all flex gap-2.5 items-start ${
                          isChecked
                            ? 'bg-slate-50 border-slate-300 text-slate-400 opacity-75 shadow-none'
                            : 'bg-white border-slate-950 text-slate-800 hover:bg-slate-50 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // Handled by parent onClick
                          className="rounded text-teal-600 focus:ring-teal-500 bg-white border-slate-900 h-4.5 w-4.5 mt-0.5 cursor-pointer border-2"
                        />
                        <div className="flex-1">
                          <span className={`text-xs font-black ${isChecked ? 'line-through text-slate-400' : 'text-slate-950'}`}>
                            {item.name}
                          </span>
                          <p className="text-[10px] text-slate-500 font-semibold leading-snug">{item.detail}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transport Key Principles Card */}
        <div className="bg-white border-2 border-slate-900 rounded-xl p-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] text-slate-900 space-y-4">
          <div className="flex items-center gap-1.5 border-b-2 border-slate-100 pb-2.5 mb-2 uppercase font-display">
            <FileText className="h-5 w-5 text-teal-600" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Transit Airway Safety Rules</h3>
          </div>

          <div className="space-y-3.5">
            {TRANSPORT_PRINCIPLES.map((principle, index) => {
              const textParts = principle.split(':');
              const header = textParts[0];
              const details = textParts[1] || '';

              return (
                <div key={index} className="flex gap-2.5 items-start font-semibold">
                  <div className="w-6.5 h-6.5 bg-teal-50 border-2 border-teal-600 text-teal-800 text-xs font-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 font-mono">
                    {index + 1}
                  </div>
                  <div className="text-xs">
                    {details ? (
                      <p className="text-slate-800 leading-snug">
                        <strong className="text-teal-700 font-black">{header}:</strong> {details}
                      </p>
                    ) : (
                      <p className="text-slate-800 leading-snug">{principle}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Emergency Alert Badge */}
          <div className="p-3.5 bg-teal-50 border-2 border-teal-600 rounded-lg flex gap-2.5 items-start text-xs text-slate-850 shadow-[3px_3px_0px_0px_rgba(13,148,136,1)] font-semibold">
            <AlertTriangle className="h-4.5 w-4.5 text-teal-600 flex-shrink-0 mt-0.5" />
            <p className="leading-snug text-[10.5px]">
              <strong>Specialized Transport Alert:</strong> Mobilization of specialized pediatric critical care transport teams has been shown to statistically reduce intratransport morbidity and overall PICU mortality.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
