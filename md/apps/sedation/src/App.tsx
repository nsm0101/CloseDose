import { useEffect, useMemo, useRef, useState } from 'react';
import {
  calculateMedicationOption,
  MEDICATION_OPTIONS,
  MONITORING_SOURCE
} from './sedationCalculations.mjs';
import type {
  IncludedMedicationResult,
  MedicationOption,
  MedicationOptionId,
  MedicationResult
} from './sedationCalculations.d.ts';

const procedures = [
  'Laceration repair',
  'Fracture reduction',
  'Abscess drainage',
  'Foreign-body removal',
  'Imaging',
  'Vascular access',
  'Other'
] as const;

const sections = ['Context', 'Compare', 'Prepare', 'Recovery', 'Document'];

type RiskState = '' | 'present' | 'not-present';

type ReviewContext = {
  procedure: string;
  ageMonths: string;
  weightKg: string;
  airwayOsa: RiskState;
  respiratoryIllness: RiskState;
  asaThreeOrGreater: RiskState;
  congenitalHeartDisease: RiskState;
  previousSedationComplication: RiskState;
  interactingSedative: RiskState;
};

const initialContext: ReviewContext = {
  procedure: '',
  ageMonths: '',
  weightKg: '',
  airwayOsa: '',
  respiratoryIllness: '',
  asaThreeOrGreater: '',
  congenitalHeartDisease: '',
  previousSedationComplication: '',
  interactingSedative: ''
};

const riskFields = [
  {
    key: 'airwayOsa',
    label: 'Airway or OSA concern',
    prompt:
      'Airway or OSA concern recorded. Confirm an individualized airway assessment, appropriate monitoring, and rescue capability before proceeding.'
  },
  {
    key: 'respiratoryIllness',
    label: 'Respiratory illness',
    prompt:
      'Respiratory illness recorded. The ketamine source lists significant respiratory illness as a relative contraindication requiring discussion with experienced senior staff.'
  },
  {
    key: 'asaThreeOrGreater',
    label: 'ASA III or greater',
    prompt:
      'ASA III or greater recorded. Complete individualized physician and anesthesia risk review before any sedation plan.'
  },
  {
    key: 'congenitalHeartDisease',
    label: 'Congenital heart disease',
    prompt:
      'Congenital heart disease recorded. Review hemodynamic risk, monitoring, location, and rescue resources with the appropriate specialists.'
  },
  {
    key: 'previousSedationComplication',
    label: 'Previous sedation complication',
    prompt:
      'Previous sedation complication recorded. Review the prior event and obtain an individualized sedation safety plan.'
  },
  {
    key: 'interactingSedative',
    label: 'Interacting sedative',
    prompt:
      'Interacting sedative recorded. Do not combine these reference outputs. Review all active medications and additive respiratory or sedation effects with pediatric pharmacy.'
  }
] as const;

const comparisonFoundations = [
  {
    title: 'Nonpharmacologic comfort and local anesthesia',
    category: 'Comfort and procedure support',
    summary:
      'Compare preparation, caregiver support, positioning, distraction, topical or local anesthesia, and the least restrictive approach appropriate to the procedure.',
    note: 'No medication calculation is produced.'
  },
  {
    title: 'Nitrous oxide',
    category: 'Minimal sedation option',
    summary:
      'Qualitative comparison only. Verify local policy, age eligibility, delivery equipment, staff competency, contraindications, and actual sedation depth.',
    note: 'No dose calculation is produced in this application.'
  }
];

const soapmeItems = [
  ['S', 'Suction sized and functioning'],
  ['O', 'Oxygen supply and delivery devices'],
  ['A', 'Age and size appropriate airway equipment'],
  ['P', 'Pharmacy supplies, intended medication, and rescue medications'],
  ['M', 'Monitors selected for intended and actual sedation depth'],
  ['E', 'Special equipment and immediate rescue access']
] as const;

const riskLabel = (value: RiskState) => {
  if (value === 'present') return 'Present';
  if (value === 'not-present') return 'Not present';
  return 'Not assessed';
};

