import { useMemo, useState } from 'react';
import {
  INDUCTION_AGENTS,
  PARALYTICS_COMPARISON,
  SCENARIOS,
  type Medication,
  type Scenario
} from '@closedose-md/rsi-reference';

import {
  PATIENT_FACTORS as PATIENT_FACTORS_RAW,
  SCENARIO_CONTEXT as SCENARIO_CONTEXT_RAW,
  SOURCE_REFERENCES as SOURCE_REFERENCES_RAW,
  describeAge,
  getPatientWarnings
} from './scenarioFlow.mjs';
import type {
  AgeUnit,
  PatientFactor,
  PatientWarning,
  ScenarioContext,
  SourceReference
} from './scenarioFlow.d.ts';

interface IntegratedScenarioGuideProps {
  weight: number;
  onWeightChange: (weight: number) => void;
}

const severityLabels = {
  critical: 'High-priority caution',
  caution: 'Review before proceeding',
  context: 'Context check'
} as const;

const patientFactors = PATIENT_FACTORS_RAW as readonly PatientFactor[];
const scenarioContext = SCENARIO_CONTEXT_RAW as Readonly<Record<string, ScenarioContext>>;
const sourceReferences = SOURCE_REFERENCES_RAW as Readonly<Record<string, SourceReference>>;

function medicationFor(id: string) {
  return INDUCTION_AGENTS.find((medication) => medication.id === id);
}

function doseLine(medication: Medication | undefined, weight: number) {
  if (!medication) return 'Imported medication record not found';
  if (typeof medication.ivDosePerKg === 'number') {
    return `${(medication.ivDosePerKg * weight).toFixed(1)} mg at ${medication.ivDosePerKg} mg/kg`;
  }
  if (medication.ivDoseRangePerKg) {
    const { min, max } = medication.ivDoseRangePerKg;
    return `${(min * weight).toFixed(1)}-${(max * weight).toFixed(1)} mg at ${min}-${max} mg/kg`;
  }
  return medication.ivDose;
}