const formatDose = (dose: IncludedMedicationResult['doses']['initial']) => {
  if ('value' in dose) return dose.value.toFixed(1);
  return `${dose.minimum.toFixed(1)} to ${dose.maximum.toFixed(1)}`;
};

function RiskChoice({
  field,
  label,
  value,
  onChange
}: {
  field: string;
  label: string;
  value: RiskState;
  onChange: (value: RiskState) => void;
}) {
  return (
    <fieldset className="risk-choice">
      <legend>{label}</legend>
      <div className="segmented-control">
        <label className={value === 'present' ? 'selected' : ''}>
          <input
            checked={value === 'present'}
            name={field}
            onChange={() => onChange('present')}
            type="radio"
          />
          Present
        </label>
        <label className={value === 'not-present' ? 'selected' : ''}>
          <input
            checked={value === 'not-present'}
            name={field}
            onChange={() => onChange('not-present')}
            type="radio"
          />
          Not present
        </label>
      </div>
    </fieldset>
  );
}

function MedicationCard({
  result,
  compared,
  remainingSeconds,
  onComparisonChange,
  onStartTimer,
  onResetTimer
}: {
  result: MedicationResult;
  compared: boolean;
  remainingSeconds: number | null;
  onComparisonChange: (checked: boolean) => void;
  onStartTimer: (intervalMinutes: number) => void;
  onResetTimer: () => void;
}) {
  const repeat =
    !result.excluded && result.doses.repeat ? result.doses.repeat : null;

  return (
    <article className={result.excluded ? 'medication-card excluded' : 'medication-card'}>
      <header>
        <div>
          <p className="card-label">{result.category}</p>
          <h3>
            {result.name} <span>{result.route}</span>
          </h3>
        </div>
        <span className="option-marker">Option</span>
      </header>

      {result.excluded ? (
        <div className="exclusion" role="status">
          <strong>Outside named source population</strong>
          <p>{result.exclusionReason}. No dose is displayed.</p>
        </div>
      ) : (
        <div className="dose-panel">
          <p className="dose-label">Calculated reference range</p>
          <p className="dose-value">
            {formatDose(result.doses.initial)} <span>{result.units}</span>
          </p>
          <p className="calculation-line">{result.calculationBasis}</p>

          {repeat && (
            <div className="repeat-panel">
              <p>
                <strong>Repeat reference:</strong> {formatDose(repeat)}{' '}
                {result.units} at {repeat.intervalMinutes} minutes if needed.
              </p>
              {'cumulativeCap' in result.doses && (
                <p>
                  <strong>Calculated cumulative cap:</strong>{' '}
                  {result.doses.cumulativeCap?.toFixed(1)} {result.units}
                </p>
              )}
              {remainingSeconds === null ? (
                <button
                  className="timer-action"
                  onClick={() => onStartTimer(repeat.intervalMinutes)}
                  type="button"
                >
                  Start {repeat.intervalMinutes} minute reference timer
                </button>
              ) : (
                <div
                  aria-label={`${result.name} ${result.route} reference timer`}
                  className="timer"
                  role="timer"
                >
                  <span>
                    {String(Math.floor(remainingSeconds / 60)).padStart(2, '0')}:
                    {String(remainingSeconds % 60).padStart(2, '0')}
                  </span>
                  <button onClick={onResetTimer} type="button">
                    Reset
                  </button>
                </div>
              )}
              <small>
                Timer is a local tab aid only. It does not authorize a repeat
                dose.
              </small>
            </div>
          )}
        </div>
      )}

      <dl className="metadata-grid">
        <div>
          <dt>Population</dt>
          <dd>{result.population}</dd>
        </div>
        <div>
          <dt>Onset</dt>
          <dd>{result.onset}</dd>
        </div>
        <div>
          <dt>Cap</dt>
          <dd>{Object.values(result.cap).join('; ')}</dd>
        </div>
        <div>
          <dt>Monitoring depth</dt>
          <dd>{result.monitoringDepth}</dd>
        </div>
      </dl>

      <div className="source-block">
        <p className="source-label">Source adjacent to calculation</p>
        <cite>{result.source.title}</cite>
        <span>
          {result.source.organization}, {result.source.date}
        </span>
      </div>

      <label className="compare-check">
        <input
          checked={compared}
          onChange={(event) => onComparisonChange(event.target.checked)}
          type="checkbox"
        />
        Include this option in the comparison record
      </label>
    </article>
  );
}

export default function App() {
  const [entered, setEntered] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [context, setContext] = useState<ReviewContext>(initialContext);
  const [comparedOptions, setComparedOptions] = useState<MedicationOptionId[]>([]);
  const [soapmeChecks, setSoapmeChecks] = useState<string[]>([]);
  const [recoveryChecks, setRecoveryChecks] = useState<string[]>([]);
  const [timerExpiries, setTimerExpiries] = useState<
    Partial<Record<MedicationOptionId, number>>
  >({});
  const [nowMs, setNowMs] = useState(Date.now());
  const [timerAnnouncement, setTimerAnnouncement] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const lastTimerTick = useRef(nowMs);

  const parsedWeight = Number(context.weightKg);
  const parsedAge = Number(context.ageMonths);
  const inputsReady =
    context.weightKg !== '' &&
    context.ageMonths !== '' &&
    Number.isFinite(parsedWeight) &&
    Number.isFinite(parsedAge) &&
    parsedWeight >= 0.5 &&
    parsedWeight <= 200 &&
    parsedAge >= 0;

  const calculatedOptions = useMemo<MedicationResult[]>(
    () =>
      inputsReady
        ? MEDICATION_OPTIONS.map((option: MedicationOption) =>
            calculateMedicationOption(option.id, parsedWeight, parsedAge)
          ) as MedicationResult[]
        : [],
    [inputsReady, parsedAge, parsedWeight]
  );

  const activeRiskPrompts = riskFields.filter(
    ({ key }) => context[key] === 'present'
  );

  const hasActiveTimer = Object.values(timerExpiries).some(
    (expiry) => expiry !== undefined && expiry > nowMs
  );

  useEffect(() => {
    if (!hasActiveTimer) return undefined;
    const timerId = window.setInterval(() => {
      const nextNow = Date.now();
      const reachedInterval = Object.values(timerExpiries).some(
        (expiry) =>
          expiry !== undefined &&
          expiry > lastTimerTick.current &&
          expiry <= nextNow
      );
      lastTimerTick.current = nextNow;
      if (reachedInterval) {
        setTimerAnnouncement(
          'A reference timer reached zero. This does not authorize a repeat dose.'
        );
      }
      setNowMs(nextNow);
    }, 1000);
    return () => window.clearInterval(timerId);
  }, [hasActiveTimer, timerExpiries]);

  useEffect(() => {
    if (Object.keys(timerExpiries).length > 0) {
      setTimerAnnouncement(
        'Reference timers cleared because age or weight changed.'
      );
    }
    setTimerExpiries({});
  }, [context.ageMonths, context.weightKg]);

  const updateContext = <K extends keyof ReviewContext>(
    field: K,
    value: ReviewContext[K]
  ) => {
    setContext((current) => ({ ...current, [field]: value }));
  };

  const setCompared = (optionId: MedicationOptionId, checked: boolean) => {
    setComparedOptions((current) =>
      checked
        ? [...new Set([...current, optionId])]
        : current.filter((id) => id !== optionId)
    );
  };

  const toggleCheck = (
    current: string[],
    value: string,
    setter: (next: string[]) => void
  ) => {
    setter(
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  };

  const startTimer = (
    optionId: MedicationOptionId,
    intervalMinutes: number
  ) => {
    const startedAt = Date.now();
    setNowMs(startedAt);
    lastTimerTick.current = startedAt;
    setTimerExpiries((current) => ({
      ...current,
      [optionId]: startedAt + intervalMinutes * 60 * 1000
    }));
    setTimerAnnouncement(
      `${intervalMinutes} minute reference timer started.`
    );
  };

  const resetTimer = (optionId: MedicationOptionId) => {
    setTimerExpiries((current) => {
      const next = { ...current };
      delete next[optionId];
      return next;
    });
    setTimerAnnouncement('Reference timer reset.');
  };

  const documentation = useMemo(() => {
    const selectedNames = MEDICATION_OPTIONS.filter(
      ({ id }: MedicationOption) => comparedOptions.includes(id)
    ).map(
      ({ name, route }: MedicationOption) => `${name} ${route}`
    );
    const riskLines = riskFields.map(
      ({ key, label }) => `- ${label}: ${riskLabel(context[key])}`
    );

    return [
      'PEDIATRIC COMFORT AND SEDATION REVIEW',
      'Clinical review / not approved for clinical use',
      '',
      `Procedure category: ${context.procedure || 'Not selected'}`,
      `Age: ${context.ageMonths || 'Not entered'} months`,
      `Weight: ${context.weightKg || 'Not entered'} kg`,
      '',
      'Risk screen:',
      ...riskLines,
      '',
      `Medication options compared: ${
        selectedNames.length > 0 ? selectedNames.join('; ') : 'None recorded'
      }`,
      'No agent selected or recommended by this application.',
      'No combinations, concentrations, or volumes calculated.',
      '',
      `SOAPME checks recorded: ${
        soapmeChecks.length > 0 ? soapmeChecks.join('; ') : 'None recorded'
      }`,
      `Recovery checks recorded: ${
        recoveryChecks.length > 0
          ? recoveryChecks.join('; ')
          : 'None recorded'
      }`,
      '',
      'No identifiers. No saved data.'
    ].join('\n');
  }, [comparedOptions, context, recoveryChecks, soapmeChecks]);

  const copyDocumentation = async () => {
    try {
      await navigator.clipboard.writeText(documentation);
      setCopyStatus('Documentation copied');
    } catch {
      setCopyStatus(
        'Copy failed. Select and copy the documentation preview manually.'
      );
    }
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to review content
      </a>

      <header className="site-header">
        <a className="return-link" href="/">
          CloseDose MD
        </a>
        <div className="header-title">
          <p className="eyebrow">Bedside comparison console</p>
          <h1>Pediatric Comfort and Sedation</h1>
        </div>
        <div className="review-badge" role="status">
          <span className="status-dot" aria-hidden="true" />
          <span>
            <strong>Clinical review</strong>
            <small>Not approved for clinical use</small>
          </span>
        </div>
      </header>

      <main id="main-content">
        {!entered ? (
          <section className="start-view" aria-labelledby="start-title">
            <div>
              <p className="kicker">Transparent reference review</p>
              <h2 id="start-title">Compare options without choosing an agent.</h2>
              <p>
                This console keeps named-source options visible and separate. It
                does not recommend, combine, prescribe, or replace local policy
                and credentialed clinical judgment.
              </p>
              <button
                className="primary-action"
                onClick={() => setEntered(true)}
                type="button"
              >
                Enter review workspace
              </button>
            </div>
            <aside className="gate-card" aria-label="Clinical release gate">
              <p className="gate-label">Clinical release gate</p>
              <h3>Not approved for clinical use</h3>
              <p>
                Pediatric emergency medicine, pharmacy, anesthesia, regulatory,
                safety, and accessibility reviews remain open.
              </p>
              <ul>
                <li>No identifiers or saved data</li>
                <li>No best-agent output</li>
                <li>No concentrations or volumes</li>
              </ul>
            </aside>
          </section>
        ) : (
          <div className="workspace">
            <span className="sr-only" aria-live="polite">
              {timerAnnouncement}
            </span>
            <nav className="section-nav" aria-label="Review sections">
              {sections.map((section, index) => (
                <button
                  aria-current={activeSection === index ? 'step' : undefined}
                  className={activeSection === index ? 'active' : ''}
                  key={section}
                  onClick={() => setActiveSection(index)}
                  type="button"
                >
                  <span>{index + 1}</span>
                  {section}
                </button>
              ))}
            </nav>

            <section className="workspace-panel">
              {activeSection === 0 && (
                <div className="panel-content">
                  <p className="section-label">Context and risk screen</p>
                  <h2>Record only non-identifying clinical context</h2>
                  <p className="intro">
                    No field begins with an affirmative clinical assumption.
                    Complete each item from the current bedside assessment.
                  </p>

                  <div className="context-grid">
                    <label>
                      Procedure category
                      <select
                        onChange={(event) =>
                          updateContext('procedure', event.target.value)
                        }
                        value={context.procedure}
                      >
                        <option value="">Select procedure</option>
                        {procedures.map((procedure) => (
                          <option key={procedure} value={procedure}>
                            {procedure}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Age in months
                      <input
                        inputMode="numeric"
                        min="0"
                        onChange={(event) =>
                          updateContext('ageMonths', event.target.value)
                        }
                        placeholder="Not entered"
                        step="1"
                        type="number"
                        value={context.ageMonths}
                      />
                    </label>
                    <label>
                      Weight in kg
                      <input
                        inputMode="decimal"
                        max="200"
                        min="0.5"
                        onChange={(event) =>
                          updateContext('weightKg', event.target.value)
                        }
                        placeholder="0.5 to 200"
                        step="0.1"
                        type="number"
                        value={context.weightKg}
                      />
                    </label>
                  </div>

                  <div className="risk-grid">
                    {riskFields.map(({ key, label }) => (
                      <RiskChoice
                        field={key}
                        key={key}
                        label={label}
                        onChange={(value) => updateContext(key, value)}
                        value={context[key]}
                      />
                    ))}
                  </div>

                  {activeRiskPrompts.length > 0 ? (
                    <div className="risk-prompts" aria-live="polite">
                      <h3>Recorded risk prompts</h3>
                      {activeRiskPrompts.map(({ key, prompt }) => (
                        <p key={key}>{prompt}</p>
                      ))}
                    </div>
                  ) : (
                    <div className="neutral-prompt" role="status">
                      No risk conclusion is shown until a concern is recorded.
                    </div>
                  )}
                </div>
              )}

              {activeSection === 1 && (
                <div className="panel-content">
                  <p className="section-label">Parallel option review</p>
                  <h2>Compare distinct comfort, analgesia, and sedation options</h2>
                  <div className="boundary-banner" role="note">
                    <strong>No best agent is selected.</strong> Do not combine
                    medication outputs. Each card remains a separate reference
                    from its named source.
                  </div>

                  <div className="foundation-grid">
                    {comparisonFoundations.map((option) => (
                      <article className="foundation-card" key={option.title}>
                        <p className="card-label">{option.category}</p>
                        <h3>{option.title}</h3>
                        <p>{option.summary}</p>
                        <small>{option.note}</small>
                      </article>
                    ))}
                  </div>

                  {!inputsReady ? (
                    <div className="input-gate" role="status">
                      Enter a finite age and a weight from 0.5 kg through 200 kg
                      in Context to display source-specific medication
                      calculations.
                    </div>
                  ) : (
                    <div className="medication-grid">
                      {calculatedOptions.map((result) => {
                        const expiry = timerExpiries[result.optionId];
                        const remainingSeconds =
                          expiry === undefined
                            ? null
                            : Math.max(
                                0,
                                Math.ceil((expiry - nowMs) / 1000)
                              );
                        return (
                          <MedicationCard
                            compared={comparedOptions.includes(result.optionId)}
                            key={result.optionId}
                            onComparisonChange={(checked) =>
                              setCompared(result.optionId, checked)
                            }
                            onResetTimer={() => resetTimer(result.optionId)}
                            onStartTimer={(intervalMinutes) =>
                              startTimer(result.optionId, intervalMinutes)
                            }
                            remainingSeconds={remainingSeconds}
                            result={result}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeSection === 2 && (
                <div className="panel-content">
                  <p className="section-label">Preparation and monitoring</p>
                  <h2>SOAPME preparation</h2>
                  <p className="intro">
                    Record preparation checks only after confirming each item.
                    Checked items are documentation aids, not proof of readiness.
                  </p>
                  <div className="soapme-list">
                    {soapmeItems.map(([letter, item]) => (
                      <label key={letter}>
                        <input
                          checked={soapmeChecks.includes(item)}
                          onChange={() =>
                            toggleCheck(soapmeChecks, item, setSoapmeChecks)
                          }
                          type="checkbox"
                        />
                        <strong aria-hidden="true">{letter}</strong>
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>

                  <div className="monitoring-card">
                    <p className="card-label">Monitoring expectation</p>
                    <h3>Monitor the actual depth and retain rescue capability</h3>
                    <p>
                      Sedation can deepen beyond the intended level. Use
                      appropriately trained staff, age and size appropriate
                      equipment, physiologic monitoring during and after the
                      procedure, and a staffed recovery area.
                    </p>
                    <div className="source-block">
                      <cite>{MONITORING_SOURCE.title}</cite>
                      <span>
                        Original publication {MONITORING_SOURCE.originalPublication};
                        reaffirmed {MONITORING_SOURCE.reaffirmed}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 3 && (
                <div className="panel-content">
                  <p className="section-label">Post-procedure boundary</p>
                  <h2>Recovery criteria</h2>
                  <div className="recovery-grid">
                    {[
                      'Returned to presedation level of consciousness',
                      'Airway patency and cardiovascular function are satisfactory and stable',
                      'Age-appropriate protective reflexes are intact',
                      'Hydration is adequate for the clinical situation',
                      'Responsible supervision and discharge instructions are confirmed',
                      'For ketamine, premorbid neurologic, verbal, and ambulatory baseline is restored as applicable'
                    ].map((criterion) => (
                      <label key={criterion}>
                        <input
                          checked={recoveryChecks.includes(criterion)}
                          onChange={() =>
                            toggleCheck(
                              recoveryChecks,
                              criterion,
                              setRecoveryChecks
                            )
                          }
                          type="checkbox"
                        />
                        <span>{criterion}</span>
                      </label>
                    ))}
                  </div>
                  <div className="boundary-banner">
                    The application does not declare recovery complete or
                    authorize discharge. Apply local criteria and clinician
                    assessment.
                  </div>
                </div>
              )}

              {activeSection === 4 && (
                <div className="panel-content">
                  <p className="section-label">Identifier-free record</p>
                  <h2>Copyable review documentation</h2>
                  <p className="privacy-note">
                    Do not enter or add a name, birth date, record number,
                    address, contact information, or other identifier.
                  </p>
                  <div className="documentation-block">
                    <pre
                      aria-label="Selectable identifier-free documentation preview"
                      tabIndex={0}
                    >
                      {documentation}
                    </pre>
                    <button
                      className="secondary-action"
                      onClick={copyDocumentation}
                      type="button"
                    >
                      Copy identifier-free documentation
                    </button>
                    <span aria-live="polite">{copyStatus}</span>
                  </div>
                </div>
              )}

              <div className="panel-footer">
                <button
                  className="text-action"
                  disabled={activeSection === 0}
                  onClick={() =>
                    setActiveSection((current) => Math.max(0, current - 1))
                  }
                  type="button"
                >
                  Previous
                </button>
                {activeSection < sections.length - 1 && (
                  <button
                    className="secondary-action"
                    onClick={() =>
                      setActiveSection((current) =>
                        Math.min(sections.length - 1, current + 1)
                      )
                    }
                    type="button"
                  >
                    Continue to {sections[activeSection + 1]}
                  </button>
                )}
              </div>
            </section>
          </div>
        )}

        <section className="evidence-panel" aria-labelledby="evidence-title">
          <div>
            <p className="section-label">Evidence boundary</p>
            <h2 id="evidence-title">Named sources, visible limits</h2>
          </div>
          <ul>
            <li>AAP and AAPD monitoring guideline, reaffirmed December 2025</li>
            <li>Royal Children's Hospital Melbourne ketamine guideline, December 2021</li>
            <li>Texas Children's Hospital procedural sedation guideline, February 2023</li>
          </ul>
        </section>
      </main>

      <footer>
        <p>
          Review application only. No identifiers, persistence, analytics, AI,
          external runtime calls, concentrations, volumes, or combined-agent
          calculations.
        </p>
        <a href="/">Return to CloseDose MD</a>
      </footer>
    </div>
  );
}