function MedicationGroup({
  label,
  tone,
  medicationIds,
  weight
}: {
  label: string;
  tone: 'preferred' | 'alternative' | 'avoid';
  medicationIds: string[];
  weight: number;
}) {
  return (
    <section className="scenario-medication-group" data-tone={tone} aria-label={label}>
      <h4>{label}</h4>
      {medicationIds.length > 0 ? (
        <div className="scenario-medication-list">
          {medicationIds.map((id) => {
            const medication = medicationFor(id);
            return (
              <article key={id} className="scenario-medication-row">
                <strong>{medication?.name ?? id}</strong>
                <span>{doseLine(medication, weight)}</span>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="scenario-empty-copy">No imported option in this category.</p>
      )}
    </section>
  );
}

function WarningList({ warnings }: { warnings: readonly PatientWarning[] }) {
  if (warnings.length === 0) {
    return (
      <div className="scenario-empty-state">
        <strong>No additional patient-factor cautions selected</strong>
        <p>Continue to verify the full history, physiology, airway examination, allergies, and local protocol.</p>
      </div>
    );
  }

  return (
    <div className="scenario-warning-list" aria-live="polite">
      {warnings.map((warning) => (
        <article key={warning.id} className="scenario-warning" data-severity={warning.severity}>
          <p className="scenario-warning-severity">{severityLabels[warning.severity]}</p>
          <h4>{warning.title}</h4>
          <p>{warning.detail}</p>
          <a href={`#source-${warning.sourceId}`}>Source: {sourceReferences[warning.sourceId].organization}</a>
        </article>
      ))}
    </div>
  );
}

function ExceptionalMedicationReview({ scenario }: { scenario: Scenario }) {
  const medicationIds = [
    ...scenario.preferredInduction,
    ...scenario.alternativeInduction,
    ...scenario.avoidInduction
  ];
  const uniqueMedications = [...new Set(medicationIds)]
    .map(medicationFor)
    .filter((medication): medication is Medication => Boolean(medication));

  return (
    <div className="scenario-exception-grid">
      {uniqueMedications.map((medication) => (
        <details key={medication.id} className="scenario-disclosure">
          <summary>{medication.name}: limitations and contraindications</summary>
          <div>
            <p><strong>Imported disadvantages</strong></p>
            <ul>{medication.disadvantages.map((item) => <li key={item}>{item}</li>)}</ul>
            <p><strong>Imported contraindications</strong></p>
            <ul>{medication.contraindications.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        </details>
      ))}
    </div>
  );
}

export default function IntegratedScenarioGuide({
  weight,
  onWeightChange
}: IntegratedScenarioGuideProps) {
  const [ageValue, setAgeValue] = useState('8');
  const [ageUnit, setAgeUnit] = useState<AgeUnit>('years');
  const [scenarioId, setScenarioId] = useState('sepsis');
  const [factorIds, setFactorIds] = useState<string[]>([]);

  const parsedAge = Number(ageValue);
  const ageError = useMemo(() => {
    if (ageValue.trim() === '') return 'Enter the child\'s exact age.';
    try {
      describeAge(parsedAge, ageUnit);
      return '';
    } catch (error) {
      return error instanceof Error ? error.message : 'Enter a valid pediatric age.';
    }
  }, [ageUnit, ageValue, parsedAge]);

  const activeScenario = SCENARIOS.find((scenario) => scenario.id === scenarioId) ?? SCENARIOS[0];
  const context = scenarioContext[activeScenario.id];
  const warnings = ageError
    ? []
    : getPatientWarnings({ ageValue: parsedAge, ageUnit, scenarioId, factorIds });
  const sourceIds = [...new Set([
    'pinned-cc-rsi',
    ...context.sourceIds,
    ...warnings.map(({ sourceId }) => sourceId)
  ])];
  const paralytics = [...new Set([
    ...(activeScenario.recommendedParalytic ?? []),
    ...(activeScenario.avoidParalytic ?? [])
  ])].map((id) => PARALYTICS_COMPARISON.find((paralytic) => paralytic.id === id));

  const toggleFactor = (factorId: string) => {
    setFactorIds((current) => current.includes(factorId)
      ? current.filter((id) => id !== factorId)
      : [...current, factorId]);
  };

  return (
    <div className="scenario-review-flow">
      <header className="scenario-review-gate" aria-label="Clinical review status">
        <div>
          <strong>Clinical review</strong>
          <span>Not approved for clinical use</span>
        </div>
        <p>This candidate view organizes imported options and source-mapped cautions. It does not diagnose the child or select a best medication.</p>
      </header>

      <form className="scenario-flow-form" onSubmit={(event) => event.preventDefault()}>
        <section className="scenario-flow-stage" aria-labelledby="patient-stage-title">
          <div className="scenario-stage-heading">
            <span aria-hidden="true">1</span>
            <div>
              <h2 id="patient-stage-title">Describe this child</h2>
              <p>Use exact age and an independently confirmed weight. Nothing is saved.</p>
            </div>
          </div>

          <div className="scenario-patient-grid">
            <label className="scenario-field">
              <span>Exact age</span>
              <input
                aria-describedby={ageError ? 'scenario-age-error' : 'scenario-age-help'}
                inputMode="decimal"
                min="0"
                step="0.01"
                type="number"
                value={ageValue}
                onChange={(event) => setAgeValue(event.currentTarget.value)}
              />
              <small id={ageError ? 'scenario-age-error' : 'scenario-age-help'} data-error={Boolean(ageError)}>
                {ageError || 'Age zero days is valid. Maximum age is 18 years.'}
              </small>
            </label>

            <label className="scenario-field">
              <span>Age unit</span>
              <select value={ageUnit} onChange={(event) => setAgeUnit(event.currentTarget.value as AgeUnit)}>
                <option value="days">Days</option>
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
              <small>Select the unit explicitly.</small>
            </label>

            <label className="scenario-field">
              <span>Verified weight</span>
              <span className="scenario-weight-input">
                <input
                  inputMode="decimal"
                  min="0.1"
                  max="150"
                  step="0.1"
                  type="number"
                  value={weight}
                  onChange={(event) => {
                    const next = event.currentTarget.valueAsNumber;
                    if (Number.isFinite(next) && next > 0 && next <= 150) onWeightChange(next);
                  }}
                />
                <span>kg</span>
              </span>
              <small>Confirm independently. Weight does not infer age.</small>
            </label>
          </div>
        </section>

        <fieldset className="scenario-flow-stage">
          <legend className="scenario-stage-heading">
            <span aria-hidden="true">2</span>
            <span>
              <strong>Choose the clinical scenario</strong>
              <small>Select the physiology closest to the current bedside problem.</small>
            </span>
          </legend>
          <div className="scenario-choice-grid">
            {SCENARIOS.map((scenario) => (
              <label key={scenario.id} className="scenario-choice" data-selected={scenarioId === scenario.id}>
                <input
                  type="radio"
                  name="clinical-scenario"
                  value={scenario.id}
                  checked={scenarioId === scenario.id}
                  onChange={() => setScenarioId(scenario.id)}
                />
                <span>{scenario.name}</span>
                <small>{scenarioId === scenario.id ? 'Selected' : 'Select'}</small>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="scenario-flow-stage">
          <legend className="scenario-stage-heading">
            <span aria-hidden="true">3</span>
            <span>
              <strong>Add patient-specific factors</strong>
              <small>Select only factors known or reasonably suspected in this child.</small>
            </span>
          </legend>
          <div className="scenario-factor-grid">
            {patientFactors.map((factor) => (
              <label key={factor.id} className="scenario-factor" data-selected={factorIds.includes(factor.id)}>
                <input
                  type="checkbox"
                  checked={factorIds.includes(factor.id)}
                  onChange={() => toggleFactor(factor.id)}
                />
                <span>{factor.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </form>

      <section className="scenario-reference" aria-labelledby="scenario-reference-title">
        <header className="scenario-reference-header">
          <div>
            <p>Selected bedside reference</p>
            <h2 id="scenario-reference-title">{activeScenario.name}</h2>
          </div>
          <dl>
            <div><dt>Age</dt><dd>{ageError ? 'Needs correction' : describeAge(parsedAge, ageUnit)}</dd></div>
            <div><dt>Weight</dt><dd>{weight.toFixed(1)} kg</dd></div>
            <div><dt>Factors</dt><dd>{factorIds.length || 'None selected'}</dd></div>
          </dl>
        </header>

        {ageError ? (
          <div className="scenario-blocking-error" role="alert">
            <strong>Correct the age before using the patient-specific view.</strong>
            <p>{ageError}</p>
          </div>
        ) : (
          <>
            <section className="scenario-output-section" aria-labelledby="protect-first-title">
              <div className="scenario-output-heading">
                <h3 id="protect-first-title">Protect first</h3>
                <p>The priorities that should remain visible while the airway plan is built.</p>
              </div>
              <div className="scenario-protect-grid">
                {context.protect.map((item) => (
                  <article key={item.title}>
                    <strong>{item.title}</strong>
                    <p>{item.detail}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="scenario-output-section" aria-labelledby="patient-cautions-title">
              <div className="scenario-output-heading">
                <h3 id="patient-cautions-title">Patient-specific cautions</h3>
                <p>Age, scenario, and selected factors are combined here. These prompts do not diagnose or rank treatment.</p>
              </div>
              <WarningList warnings={warnings} />
            </section>

            <section className="scenario-output-section" aria-labelledby="medication-considerations-title">
              <div className="scenario-output-heading">
                <h3 id="medication-considerations-title">Imported medication considerations</h3>
                <p>The classifications and calculations below are unchanged from the pinned source. Review every caution above before using them.</p>
              </div>
              <div className="scenario-medication-grid">
                <MedicationGroup label="Preferred in imported scenario" tone="preferred" medicationIds={activeScenario.preferredInduction} weight={weight} />
                <MedicationGroup label="Alternative in imported scenario" tone="alternative" medicationIds={activeScenario.alternativeInduction} weight={weight} />
                <MedicationGroup label="Avoid or warning in imported scenario" tone="avoid" medicationIds={activeScenario.avoidInduction} weight={weight} />
              </div>
              <div className="scenario-rationale">
                <strong>Imported rationale</strong>
                <p>{activeScenario.rationale}</p>
              </div>
            </section>

            <section className="scenario-output-section" aria-labelledby="pearls-pitfalls-title">
              <div className="scenario-output-heading">
                <h3 id="pearls-pitfalls-title">Pearls and pitfalls</h3>
                <p>Use these to brief the team and challenge the plan before the first attempt.</p>
              </div>
              <div className="scenario-pearl-grid">
                <article data-kind="pearl">
                  <h4>Pearls</h4>
                  <ul>{context.pearls.map((item) => <li key={item}>{item}</li>)}</ul>
                </article>
                <article data-kind="pitfall">
                  <h4>Pitfalls</h4>
                  <ul>{context.pitfalls.map((item) => <li key={item}>{item}</li>)}</ul>
                </article>
              </div>
            </section>

            <section className="scenario-output-section" aria-labelledby="exceptional-cases-title">
              <div className="scenario-output-heading">
                <h3 id="exceptional-cases-title">Exceptional cases and drug limitations</h3>
                <p>Open the relevant imported details instead of assuming that a scenario label overrides a medication limitation.</p>
              </div>
              <ExceptionalMedicationReview scenario={activeScenario} />
              {paralytics.length > 0 ? (
                <div className="scenario-paralytic-review">
                  <h4>Imported paralysis options</h4>
                  {paralytics.map((paralytic) => paralytic ? (
                    <details key={paralytic.id} className="scenario-disclosure">
                      <summary>{paralytic.name}</summary>
                      <div>
                        <p><strong>Scenario classification:</strong> {activeScenario.avoidParalytic?.includes(paralytic.id) ? 'Avoid in imported scenario' : 'Recommended in imported scenario'}</p>
                        <p><strong>Onset:</strong> {paralytic.onset}</p>
                        <p><strong>Duration:</strong> {paralytic.duration}</p>
                        <p><strong>Contraindications</strong></p>
                        <ul>{paralytic.contraindications.map((item) => <li key={item}>{item}</li>)}</ul>
                      </div>
                    </details>
                  ) : null)}
                </div>
              ) : null}
            </section>

            <section className="scenario-sources" aria-labelledby="scenario-sources-title">
              <div>
                <h3 id="scenario-sources-title">Evidence shown with the output</h3>
                <p>Publication year identifies the reviewed source version. Source inclusion is not clinical approval of this candidate flow.</p>
              </div>
              <div className="scenario-source-list">
                {sourceIds.map((sourceId) => {
                  const source = sourceReferences[sourceId];
                  return (
                    <article key={sourceId} id={`source-${sourceId}`}>
                      <strong>{source.title}</strong>
                      <span>{source.organization}, {source.publication}</span>
                      <span className="scenario-source-citation">{source.citation}</span>
                    </article>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </section>
    </div>
  );
}
